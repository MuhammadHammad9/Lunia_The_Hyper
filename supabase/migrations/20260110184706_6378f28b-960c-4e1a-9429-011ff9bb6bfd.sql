-- Fix newsletter_subscribers RLS policies to be more restrictive

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can manage their subscription by email" ON public.newsletter_subscribers;

-- Create more restrictive policies
-- Anyone can insert (subscribe) - this is intentional for public newsletter signup
CREATE POLICY "Public newsletter signup" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (is_subscribed = true);

-- Only allow updates where email matches (for unsubscribe links with email token)
-- In practice, this would be handled via an edge function with proper verification
CREATE POLICY "Users can unsubscribe via verified email" 
ON public.newsletter_subscribers FOR UPDATE 
USING (false)
WITH CHECK (false);

-- No one can select newsletter subscribers (admin only via service role)
CREATE POLICY "Newsletter list is private" 
ON public.newsletter_subscribers FOR SELECT 
USING (false);