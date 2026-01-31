import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createRazorpayOrder, verifyPayment } from "@/lib/ordersApi";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSidebar } from "./components/CheckoutSidebar";
import { CheckoutSteps } from "./components/CheckoutSteps";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { clearCart, appliedCoupon } = useCartStore();
  const { selectedAddress, deliverySlot, clearCheckout } = useCheckoutStore();
  const [selectedMethod, setSelectedMethod] = useState<string>("razorpay");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get delivery cost from checkout store
  const deliveryCost = deliverySlot?.cost || 0;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Get address from checkout store
    if (!selectedAddress?.id) {
      toast.error(
        "Delivery address not found. Please go back and select an address.",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 1. Create Order on Backend (Get Order ID and Key)
      const orderData = {
        couponCode: appliedCoupon?.code
      };

      const data = await createRazorpayOrder(orderData);

      // 2. Open Razorpay options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "RentX",
        description: "Rental Transaction",
        image: "/RentX.png",
        order_id: data.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            console.log("Payment Success", response);
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId: selectedAddress.id,
              couponCode: appliedCoupon?.code
            };

            await verifyPayment(verifyData);

            // Clear cart and checkout state
            clearCart();
            clearCheckout();

            toast.success('Order placed successfully!');
            navigate("/orders");

          } catch (error: any) {
            console.error("Verification Failed:", error);
            toast.error("Payment verification failed. Please contact support if money was deducted.");
            setIsProcessing(false);
          }
        },
        prefill: {
          // TODO: Add user details here if available from auth store
          name: "RentX User",
          email: "user@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "RentX Corporate Office",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response: any) {
        toast.error(response.error.description || "Payment failed");
        setIsProcessing(false);
      });

    } catch (error: any) {
      console.error("[Payment] Order creation failed:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order";
      toast.error(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <CheckoutSteps currentStep={4} />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">
                    4. Payment Method
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Payment Methods */}
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "relative rounded-xl border-2 transition-all",
                        selectedMethod === "razorpay" ?
                          "border-blue-600 bg-blue-50"
                          : "border-border hover:border-gray-400",
                      )}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <RadioGroupItem
                          value="razorpay"
                          id="razorpay"
                        />
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl",
                            selectedMethod === "razorpay" ?
                              "bg-blue-200 text-blue-600"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <Label
                          htmlFor="razorpay"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="mb-1 font-semibold">
                            Razorpay
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Credit/Debit Card, UPI, Netbanking, Wallets
                          </div>
                        </Label>
                        {selectedMethod === "razorpay" && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* Security & Trust Badges */}
                <div className="rounded-xl bg-green-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Safe & Secure Payment
                    </h4>
                  </div>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Your payment information is encrypted and secure</li>
                    <li>• We never store your card details</li>
                    <li>• 100% payment protection</li>
                    <li>• Trusted by thousands of customers</li>
                  </ul>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) =>
                      setAgreeToTerms(checked as boolean)
                    }
                  />
                  <Label htmlFor="terms" className="cursor-pointer text-sm">
                    I agree to the{" "}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    . I understand that rental items must be returned in good
                    condition and by the specified date.
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/checkout/delivery-time")}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!selectedMethod || !agreeToTerms || isProcessing}
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isProcessing ?
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Processing...
                      </>
                      : "Pay Now"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          <CheckoutSidebar currentStep={4} deliveryCost={deliveryCost} />
        </div>
      </div>
    </div>
  );
}
