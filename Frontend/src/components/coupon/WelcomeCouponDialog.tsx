import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableCoupons, type Coupon } from '@/lib/couponApi';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function WelcomeCouponDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [welcomeCoupon, setWelcomeCoupon] = useState<Coupon | null>(null);
    const [copied, setCopied] = useState(false);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            checkForWelcomeCoupon();
        }
    }, [isAuthenticated]);

    const checkForWelcomeCoupon = async () => {
        try {
            // Check if dialog was already shown in this session
            const dialogShown = sessionStorage.getItem('welcomeCouponDialogShown');
            if (dialogShown) return;

            const coupons = await getAvailableCoupons();
            const welcomeCoupon = coupons.find(c => c.isWelcomeCoupon);

            if (welcomeCoupon) {
                setWelcomeCoupon(welcomeCoupon);
                setIsOpen(true);
                sessionStorage.setItem('welcomeCouponDialogShown', 'true');
            }
        } catch (error) {
            console.error('Failed to fetch welcome coupon:', error);
        }
    };

    const handleCopy = () => {
        if (welcomeCoupon) {
            navigator.clipboard.writeText(welcomeCoupon.code);
            setCopied(true);
            toast.success('Coupon code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!welcomeCoupon) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-blue-50 opacity-50" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20" />

                <div className="relative p-6">
                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Animated gift icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 shadow-lg"
                    >
                        <Gift className="h-10 w-10 text-white" />
                    </motion.div>

                    {/* Sparkles animation */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2">
                        <AnimatePresence>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                    animate={{
                                        opacity: 0,
                                        scale: 1,
                                        x: Math.cos((i * Math.PI * 2) / 6) * 50,
                                        y: Math.sin((i * Math.PI * 2) / 6) * 50,
                                    }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="absolute"
                                >
                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <DialogHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <DialogTitle className="text-2xl font-bold text-blue-600">
                                🎉 Congratulations!
                            </DialogTitle>
                        </motion.div>
                    </DialogHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 text-center space-y-4"
                    >
                        <p className="text-lg font-semibold text-gray-900">
                            You've got a <span className="text-blue-600 text-xl font-bold">{welcomeCoupon.discountValue}% discount</span>!
                        </p>
                        <p className="text-sm text-gray-600">
                            {welcomeCoupon.description}
                        </p>

                        {/* Coupon code box */}
                        <div className="relative mt-6 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-4">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                                <span className="text-xs font-semibold text-blue-600 uppercase">Your Code</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-1">
                                <code className="text-2xl font-bold tracking-wider text-blue-700">
                                    {welcomeCoupon.code}
                                </code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopy}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-blue-600" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Expiry info */}
                        {welcomeCoupon.expiryDate && (
                            <p className="text-xs text-gray-500">
                                Valid until {new Date(welcomeCoupon.expiryDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        )}

                        {/* CTA Button */}
                        <Button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
                            size="lg"
                        >
                            Start Shopping
                            <Sparkles className="ml-2 h-4 w-4" />
                        </Button>

                        <p className="text-xs text-gray-500 mt-2">
                            This coupon is valid on your first order only
                        </p>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
