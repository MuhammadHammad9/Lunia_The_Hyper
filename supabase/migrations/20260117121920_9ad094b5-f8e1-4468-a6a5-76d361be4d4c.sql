-- Create rate limiting table for tracking API requests
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit data
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limits FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own rate limits
CREATE POLICY "Users can create their own rate limits" 
ON public.rate_limits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limits
CREATE POLICY "Users can update their own rate limits" 
ON public.rate_limits FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_user_action ON public.rate_limits(user_id, action_type, window_start);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, now());
  
  RETURN TRUE;
END;
$$;

-- Cleanup old rate limit entries (keep last 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;

-- Fix conflicting product_reviews policies - remove the overly permissive one
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.product_reviews;

-- Create proper newsletter unsubscribe function
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET is_subscribed = false,
      unsubscribed_at = now()
  WHERE email = LOWER(TRIM(p_email));
  
  RETURN FOUND;
END;
$$;