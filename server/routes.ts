import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertReviewSchema, insertPartnerSchema, insertNewsletterSchema, insertAddressSchema, insertContestEntrySchema } from "../shared/schema";
import bcrypt from "bcryptjs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      fullName?: string;
      role?: string;
    };
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

export async function registerRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
      });
      
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || undefined,
        role: user.role || undefined,
      };
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          fullName: user.fullName,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || undefined,
        role: user.role || undefined,
      };
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          fullName: user.fullName,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.json({ user: null });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        role: user.role,
        paybackBalance: user.paybackBalance,
      } 
    });
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProductsWithVariants({
        category: category as string,
        search: search as string,
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductWithVariants(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.id);
      res.json(variants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const { variantId } = req.query;
      const reviews = await storage.getReviews(req.params.id, variantId as string | undefined);
      
      const mappedReviews = reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        perfumeId: review.perfumeId,
        variantId: review.variantId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images || [],
        isVerified: review.isVerified || false,
        createdAt: review.createdAt,
        reviewerName: review.isVerified ? 'Verifizierter Kunde' : 'Kunde',
      }));
      
      res.json(mappedReviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reviews/top", async (req, res) => {
    try {
      const reviews = await storage.getTopReviews();
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const data = insertReviewSchema.parse({
        ...req.body,
        userId: req.session.userId,
        perfumeId: req.params.id,
      });
      const review = await storage.createReview(data);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.session.userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (user?.role !== "admin") {
          return res.status(403).json({ error: "Forbidden" });
        }
      }
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderNumber = await storage.generateOrderNumber();
      
      let partnerId: string | null = null;
      if (req.body.referralCode) {
        const partner = await storage.getPartnerByCode(req.body.referralCode);
        if (partner && partner.status === "approved") {
          partnerId = partner.id;
        }
      }
      
      const items = req.body.items;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      
      let calculatedSubtotal = 0;
      const validatedItems: Array<{
        perfumeId?: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
      }> = [];
      
      for (const item of items) {
        if (!item.variantId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({ error: "Invalid order item" });
        }
        
        const variant = await storage.getProductVariant(item.variantId);
        if (!variant) {
          return res.status(400).json({ error: `Product variant ${item.variantId} not found` });
        }
        
        const unitPrice = parseFloat(variant.price);
        const totalPrice = unitPrice * item.quantity;
        calculatedSubtotal += totalPrice;
        
        validatedItems.push({
          perfumeId: item.perfumeId || variant.productId || undefined,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        });
      }
      
      const discountAmount = parseFloat(req.body.discountAmount) || 0;
      const shippingCost = parseFloat(req.body.shippingCost) || 0;
      const finalAmount = Math.max(0, calculatedSubtotal - discountAmount + shippingCost);
      
      const orderData = {
        orderNumber,
        partnerId,
        userId: req.session.userId || null,
        totalAmount: finalAmount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        currency: "EUR",
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        shippingAddressData: req.body.shippingAddressData,
        billingAddressData: req.body.billingAddressData,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: "pending",
        status: req.body.paymentMethod === "bank" ? "pending_payment" : "pending",
        notes: req.body.notes,
      };
      
      const order = await storage.createOrder(orderData);
      
      for (const item of validatedItems) {
        await storage.createOrderItem({
          orderId: order.id,
          ...item,
        });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Products Management
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProductsWithVariants();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Variants Management
  const variantSchema = z.object({
    size: z.string().min(1),
    price: z.union([z.string(), z.number()]).transform(v => String(v)),
    originalPrice: z.union([z.string(), z.number(), z.null()]).optional().transform(v => v ? String(v) : null),
    stock: z.union([z.string(), z.number()]).transform(v => Number(v)),
    sku: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    name: z.string().optional(),
  });

  app.post("/api/products/:productId/variants", requireAdmin, async (req, res) => {
    try {
      const parsed = variantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid variant data", details: parsed.error.issues });
      }
      const variant = await storage.createProductVariant({
        productId: req.params.productId,
        name: parsed.data.name || parsed.data.size,
        size: parsed.data.size,
        price: parsed.data.price,
        stock: parsed.data.stock,
        isActive: parsed.data.isActive,
      });
      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/variants/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = variantSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid variant data", details: parsed.error.issues });
      }
      const updateData: any = {};
      if (parsed.data.size !== undefined) updateData.size = parsed.data.size;
      if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
      if (parsed.data.stock !== undefined) updateData.stock = parsed.data.stock;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;

      const variant = await storage.updateProductVariant(req.params.id, updateData);
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }
      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/variants/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProductVariant(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUser(req.params.id, { role });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Analytics
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const products = await storage.getProducts();
      const users = await storage.getAllUsers();
      
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount?.toString() || '0'), 0);
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      
      res.json({
        totalOrders: orders.length,
        completedOrders,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: users.filter(u => u.role !== 'admin').length,
        recentOrders: orders.slice(0, 10),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const favorites = await storage.getFavorites(req.session.userId!);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const { perfumeId } = req.body;
      const favorite = await storage.addFavorite({
        userId: req.session.userId!,
        perfumeId,
      });
      res.json(favorite);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:perfumeId", requireAuth, async (req, res) => {
    try {
      await storage.removeFavorite(req.session.userId!, req.params.perfumeId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/partners", requireAdmin, async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/partners/apply", async (req, res) => {
    try {
      const partnerCode = await storage.generatePartnerCode();
      
      const partnerData = {
        partnerCode,
        status: "pending",
        commissionRate: "2.50",
        applicationData: req.body.applicationData,
        bankDetails: req.body.bankDetails,
        userId: req.session.userId || null,
      };
      
      const partner = await storage.createPartner(partnerData);
      
      res.json({ 
        success: true, 
        partnerId: partner.id, 
        partnerCode: partner.partnerCode 
      });
    } catch (error: any) {
      console.error("Partner application error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/partners/:id", requireAdmin, async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id, req.body);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/partners/me", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      res.json(partner || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partners/validate/:code", async (req, res) => {
    try {
      const partner = await storage.getPartnerByCode(req.params.code.toUpperCase());
      if (!partner || partner.status !== 'approved') {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      const user = partner.userId ? await storage.getUser(partner.userId) : null;
      
      res.json({
        id: partner.id,
        partnerCode: partner.partnerCode,
        commissionRate: parseFloat(partner.commissionRate || '2.5'),
        fullName: user?.fullName || 'Partner'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      const existing = await storage.getNewsletterSubscription(email);
      if (existing) {
        return res.json({ success: true, message: "Already subscribed" });
      }
      
      await storage.createNewsletterSubscription({ email });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/addresses", requireAuth, async (req, res) => {
    try {
      const addresses = await storage.getAddresses(req.session.userId!);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", requireAuth, async (req, res) => {
    try {
      const data = insertAddressSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      const address = await storage.createAddress(data);
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAddress(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/contests/:contestId/enter", async (req, res) => {
    try {
      const data = insertContestEntrySchema.parse({
        ...req.body,
        contestId: req.params.contestId,
        userId: req.session.userId || null,
      });
      const entry = await storage.createContestEntry(data);
      res.json({ success: true, entryId: entry.id });
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        return res.status(400).json({ error: "Already entered this contest" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      if (!LOVABLE_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const systemPrompt = `Du bist ein freundlicher Kundenservice-Assistent für ALDENAIR, einen Premium-Online-Shop für Parfums und Düfte.

Wichtige Informationen über ALDENAIR:
- Wir bieten hochwertige Parfums und Düfte in verschiedenen Größen (5ml Proben für 4,99€ und 50ml Flaschen)
- Versand: 3-7 Werktage innerhalb Deutschlands (On-Demand-Bestellung)
- Versandkosten: Kostenlos ab 50€, sonst 4,90€
- Zahlungsmethoden: Kreditkarte, PayPal, SEPA-Lastschrift, Sofortüberweisung
- Rückgaberecht: 30 Tage für ungeöffnete Artikel
- Rabatte: 10% für Neukunden bei Newsletter-Anmeldung
- Geschäftszeiten: Mo-Fr 9:00-18:00 Uhr

Dein Verhalten:
- Sei immer freundlich, professionell und hilfsbereit
- Beantworte Fragen klar und präzise
- Halte Antworten kurz (max. 2-3 Sätze)`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ 
        message: data.choices?.[0]?.message?.content || "Sorry, I could not generate a response."
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Chat service unavailable" });
    }
  });

  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...profile } = user;
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const { password, email, ...data } = req.body;
      const user = await storage.updateUser(req.session.userId!, data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password: _, ...profile } = user;
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/returns", requireAuth, async (req, res) => {
    try {
      const { orderId, reason } = req.body;
      if (!orderId || !reason) {
        return res.status(400).json({ error: "Order ID and reason required" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      res.json({ success: true, message: "Return request submitted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/loyalty", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        points: 0,
        lifetimePoints: 0,
        tier: "bronze",
        transactions: [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partners/me/sales", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const sales = await storage.getPartnerSales(partner.id);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partners/me/payouts", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const payouts = await storage.getPartnerPayouts(partner.id);
      res.json(payouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/partners/me/bank", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const updated = await storage.updatePartner(partner.id, {
        bankDetails: req.body,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/partners/me/payouts", requireAuth, async (req, res) => {
    try {
      const partner = await storage.getPartnerByUserId(req.session.userId!);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const { amount } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      const pendingEarnings = parseFloat(partner.pendingEarnings || "0");
      if (parseFloat(amount) > pendingEarnings) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      
      res.json({ success: true, message: "Payout request submitted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Payback API endpoints
  app.get("/api/payback", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      res.json({
        earnings: [],
        payouts: [],
        balance: parseFloat(user?.paybackBalance || "0"),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payback/payout", requireAuth, async (req, res) => {
    try {
      const { amount, bankDetails } = req.body;
      
      if (!amount || amount < 10) {
        return res.status(400).json({ error: "Mindestbetrag für Auszahlung: 10€" });
      }
      
      res.json({ success: true, message: "Auszahlungsantrag wurde eingereicht" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Check verified purchase for reviews
  app.get("/api/orders/check-purchase", requireAuth, async (req, res) => {
    try {
      const { variantId } = req.query;
      const orders = await storage.getOrdersByUserId(req.session.userId!);
      
      const verified = orders.some(order => 
        order.status === 'completed' && 
        order.orderItems?.some(item => item.variantId === variantId)
      );
      
      res.json({ verified });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => {
        const { password, ...user } = u;
        return user;
      }));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/newsletter", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stock notification endpoint (placeholder - stores in memory for now)
  app.post("/api/stock-notifications", async (req, res) => {
    try {
      const { email, productId, variantId, userId } = req.body;
      
      if (!email || !productId || !variantId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // For now, just acknowledge the request
      // In production, this would store the notification preference
      console.log(`Stock notification registered: ${email} for variant ${variantId}`);
      
      res.json({ success: true, message: "Notification registered" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-reorder endpoints (placeholder)
  app.get("/api/auto-reorder", requireAuth, async (req, res) => {
    try {
      // Placeholder - returns empty array
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auto-reorder", requireAuth, async (req, res) => {
    try {
      // Placeholder - acknowledge the request
      res.json({ success: true, id: crypto.randomUUID() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/auto-reorder/:id", requireAuth, async (req, res) => {
    try {
      // Placeholder - acknowledge the update
      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/auto-reorder/:id", requireAuth, async (req, res) => {
    try {
      // Placeholder - acknowledge the deletion
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Push notifications endpoint (placeholder)
  app.post("/api/push-subscriptions", requireAuth, async (req, res) => {
    try {
      // Placeholder - acknowledge the subscription
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/push-subscriptions", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Product Description Generation
  app.post("/api/admin/generate-description", requireAdmin, async (req, res) => {
    try {
      const { productName, brand, scentNotes, inspiredBy, gender, category } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "Produktname erforderlich" });
      }

      const notesText = scentNotes?.length ? scentNotes.join(", ") : "nicht angegeben";
      const inspiredText = inspiredBy || "keine Angabe";

      const prompt = `Du bist ein Experte für Luxusparfüms. Erstelle eine ansprechende deutsche Produktbeschreibung für folgendes Parfüm:

Produktname: ${productName}
Marke: ${brand || "ALDENAIR"}
Duftnoten: ${notesText}
Inspiriert von: ${inspiredText}
Geschlecht: ${gender || "Unisex"}
Kategorie: ${category || "Eau de Parfum"}

Erstelle eine JSON-Antwort mit folgender Struktur:
{
  "description": "Eine elegante, verkaufsfördernde Beschreibung (2-3 Sätze)",
  "seasons": ["Array der passenden Jahreszeiten: Frühling, Sommer, Herbst, Winter"],
  "occasions": ["Array der passenden Anlässe: z.B. Alltag, Büro, Date, Abendveranstaltung, Hochzeit, Sport"],
  "highlights": ["3 besondere Eigenschaften oder Vorteile dieses Duftes"]
}

Antworte nur mit validem JSON, kein weiterer Text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ error: "Keine Antwort von KI erhalten" });
      }

      const result = JSON.parse(content);
      res.json(result);
    } catch (error: any) {
      console.error("AI description error:", error);
      res.status(500).json({ error: error.message || "KI-Beschreibung fehlgeschlagen" });
    }
  });

  // Update product with extended fields
  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updated = await storage.updateProduct(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Produkt nicht gefunden" });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SAMPLE SETS / PROBENSETS ====================
  
  // Get all sample set options
  app.get("/api/sample-sets", async (req, res) => {
    try {
      const sampleSets = await storage.getSampleSets();
      res.json(sampleSets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create custom sample set order
  app.post("/api/sample-sets/order", async (req, res) => {
    try {
      const { sampleSetId, variantIds, customerEmail, shippingAddress } = req.body;
      
      if (!sampleSetId || !variantIds || variantIds.length === 0) {
        return res.status(400).json({ error: "Sample Set und Varianten erforderlich" });
      }

      const sampleSet = await storage.getSampleSetById(sampleSetId);
      if (!sampleSet) {
        return res.status(404).json({ error: "Sample Set nicht gefunden" });
      }

      if (variantIds.length > (sampleSet.maxSamples || 5)) {
        return res.status(400).json({ 
          error: `Maximal ${sampleSet.maxSamples} Proben erlaubt` 
        });
      }

      // Create order for sample set
      const orderNumber = `SS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const order = await storage.createOrder({
        orderNumber,
        totalAmount: sampleSet.price,
        customerEmail,
        shippingAddressData: shippingAddress,
        paymentMethod: "bank_transfer",
        notes: `Probenset: ${sampleSet.name} - ${variantIds.length} Proben`,
        userId: req.session.userId || null,
      });

      res.json({ 
        success: true, 
        orderId: order.id, 
        orderNumber: order.orderNumber,
        sampleSet: sampleSet.name,
        samplesCount: variantIds.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SHIPPING OPTIONS ====================
  
  // Get all shipping options
  app.get("/api/shipping-options", async (req, res) => {
    try {
      const options = await storage.getShippingOptions();
      res.json(options);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ABANDONED CARTS ====================
  
  // Save abandoned cart
  app.post("/api/abandoned-cart", async (req, res) => {
    try {
      const { email, cartData, totalAmount } = req.body;
      
      if (!cartData || Object.keys(cartData).length === 0) {
        return res.status(400).json({ error: "Warenkorb ist leer" });
      }

      const cart = await storage.saveAbandonedCart({
        userId: req.session.userId || null,
        email: email || null,
        cartData,
        totalAmount: totalAmount?.toString() || "0",
      });

      res.json({ success: true, cartId: cart.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark abandoned cart as recovered
  app.post("/api/abandoned-cart/:id/recover", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.recoverAbandonedCart(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get abandoned carts for email reminders
  app.get("/api/admin/abandoned-carts", requireAdmin, async (req, res) => {
    try {
      const carts = await storage.getAbandonedCartsForReminder();
      res.json(carts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Send reminder email for abandoned cart
  app.post("/api/admin/abandoned-carts/:id/send-reminder", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markReminderSent(id);
      // In production, this would trigger an email
      res.json({ success: true, message: "Erinnerung wurde als gesendet markiert" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
