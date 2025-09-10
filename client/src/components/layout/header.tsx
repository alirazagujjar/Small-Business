import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  Bell, 
  Globe, 
  Plus,
  RefreshCw,
  Menu,
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
  Settings
} from "lucide-react";
import type { Notification } from "@/types/business";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const mobileMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/pos", label: "Point of Sale", icon: ScanBarcode },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales-orders", label: "Sales & Orders", icon: FileText },
  { href: "/purchase-orders", label: "Purchase Orders", icon: Truck },
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/accounting", label: "Accounting", icon: Calculator },
  { href: "/reports", label: "Reports", icon: ChartBar },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  // Get notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <nav className="space-y-2">
                  {mobileMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              {title}
            </h2>
            {subtitle && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <span>Last updated:</span>
                <span className="text-foreground font-medium" data-testid="text-last-updated">
                  {subtitle}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search"
            />
          </form>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    data-testid="badge-notification-count"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Notifications</h3>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`p-3 flex flex-col items-start ${!notification.isRead ? 'bg-muted/50' : ''}`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Language Selector - Hidden on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex" data-testid="button-language">
                <Globe className="h-4 w-4 mr-2" />
                <span>EN</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Español</DropdownMenuItem>
              <DropdownMenuItem>Français</DropdownMenuItem>
              <DropdownMenuItem>Deutsch</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Quick Actions */}
          <Button className="bg-primary text-primary-foreground" data-testid="button-quick-sale" asChild>
            <Link href="/pos">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Quick Sale</span>
              <span className="sm:hidden">POS</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
