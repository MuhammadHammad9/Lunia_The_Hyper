-- Add stripe_checkout_session_id to orders for payment tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS discount_code_id uuid REFERENCES public.discount_codes(id),
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Create abandoned_carts table for tracking abandoned carts
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cart_data jsonb NOT NULL,
  cart_total numeric NOT NULL DEFAULT 0,
  email_sent_at timestamp with time zone,
  reminder_count integer DEFAULT 0,
  recovered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on abandoned_carts
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Policies for abandoned_carts
CREATE POLICY "Users can view their own abandoned carts" 
ON public.abandoned_carts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own abandoned cart" 
ON public.abandoned_carts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own abandoned cart" 
ON public.abandoned_carts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own abandoned cart" 
ON public.abandoned_carts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create discount_code_usage table to track which users have used which codes
CREATE TABLE IF NOT EXISTS public.discount_code_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id uuid NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on discount_code_usage
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Policies for discount_code_usage
CREATE POLICY "Users can view their own discount usage" 
ON public.discount_code_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discount usage" 
ON public.discount_code_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add full-text search index to products
CREATE INDEX IF NOT EXISTS idx_products_search 
ON public.products 
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(tagline, '')));

-- Create a function to validate and apply discount codes
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  p_code text,
  p_order_total numeric,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discount_code discount_codes%ROWTYPE;
  v_usage_count integer;
  v_discount_amount numeric;
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount_code
  FROM discount_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (expires_at IS NULL OR expires_at > now());
  
  IF v_discount_code.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired discount code');
  END IF;
  
  -- Check if max uses reached
  IF v_discount_code.max_uses IS NOT NULL AND v_discount_code.uses_count >= v_discount_code.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This discount code has reached its maximum usage limit');
  END IF;
  
  -- Check minimum order amount
  IF p_order_total < v_discount_code.min_order_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Order total must be at least $' || v_discount_code.min_order_amount::text);
  END IF;
  
  -- Check if user already used this code
  SELECT COUNT(*) INTO v_usage_count
  FROM discount_code_usage
  WHERE discount_code_id = v_discount_code.id AND user_id = p_user_id;
  
  IF v_usage_count > 0 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'You have already used this discount code');
  END IF;
  
  -- Calculate discount amount
  IF v_discount_code.discount_type = 'percentage' THEN
    v_discount_amount := ROUND((p_order_total * v_discount_code.discount_value / 100)::numeric, 2);
  ELSE
    v_discount_amount := LEAST(v_discount_code.discount_value, p_order_total);
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'discount_code_id', v_discount_code.id,
    'code', v_discount_code.code,
    'discount_type', v_discount_code.discount_type,
    'discount_value', v_discount_code.discount_value,
    'discount_amount', v_discount_amount,
    'description', v_discount_code.description
  );
END;
$$;

-- Create a function to apply discount code after order
CREATE OR REPLACE FUNCTION public.apply_discount_code(
  p_discount_code_id uuid,
  p_user_id uuid,
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Record the usage
  INSERT INTO discount_code_usage (discount_code_id, user_id, order_id)
  VALUES (p_discount_code_id, p_user_id, p_order_id);
  
  -- Increment uses count
  UPDATE discount_codes
  SET uses_count = uses_count + 1
  WHERE id = p_discount_code_id;
END;
$$;

-- Add admin policies for order management
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- Add admin policies for products management
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Add category_id to products if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Add stock_quantity to products for inventory
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 100;

-- Add average_rating to products for filtering
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0;

-- Create function to update product average rating
CREATE OR REPLACE FUNCTION public.update_product_average_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM product_reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND moderation_status = 'approved'
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for updating average rating
DROP TRIGGER IF EXISTS update_product_rating ON product_reviews;
CREATE TRIGGER update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_average_rating();