-- Force RLS on addresses table for additional security hardening
-- This ensures RLS policies cannot be bypassed even by table owners

ALTER TABLE public.addresses FORCE ROW LEVEL SECURITY;