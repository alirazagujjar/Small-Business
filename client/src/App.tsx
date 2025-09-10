import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import POS from "@/pages/pos";
import Customers from "@/pages/customers";
import Inventory from "@/pages/inventory";
import SalesOrders from "@/pages/sales-orders";
import PurchaseOrders from "@/pages/purchase-orders";
import Vendors from "@/pages/vendors";
import Accounting from "@/pages/accounting";
import Reports from "@/pages/reports";
import AIInsights from "@/pages/ai-insights";
import Settings from "@/pages/settings";
import Subscribe from "@/pages/subscribe";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/subscribe">
        <AuthGuard fallback={<Login />}>
          <Subscribe />
        </AuthGuard>
      </Route>
      <Route path="/dashboard">
        <AuthGuard fallback={<Login />}>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/pos">
        <AuthGuard fallback={<Login />}>
          <POS />
        </AuthGuard>
      </Route>
      <Route path="/customers">
        <AuthGuard fallback={<Login />}>
          <Customers />
        </AuthGuard>
      </Route>
      <Route path="/inventory">
        <AuthGuard fallback={<Login />}>
          <Inventory />
        </AuthGuard>
      </Route>
      <Route path="/sales-orders">
        <AuthGuard fallback={<Login />}>
          <SalesOrders />
        </AuthGuard>
      </Route>
      <Route path="/purchase-orders">
        <AuthGuard fallback={<Login />}>
          <PurchaseOrders />
        </AuthGuard>
      </Route>
      <Route path="/vendors">
        <AuthGuard fallback={<Login />}>
          <Vendors />
        </AuthGuard>
      </Route>
      <Route path="/accounting">
        <AuthGuard fallback={<Login />}>
          <Accounting />
        </AuthGuard>
      </Route>
      <Route path="/reports">
        <AuthGuard fallback={<Login />}>
          <Reports />
        </AuthGuard>
      </Route>
      <Route path="/ai-insights">
        <AuthGuard fallback={<Login />}>
          <AIInsights />
        </AuthGuard>
      </Route>
      <Route path="/settings">
        <AuthGuard fallback={<Login />}>
          <Settings />
        </AuthGuard>
      </Route>
      <Route path="/">
        <AuthGuard fallback={<Login />}>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
