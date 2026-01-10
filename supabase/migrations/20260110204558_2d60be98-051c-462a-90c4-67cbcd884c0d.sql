-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- RLS: Admins can manage roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create helpful_votes table for review helpfulness
CREATE TABLE public.helpful_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid REFERENCES public.product_reviews(id) ON DELETE CASCADE NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (review_id, user_id)
);

-- Enable RLS on helpful_votes
ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for helpful_votes
CREATE POLICY "Anyone can view helpful votes" ON public.helpful_votes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote helpful" ON public.helpful_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful vote" ON public.helpful_votes
FOR DELETE USING (auth.uid() = user_id);

-- Add moderation columns to product_reviews
ALTER TABLE public.product_reviews 
ADD COLUMN moderation_status text NOT NULL DEFAULT 'pending',
ADD COLUMN moderation_notes text,
ADD COLUMN moderated_by uuid,
ADD COLUMN moderated_at timestamp with time zone;

-- Create index for faster moderation queries
CREATE INDEX idx_product_reviews_moderation ON public.product_reviews(moderation_status);
CREATE INDEX idx_helpful_votes_review ON public.helpful_votes(review_id);

-- Update RLS policy for product_reviews to only show approved reviews publicly
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
FOR SELECT USING (
    moderation_status = 'approved' 
    OR auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
);

-- Admins/moderators can update moderation status
CREATE POLICY "Admins can moderate reviews" ON public.product_reviews
FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'moderator')
);

-- Admins can delete any review
CREATE POLICY "Admins can delete reviews" ON public.product_reviews
FOR DELETE USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
);