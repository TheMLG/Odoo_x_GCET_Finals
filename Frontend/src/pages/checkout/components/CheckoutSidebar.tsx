import { CouponSelector } from "@/components/coupon/CouponSelector";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { addDays, format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, CreditCard, Zap } from "lucide-react";
import { useState } from "react";

interface CheckoutSidebarProps {
  currentStep: number;
  deliveryCost?: number;
}

export function CheckoutSidebar({
  currentStep,
  deliveryCost = 0,
}: CheckoutSidebarProps) {
  // Use global cartStore for coupon state to persist across all checkout pages
  const { items, getTotalAmount, appliedCoupon, applyCoupon, removeCoupon } =
    useCartStore();
  const [showBillDetails, setShowBillDetails] = useState(true);

  const subtotalAmount = getTotalAmount();
  const discountAmount = appliedCoupon?.discount || 0;
  const totalAfterDiscount = subtotalAmount - discountAmount + deliveryCost;
  const deliveryDate = addDays(new Date(), 10);
  const pickupDate = addDays(new Date(), 13);

  const handleCouponApplied = (code: string, discount: number) => {
    if (code && discount > 0) {
      applyCoupon({ code, discount });
    } else {
      removeCoupon();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate savings (assuming 70% savings by renting)
  const originalPrice = totalAfterDiscount * 3.33; // Approximate retail price
  const savings = originalPrice - totalAfterDiscount;

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
            Rent for: {format(deliveryDate, "do MMM")} •{" "}
            {format(pickupDate, "do MMM")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full text-xs"
          >
            Edit
          </Button>
        </div>

        {/* Items Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </div>

        {/* Cart Items Preview */}
        <div className="mb-6 space-y-3 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg bg-gray-50 p-2">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                <img
                  src={
                    item.product.images[0] || "https://via.placeholder.com/56"
                  }
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {item.product.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
                {item.selectedAttributes &&
                  Object.keys(item.selectedAttributes).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.selectedAttributes).map(
                        ([key, value]) => (
                          <span
                            key={key}
                            className="text-xs text-muted-foreground"
                          >
                            {key}: {value as string}
                          </span>
                        ),
                      )}
                    </div>
                  )}
              </div>
              <div className="text-sm font-semibold whitespace-nowrap">
                {formatPrice(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code */}
        <div className="mb-6 space-y-2">
          <CouponSelector
            totalAmount={subtotalAmount}
            onCouponApplied={handleCouponApplied}
            appliedCouponCode={appliedCoupon?.code}
          />
        </div>

        {/* Bill Summary */}
        <div className="mb-6 rounded-xl border border-border p-4">
          <button
            onClick={() => setShowBillDetails(!showBillDetails)}
            className="mb-2 flex w-full items-center justify-between"
          >
            <span className="flex items-center gap-1 text-sm font-semibold">
              Bill Summary
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showBillDetails ? "rotate-180" : ""}`}
              />
            </span>
            <div className="text-2xl font-bold">
              {formatPrice(totalAfterDiscount)}
            </div>
          </button>
          <p className="text-xs text-muted-foreground">
            Price incl. of all taxes
          </p>

          {showBillDetails && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(subtotalAmount)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Rental Cost (Base)
                </span>
                <span className="font-medium">
                  {formatPrice((subtotalAmount - discountAmount) / 1.18)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-medium">
                  {formatPrice(
                    subtotalAmount -
                      discountAmount -
                      (subtotalAmount - discountAmount) / 1.18,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charges</span>
                {deliveryCost === 0 ?
                  <span className="font-medium text-green-600">FREE</span>
                : <span className="font-medium">
                    {formatPrice(deliveryCost)}
                  </span>
                }
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(totalAfterDiscount)}
                </span>
              </div>
            </div>
          )}
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
          By placing your order, you agree to our privacy notice and conditions
          of use.
        </p>
      </div>
    </motion.div>
  );
}
