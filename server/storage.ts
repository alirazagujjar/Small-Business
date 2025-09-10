import { 
  users, customers, vendors, products, salesOrders, salesOrderItems,
  purchaseOrders, purchaseOrderItems, payments, aiInsights, notifications,
  type User, type InsertUser, type Customer, type InsertCustomer,
  type Vendor, type InsertVendor, type Product, type InsertProduct,
  type SalesOrder, type InsertSalesOrder, type SalesOrderItem, type InsertSalesOrderItem,
  type PurchaseOrder, type InsertPurchaseOrder, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  type Payment, type InsertPayment, type AiInsight, type InsertAiInsight,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscription(id: string, tier: string): Promise<User>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: string): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getLowStockProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  updateProductQuantity(id: string, quantity: number): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Sales Orders
  getSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  getSalesOrderWithItems(id: string): Promise<any>;
  createSalesOrder(order: InsertSalesOrder, items: InsertSalesOrderItem[]): Promise<SalesOrder>;
  updateSalesOrder(id: string, order: Partial<InsertSalesOrder>): Promise<SalesOrder>;
  deleteSalesOrder(id: string): Promise<void>;

  // Purchase Orders
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderWithItems(id: string): Promise<any>;
  createPurchaseOrder(order: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByCustomer(customerId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // AI Insights
  getAiInsights(): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markInsightAsRead(id: string): Promise<void>;

  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Analytics
  getDashboardMetrics(): Promise<any>;
  getSalesAnalytics(days: number): Promise<any>;
  getTopProducts(limit: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSubscription(id: string, tier: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ subscriptionTier: tier })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db
      .insert(vendors)
      .values(vendor)
      .returning();
    return newVendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    return product || undefined;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.quantity} <= ${products.lowStockThreshold}`
        )
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async updateProductQuantity(id: string, quantity: number): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ quantity })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return order || undefined;
  }

  async getSalesOrderWithItems(id: string): Promise<any> {
    const order = await db.query.salesOrders.findFirst({
      where: eq(salesOrders.id, id),
      with: {
        customer: true,
        user: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });
    return order;
  }

  async createSalesOrder(order: InsertSalesOrder, items: InsertSalesOrderItem[]): Promise<SalesOrder> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(salesOrders)
        .values(order)
        .returning();

      const orderItems = items.map(item => ({
        ...item,
        salesOrderId: newOrder.id,
      }));

      await tx.insert(salesOrderItems).values(orderItems);

      // Update product quantities
      for (const item of items) {
        if (item.productId) {
          await tx
            .update(products)
            .set({ 
              quantity: sql`${products.quantity} - ${item.quantity}` 
            })
            .where(eq(products.id, item.productId));
        }
      }

      return newOrder;
    });
  }

  async updateSalesOrder(id: string, order: Partial<InsertSalesOrder>): Promise<SalesOrder> {
    const [updatedOrder] = await db
      .update(salesOrders)
      .set(order)
      .where(eq(salesOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await db.delete(salesOrders).where(eq(salesOrders.id, id));
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order || undefined;
  }

  async getPurchaseOrderWithItems(id: string): Promise<any> {
    const order = await db.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, id),
      with: {
        vendor: true,
        user: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });
    return order;
  }

  async createPurchaseOrder(order: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(purchaseOrders)
        .values(order)
        .returning();

      const orderItems = items.map(item => ({
        ...item,
        purchaseOrderId: newOrder.id,
      }));

      await tx.insert(purchaseOrderItems).values(orderItems);

      return newOrder;
    });
  }

  async updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder> {
    const [updatedOrder] = await db
      .update(purchaseOrders)
      .set(order)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.customerId, customerId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  // AI Insights
  async getAiInsights(): Promise<AiInsight[]> {
    return await db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [newInsight] = await db
      .insert(aiInsights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async markInsightAsRead(id: string): Promise<void> {
    await db.update(aiInsights).set({ isRead: true }).where(eq(aiInsights.id, id));
  }

  // Notifications
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Analytics
  async getDashboardMetrics(): Promise<any> {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [currentMetrics] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(${salesOrders.total}), 0)`,
        orders: sql<number>`COUNT(${salesOrders.id})`,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.status, 'completed'),
          sql`${salesOrders.createdAt} >= ${thisMonth}`
        )
      );

    const [lastMonthMetrics] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(${salesOrders.total}), 0)`,
        orders: sql<number>`COUNT(${salesOrders.id})`,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.status, 'completed'),
          sql`${salesOrders.createdAt} >= ${lastMonth}`,
          sql`${salesOrders.createdAt} < ${thisMonth}`
        )
      );

    const [customerCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(customers);

    const [inventoryValue] = await db
      .select({
        value: sql<number>`COALESCE(SUM(${products.price} * ${products.quantity}), 0)`,
      })
      .from(products)
      .where(eq(products.isActive, true));

    return {
      revenue: {
        current: Number(currentMetrics.revenue),
        previous: Number(lastMonthMetrics.revenue),
      },
      orders: {
        current: Number(currentMetrics.orders),
        previous: Number(lastMonthMetrics.orders),
      },
      customers: Number(customerCount.count),
      inventoryValue: Number(inventoryValue.value),
    };
  }

  async getSalesAnalytics(days: number): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await db
      .select({
        date: sql<string>`DATE(${salesOrders.createdAt})`,
        total: sql<number>`COALESCE(SUM(${salesOrders.total}), 0)`,
        count: sql<number>`COUNT(${salesOrders.id})`,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.status, 'completed'),
          sql`${salesOrders.createdAt} >= ${startDate}`
        )
      )
      .groupBy(sql`DATE(${salesOrders.createdAt})`)
      .orderBy(sql`DATE(${salesOrders.createdAt})`);

    return salesData.map(item => ({
      date: item.date,
      total: Number(item.total),
      count: Number(item.count),
    }));
  }

  async getTopProducts(limit: number): Promise<any> {
    const topProducts = await db
      .select({
        productId: salesOrderItems.productId,
        productName: products.name,
        totalSold: sql<number>`SUM(${salesOrderItems.quantity})`,
        totalRevenue: sql<number>`SUM(${salesOrderItems.total})`,
      })
      .from(salesOrderItems)
      .innerJoin(products, eq(salesOrderItems.productId, products.id))
      .innerJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .where(eq(salesOrders.status, 'completed'))
      .groupBy(salesOrderItems.productId, products.name)
      .orderBy(desc(sql`SUM(${salesOrderItems.total})`))
      .limit(limit);

    return topProducts.map(item => ({
      productId: item.productId,
      name: item.productName,
      totalSold: Number(item.totalSold),
      totalRevenue: Number(item.totalRevenue),
    }));
  }
}

export const storage = new DatabaseStorage();
