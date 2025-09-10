import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Calendar,
  Download,
  Eye
} from "lucide-react";
import type { Payment } from "@/types/business";

export default function Accounting() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const cashPayments = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const cardPayments = payments.filter(p => p.method === 'card').reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <MainLayout title="Accounting" subtitle="Financial management and reporting">
      <div className="p-6 space-y-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics ? formatCurrency(metrics.revenue.current) : '$0.00'}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12.5% from last month
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
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPayments)}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <FileText className="h-3 w-3 mr-1" />
                    {payments.length} transactions
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
                  <p className="text-sm font-medium text-muted-foreground">Cash Payments</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(cashPayments)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((cashPayments / totalPayments) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="text-2xl">💵</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Card Payments</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(cardPayments)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((cardPayments / totalPayments) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="text-2xl">💳</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col" data-testid="button-generate-report">
                <FileText className="h-6 w-6 mb-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-export-data">
                <Download className="h-6 w-6 mb-2" />
                Export Data
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-view-statements">
                <Eye className="h-6 w-6 mb-2" />
                View Statements
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Badge variant="secondary">{payments.length} payments</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 20).map((payment) => (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.customerId ? 'Customer' : 'Walk-in'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">{getPaymentMethodIcon(payment.method)}</span>
                          <Badge variant="outline" className="capitalize">
                            {payment.method}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {payment.reference || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`button-view-${payment.id}`}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">💵</span>
                    <span>Cash</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(cashPayments)}</div>
                    <div className="text-sm text-muted-foreground">
                      {payments.filter(p => p.method === 'cash').length} transactions
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">💳</span>
                    <span>Card</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(cardPayments)}</div>
                    <div className="text-sm text-muted-foreground">
                      {payments.filter(p => p.method === 'card').length} transactions
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">🏦</span>
                    <span>Transfer</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(payments.filter(p => p.method === 'transfer').reduce((sum, p) => sum + parseFloat(p.amount), 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payments.filter(p => p.method === 'transfer').length} transactions
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Month</span>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{formatCurrency(totalPayments)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Transaction</span>
                  <span className="font-medium">
                    {formatCurrency(payments.length > 0 ? totalPayments / payments.length : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Transactions</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
