import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { addDays, format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, IndianRupee, MapPin, Package, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSidebar } from "./components/CheckoutSidebar";
import { CheckoutSteps } from "./components/CheckoutSteps";

interface ShippingSlot {
  id: string;
  label: string;
  time: string;
  cost: number;
  description: string;
  available: boolean;
}

export default function DeliveryTimePage() {
  const navigate = useNavigate();
  const { setDeliveryType, setDeliverySlot } = useCheckoutStore();

  const [localDeliveryType, setLocalDeliveryType] = useState<
    "pickup" | "shipping"
  >("shipping");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(
    addDays(new Date(), 2),
  );

  // Shipping time slots with costs
  const shippingSlots: ShippingSlot[] = [
    {
      id: "standard",
      label: "Standard Delivery",
      time: "5-7 Business Days",
      cost: 0,
      description: "Free delivery, no rush",
      available: true,
    },
    {
      id: "express",
      label: "Express Delivery",
      time: "2-3 Business Days",
      cost: 99,
      description: "Faster delivery for urgent needs",
      available: true,
    },
    {
      id: "priority",
      label: "Priority Delivery",
      time: "1 Business Day",
      cost: 199,
      description: "Next day delivery",
      available: true,
    },
    {
      id: "same-day",
      label: "Same Day Delivery",
      time: "Within 6 Hours",
      cost: 299,
      description: "Get it today (if ordered before 12 PM)",
      available: false, // Not available for all locations
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleContinue = () => {
    if (localDeliveryType === "shipping" && !selectedSlot) {
      toast.error("Please select a shipping option");
      return;
    }

    // Save to checkout store
    setDeliveryType(localDeliveryType);

    if (localDeliveryType === "shipping") {
      const slot = shippingSlots.find((s) => s.id === selectedSlot);
      if (slot) {
        setDeliverySlot({
          id: slot.id,
          date: format(
            addDays(
              new Date(),
              slot.id === "standard" ? 7
              : slot.id === "express" ? 3
              : 1,
            ),
            "yyyy-MM-dd",
          ),
          time: slot.time,
          cost: slot.cost,
        });
      }
    } else {
      setDeliverySlot({
        id: "pickup",
        date: format(selectedDate, "yyyy-MM-dd"),
        time: "Store Hours",
        cost: 0,
      });
    }

    toast.success(
      `${localDeliveryType === "pickup" ? "Pickup" : "Shipping"} option selected!`,
    );
    navigate("/checkout/payment");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <CheckoutSteps currentStep={3} />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">
                    3. Delivery Method
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to receive your order
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Delivery Type Selection */}
                <div>
                  <h3 className="mb-4 font-semibold">Select Delivery Option</h3>
                  <RadioGroup
                    value={localDeliveryType}
                    onValueChange={(value: any) => {
                      setLocalDeliveryType(value);
                      setSelectedSlot(""); // Reset slot selection when type changes
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Pickup Option */}
                      <div
                        className={cn(
                          "relative rounded-xl border-2 transition-all cursor-pointer",
                          localDeliveryType === "pickup" ?
                            "border-blue-600 bg-blue-50"
                          : "border-border hover:border-gray-400",
                        )}
                      >
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                              <Package className="h-7 w-7 text-green-600" />
                            </div>
                          </div>
                          <Label htmlFor="pickup" className="cursor-pointer">
                            <div className="mb-2 text-lg font-bold">
                              Store Pickup
                            </div>
                            <div className="mb-3 text-sm text-muted-foreground">
                              Pickup from our store location
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 text-sm font-medium text-green-700">
                              <IndianRupee className="h-4 w-4" />
                              <span>FREE</span>
                            </div>
                          </Label>
                        </div>
                      </div>

                      {/* Shipping Option */}
                      <div
                        className={cn(
                          "relative rounded-xl border-2 transition-all cursor-pointer",
                          localDeliveryType === "shipping" ?
                            "border-blue-600 bg-blue-50"
                          : "border-border hover:border-gray-400",
                        )}
                      >
                        <div className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <RadioGroupItem value="shipping" id="shipping" />
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                              <Truck className="h-7 w-7 text-blue-600" />
                            </div>
                          </div>
                          <Label htmlFor="shipping" className="cursor-pointer">
                            <div className="mb-2 text-lg font-bold">
                              Home Delivery
                            </div>
                            <div className="mb-3 text-sm text-muted-foreground">
                              Get it delivered to your doorstep
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-sm font-medium text-blue-700">
                              <Clock className="h-4 w-4" />
                              <span>Multiple Options</span>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Pickup Date Selection */}
                {localDeliveryType === "pickup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-border bg-gray-50 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Pickup Location</h3>
                      </div>
                      <div className="mb-4 text-sm">
                        <p className="font-medium">
                          SharePal Store - Main Branch
                        </p>
                        <p className="text-muted-foreground">
                          123 Main Street, Commercial Complex
                        </p>
                        <p className="text-muted-foreground">
                          City Center, State - 123456
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          <span className="font-medium">Hours:</span> Mon-Sat:
                          10:00 AM - 8:00 PM
                        </p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                        <p className="font-medium">Pickup available from:</p>
                        <p className="text-lg font-bold">
                          {format(selectedDate, "EEEE, MMMM do, yyyy")}
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                          Please bring a valid ID and order confirmation
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Shipping Time Slots */}
                {localDeliveryType === "shipping" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Select Shipping Speed</h3>
                    </div>

                    <RadioGroup
                      value={selectedSlot}
                      onValueChange={setSelectedSlot}
                    >
                      <div className="space-y-3">
                        {shippingSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={cn(
                              "relative rounded-xl border-2 transition-all",
                              !slot.available && "opacity-50",
                              selectedSlot === slot.id ?
                                "border-blue-600 bg-blue-50"
                              : "border-border hover:border-gray-400",
                            )}
                          >
                            <div className="flex items-start gap-4 p-4">
                              <RadioGroupItem
                                value={slot.id}
                                id={slot.id}
                                disabled={!slot.available}
                                className="mt-1"
                              />
                              <Label
                                htmlFor={slot.id}
                                className={cn(
                                  "flex-1 cursor-pointer",
                                  !slot.available && "cursor-not-allowed",
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="mb-1 font-bold">
                                      {slot.label}
                                    </div>
                                    <div className="mb-1 text-sm font-medium text-blue-600">
                                      {slot.time}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {slot.description}
                                    </div>
                                    {!slot.available && (
                                      <div className="mt-2 text-xs font-medium text-red-600">
                                        Not available for your location
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {slot.cost === 0 ?
                                      <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                        FREE
                                      </div>
                                    : <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
                                        {formatPrice(slot.cost)}
                                      </div>
                                    }
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {/* Shipping Info */}
                    <div className="rounded-xl bg-blue-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">
                          Shipping Information
                        </h4>
                      </div>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• All deliveries are fully tracked and insured</li>
                        <li>• Contactless delivery available upon request</li>
                        <li>• Delivery partner will call before arrival</li>
                        <li>• Signature required for high-value items</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/checkout/address")}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={localDeliveryType === "shipping" && !selectedSlot}
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          <CheckoutSidebar
            currentStep={3}
            deliveryCost={
              localDeliveryType === "shipping" && selectedSlot ?
                shippingSlots.find((s) => s.id === selectedSlot)?.cost || 0
              : 0
            }
          />
        </div>
      </div>
    </div>
  );
}
