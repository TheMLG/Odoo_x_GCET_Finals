import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Tag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {MainLayout} from '@/components/layout/MainLayout';

const steps = [
  { id: 1, name: 'Contact Details' },
  { id: 2, name: 'Delivery Address' },
  { id: 3, name: 'ID Proof' },
  { id: 4, name: 'Review' },
  { id: 5, name: 'Payment' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalAmount } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCoupons, setShowCoupons] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: 'Ronit',
    lastName: 'Dhimmar',
    email: 'rajdhimmar4@gmail.com',
    phone: '8320331941',
    isWhatsApp: 'yes',
  });

  const deliveryDate = addDays(new Date(), 10); // Feb 10
  const pickupDate = addDays(new Date(), 13); // Feb 13
  const totalAmount = getTotalAmount();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveDetails = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Details saved!');
    setCurrentStep(2);
  };

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Add items to proceed to checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 md:px-6">
          <div className="mb-8 flex items-center gap-2">
            <button
              onClick={() => navigate('/cart')}
              className="rounded-full p-2 hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Steps Navigation */}
          <div className="mb-8 flex items-center justify-center gap-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                      step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : step.id < currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {step.id}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.id === currentStep ? 'text-blue-600' : 'text-gray-600'
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-white p-8 shadow-sm"
                >
                  <h2 className="mb-6 text-2xl font-bold">1. Contact Details</h2>

                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">
                          Your Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          <span className="sr-only">Last Name</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-8"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <select className="w-24 rounded-lg border border-border px-3 py-2">
                          <option>+91</option>
                        </select>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Is this your WhatsApp Number?</Label>
                      <RadioGroup
                        value={formData.isWhatsApp}
                        onValueChange={(value) =>
                          setFormData({ ...formData, isWhatsApp: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes" className="font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no" className="font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">WhatsApp number required for order details</span>
                        <br />
                        <span className="text-blue-700">
                          All order notifications are sent to you over WhatsApp.
                        </span>
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveDetails}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      Save Details
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep > 1 && (
                <div className="rounded-2xl bg-white p-8 shadow-sm">
                  <p className="text-center text-muted-foreground">
                    Step {currentStep} content coming soon...
                  </p>
                  <div className="mt-6 flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm"
              >
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

                {/* GST Credit */}
                <div className="mb-6 flex items-center gap-2">
                  <Checkbox id="gst" />
                  <Label htmlFor="gst" className="text-sm font-normal">
                    Claim GST credit up to 18% on this order
                  </Label>
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
                  <div className="mb-2 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-sm font-semibold">
                      Bill Summary
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="text-2xl font-bold">{formatPrice(totalAmount)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Price incl. of all taxes</p>
                </div>

                {/* Savings Message */}
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4">
                  <Zap className="h-5 w-5 fill-green-600 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Yay! You're saving {'\u20B9'}41,500 by choosing to rent.
                  </p>
                </div>

                {/* Payment Mode */}
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

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={currentStep < 5}
                  className="w-full rounded-xl bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700"
                  size="lg"
                >
                  Place Your Order & Pay
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By placing your order, you agree to RentX's privacy notice and conditions of
                  use.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
