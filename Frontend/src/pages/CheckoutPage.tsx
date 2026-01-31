import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Tag, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Contact Details' },
  { id: 2, name: 'Address' },
  { id: 3, name: 'Delivery Method' },
  { id: 4, name: 'Payment' },
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
    // Address fields
    fullName: '',
    addressPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="container flex flex-col items-center justify-center px-4 py-12">
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Add items to proceed to checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo Bar */}
      <div className="bg-white shadow-sm">
        <div className="container px-4 py-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cart')}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <span className="text-xl font-bold text-white">Q</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                SharePal
              </span>
            </div>
          </div>
          <ShieldCheck className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div className="container px-4 py-6 md:px-6 md:py-8">
        {/* Steps Navigation */}
        <div className="mb-6 flex items-center justify-center gap-1 overflow-x-auto md:mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm font-semibold transition-all',
                    step.id === currentStep
                      ? 'bg-blue-600 text-white'
                      : step.id < currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {step.id}
                </div>
                <span
                  className={cn(
                    'hidden md:inline text-xs md:text-sm font-medium whitespace-nowrap',
                    step.id === currentStep ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-0.5 md:mx-2 h-4 w-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Main Content */}
          <div>
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
              >
                <h2 className="mb-6 text-lg md:text-xl font-bold">1. Contact Details</h2>

                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        Your Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium sr-only">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-[26px] bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5 flex gap-2">
                      <select className="w-20 rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>+91</option>
                      </select>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="flex-1 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-sm font-medium">Is this your WhatsApp Number?</Label>
                    <RadioGroup
                      value={formData.isWhatsApp}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isWhatsApp: value })
                      }
                      className="flex gap-4"
                    >
                      <div
                        className={cn(
                          "flex items-center space-x-2 rounded-lg border-2 px-6 py-2.5 cursor-pointer transition-all",
                          formData.isWhatsApp === 'yes'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        onClick={() => setFormData({ ...formData, isWhatsApp: 'yes' })}
                      >
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="font-medium cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-center space-x-2 rounded-lg border-2 px-6 py-2.5 cursor-pointer transition-all",
                          formData.isWhatsApp === 'no'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        onClick={() => setFormData({ ...formData, isWhatsApp: 'no' })}
                      >
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="font-medium cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900">WhatsApp number required for order details</p>
                      <p className="text-blue-700 mt-0.5">
                        All order notifications are sent to you over WhatsApp.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveDetails}
                    className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-5 text-base font-semibold shadow-sm"
                    size="lg"
                  >
                    Save Details
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
              >
                <h2 className="mb-6 text-lg md:text-xl font-bold">2. Delivery Address</h2>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressPhone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5 flex gap-2">
                      <select className="w-20 rounded-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>+91</option>
                      </select>
                      <Input
                        id="addressPhone"
                        name="addressPhone"
                        value={formData.addressPhone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        className="flex-1 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-sm font-medium">
                      Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="House No., Building Name"
                      className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-sm font-medium">
                      Address Line 2
                    </Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Road name, Area, Colony (Optional)"
                      className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="postalCode" className="text-sm font-medium">
                        Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="PIN Code"
                        className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1.5 bg-gray-50 border-gray-300 focus:bg-white"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (!formData.fullName || !formData.addressPhone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
                          toast.error('Please fill in all required address fields');
                          return;
                        }
                        toast.success('Address saved!');
                        setCurrentStep(3);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Delivery
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep > 2 && (
              <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-200">
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
                  <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-6 rounded-lg bg-white p-6 shadow-sm border border-gray-200"
            >
              <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

              {/* Rental Period */}
              <div className="mb-5 flex items-center gap-2 rounded-lg bg-gray-50 p-3 border border-gray-200">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Rent for: {format(deliveryDate, 'do MMM')} • {format(pickupDate, 'do MMM')}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto h-7 rounded-full px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Edit
                </Button>
              </div>

              {/* GST Credit */}
              <div className="mb-5 flex items-start gap-2">
                <Checkbox id="gst" className="mt-0.5" />
                <Label htmlFor="gst" className="text-sm font-normal text-gray-700 leading-tight cursor-pointer">
                  Claim GST credit up to 18% on this order
                </Label>
              </div>

              {/* Coupon Code */}
              <div className="mb-5 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input placeholder="Enter coupon code" className="pr-10 bg-gray-50 border-gray-300" />
                    <Tag className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  <Button variant="outline" className="font-semibold">Apply</Button>
                </div>
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View Coupons
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', showCoupons && 'rotate-180')}
                  />
                </button>
              </div>

              {/* Bill Summary */}
              <div className="mb-5 rounded-lg border-2 border-gray-200 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <button className="flex items-center gap-1 text-sm font-bold text-gray-700">
                    Bill Summary
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(totalAmount)}</div>
                </div>
                <p className="text-xs text-gray-500">Price incl. of all taxes</p>
              </div>

              {/* Savings Message */}
              <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 border border-green-100">
                <Zap className="h-4 w-4 fill-green-600 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">
                  Yay! You're saving {'\u20B9'}41,500 by choosing to rent.
                </p>
              </div>

              {/* Payment Mode */}
              <div className="mb-5">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Payment Mode:</h3>
                <div className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-3 bg-blue-50/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Pay via Razorpay</div>
                    <div className="text-xs text-gray-600">
                      Cards, Netbanking, Wallet & UPI
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={currentStep < 4}
                className="w-full rounded-lg bg-blue-600 py-5 text-base font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                Place Your Order & Pay
              </Button>

              <p className="mt-4 text-center text-xs text-gray-500 leading-relaxed">
                By placing your order, you agree to SharePal's privacy notice and conditions of use.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
