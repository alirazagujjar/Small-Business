import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { SubscriptionGuard } from "@/components/subscription/subscription-guard";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Eye, 
  Printer,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Package
} from "lucide-react";
import type { PurchaseOrder, Vendor, Product } from "@/types/business";

const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  expectedDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    cost: z.string().min(1, "Cost is required"),
  })).min(1, "At least one item is required"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function PurchaseOrders() {
  return (
    <SubscriptionGuard feature="purchase_orders">
      <PurchaseOrdersContent />
    </SubscriptionGuard>
  );
}

function PurchaseOrdersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/purchase-orders'],
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ['/api/purchase-orders', selectedOrder?.id],
    enabled: !!selectedOrder,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      const subtotal = data.items.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.cost)), 0
      );
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      const orderData = {
        vendorId: data.vendorId,
        expectedDate: data.expectedDate,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
      };

      const response = await apiRequest("POST", "/api/purchase-orders", {
        order: orderData,
        items: data.items.map(item => ({
          ...item,
          total: (item.quantity * parseFloat(item.cost)).toString(),
        })),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Purchase order created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating purchase order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/purchase-orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Purchase order status updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating purchase order", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendorId: "",
      expectedDate: "",
      items: [{ productId: "", quantity: 1, cost: "" }],
    },
  });

  const onSubmit = (data: PurchaseOrderFormData) => {
    createMutation.mutate(data);
  };

  const addItem = () => {
    const currentItems = form.getValues().items;
    form.setValue("items", [...currentItems, { productId: "", quantity: 1, cost: "" }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues().items;
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'received':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'received':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;

  return (
    <MainLayout title="Purchase Orders" subtitle="Manage vendor orders and inventory procurement">
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total POs</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue.toString())}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-foreground">{confirmedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Purchase Orders</span>
                <Badge variant="secondary">{filteredOrders.length} orders</Badge>
              </CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-po">
                    <Plus className="h-4 w-4 mr-2" />
                    Create PO
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vendorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-vendor">
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vendors.map((vendor) => (
                                    <SelectItem key={vendor.id} value={vendor.id}>
                                      {vendor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expectedDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-expected-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Items</h3>
                          <Button type="button" onClick={addItem} data-testid="button-add-item">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {form.watch("items").map((_, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 items-end">
                              <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Product</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid={`select-product-${index}`}>
                                          <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {products.map((product) => (
                                          <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid={`input-quantity-${index}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`items.${index}.cost`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unit Cost</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01" 
                                        {...field}
                                        data-testid={`input-cost-${index}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeItem(index)}
                                disabled={form.watch("items").length === 1}
                                data-testid={`button-remove-${index}`}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending}
                          data-testid="button-create-order"
                        >
                          Create Order
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PO number or amount..."
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
                <option value="confirmed">Confirmed</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading purchase orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? "No purchase orders found matching your criteria." 
                  : "No purchase orders found. Create your first PO to get started."
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                      <TableCell className="font-medium">{order.poNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          Vendor
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.expectedDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(order.expectedDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(order.total)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="flex items-center w-fit">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
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
              <DialogTitle>Purchase Order Details - {selectedOrder?.poNumber}</DialogTitle>
            </DialogHeader>
            {orderDetailsLoading ? (
              <div className="py-8 text-center">Loading order details...</div>
            ) : orderDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <div className="space-y-1 text-sm">
                      <div>PO: {orderDetails.poNumber}</div>
                      <div>Date: {new Date(orderDetails.createdAt).toLocaleString()}</div>
                      <div>Status: {orderDetails.status}</div>
                      {orderDetails.expectedDate && (
                        <div>Expected: {new Date(orderDetails.expectedDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Vendor</h3>
                    <div className="space-y-1 text-sm">
                      <div>{orderDetails.vendor?.name || 'Vendor'}</div>
                      {orderDetails.vendor?.email && <div>{orderDetails.vendor.email}</div>}
                      {orderDetails.vendor?.phone && <div>{orderDetails.vendor.phone}</div>}
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
                        <TableHead>Cost</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || 'Product'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.cost)}</TableCell>
                          <TableCell>{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(orderDetails.subtotal)}</span>
                    </div>
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

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" data-testid="button-print-po">
                    <Printer className="h-4 w-4 mr-2" />
                    Print PO
                  </Button>
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderMutation.mutate({ 
                        id: selectedOrder.id, 
                        status: 'confirmed' 
                      })}
                      disabled={updateOrderMutation.isPending}
                      data-testid="button-confirm-order"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button
                      onClick={() => updateOrderMutation.mutate({ 
                        id: selectedOrder.id, 
                        status: 'received' 
                      })}
                      disabled={updateOrderMutation.isPending}
                      data-testid="button-mark-received"
                    >
                      Mark as Received
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
