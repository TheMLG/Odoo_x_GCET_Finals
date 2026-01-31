import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Tag, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/stores/cartStore';
import { format, addDays } from 'date-fns';
import { useState } from 'react';

interface CheckoutSidebarProps {
  currentStep: number;
  deliveryCost?: number;
}

export function CheckoutSidebar({ currentStep, deliveryCost = 0 }: CheckoutSidebarProps) {
  const { items, getTotalAmount } = useCartStore();
  const [showCoupons, setShowCoupons] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(true);

  const subtotalAmount = getTotalAmount();
  const totalAmount = subtotalAmount + deliveryCost;
  const deliveryDate = addDays(new Date(), 10);
  const pickupDate = addDays(new Date(), 13);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate savings (assuming 70% savings by renting)
  const originalPrice = totalAmount * 3.33; // Approximate retail price
  const savings = originalPrice - totalAmount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

        {/* Rental Period */}
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-gray-50 p-3">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium">
            Rent for: {format(deliveryDate, 'do MMM')} •{' '}
            {format(pickupDate, 'do MMM')}
          </span>
          <Button variant="ghost" size="sm" className="ml-auto rounded-full text-xs">
            Edit
          </Button>
        </div>

        {/* Items Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </div>


        {/* Coupon Code */}
        <div className="mb-6 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input placeholder="Enter coupon code" className="pr-10" />
              <Tag className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button variant="outline">Apply</Button>
          </div>
          <button
            onClick={() => setShowCoupons(!showCoupons)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View Coupons
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showCoupons ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="mb-6 rounded-xl border border-border p-4">
          <button
            onClick={() => setShowBillDetails(!showBillDetails)}
            className="mb-2 flex w-full items-center justify-between"
          >
            <span className="flex items-center gap-1 text-sm font-semibold">
              Bill Summary
              <ChevronDown className={`h-4 w-4 transition-transform ${showBillDetails ? 'rotate-180' : ''}`} />
            </span>
            <div className="text-2xl font-bold">{formatPrice(totalAmount)}</div>
          </button>
          <p className="text-xs text-muted-foreground">Price incl. of all taxes</p>

          {showBillDetails && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Cost (Base)</span>
                <span className="font-medium">{formatPrice(subtotalAmount / 1.18)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-medium">{formatPrice(subtotalAmount - (subtotalAmount / 1.18))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charges</span>
                {deliveryCost === 0 ? (
                  <span className="font-medium text-green-600">FREE</span>
                ) : (
                  <span className="font-medium">{formatPrice(deliveryCost)}</span>
                )}
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Savings Message */}
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4">
          <Zap className="h-5 w-5 fill-green-600 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Yay! You're saving {formatPrice(savings)} by choosing to rent.
          </p>
        </div>

        {/* Payment Mode */}
        {currentStep >= 4 && (
          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Payment Mode:</h3>
            <div className="flex items-center gap-3 rounded-xl border border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Pay via Razorpay</div>
                <div className="text-sm text-muted-foreground">
                  Cards, Netbanking, Wallet & UPI
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Text */}
        <p className="text-center text-xs text-muted-foreground">
          By placing your order, you agree to our privacy notice and conditions of use.
        </p>
      </div>
    </motion.div>
  );
}
