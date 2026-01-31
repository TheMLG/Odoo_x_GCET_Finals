import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Address, createAddress, getAddresses } from "@/lib/addressApi";
import { cn } from "@/lib/utils";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { motion } from "framer-motion";
import { Home, Loader2, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSidebar } from "./components/CheckoutSidebar";
import { CheckoutSteps } from "./components/CheckoutSteps";

export default function AddressPage() {
  const navigate = useNavigate();
  const { selectedAddress, setSelectedAddress } = useCheckoutStore();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    selectedAddress?.id || "",
  );
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const addresses = await getAddresses();
        setSavedAddresses(addresses);

        // If we have a selected address in store, use it
        if (selectedAddress) {
          setSelectedAddressId(selectedAddress.id);
        } else {
          // Otherwise select default address
          const defaultAddr = addresses.find((addr) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [selectedAddress]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = async () => {
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.postalCode ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.postalCode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSaving(true);
      const newAddress = await createAddress({
        ...formData,
        isDefault: savedAddresses.length === 0,
      });

      setSavedAddresses([...savedAddresses, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setFormData({
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
      toast.success("Address saved successfully!");
    } catch (error: any) {
      console.error("Failed to save address:", error);
      const message =
        error?.response?.data?.message || "Failed to save address";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    const address = savedAddresses.find(
      (addr) => addr.id === selectedAddressId,
    );
    if (address) {
      setSelectedAddress(address);
      navigate("/checkout/delivery-time");
    }
  };

  const getAddressIcon = (isDefault: boolean) => {
    return isDefault ?
        <Home className="h-5 w-5" />
      : <MapPin className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CheckoutHeader />
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <CheckoutSteps currentStep={2} />
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

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
                <h2 className="text-lg md:text-xl font-bold">
                  2. Delivery Address
                </h2>
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

              {showAddressForm ?
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">
                      Address Line 1 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="mt-2"
                      placeholder="House No, Building, Street, Area"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="mt-2"
                      placeholder="Landmark (optional)"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="postalCode">
                        Pincode <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
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
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-2"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowAddressForm(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAddress}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
                      disabled={saving}
                    >
                      {saving ?
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      : "Save Address"}
                    </Button>
                  </div>
                </div>
              : <div className="space-y-4">
                  {savedAddresses.length === 0 ?
                    <div className="py-12 text-center">
                      <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-2 text-lg font-medium">
                        No saved addresses
                      </p>
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
                  : <>
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={setSelectedAddressId}
                      >
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={cn(
                              "flex gap-4 rounded-xl border p-4 transition-colors",
                              selectedAddressId === address.id ?
                                "border-blue-600 bg-blue-50"
                              : "border-border hover:border-gray-400",
                            )}
                          >
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
                                  {getAddressIcon(address.isDefault)}
                                  <span className="text-sm font-medium">
                                    {address.isDefault ? "Default" : "Address"}
                                  </span>
                                </div>
                                {address.isDefault && (
                                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="font-medium">
                                  {address.fullName}
                                </p>
                                <p className="text-muted-foreground">
                                  {address.addressLine1}
                                </p>
                                {address.addressLine2 && (
                                  <p className="text-muted-foreground">
                                    {address.addressLine2}
                                  </p>
                                )}
                                <p className="text-muted-foreground">
                                  {address.city}, {address.state} -{" "}
                                  {address.postalCode}
                                </p>
                                <p className="text-muted-foreground">
                                  Phone: {address.phoneNumber}
                                </p>
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
                  }
                </div>
              }
            </motion.div>
          </div>

          <CheckoutSidebar currentStep={2} />
        </div>
      </div>
    </div>
  );
}
