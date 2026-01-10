-- Create review likes table
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Review likes are viewable by everyone" 
ON public.review_likes 
FOR SELECT 
USING (true);

-- Users can like reviews
CREATE POLICY "Users can like reviews" 
ON public.review_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can remove their own likes" 
ON public.review_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON public.review_likes(user_id);