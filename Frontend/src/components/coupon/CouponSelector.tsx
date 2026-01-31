import { useState, useEffect } from 'react';
import { Tag, ChevronDown, Loader2, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getAvailableCoupons, validateCoupon, type Coupon } from '@/lib/couponApi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CouponSelectorProps {
    totalAmount: number;
    onCouponApplied: (couponCode: string, discountAmount: number) => void;
    appliedCouponCode?: string;
}

export function CouponSelector({ totalAmount, onCouponApplied, appliedCouponCode }: CouponSelectorProps) {
    const [showCoupons, setShowCoupons] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (showCoupons && coupons.length === 0) {
            fetchCoupons();
        }
    }, [showCoupons]);

    const fetchCoupons = async () => {
        try {
            setIsLoading(true);
            const data = await getAvailableCoupons();
            setCoupons(data);
        } catch (error: any) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyCoupon = async (code: string) => {
        if (!code.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        try {
            setIsApplying(true);
            const result = await validateCoupon(code.toUpperCase(), totalAmount);
            onCouponApplied(result.coupon.code, result.discountAmount);
            toast.success(`Coupon applied! You saved ₹${result.discountAmount.toFixed(0)}`);
            setCouponCode('');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Invalid coupon code';
            toast.error(errorMessage);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Coupon Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder={appliedCouponCode || "Enter coupon code"}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCouponCode || isApplying}
                        className="pr-10 bg-gray-50 border-gray-300 uppercase placeholder:normal-case"
                    />
                    <Tag className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <Button
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={!!appliedCouponCode || isApplying || !couponCode.trim()}
                    variant="outline"
                    className="font-semibold min-w-[80px]"
                >
                    {isApplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : appliedCouponCode ? (
                        'Applied'
                    ) : (
                        'Apply'
                    )}
                </Button>
            </div>

            {/* View Coupons Toggle */}
            {!appliedCouponCode && (
                <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View Available Coupons
                    <ChevronDown
                        className={cn('h-4 w-4 transition-transform duration-200', showCoupons && 'rotate-180')}
                    />
                </button>
            )}

            {/* Coupons List */}
            <AnimatePresence>
                {showCoupons && !appliedCouponCode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                </div>
                            ) : coupons.length === 0 ? (
                                <div className="text-center py-6 text-sm text-muted-foreground rounded-lg border border-dashed">
                                    No coupons available
                                </div>
                            ) : (
                                coupons.map((coupon) => (
                                    <motion.div
                                        key={coupon.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            'relative overflow-hidden rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md',
                                            coupon.isWelcomeCoupon
                                                ? 'border-gradient-to-r from-blue-400 to-purple-400 bg-gradient-to-r from-blue-50 to-purple-50'
                                                : 'border-gray-200 bg-white'
                                        )}
                                        onClick={() => handleApplyCoupon(coupon.code)}
                                    >
                                        {coupon.isWelcomeCoupon && (
                                            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-yellow-400 opacity-20" />
                                        )}

                                        <div className="relative flex items-start gap-3">
                                            <div className={cn(
                                                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
                                                coupon.isWelcomeCoupon
                                                    ? "bg-gradient-to-br from-blue-500 to-purple-500"
                                                    : "bg-blue-100"
                                            )}>
                                                {coupon.isWelcomeCoupon ? (
                                                    <Gift className="h-6 w-6 text-white" />
                                                ) : (
                                                    <Tag className="h-6 w-6 text-blue-600" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-sm">{coupon.code}</span>
                                                            {coupon.isWelcomeCoupon && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-xs font-semibold text-white">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    Welcome Offer
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                            {coupon.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className={cn(
                                                            "text-lg font-bold",
                                                            coupon.isWelcomeCoupon ? "text-purple-600" : "text-blue-600"
                                                        )}>
                                                            {coupon.discountType === 'PERCENTAGE'
                                                                ? `${coupon.discountValue}% OFF`
                                                                : `₹${coupon.discountValue} OFF`}
                                                        </div>
                                                    </div>
                                                </div>

                                                {coupon.minOrderAmount && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Min. order: ₹{coupon.minOrderAmount}
                                                    </p>
                                                )}
                                                {coupon.expiryDate && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Expires: {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Applied Coupon Display */}
            {appliedCouponCode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                            <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-900">{appliedCouponCode} Applied!</p>
                            <p className="text-xs text-green-700">Discount applied to your order</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCouponApplied('', 0)}
                        className="text-green-700 hover:text-green-900 hover:bg-green-100"
                    >
                        Remove
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
