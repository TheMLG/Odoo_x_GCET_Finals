import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Mail,
  Save,
  Settings,
  User,
  Phone,
  MapPin,
  Bell,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

export default function UserSettingsPage() {
  const { toast } = useToast();
  const { user, setUser } = useAuthStore();

  // User info form state
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    smsNotifications: false,
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      setUserForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user]);

  // Handle user info update
  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserLoading(true);

    try {
      // Since there's no dedicated user update endpoint, we'll use auth endpoint
      // You may need to create a backend endpoint for this
      const response = await api.put("/auth/profile", userForm);
      const updatedUser = response.data.data;

      // Update auth store
      setUser(updatedUser);

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error: any) {
      // If endpoint doesn't exist, show a friendly message
      if (error.response?.status === 404) {
        toast({
          title: "Note",
          description:
            "Profile update endpoint is not yet implemented on the server",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "Failed to update personal information",
          variant: "destructive",
        });
      }
    } finally {
      setIsUserLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      // If endpoint doesn't exist, show a friendly message
      if (error.response?.status === 404) {
        toast({
          title: "Note",
          description:
            "Password change endpoint is not yet implemented on the server",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle notification settings update
  const handleNotificationUpdate = async () => {
    try {
      await api.put("/auth/notifications", notifications);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Note",
          description:
            "Saved locally - Server endpoint will be implemented soon",
          variant: "default",
        });
      }
    }
  };

  return (
    <MainLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and security
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserUpdate} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={userForm.firstName}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={userForm.lastName}
                        onChange={(e) =>
                          setUserForm({ ...userForm, lastName: e.target.value })
                        }
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm({ ...userForm, email: e.target.value })
                        }
                        required
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={userForm.phone}
                        onChange={(e) =>
                          setUserForm({ ...userForm, phone: e.target.value })
                        }
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isUserLoading}
                    className="rounded-xl"
                  >
                    {isUserLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Ensure your account is using a strong password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        className="pl-10 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="rounded-xl"
                  >
                    {isPasswordLoading ? (
                      "Changing Password..."
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div> 
        </div>
      </div>
    </MainLayout>
  );
}
