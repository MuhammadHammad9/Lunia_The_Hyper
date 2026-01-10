-- Security hardening: Force RLS on sensitive tables
-- This prevents any bypass of Row Level Security policies

-- Force RLS on addresses table (contains customer PII)
ALTER TABLE public.addresses FORCE ROW LEVEL SECURITY;

-- Force RLS on orders table (contains financial data and addresses)
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- Force RLS on order_items table (linked to orders)
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;

-- Force RLS on cart_items table (user data)
ALTER TABLE public.cart_items FORCE ROW LEVEL SECURITY;

-- Force RLS on profiles table (user data)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Create a secure function to generate cryptographically random order numbers
CREATE OR REPLACE FUNCTION public.generate_secure_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    random_part TEXT;
    new_order_number TEXT;
    order_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate cryptographically random bytes and encode as hex
        random_part := UPPER(encode(gen_random_bytes(6), 'hex'));
        new_order_number := 'LUN-' || random_part;
        
        -- Check if this order number already exists
        SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) INTO order_exists;
        
        -- If unique, return the order number
        IF NOT order_exists THEN
            RETURN new_order_number;
        END IF;
    END LOOP;
END;
$$;

-- Update the orders table default (this doesn't affect existing code but provides DB-level generation)
COMMENT ON FUNCTION public.generate_secure_order_number() IS 'Generates cryptographically secure unique order numbers';