import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SalesChart } from "@/components/charts/sales-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUp, 
  ArrowDown,
  Brain,
  ExternalLink,
  Printer,
  Eye,
  Truck,
  TriangleAlert,
  FileText,
  Clock,
  TrendingUp
} from "lucide-react";
import type { DashboardMetrics, TopProduct, AiInsight } from "@/types/business";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: topProducts = [], isLoading: productsLoading } = useQuery<TopProduct[]>({
    queryKey: ['/api/dashboard/top-products', { limit: '5' }],
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai/insights'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['/api/products/low-stock'],
  });

  const { data: pendingPOs = [] } = useQuery({
    queryKey: ['/api/purchase-orders', { status: 'pending' }],
  });

  const { data: overduePayments = [] } = useQuery({
    queryKey: ['/api/payments/overdue'],
  });

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  return (
    <MainLayout title="Dashboard" subtitle="2 minutes ago">
      <div className="space-y-4 md:space-y-6">
        {/* AI Insights Alert */}
        {insights.length > 0 && !insightsLoading && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">AI Insight</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {insights[0].description}
                </p>
                <div className="mt-3 flex space-x-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-po">
                    Create PO
                  </Button>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600" data-testid="button-view-analytics">
                    View Analytics
                  </Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-600">
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Revenue (This Month)</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-revenue">
                      {formatCurrency(metrics?.revenue.current || 0)}
                    </p>
                  )}
                  {metrics && (
                    <p className="text-sm flex items-center text-green-600">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {formatPercentage(calculatePercentageChange(metrics.revenue.current, metrics.revenue.previous))} from last month
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-orders">
                      {metrics?.orders.current || 0}
                    </p>
                  )}
                  {metrics && (
                    <p className="text-sm flex items-center text-green-600">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {formatPercentage(calculatePercentageChange(metrics.orders.current, metrics.orders.previous))} from last week
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-customers">
                      {metrics?.customers || 0}
                    </p>
                  )}
                  <p className="text-sm flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    5.1% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="metric-inventory">
                      {formatCurrency(metrics?.inventoryValue || 0)}
                    </p>
                  )}
                  <p className="text-sm flex items-center text-red-600">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    3.8% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sales data available
                  </div>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between" data-testid={`top-product-${index}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.totalSold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                        <p className="text-sm text-green-600">+12%</p>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-products" asChild>
                  <Link href="/inventory">View All Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm" data-testid="button-view-all-orders" asChild>
                <Link href="/sales-orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 text-sm font-medium text-foreground" data-testid="order-id-1">ORD-001</td>
                      <td className="py-3 text-sm text-foreground">Alice Johnson</td>
                      <td className="py-3 text-sm text-foreground">$125.50</td>
                      <td className="py-3">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completed
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" className="text-primary" data-testid="button-print-order-1">
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 text-sm font-medium text-foreground">ORD-002</td>
                      <td className="py-3 text-sm text-foreground">Bob Smith</td>
                      <td className="py-3 text-sm text-foreground">$89.99</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Processing
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" className="text-primary" data-testid="button-view-order-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 text-sm font-medium text-foreground">ORD-003</td>
                      <td className="py-3 text-sm text-foreground">Carol Davis</td>
                      <td className="py-3 text-sm text-foreground">$299.00</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Shipped
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" className="text-primary" data-testid="button-track-order-3">
                          <Truck className="h-3 w-3 mr-1" />
                          Track
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <TriangleAlert className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">Low Stock Alert</h4>
                      <p className="text-orange-700 dark:text-orange-300 mt-1">{lowStockProducts.length} products below threshold</p>
                      <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-800 mt-2 h-auto p-0" data-testid="button-view-low-stock" asChild>
                        <Link href="/inventory?filter=low-stock">View Items</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pending Purchase Orders */}
                {pendingPOs.length > 0 && (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Pending Purchase Orders</h4>
                      <p className="text-blue-700 dark:text-blue-300 mt-1">{pendingPOs.length} orders awaiting vendor confirmation</p>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800 mt-2 h-auto p-0" data-testid="button-review-orders" asChild>
                        <Link href="/purchase-orders?status=pending">Review Orders</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Overdue Payments */}
                {overduePayments.length > 0 && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <Clock className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <h4 className="font-medium text-red-800 dark:text-red-200">Overdue Payments</h4>
                      <p className="text-red-700 dark:text-red-300 mt-1">{overduePayments.length} invoices past due date</p>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800 mt-2 h-auto p-0" data-testid="button-send-reminders" asChild>
                        <Link href="/accounting?tab=overdue">Send Reminders</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Performance Insight */}
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Performance Milestone</h4>
                    <p className="text-green-700 dark:text-green-300 mt-1">Monthly sales target achieved!</p>
                    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-800 mt-2 h-auto p-0" data-testid="button-view-report" asChild>
                      <Link href="/reports">View Report</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
