import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckoutSidebar } from './components/CheckoutSidebar';
import { CheckoutSteps } from './components/CheckoutSteps';
import { useAuthStore } from '@/stores/authStore';

export default function ContactDetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isWhatsApp: 'yes',
  });

  // Fetch and populate user contact details
  useEffect(() => {
    const loadUserDetails = () => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          // Phone number might not be in the user object, keep existing value
        }));
      }
    };

    loadUserDetails();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Save to localStorage or state management
    localStorage.setItem('checkoutContactDetails', JSON.stringify(formData));
    
    toast.success('Details saved successfully!');
    navigate('/checkout/address');
  };

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

          <CheckoutSteps currentStep={1} />

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-white p-8 shadow-sm"
              >
                <h2 className="mb-6 text-2xl font-bold">1. Contact Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter your last name"
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
                      placeholder="your.email@example.com"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Order confirmation will be sent to this email
                    </p>
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
                        placeholder="1234567890"
                        maxLength={10}
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
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Continue to Address
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <CheckoutSidebar currentStep={1} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
