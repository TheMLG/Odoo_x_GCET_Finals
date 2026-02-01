import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSidebar } from "./components/CheckoutSidebar";
import { CheckoutSteps } from "./components/CheckoutSteps";

export default function ContactDetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setContactDetails, contactDetails } = useCheckoutStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch and populate user contact details
  useEffect(() => {
    const loadUserDetails = () => {
      if (contactDetails) {
        setFormData(contactDetails);
        return;
      }

      if (user) {
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: (user as any).phone || "",
        }));
      }
    };

    loadUserDetails();
  }, [user, contactDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      // Update user phone in profile if it's different or not set
      const userPhone = (user as any)?.phone;
      if (formData.phone && formData.phone !== userPhone) {
        await api.put("/auth/profile", { phone: formData.phone });
      }

      // Save to store
      setContactDetails(formData);

      toast.success("Details saved successfully!");
      navigate("/checkout/address");
    } catch (error) {
      console.error("Error updating phone:", error);
      // Still proceed even if phone update fails
      setContactDetails(formData);
      navigate("/checkout/address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <div className="container px-4 py-6 md:px-6 md:py-8">
        <CheckoutSteps currentStep={1} />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 md:p-8 shadow-sm border border-gray-200"
            >
              <h2 className="mb-6 text-lg md:text-xl font-bold">
                1. Contact Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      placeholder="Ronit"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium sr-only"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-[26px] bg-gray-50 border-gray-300 focus:bg-white"
                      placeholder="Dhimmar"
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
                    placeholder="rajdhimmar4@gmail.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <select className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>+91</option>
                    </select>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="flex-1"
                      placeholder="8320331941"
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-5 text-base font-semibold shadow-sm"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Continue to Address"}
                </Button>
              </form>
            </motion.div>
          </div>

          <CheckoutSidebar currentStep={1} />
        </div>
      </div>
    </div>
  );
}
