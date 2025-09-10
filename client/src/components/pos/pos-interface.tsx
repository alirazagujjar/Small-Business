import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePrint } from "@/lib/print";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Printer,
  User,
  Scan,
  Calculator,
  Receipt
} from "lucide-react";
import type { Product, Customer } from "@/types/business";

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export function POSInterface() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { printReceipt } = usePrint();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const processSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await apiRequest("POST", "/api/sales-orders", saleData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Sale completed successfully" });
      
      // Print receipt
      printReceipt(data);
      
      // Clear cart
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setIsPaymentDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error processing sale", 
        description: error.message,
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const price = parseFloat(product.price);
      const newItem: CartItem = {
        product,
        quantity: 1,
        price,
        total: price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity,
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;
    
    try {
      const response = await apiRequest("GET", `/api/products/barcode/${barcodeInput}`);
      const product = await response.json();
      addToCart(product);
      setBarcodeInput("");
      toast({ title: "Product added to cart" });
    } catch (error) {
      toast({ 
        title: "Product not found", 
        description: "No product found with this barcode",
        variant: "destructive" 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch();
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.1; // 10% tax
  const total = subtotal - discountAmount + tax;

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const processPayment = () => {
    setIsProcessing(true);
    
    const saleData = {
      order: {
        customerId: selectedCustomer?.id || null,
        subtotal: subtotal.toString(),
        discount: discountAmount.toString(),
        tax: tax.toString(),
        total: total.toString(),
        status: 'completed',
        paymentStatus: 'paid',
      },
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price.toString(),
        total: item.total.toString(),
      })),
    };

    // Create payment record
    if (selectedCustomer) {
      apiRequest("POST", "/api/payments", {
        customerId: selectedCustomer.id,
        amount: total.toString(),
        method: paymentMethod,
      });
    }

    processSaleMutation.mutate(saleData);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.includes(searchQuery)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="h-full flex">
      {/* Product Selection */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Search and Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan or enter barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                data-testid="input-barcode"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
                data-testid={`product-card-${product.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl">📦</span>
                  </div>
                  <CardTitle className="text-sm truncate">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(parseFloat(product.price))}
                    </p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    )}
                    <Badge 
                      variant={product.quantity > product.lowStockThreshold ? "default" : "destructive"}
                      className="text-xs"
                    >
                      Stock: {product.quantity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 border-l bg-muted/30 flex flex-col">
        <div className="p-6 border-b bg-card">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart ({cart.length})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <Card key={item.product.id} data-testid={`cart-item-${item.product.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.product.id)}
                      data-testid={`remove-item-${item.product.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        data-testid={`decrease-quantity-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        data-testid={`increase-quantity-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-6 border-t bg-card space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Customer (Optional)</label>
            <Select 
              value={selectedCustomer?.id || "walk-in"} 
              onValueChange={(value) => {
                if (value === "walk-in") {
                  setSelectedCustomer(null);
                } else {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }
              }}
            >
              <SelectTrigger data-testid="select-customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div>
            <label className="text-sm font-medium mb-2 block">Discount (%)</label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              data-testid="input-discount"
            />
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({discount}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Tax:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span data-testid="total-amount">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            data-testid="button-complete-sale"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Complete Sale
          </Button>
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value: 'cash' | 'card' | 'transfer') => setPaymentMethod(value)}
                >
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 mr-2" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={processPayment}
                  disabled={isProcessing}
                  data-testid="button-process-payment"
                >
                  {isProcessing ? 'Processing...' : 'Process Payment'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
