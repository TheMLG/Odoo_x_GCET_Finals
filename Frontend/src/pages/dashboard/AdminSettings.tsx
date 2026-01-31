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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import {
  Bell,
  Lock,
  Mail,
  Save,
  Send,
  Settings2,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminSettings() {
  const { toast } = useToast();
  const { user, setUser } = useAuthStore();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
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
      await api.post("/admin/profile/change-password", {
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
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle trigger rental reminders
  const handleTriggerRentalReminders = async () => {
    setIsReminderLoading(true);

    try {
      await api.post("/admin/trigger-rental-reminders");

      toast({
        title: "Success",
        description: "Rental reminder emails have been sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send rental reminders",
        variant: "destructive",
      });
    } finally {
      setIsReminderLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12 max-w-4xl mx-auto">
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

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px] mb-8">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Settings2 className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
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
                    <div className="flex justify-end">
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
          </TabsContent>

          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
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
                    <div className="flex justify-end">
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
          </TabsContent>

          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Rental Return Reminders
                  </CardTitle>
                  <CardDescription>
                    Send email notifications to customers with rentals due for
                    return tomorrow. This runs automatically every day at 9:00
                    AM, but you can trigger it manually for testing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="space-y-1">
                      <p className="font-medium">Trigger Rental Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Manually send reminder emails to all customers with
                        rentals ending tomorrow
                      </p>
                    </div>
                    <Button
                      onClick={handleTriggerRentalReminders}
                      disabled={isReminderLoading}
                      className="rounded-xl min-w-[180px]"
                    >
                      {isReminderLoading ?
                        "Sending..."
                      : <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reminders
                        </>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Scheduled Jobs</CardTitle>
                  <CardDescription>
                    Overview of automated background tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Rental Return Reminder</p>
                          <p className="text-sm text-muted-foreground">
                            Daily at 9:00 AM IST
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
