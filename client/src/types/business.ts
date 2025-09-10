export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalDue: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalDue: string;
  performanceScore: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: string;
  cost?: string;
  quantity: number;
  lowStockThreshold: number;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  userId: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  quantity: number;
  price: string;
  total: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  userId: string;
  subtotal: string;
  tax: string;
  total: string;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  expectedDate?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerId?: string;
  salesOrderId?: string;
  amount: string;
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
  createdAt: string;
}

export interface AiInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'forecast';
  title: string;
  description: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
  };
  orders: {
    current: number;
    previous: number;
  };
  customers: number;
  inventoryValue: number;
}

export interface SalesAnalytics {
  date: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}
