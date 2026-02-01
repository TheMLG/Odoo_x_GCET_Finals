import { AdminLayout } from "@/components/layout/AdminLayout";
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

import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Lock, Mail, Phone, Save, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, setUser } = useAuthStore();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Rental reminder state
  const [isReminderLoading, setIsReminderLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const response = await api.put("/admin/profile", profileForm);
      const updatedUser = response.data.data;

      // Update auth store
      setUser(updatedUser);

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsPasswordLoading(true);

    try {
      await api.post("/admin/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully");

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle trigger rental reminders
  const handleTriggerRentalReminders = async () => {
    setIsReminderLoading(true);

    try {
      await api.post("/admin/trigger-rental-reminders");

      toast.success("Rental reminder emails have been sent successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send rental reminders",
      );
    } finally {
      setIsReminderLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl border-none shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information and email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
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
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            lastName: e.target.value,
                          })
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
                        placeholder="admin@example.com"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
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
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isProfileLoading}
                      className="rounded-xl min-w-[140px]"
                    >
                      {isProfileLoading ?
                        "Saving..."
                      : <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl border-none shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>
                  Ensure your account is using a strong password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
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
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="rounded-xl min-w-[180px]"
                    >
                      {isPasswordLoading ?
                        "Changing Password..."
                      : <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
