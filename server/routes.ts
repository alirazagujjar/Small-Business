import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { aiService } from "./openai";
import { 
  insertUserSchema, insertCustomerSchema, insertVendorSchema, 
  insertProductSchema, insertSalesOrderSchema, insertPurchaseOrderSchema,
  insertPaymentSchema, insertNotificationSchema, type User
} from "@shared/schema";
import { z } from "zod";

// Authentication schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    async (username: string, password: string, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

  const requireSubscription = (tier: string) => (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userTier = req.user.subscriptionTier;
    if (tier === 'premium' && userTier !== 'premium') {
      return res.status(402).json({ message: 'Premium subscription required' });
    }
    
    next();
  };

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const { confirmPassword, ...userData } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      res.json({ message: 'Registration successful', user: { id: user.id, username: user.username, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", passport.authenticate('local'), (req, res) => {
    const user = req.user as User;
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        subscriptionTier: user.subscriptionTier 
      } 
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get("/api/me", requireAuth, (req, res) => {
    const user = req.user as User;
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        subscriptionTier: user.subscriptionTier 
      } 
    });
  });

  // Subscription upgrade to premium (cash only)
  app.post('/api/upgrade-subscription', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      await storage.updateUserSubscription(user.id, 'premium');
      res.json({ message: 'Subscription upgraded to premium' });
    } catch (error: any) {
      res.status(400).json({ error: { message: error.message } });
    }
  });

  // Dashboard and analytics
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/sales-analytics", requireAuth, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const analytics = await storage.getSalesAnalytics(days);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/top-products", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/customers/:id", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vendor routes
  app.get("/api/vendors", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vendors", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/products/barcode/:barcode", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/low-stock", requireAuth, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sales Order routes
  app.get("/api/sales-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getSalesOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sales-orders", requireAuth, async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Generate order number
      const orderNumber = `SO-${Date.now()}`;
      
      const orderData = {
        ...insertSalesOrderSchema.parse(order),
        orderNumber,
        userId: (req.user as User).id,
      };

      const salesOrder = await storage.createSalesOrder(orderData, items);
      res.json(salesOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sales-orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getSalesOrderWithItems(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Sales order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/purchase-orders", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Generate PO number
      const poNumber = `PO-${Date.now()}`;
      
      const orderData = {
        ...insertPurchaseOrderSchema.parse(order),
        poNumber,
        userId: (req.user as User).id,
      };

      const purchaseOrder = await storage.createPurchaseOrder(orderData, items);
      res.json(purchaseOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Insights routes (Premium feature)
  app.get("/api/ai/insights", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      const insights = await storage.getAiInsights();
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-insights", requireAuth, requireSubscription('premium'), async (req, res) => {
    try {
      // Get recent sales and inventory data
      const salesData = await storage.getSalesAnalytics(30);
      const inventoryData = await storage.getLowStockProducts();
      
      // Generate AI insights
      const insights = await aiService.generateBusinessInsights(salesData, inventoryData);
      
      // Store insights in database
      for (const insight of insights) {
        await storage.createAiInsight(insight);
      }
      
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser((req.user as User).id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types (e.g., subscribe to notifications)
        console.log('Received message:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Export broadcast function for use in other parts of the application
  (global as any).broadcast = broadcast;

  return httpServer;
}
