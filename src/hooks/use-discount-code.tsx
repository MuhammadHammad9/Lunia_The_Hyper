import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscountValidation {
  valid: boolean;
  error?: string;
  discount_code_id?: string;
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  description?: string;
}

export const useDiscountCode = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidation | null>(null);

  const validateCode = useCallback(async (code: string, orderTotal: number): Promise<DiscountValidation> => {
    if (!code.trim()) {
      return { valid: false, error: 'Please enter a discount code' };
    }

    setIsValidating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsValidating(false);
        return { valid: false, error: 'Please sign in to use discount codes' };
      }

      const { data, error } = await supabase.rpc('validate_discount_code', {
        p_code: code,
        p_order_total: orderTotal,
        p_user_id: user.id,
      });

      if (error) {
        console.error('Validation error:', error);
        setIsValidating(false);
        return { valid: false, error: 'Failed to validate discount code' };
      }

      const result = data as unknown as DiscountValidation;
      
      if (result.valid) {
        setAppliedDiscount(result);
        toast.success(`Discount applied: ${result.discount_type === 'percentage' ? `${result.discount_value}% off` : `$${result.discount_value} off`}`);
      } else {
        toast.error(result.error || 'Invalid discount code');
      }

      setIsValidating(false);
      return result;
    } catch (error) {
      console.error('Discount validation error:', error);
      setIsValidating(false);
      return { valid: false, error: 'Failed to validate discount code' };
    }
  }, []);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
    toast.info('Discount removed');
  }, []);

  const calculateDiscountedTotal = useCallback((subtotal: number): { discountAmount: number; finalTotal: number } => {
    if (!appliedDiscount || !appliedDiscount.valid) {
      return { discountAmount: 0, finalTotal: subtotal };
    }

    let discountAmount = 0;
    if (appliedDiscount.discount_type === 'percentage') {
      discountAmount = (subtotal * (appliedDiscount.discount_value || 0)) / 100;
    } else {
      discountAmount = Math.min(appliedDiscount.discount_value || 0, subtotal);
    }

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalTotal: Math.round((subtotal - discountAmount) * 100) / 100,
    };
  }, [appliedDiscount]);

  return {
    isValidating,
    appliedDiscount,
    validateCode,
    removeDiscount,
    calculateDiscountedTotal,
  };
};
