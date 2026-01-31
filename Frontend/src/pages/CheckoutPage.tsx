import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { createRazorpayOrder, verifyPayment } from '@/lib/orderApi';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Tag, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Contact Details' },
  { id: 2, name: 'Address' },
  { id: 3, name: 'Payment' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalAmount, fetchCart, appliedCoupon, clearCart, applyCoupon, removeCoupon } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCoupons, setShowCoupons] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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
  const discountAmount = appliedCoupon?.discount || 0;
  const totalAfterDiscount = totalAmount - discountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCouponApplied = (code: string, discount: number) => {
    if (code && discount > 0) {
      applyCoupon({ code, discount });
    } else {
      removeCoupon();
    }
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
    if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Please complete the address details first.');
      setCurrentStep(2);
      return;
    }

    try {
      setIsPlacingOrder(true);
      console.log("Initiating Razorpay Order...");

      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        console.error("Razorpay SDK load failed");
        setIsPlacingOrder(false);
        return;
      }

      // 1. Create Order on Backend (Get Order ID and Key)
      const orderData = {
        couponCode: appliedCoupon?.code
      };

      console.log("Creating backend order...");
      const data = await createRazorpayOrder(orderData);

      console.log("Razorpay Order Created:", data);

      if (!data || !data.id) {
        throw new Error("Invalid response from backend: Missing order ID");
      }

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
            console.log("Payment Success Callback", response);
            // alert(`Payment Success! ${response.razorpay_payment_id}`); // Debug alert
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId: 'temp-address-id', // TODO: Use selected address ID
              couponCode: appliedCoupon?.code
            };

            await verifyPayment(verifyData);

            toast.success('Order placed successfully!', {
              description: 'Thank you for your order. You will receive a confirmation shortly.',
            });

            // Clear cart including coupon
            await clearCart();
            navigate('/orders');

          } catch (error: any) {
            console.error("Verification Failed:", error);
            toast.error("Payment verification failed. Please contact support if money was deducted.");
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: "RentX Corporate Office",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setIsPlacingOrder(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response: any) {
        console.error("Payment Failed:", response.error);
        toast.error(response.error.description || "Payment failed");
        setIsPlacingOrder(false);
      });

    } catch (error: any) {
      console.error('Failed to initiate payment:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setIsPlacingOrder(false);
    }
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
              <img src="/RentX.png" alt="RentX Logo" className="h-10 w-auto" />
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
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
              >
                <h2 className="mb-6 text-lg md:text-xl font-bold">3. Payment Methods</h2>

                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-blue-600 bg-blue-50 p-4 flex items-center gap-4 cursor-pointer">
                    <div className="flex-shrink-0">
                      <RadioGroup value="razorpay">
                        <RadioGroupItem value="razorpay" checked={true} />
                      </RadioGroup>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Pay via Razorpay</h3>
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">UPI, Cards, Wallets, NetBanking</p>
                    </div>
                    <div>
                      <img src="/RentX.png" className="h-8 w-auto opacity-80" alt="Razorpay" />
                    </div>
                  </div>

                  {/* We removed other methods as requested */}
                </div>

                <div className="mt-8 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      // alert("DEBUG: Place Order Clicked"); // User-visible debug
                      handlePlaceOrder();
                    }}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
                    size="lg"
                  >
                    {isPlacingOrder ? 'Processing...' : `Pay Now ${formatPrice(totalAfterDiscount)}`}
                  </Button>
                </div>

              </motion.div>
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

              {/* Cart Items Preview */}
              <div className="mb-5 space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-lg bg-gray-50 p-2 border border-gray-100">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                      <img
                        src={item.product.images[0] || 'https://via.placeholder.com/48'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(item.selectedAttributes).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-400">
                              {key}: {value as string}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>

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
                <CouponSelector
                  totalAmount={totalAmount}
                  onCouponApplied={handleCouponApplied}
                  appliedCouponCode={appliedCoupon?.code}
                />
              </div>

              {/* Bill Summary */}
              <div className="mb-5 rounded-lg border-2 border-gray-200 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <button className="flex items-center gap-1 text-sm font-bold text-gray-700">
                    Bill Summary
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(totalAfterDiscount)}</div>
                </div>
                <p className="text-xs text-gray-500">Price incl. of all taxes</p>

                {/* Order breakdown */}
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium">{formatPrice(totalAfterDiscount / 1.18)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">{formatPrice(totalAfterDiscount - (totalAfterDiscount / 1.18))}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Amount</span>
                    <span className="text-lg text-primary">{formatPrice(totalAfterDiscount)}</span>
                  </div>
                </div>
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

              {/* Place Order Button Mobile */}
              <Button
                onClick={handlePlaceOrder}
                disabled={currentStep < 3 || isPlacingOrder}
                className="w-full rounded-lg bg-blue-600 py-5 text-base font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {isPlacingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing Order...
                  </span>
                ) : (
                  'Place Your Order & Pay'
                )}
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
  );
}
