import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePrint } from "@/lib/print";
import { 
  Plus, 
  Search, 
  Eye, 
  Printer,
  Calendar,
  DollarSign,
  FileText,
  User,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import type { SalesOrder } from "@/types/business";

export default function SalesOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { printReceipt } = usePrint();

  const { data: orders = [], isLoading } = useQuery<SalesOrder[]>({
    queryKey: ['/api/sales-orders'],
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ['/api/sales-orders', selectedOrder?.id],
    enabled: !!selectedOrder,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/sales-orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handlePrintReceipt = async (order: SalesOrder) => {
    try {
      const response = await apiRequest("GET", `/api/sales-orders/${order.id}`);
      const orderData = await response.json();
      await printReceipt(orderData);
      toast({ title: "Receipt sent to printer" });
    } catch (error: any) {
      toast({ 
        title: "Print failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.total.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);

  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <MainLayout title="Sales & Orders" subtitle="Manage your sales transactions">
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue.toString())}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Sales Orders</span>
                <Badge variant="secondary">{filteredOrders.length} orders</Badge>
              </CardTitle>
              <Button data-testid="button-new-sale" onClick={() => window.location.href = '/pos'}>
                <Plus className="h-4 w-4 mr-2" />
                New Sale
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
                data-testid="select-status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? "No orders found matching your criteria." 
                  : "No sales orders found. Create your first sale to get started."
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {order.customerId ? 'Customer' : 'Walk-in'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(order.total)}</div>
                          {parseFloat(order.discount) > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Discount: {formatCurrency(order.discount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="flex items-center w-fit">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="capitalize">
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePrintReceipt(order)}
                            data-testid={`button-print-${order.id}`}
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {orderDetailsLoading ? (
              <div className="py-8 text-center">Loading order details...</div>
            ) : orderDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm">
                      <div>Order: {orderDetails.orderNumber}</div>
                      <div>Date: {new Date(orderDetails.createdAt).toLocaleString()}</div>
                      <div>Status: {orderDetails.status}</div>
                      <div>Payment: {orderDetails.paymentStatus}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Customer</h3>
                    <div className="space-y-1 text-sm">
                      <div>{orderDetails.customer?.name || 'Walk-in Customer'}</div>
                      {orderDetails.customer?.email && <div>{orderDetails.customer.email}</div>}
                      {orderDetails.customer?.phone && <div>{orderDetails.customer.phone}</div>}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || 'Product'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center space-y-1">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(orderDetails.subtotal)}</span>
                      </div>
                      {parseFloat(orderDetails.discount) > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Discount:</span>
                          <span>-{formatCurrency(orderDetails.discount)}</span>
                        </div>
                      )}
                      {parseFloat(orderDetails.tax) > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax:</span>
                          <span>{formatCurrency(orderDetails.tax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(orderDetails.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePrintReceipt(selectedOrder)}
                    data-testid="button-print-receipt"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderMutation.mutate({ 
                        id: selectedOrder.id, 
                        status: 'completed' 
                      })}
                      disabled={updateOrderMutation.isPending}
                      data-testid="button-complete-order"
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
