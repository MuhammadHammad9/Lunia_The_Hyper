-- Create product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.product_reviews 
FOR SELECT 
USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.product_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.product_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create order tracking events table
CREATE TABLE public.order_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tracking events
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Users can view tracking events for their orders
CREATE POLICY "Users can view their order tracking events" 
ON public.order_tracking_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_tracking_events.order_id 
  AND orders.user_id = auth.uid()
));

-- Create index for faster lookups
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_order_tracking_events_order_id ON public.order_tracking_events(order_id);

-- Add trigger for reviews updated_at
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to insert initial tracking event when order is created
CREATE OR REPLACE FUNCTION public.create_initial_tracking_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_tracking_events (order_id, status, title, description)
  VALUES (NEW.id, NEW.status, 'Order Placed', 'Your order has been successfully placed and is awaiting confirmation.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create initial tracking event
CREATE TRIGGER on_order_created_tracking
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_tracking_event();

-- Create function to add tracking event on status change
CREATE OR REPLACE FUNCTION public.add_tracking_event_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  event_description TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'processing' THEN
        event_title := 'Order Processing';
        event_description := 'Your order is being prepared by our team.';
      WHEN 'shipped' THEN
        event_title := 'Order Shipped';
        event_description := 'Your package is on its way! Track your shipment for delivery updates.';
      WHEN 'delivered' THEN
        event_title := 'Order Delivered';
        event_description := 'Your order has been delivered. Enjoy your products!';
      WHEN 'cancelled' THEN
        event_title := 'Order Cancelled';
        event_description := 'Your order has been cancelled.';
      ELSE
        event_title := 'Status Updated';
        event_description := 'Your order status has been updated to: ' || NEW.status;
    END CASE;
    
    INSERT INTO public.order_tracking_events (order_id, status, title, description)
    VALUES (NEW.id, NEW.status, event_title, event_description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for status change tracking
CREATE TRIGGER on_order_status_change_tracking
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.add_tracking_event_on_status_change();