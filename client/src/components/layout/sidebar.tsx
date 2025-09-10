import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart3,
  ScanBarcode,
  Users,
  Package,
  FileText,
  Truck,
  Building2,
  Calculator,
  ChartBar,
  Brain,
  Settings,
  HelpCircle,
  Network,
  Crown,
  Cog,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, feature: "dashboard" },
  { href: "/pos", label: "Point of Sale", icon: ScanBarcode, feature: "pos" },
  { href: "/customers", label: "Customers", icon: Users, feature: "customer_management" },
  { href: "/inventory", label: "Inventory", icon: Package, feature: "inventory" },
  { href: "/sales-orders", label: "Sales & Orders", icon: FileText, feature: "sales_orders" },
  { href: "/purchase-orders", label: "Purchase Orders", icon: Truck, feature: "purchase_orders", badge: "3" },
  { href: "/vendors", label: "Vendors", icon: Building2, feature: "vendor_management" },
  { href: "/accounting", label: "Accounting", icon: Calculator, feature: "basic_accounting" },
  { href: "/reports", label: "Reports", icon: ChartBar, feature: "basic_reports" },
];

const premiumItems = [
  { href: "/ai-insights", label: "AI Insights", icon: Brain, feature: "ai_insights", badge: "PRO" },
  { href: "/settings", label: "Settings", icon: Settings, feature: "dashboard" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { subscriptionTier, hasFeature } = useSubscription();

  const isActive = (href: string) => location === href;

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-full">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Network className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Nexus</h1>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <Badge 
            variant={subscriptionTier === 'premium' ? 'default' : 'secondary'}
            className="flex items-center space-x-1"
          >
            {subscriptionTier === 'premium' && <Crown className="h-3 w-3" />}
            <span className="capitalize">{subscriptionTier}</span>
          </Badge>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" data-testid="button-settings">
            <Cog className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.username}
            </p>
            <p className="text-xs text-muted-foreground capitalize" data-testid="text-role">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const canAccess = hasFeature(item.feature);
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`w-full justify-start ${!canAccess ? 'opacity-50' : ''}`}
                disabled={!canAccess}
                data-testid={`link-${item.label.toLowerCase().replace(/ /g, '-')}`}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-border mt-4">
          {premiumItems.map((item) => {
            const canAccess = hasFeature(item.feature);
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`w-full justify-start ${!canAccess ? 'opacity-50' : ''}`}
                  disabled={!canAccess}
                  data-testid={`link-${item.label.toLowerCase().replace(/ /g, '-')}`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-2 text-xs text-primary border-primary/20 bg-primary/10">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="outline" className="w-full justify-start" data-testid="button-support">
          <HelpCircle className="h-4 w-4 mr-3" />
          Support
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
