-- Add low_stock_threshold column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;

-- Create stock_reservations table for holding stock during checkout
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on stock_reservations
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

-- RLS policies for stock_reservations
CREATE POLICY "Users can view their own reservations"
ON public.stock_reservations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
ON public.stock_reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
ON public.stock_reservations FOR DELETE
USING (auth.uid() = user_id);

-- Create function to check and deduct stock when order is created
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Deduct stock for each order item
  FOR item IN 
    SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id
  LOOP
    IF item.product_id IS NOT NULL THEN
      UPDATE public.products 
      SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - item.quantity)
      WHERE id = item.product_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to auto-disable products when out of stock
CREATE OR REPLACE FUNCTION public.check_stock_and_update_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock reaches 0, mark product as out of stock (but keep active for display)
  IF NEW.stock_quantity <= 0 AND OLD.stock_quantity > 0 THEN
    NEW.badge = 'Out of Stock';
  ELSIF NEW.stock_quantity > 0 AND OLD.badge = 'Out of Stock' THEN
    NEW.badge = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto out-of-stock handling
DROP TRIGGER IF EXISTS check_product_stock ON public.products;
CREATE TRIGGER check_product_stock
  BEFORE UPDATE OF stock_quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_stock_and_update_status();

-- Create function to clean up expired reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stock_reservations WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to get available stock (stock minus active reservations)
CREATE OR REPLACE FUNCTION public.get_available_stock(p_product_id uuid)
RETURNS integer AS $$
DECLARE
  total_stock integer;
  reserved_stock integer;
BEGIN
  SELECT COALESCE(stock_quantity, 0) INTO total_stock FROM public.products WHERE id = p_product_id;
  SELECT COALESCE(SUM(quantity), 0) INTO reserved_stock FROM public.stock_reservations WHERE product_id = p_product_id AND expires_at > now();
  RETURN GREATEST(0, total_stock - reserved_stock);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to send order status notification email via edge function
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  user_name text;
BEGIN
  -- Only trigger on status changes for specific statuses
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('shipped', 'delivered', 'cancelled') THEN
    -- Get user email from auth.users
    SELECT au.email INTO user_email 
    FROM auth.users au 
    WHERE au.id = NEW.user_id;
    
    -- Get user name from profiles
    SELECT full_name INTO user_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Call edge function using pg_net (if available)
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-order-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'order_id', NEW.id,
        'new_status', NEW.status,
        'user_email', user_email,
        'order_number', NEW.order_number,
        'user_name', user_name
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Failed to send order notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status changes (only if pg_net is available)
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- Fix discount_codes RLS - remove public SELECT and use secure validation instead
DROP POLICY IF EXISTS "Active discount codes are viewable" ON public.discount_codes;

-- Create a policy that allows reading only through the RPC function
CREATE POLICY "Discount codes not directly accessible"
ON public.discount_codes FOR SELECT
USING (false);

-- Allow admin access to discount codes
CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'::app_role
));