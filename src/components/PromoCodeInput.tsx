import { useState } from 'react';
import { Tag, X, Loader2, CheckCircle } from 'lucide-react';
import { useDiscountCode } from '@/hooks/use-discount-code';

interface PromoCodeInputProps {
  orderTotal: number;
  onDiscountApplied?: (discountAmount: number, discountCodeId: string) => void;
  onDiscountRemoved?: () => void;
}

export const PromoCodeInput = ({ orderTotal, onDiscountApplied, onDiscountRemoved }: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const { isValidating, appliedDiscount, validateCode, removeDiscount } = useDiscountCode();

  const handleApply = async () => {
    const result = await validateCode(code, orderTotal);
    if (result.valid && result.discount_amount && result.discount_code_id) {
      onDiscountApplied?.(result.discount_amount, result.discount_code_id);
    }
  };

  const handleRemove = () => {
    removeDiscount();
    setCode('');
    onDiscountRemoved?.();
  };

  if (appliedDiscount?.valid) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-medium text-foreground">{appliedDiscount.code}</p>
            <p className="text-sm text-muted-foreground">
              {appliedDiscount.discount_type === 'percentage' 
                ? `${appliedDiscount.discount_value}% off` 
                : `$${appliedDiscount.discount_value} off`}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Promo Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleApply}
          disabled={!code.trim() || isValidating}
          className="px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
    </div>
  );
};
