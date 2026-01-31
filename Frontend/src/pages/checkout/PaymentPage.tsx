import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createOrder } from "@/lib/ordersApi";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { motion } from "framer-motion";
import {
  Building,
  CheckCircle,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSidebar } from "./components/CheckoutSidebar";
import { CheckoutSteps } from "./components/CheckoutSteps";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { selectedAddress, deliverySlot, clearCheckout } = useCheckoutStore();
  const [selectedMethod, setSelectedMethod] = useState<string>("razorpay");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get delivery cost from checkout store
  const deliveryCost = deliverySlot?.cost || 0;

  const paymentMethods: PaymentMethod[] = [
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Credit/Debit Card, UPI, Netbanking, Wallets",
      icon: <CreditCard className="h-6 w-6" />,
      available: true,
    },
    {
      id: "upi",
      name: "UPI",
      description: "Google Pay, PhonePe, Paytm & more",
      icon: <Smartphone className="h-6 w-6" />,
      available: true,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Rupay, Amex",
      icon: <CreditCard className="h-6 w-6" />,
      available: true,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "All major banks supported",
      icon: <Building className="h-6 w-6" />,
      available: true,
    },
    {
      id: "wallet",
      name: "Wallets",
      description: "Paytm, PhonePe, Amazon Pay",
      icon: <Wallet className="h-6 w-6" />,
      available: true,
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive",
      icon: <Wallet className="h-6 w-6" />,
      available: false, // Not available for rental items
    },
  ];

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
      // Create order from cart
      const result = await createOrder({
        addressId: selectedAddress.id,
        paymentMethod: selectedMethod,
      });

      console.log("[Payment] Order created successfully:", result);

      // Clear cart and checkout state
      clearCart();
      clearCheckout();

      toast.success(
        `Order placed successfully! ${result.count} order(s) created.`,
      );
      navigate("/orders");
    } catch (error: any) {
      console.error("[Payment] Order creation failed:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order";
      toast.error(message);
    } finally {
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
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={cn(
                          "relative rounded-xl border-2 transition-all",
                          !method.available && "opacity-50",
                          selectedMethod === method.id ?
                            "border-blue-600 bg-blue-50"
                          : "border-border hover:border-gray-400",
                        )}
                      >
                        <div className="flex items-center gap-4 p-4">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            disabled={!method.available}
                          />
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl",
                              selectedMethod === method.id ?
                                "bg-blue-200 text-blue-600"
                              : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {method.icon}
                          </div>
                          <Label
                            htmlFor={method.id}
                            className={cn(
                              "flex-1 cursor-pointer",
                              !method.available && "cursor-not-allowed",
                            )}
                          >
                            <div className="mb-1 font-semibold">
                              {method.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {method.description}
                            </div>
                            {!method.available && (
                              <div className="mt-1 text-xs font-medium text-red-600">
                                Not available for rental items
                              </div>
                            )}
                          </Label>
                          {method.available && selectedMethod === method.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {/* Additional Card Details (shown when card is selected) */}
                {selectedMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 rounded-xl border border-border p-4"
                  >
                    <h3 className="font-semibold">Card Details</h3>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          maxLength={3}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="Name on card"
                        className="mt-2"
                      />
                    </div>
                  </motion.div>
                )}

                {/* UPI Details (shown when UPI is selected) */}
                {selectedMethod === "upi" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 rounded-xl border border-border p-4"
                  >
                    <h3 className="font-semibold">UPI Details</h3>
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        className="mt-2"
                      />
                    </div>
                  </motion.div>
                )}

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
                    : "Place Order & Pay"}
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
