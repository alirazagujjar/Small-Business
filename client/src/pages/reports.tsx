import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesChart } from "@/components/charts/sales-chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download, 
  FileText, 
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";
import type { TopProduct, SalesAnalytics } from "@/types/business";

const COLORS = ['#2563eb', '#dc2626', '#ea580c', '#ca8a04', '#16a34a'];

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("30");

  const { data: salesData = [] } = useQuery<SalesAnalytics[]>({
    queryKey: ['/api/dashboard/sales-analytics', { days: timeRange }],
  });

  const { data: topProducts = [] } = useQuery<TopProduct[]>({
    queryKey: ['/api/dashboard/top-products', { limit: '10' }],
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const pieChartData = topProducts.slice(0, 5).map((product, index) => ({
    name: product.name,
    value: product.totalRevenue,
    fill: COLORS[index % COLORS.length],
  }));

  const salesChartData = salesData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    revenue: parseFloat(item.total.toString()),
    orders: item.count,
  }));

  const handleExportReport = () => {
    // Create CSV content
    let csvContent = "";
    
    if (reportType === "sales") {
      csvContent = "Date,Revenue,Orders\n";
      salesData.forEach(item => {
        csvContent += `${item.date},${item.total},${item.count}\n`;
      });
    } else if (reportType === "products") {
      csvContent = "Product,Revenue,Quantity Sold\n";
      topProducts.forEach(product => {
        csvContent += `${product.name},${product.totalRevenue},${product.totalSold}\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout title="Reports" subtitle="Business analytics and insights">
      <div className="p-6 space-y-6">
        {/* Report Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Generator</CardTitle>
              <Button onClick={handleExportReport} data-testid="button-export-report">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="products">Product Performance</SelectItem>
                    <SelectItem value="customers">Customer Analysis</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics ? formatCurrency((metrics as any).revenue?.current || 0) : '$0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics ? (metrics as any).orders?.current || 0 : 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics ? (metrics as any).customers || 0 : 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-foreground">{topProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Report Content */}
        {reportType === "sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                      />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          name === 'orders' ? value : formatCurrency(value),
                          name === 'orders' ? 'Orders' : 'Revenue'
                        ]}
                        labelClassName="text-foreground"
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="orders" fill="#ea580c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs fill-muted-foreground"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        className="text-xs fill-muted-foreground"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                        labelClassName="text-foreground"
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {salesData.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <p className="text-muted-foreground">Total Transactions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(salesData.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0))}
                </div>
                <p className="text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {salesData.length > 0 
                    ? formatCurrency(salesData.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0) / salesData.reduce((sum, item) => sum + item.count, 0))
                    : '$0.00'
                  }
                </div>
                <p className="text-muted-foreground">Average Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
