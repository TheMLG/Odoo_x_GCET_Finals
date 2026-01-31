import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckoutHeader } from './components/CheckoutHeader';
import { CheckoutSidebar } from './components/CheckoutSidebar';
import { CheckoutSteps } from './components/CheckoutSteps';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export default function AddressPage() {
  const navigate = useNavigate();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    phone: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    // Load saved addresses from localStorage
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      const addresses = JSON.parse(saved);
      setSavedAddresses(addresses);
      // Select default address if exists
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }

    // Pre-fill name and phone from contact details
    const contactDetails = localStorage.getItem('checkoutContactDetails');
    if (contactDetails) {
      const { firstName, lastName, phone } = JSON.parse(contactDetails);
      setFormData(prev => ({
        ...prev,
        name: `${firstName} ${lastName}`,
        phone: phone
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = () => {
    if (!formData.name || !formData.phone || !formData.pincode || !formData.address || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: savedAddresses.length === 0,
    };

    const updatedAddresses = [...savedAddresses, newAddress];
    setSavedAddresses(updatedAddresses);
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    setSelectedAddressId(newAddress.id);
    setShowAddressForm(false);
    toast.success('Address saved successfully!');
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
    localStorage.setItem('checkoutAddress', JSON.stringify(selectedAddress));
    navigate('/checkout/delivery-time');
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'work':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <CheckoutSteps currentStep={2} />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold">2. Delivery Address</h2>
                {!showAddressForm && (
                  <Button
                    onClick={() => setShowAddressForm(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Address
                  </Button>
                )}
              </div>

              {showAddressForm ? (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Address Type</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, type: value })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home" className="font-normal">
                          Home
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work" id="work" />
                        <Label htmlFor="work" className="font-normal">
                          Work
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="pincode">
                        Pincode <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="locality">Locality</Label>
                      <Input
                        id="locality"
                        name="locality"
                        value={formData.locality}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter locality"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Address (House No, Building, Street, Area){' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-2"
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="city">
                        City/District <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">
                        State <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowAddressForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAddress}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                    >
                      Save Address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedAddresses.length === 0 ? (
                    <div className="py-12 text-center">
                      <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-2 text-lg font-medium">No saved addresses</p>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Add a delivery address to continue
                      </p>
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <>
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={cn(
                              'flex gap-4 rounded-xl border p-4 transition-colors',
                              selectedAddressId === address.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-border hover:border-gray-400'
                            )}
                          >
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
                                  {getAddressIcon(address.type)}
                                  <span className="text-sm font-medium capitalize">
                                    {address.type}
                                  </span>
                                </div>
                                {address.isDefault && (
                                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="font-medium">{address.name}</p>
                                <p className="text-muted-foreground">{address.address}</p>
                                {address.locality && (
                                  <p className="text-muted-foreground">{address.locality}</p>
                                )}
                                <p className="text-muted-foreground">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-muted-foreground">Phone: {address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      <Button
                        onClick={handleContinue}
                        disabled={!selectedAddressId}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        Continue to Delivery Time
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <CheckoutSidebar currentStep={2} />
        </div>
      </div>
    </div>
  );
}

