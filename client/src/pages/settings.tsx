import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Globe,
  Moon,
  Sun,
  Crown,
  Settings as SettingsIcon,
  Save,
  Key,
  Database,
  Printer
} from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { subscriptionTier, isPremium } = useSubscription();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    orders: true,
  });

  const handleSaveSettings = () => {
    toast({ title: "Settings saved successfully" });
  };

  const handleExportData = () => {
    toast({ title: "Data export initiated", description: "You will receive an email when ready" });
  };

  return (
    <MainLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="subscription" data-testid="tab-subscription">
              <Crown className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="data" data-testid="tab-data">
              <Database className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={user?.username || ""} 
                      readOnly
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={user?.email || ""} 
                      readOnly
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
                <Button onClick={handleSaveSettings} data-testid="button-save-profile">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                      data-testid="switch-email-notifications"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                    </div>
                    <Switch 
                      id="low-stock-alerts"
                      checked={notifications.lowStock}
                      onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                      data-testid="switch-low-stock"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-notifications">Order Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new orders and updates</p>
                    </div>
                    <Switch 
                      id="order-notifications"
                      checked={notifications.orders}
                      onCheckedChange={(checked) => setNotifications({...notifications, orders: checked})}
                      data-testid="switch-order-notifications"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveSettings} data-testid="button-save-notifications">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>Subscription Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Plan</h3>
                    <p className="text-muted-foreground">
                      You are currently on the {subscriptionTier} plan
                    </p>
                  </div>
                  <Badge 
                    variant={isPremium ? "default" : "secondary"}
                    className="text-lg px-4 py-2"
                  >
                    {isPremium && <Crown className="h-4 w-4 mr-1" />}
                    {subscriptionTier.toUpperCase()}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Standard Features</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Point of Sale System</li>
                        <li>• Inventory Management</li>
                        <li>• Customer Management</li>
                        <li>• Basic Reports</li>
                        <li>• Sales Orders</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Premium Features</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className={!isPremium ? "opacity-50" : ""}>• AI Business Insights</li>
                        <li className={!isPremium ? "opacity-50" : ""}>• Advanced Analytics</li>
                        <li className={!isPremium ? "opacity-50" : ""}>• Vendor Management</li>
                        <li className={!isPremium ? "opacity-50" : ""}>• Purchase Orders</li>
                        <li className={!isPremium ? "opacity-50" : ""}>• Multi-currency Support</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {!isPremium && (
                  <div className="pt-4">
                    <Button asChild size="lg" data-testid="button-upgrade-subscription">
                      <Link href="/subscribe">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      placeholder="Enter current password"
                      data-testid="input-current-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      placeholder="Enter new password"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      placeholder="Confirm new password"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                
                <Button data-testid="button-change-password">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Session Management</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Current session</p>
                      <p className="text-xs text-muted-foreground">Last active: Just now</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-logout-all">
                      Logout All Devices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <Switch 
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                        data-testid="switch-dark-mode"
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                        <SelectItem value="gbp">GBP - British Pound</SelectItem>
                        <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america/new_york">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                        <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} data-testid="button-save-preferences">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Export Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download your business data including customers, products, orders, and transactions.
                    </p>
                    <Button onClick={handleExportData} data-testid="button-export-data">
                      <Database className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Printer Settings</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure your receipt and document printing preferences.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="printer">Default Printer</Label>
                      <Select defaultValue="default">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">System Default</SelectItem>
                          <SelectItem value="receipt">Receipt Printer</SelectItem>
                          <SelectItem value="thermal">Thermal Printer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="mt-2" data-testid="button-test-print">
                      <Printer className="h-4 w-4 mr-2" />
                      Test Print
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive" data-testid="button-delete-account">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
