import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertReviewSchema, insertPartnerSchema, insertNewsletterSchema, insertAddressSchema, insertContestEntrySchema, updateProductSchema, updateOrderSchema, updateUserRoleSchema } from "../shared/schema";
import bcrypt from "bcryptjs";
// Use the OpenAI client from Replit AI Integrations (may be null if not configured)
import { openai as aiIntegrationsClient } from "./replit_integrations/image/client";
// PayPal integration
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

function getOpenAI() {
  // Return the AI Integrations client (may be null if API key not configured)
  if (!aiIntegrationsClient) {
    throw new Error("OpenAI not configured - missing API key");
  }
  return aiIntegrationsClient;
}

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

const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse").max(255),
  password: z.string()
    .min(8, "Passwort muss mindestens 8 Zeichen haben")
    .max(128)
    .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
    .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten"),
  fullName: z.string().min(2).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse").max(255),
  password: z.string().min(1, "Passwort erforderlich").max(128),
});

export async function registerRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        const errors = validation.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }
      
      const { email, password, fullName } = validation.data;
      
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ error: "Diese E-Mail ist bereits registriert" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email: normalizedEmail,
        password: hashedPassword,
        fullName: fullName?.trim(),
      });
      
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || undefined,
        role: user.role || undefined,
      };
      
      // Send welcome email (non-blocking)
      try {
        const { sendWelcomeEmail } = await import('./resendClient');
        const baseUrl = process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : 'https://aldenair.de';
        await sendWelcomeEmail(user.email, user.fullName || 'Kunde', baseUrl);
      } catch (emailError: any) {
        console.error('[Register] Failed to send welcome email:', emailError.message);
      }
      
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
      res.status(500).json({ error: "Registrierung fehlgeschlagen" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Ungültige Eingabe" });
      }
      
      const { email, password } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();
      
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ error: "Ungültige Anmeldedaten" });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Ungültige Anmeldedaten" });
      }
      
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Sitzungsfehler" });
        }
        
        req.session.userId = user.id;
        req.session.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName || undefined,
          role: user.role || undefined,
        };
        
        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ error: "Sitzungsfehler" });
          }
          
          res.json({ 
            user: { 
              id: user.id, 
              email: user.email, 
              fullName: user.fullName,
              role: user.role 
            } 
          });
        });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Anmeldung fehlgeschlagen" });
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "E-Mail erforderlich" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        
        const { sendPasswordResetEmail } = await import('./resendClient');
        const baseUrl = process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : `${req.protocol}://${req.get('host')}`;
        
        await sendPasswordResetEmail(email, token, baseUrl);
      }
      
      res.json({ success: true, message: "Falls ein Konto existiert, wurde eine E-Mail gesendet." });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.json({ success: true, message: "Falls ein Konto existiert, wurde eine E-Mail gesendet." });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token und Passwort erforderlich" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen haben" });
      }
      
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ error: "Ungültiger oder abgelaufener Link" });
      }
      
      if (resetToken.usedAt) {
        return res.status(400).json({ error: "Dieser Link wurde bereits verwendet" });
      }
      
      if (new Date(resetToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Dieser Link ist abgelaufen" });
      }
      
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.markPasswordResetTokenUsed(token);
      
      res.json({ success: true, message: "Passwort erfolgreich geändert" });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Fehler beim Zurücksetzen des Passworts" });
    }
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
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ungültige Produktdaten", details: parsed.error.issues });
      }
      const product = await storage.updateProduct(req.params.id, parsed.data);
      if (!product) {
        return res.status(404).json({ error: "Produkt nicht gefunden" });
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
        images: [],
        isVerified: review.isVerifiedPurchase || false,
        createdAt: review.createdAt,
        reviewerName: review.isVerifiedPurchase ? 'Verifizierter Kunde' : 'Kunde',
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
      
      // Send order confirmation email using Resend
      try {
        const { sendOrderConfirmationEmail } = await import('./resendClient');
        const emailItems = await Promise.all(validatedItems.map(async (item) => {
          const variant = await storage.getProductVariant(item.variantId);
          return {
            name: variant?.name || 'Produkt',
            quantity: item.quantity,
            price: parseFloat(item.totalPrice),
          };
        }));
        
        const bankSettings = (order.paymentMethod === 'bank' || order.paymentMethod === 'bank_transfer') ? await storage.getBankSettings() : null;
        await sendOrderConfirmationEmail({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail || '',
          customerName: order.customerName || 'Kunde',
          items: emailItems,
          totalAmount: parseFloat(order.totalAmount),
          shippingCost: shippingCost,
          shippingAddress: req.body.shippingAddressData || {},
          paymentMethod: order.paymentMethod || 'bank',
          bankSettings: bankSettings || undefined,
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ungültige Bestellungsdaten", details: parsed.error.issues });
      }
      const order = await storage.updateOrder(req.params.id, parsed.data);
      if (!order) {
        return res.status(404).json({ error: "Bestellung nicht gefunden" });
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
      // Fetch order items with product names for each order
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        // Enrich items with product and variant names
        const enrichedItems = await Promise.all(items.map(async (item) => {
          const variant = item.variantId ? await storage.getProductVariant(item.variantId) : null;
          const product = item.perfumeId ? await storage.getProduct(item.perfumeId) : null;
          return {
            ...item,
            variantName: variant?.name || 'Unbekannte Variante',
            productName: product?.name || 'Unbekanntes Produkt',
          };
        }));
        return { ...order, orderItems: enrichedItems };
      }));
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin create order manually
  app.post("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, shippingAddress, items, notes, paymentMethod, status, discount, shippingType, createAccount, userId: providedUserId } = req.body;
      
      if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Name, E-Mail und mindestens ein Artikel erforderlich" });
      }
      
      // Use provided userId if passed (existing customer selected), otherwise check if createAccount
      let userId: string | null = providedUserId || null;
      
      // Verify provided userId exists
      if (userId) {
        const existingUser = await storage.getUser(userId);
        if (!existingUser) {
          return res.status(400).json({ error: "Der ausgewählte Kunde existiert nicht mehr" });
        }
        console.log(`[Admin] Linking order to existing customer: ${existingUser.email}`);
      } else if (createAccount) {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(customerEmail);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Generate random password
          const cryptoModule = await import('crypto');
          const randomPassword = cryptoModule.randomBytes(8).toString('hex');
          
          // Create user account (password is hashed in storage)
          const newUser = await storage.createUser({
            email: customerEmail,
            password: randomPassword,
            fullName: customerName,
            role: 'customer',
            phone: customerPhone || null,
          });
          userId = newUser.id;
          
          console.log(`[Admin] Created customer account for ${customerEmail}`);
          
          // Send welcome email with password
          try {
            const { sendWelcomeEmailWithPassword } = await import('./resendClient');
            const baseUrl = process.env.REPLIT_DOMAINS 
              ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
              : `${req.protocol}://${req.get('host')}`;
            await sendWelcomeEmailWithPassword(customerEmail, customerName, randomPassword, baseUrl);
            // Wait 1.5s to avoid Resend rate limit (2 req/sec) before sending order confirmation
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (emailError: any) {
            console.error('[Admin] Failed to send welcome email:', emailError.message);
          }
        }
      }
      
      // Validate and calculate prices from database
      let subtotal = 0;
      const validatedItems: Array<{
        variantId: string;
        perfumeId: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
      }> = [];
      
      for (const item of items) {
        if (!item.variantId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({ error: "Ungültige Artikeldaten" });
        }
        
        const variant = await storage.getProductVariant(item.variantId);
        if (!variant) {
          return res.status(400).json({ error: `Variante ${item.variantId} nicht gefunden` });
        }
        
        if (!variant.productId) {
          return res.status(400).json({ error: `Variante ${variant.name} hat kein zugewiesenes Produkt` });
        }
        
        const unitPrice = parseFloat(variant.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;
        
        validatedItems.push({
          variantId: item.variantId as string,
          perfumeId: variant.productId,
          quantity: item.quantity as number,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        });
      }
      
      // Calculate discount and shipping (free over 50€, +2.99€ for prio)
      const discountAmount = Math.max(0, parseFloat(discount) || 0);
      const baseShipping = subtotal >= 50 ? 0 : 4.99;
      const prioExtra = shippingType === 'prio' ? 2.99 : 0;
      const shippingCost = baseShipping + prioExtra;
      const finalAmount = Math.max(0, subtotal - discountAmount + shippingCost);
      
      // Generate order number
      const orderNumber = await storage.generateOrderNumber();
      
      // Build notes with discount and shipping info
      const noteParts: string[] = [];
      if (notes) noteParts.push(notes);
      if (discountAmount > 0) noteParts.push(`Rabatt: €${discountAmount.toFixed(2)}`);
      if (shippingType === 'prio') noteParts.push('Prio-Versand');
      if (createAccount && !userId) noteParts.push('Konto erstellt');
      
      const orderData = {
        orderNumber,
        partnerId: null,
        userId,
        totalAmount: finalAmount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        currency: "EUR",
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddressData: shippingAddress || null,
        billingAddressData: shippingAddress || null,
        paymentMethod: paymentMethod || "bank",
        paymentStatus: status === "paid" || status === "processing" ? "completed" : "pending",
        status: status || "pending",
        notes: `[Admin] ${noteParts.length > 0 ? noteParts.join(' | ') : 'Manuell erstellt'}`,
      };
      
      const order = await storage.createOrder(orderData);
      
      const createdItems: Array<{
        id: string;
        orderId: string | null;
        variantId: string | null;
        perfumeId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        variantName: string;
        productName: string;
        createdAt: Date;
      }> = [];
      for (const item of validatedItems) {
        const createdItem = await storage.createOrderItem({
          orderId: order.id,
          ...item,
        });
        // Enrich with variant name and convert prices to numbers
        const variant = await storage.getProductVariant(item.variantId);
        const product = await storage.getProduct(item.perfumeId);
        createdItems.push({
          ...createdItem,
          unitPrice: parseFloat(String(createdItem.unitPrice)),
          totalPrice: parseFloat(String(createdItem.totalPrice)),
          variantName: variant?.name || 'Unbekannte Variante',
          productName: product?.name || 'Unbekanntes Produkt',
        });
      }
      
      console.log(`[Admin] Manual order created: ${orderNumber}`);
      
      // Send order confirmation email
      try {
        const { sendOrderConfirmationEmail } = await import('./resendClient');
        const emailItems = createdItems.map(item => ({
          name: item.variantName,
          quantity: item.quantity,
          price: item.unitPrice * item.quantity,
        }));
        
        const bankSettings = (paymentMethod === 'bank' || paymentMethod === 'bank_transfer') ? await storage.getBankSettings() : null;
        await sendOrderConfirmationEmail({
          orderId: order.id,
          orderNumber,
          customerEmail,
          customerName,
          items: emailItems,
          totalAmount: finalAmount,
          shippingCost,
          shippingAddress: shippingAddress || { street: '', city: '', postalCode: '' },
          paymentMethod: paymentMethod || 'bank',
          bankSettings: bankSettings || undefined,
        });
        console.log(`[Admin] Order confirmation email sent to ${customerEmail}`);
      } catch (emailError: any) {
        console.error('[Admin] Failed to send order confirmation email:', emailError.message);
        // Don't fail the order creation if email fails
      }
      
      res.json({ ...order, orderItems: createdItems });
    } catch (error: any) {
      console.error("Admin order creation error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Products Management - includes ALL products (visible and hidden)
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProductsWithVariants();
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
    name: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    price: z.union([z.string(), z.number()]).transform(v => String(v)),
    originalPrice: z.union([z.string(), z.number(), z.null()]).optional().transform(v => v ? String(v) : null),
    stock: z.union([z.string(), z.number()]).transform(v => Number(v)),
    sku: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    aiDescription: z.string().optional().nullable(),
    topNotes: z.array(z.string()).optional().nullable(),
    middleNotes: z.array(z.string()).optional().nullable(),
    baseNotes: z.array(z.string()).optional().nullable(),
    ingredients: z.array(z.string()).optional().nullable(),
  });

  // Allowed variant fields for updates
  const allowedVariantFields = [
    'name', 'size', 'price', 'originalPrice', 'stock', 'sku', 'isActive',
    'description', 'image', 'aiDescription', 'topNotes', 'middleNotes', 
    'baseNotes', 'ingredients'
  ];

  app.post("/api/products/:productId/variants", requireAdmin, async (req, res) => {
    try {
      const parsed = variantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid variant data", details: parsed.error.issues });
      }
      const variant = await storage.createProductVariant({
        productId: req.params.productId,
        name: parsed.data.name || parsed.data.size || "Variante",
        size: parsed.data.size || null,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice,
        stock: parsed.data.stock,
        sku: parsed.data.sku,
        isActive: parsed.data.isActive,
        description: parsed.data.description,
        image: parsed.data.image,
        aiDescription: parsed.data.aiDescription,
        topNotes: parsed.data.topNotes,
        middleNotes: parsed.data.middleNotes,
        baseNotes: parsed.data.baseNotes,
        ingredients: parsed.data.ingredients,
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
      
      // Only allow specific fields
      const updateData: any = {};
      for (const field of allowedVariantFields) {
        if ((parsed.data as any)[field] !== undefined) {
          updateData[field] = (parsed.data as any)[field];
        }
      }

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
      const parsed = updateUserRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ungültige Rollendaten", details: parsed.error.issues });
      }
      const user = await storage.updateUser(req.params.id, parsed.data);
      if (!user) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      // Don't allow deleting yourself
      if (req.params.id === req.session.userId) {
        return res.status(400).json({ error: "Sie können Ihren eigenen Account nicht löschen" });
      }
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Customer Search (for order creation)
  app.get("/api/admin/customers/search", requireAdmin, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const customers = await storage.searchCustomers(query, 10);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resend email endpoints
  app.post("/api/admin/orders/:id/resend-email", requireAdmin, async (req, res) => {
    try {
      const { emailType } = req.body; // 'confirmation', 'shipping', 'cancellation', 'refund'
      console.log('[Email] Sending email type:', emailType, 'for order:', req.params.id);
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Bestellung nicht gefunden" });
      }
      
      console.log('[Email] Order found:', order.orderNumber, 'Email:', order.customerEmail, 'Tracking:', order.trackingNumber);

      const orderItems = await storage.getOrderItems(order.id);
      const emailItems = orderItems.map(item => ({
        name: 'Produkt',
        quantity: item.quantity,
        price: parseFloat(item.unitPrice?.toString() || '0') * item.quantity,
      }));

      const shippingAddr = typeof order.shippingAddressData === 'object' && order.shippingAddressData 
        ? order.shippingAddressData as { street: string; city: string; postalCode: string; country?: string }
        : { street: '', city: '', postalCode: '' };

      const { 
        sendOrderConfirmationEmail, 
        sendShippingNotificationEmail, 
        sendOrderCancellationEmail, 
        sendRefundEmail 
      } = await import('./resendClient');

      let success = false;
      const customerEmail = order.customerEmail || '';
      const customerName = order.customerName || 'Kunde';
      const orderNumber = order.orderNumber;
      
      switch (emailType) {
        case 'confirmation':
          const bankSettings = (order.paymentMethod === 'bank' || order.paymentMethod === 'bank_transfer') ? await storage.getBankSettings() : null;
          success = await sendOrderConfirmationEmail({
            orderId: order.id,
            orderNumber,
            customerEmail,
            customerName,
            items: emailItems,
            totalAmount: parseFloat(order.totalAmount?.toString() || '0'),
            shippingCost: 0,
            shippingAddress: shippingAddr,
            paymentMethod: order.paymentMethod || 'bank',
            bankSettings: bankSettings || undefined,
          });
          break;
        case 'shipping':
          console.log('[Email] Sending shipping notification to:', customerEmail);
          success = await sendShippingNotificationEmail(
            customerEmail,
            customerName,
            orderNumber,
            order.trackingNumber || undefined,
            'DHL'
          );
          console.log('[Email] Shipping notification result:', success);
          break;
        case 'cancellation':
          success = await sendOrderCancellationEmail(
            customerEmail,
            customerName,
            orderNumber,
            'Auf Kundenwunsch storniert'
          );
          break;
        case 'refund':
          success = await sendRefundEmail(
            customerEmail,
            customerName,
            orderNumber,
            parseFloat(order.totalAmount?.toString() || '0'),
            order.paymentMethod || 'Überweisung'
          );
          break;
        default:
          return res.status(400).json({ error: "Ungültiger E-Mail-Typ" });
      }

      if (success) {
        res.json({ success: true, message: 'E-Mail erfolgreich gesendet' });
      } else {
        res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
      }
    } catch (error: any) {
      console.error('Resend email error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel and refund order (with Stripe refund if applicable)
  app.post("/api/admin/orders/:id/cancel-and-refund", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Bestellung nicht gefunden" });
      }

      const customerEmail = order.customerEmail || '';
      const customerName = order.customerName || 'Kunde';
      const orderNumber = order.orderNumber;
      const totalAmount = parseFloat(order.totalAmount?.toString() || '0');
      let refundSuccess = false;
      let stripeRefundId: string | null = null;
      let paypalRefundId: string | null = null;

      // If paid by card via Stripe, attempt refund
      if (order.paymentMethod === 'card' && order.stripeSessionId && order.paymentStatus === 'completed') {
        try {
          const { getUncachableStripeClient } = await import('./stripeClient');
          const stripe = await getUncachableStripeClient();
          
          // Get payment intent from session
          const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
          
          if (session.payment_intent) {
            const paymentIntentId = typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent.id;
            
            // Create refund
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntentId,
              reason: 'requested_by_customer',
            });
            
            stripeRefundId = refund.id;
            refundSuccess = true;
            console.log(`[Stripe] Refund created: ${refund.id} for order ${orderNumber}`);
          } else {
            // No payment intent found - cannot refund
            console.error('[Stripe] No payment_intent found for session:', order.stripeSessionId);
            return res.status(400).json({ 
              error: 'Stripe-Rückerstattung nicht möglich: Keine Zahlungsreferenz gefunden' 
            });
          }
        } catch (stripeError: any) {
          console.error('[Stripe] Refund failed:', stripeError.message);
          return res.status(400).json({ 
            error: `Stripe-Rückerstattung fehlgeschlagen: ${stripeError.message}` 
          });
        }
      } else if (order.paymentMethod === 'card' && order.paymentStatus !== 'completed') {
        // Card payment not yet completed - can cancel without refund
        refundSuccess = true;
        console.log(`[Refund] Card payment not completed, marking as cancelled without Stripe refund`);
      } else if (order.paymentMethod === 'paypal' && order.paypalOrderId && order.paymentStatus === 'completed') {
        // PayPal payment - attempt automatic refund (full refund based on capture amount)
        try {
          const { refundPaypalPayment } = await import('./paypal');
          const paypalResult = await refundPaypalPayment(order.paypalOrderId);
          
          if (paypalResult.success) {
            paypalRefundId = paypalResult.refundId || null;
            refundSuccess = true;
            console.log(`[PayPal] Refund created: ${paypalRefundId} for order ${orderNumber}, amount: ${paypalResult.refundedAmount}`);
          } else {
            console.error('[PayPal] Refund failed:', paypalResult.error);
            return res.status(400).json({ 
              error: `PayPal-Rückerstattung fehlgeschlagen: ${paypalResult.error}` 
            });
          }
        } catch (paypalError: any) {
          console.error('[PayPal] Refund error:', paypalError.message);
          return res.status(400).json({ 
            error: `PayPal-Rückerstattung fehlgeschlagen: ${paypalError.message}` 
          });
        }
      } else if (order.paymentMethod === 'paypal' && order.paymentStatus !== 'completed') {
        // PayPal payment not completed - can cancel without refund
        refundSuccess = true;
        console.log(`[Refund] PayPal payment not completed, marking as cancelled without PayPal refund`);
      } else {
        // Bank transfer or other - mark as refunded (manual refund needed)
        refundSuccess = true;
        console.log(`[Refund] Non-card payment (${order.paymentMethod}), manual refund may be needed`);
      }

      // Verify refund was successful before updating
      if (!refundSuccess) {
        return res.status(400).json({ 
          error: 'Rückerstattung konnte nicht verarbeitet werden' 
        });
      }

      // Build refund notes
      let refundNote = ` | Storniert und erstattet am ${new Date().toLocaleDateString('de-DE')}`;
      if (stripeRefundId) refundNote += ` (Stripe Refund: ${stripeRefundId})`;
      if (paypalRefundId) refundNote += ` (PayPal Refund: ${paypalRefundId})`;

      // Update order status
      await storage.updateOrder(order.id, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        notes: (order.notes || '') + refundNote
      });

      // Send cancellation/refund email
      try {
        const { sendRefundEmail } = await import('./resendClient');
        await sendRefundEmail(
          customerEmail,
          customerName,
          orderNumber,
          totalAmount,
          order.paymentMethod === 'card' ? 'Kreditkarte' : 
            order.paymentMethod === 'paypal' ? 'PayPal' : 'Banküberweisung'
        );
        console.log(`[Email] Refund confirmation sent to ${customerEmail}`);
      } catch (emailError: any) {
        console.error('[Email] Failed to send refund email:', emailError.message);
        // Don't fail the operation if email fails
      }

      res.json({ 
        success: true, 
        message: 'Bestellung storniert und erstattet',
        stripeRefundId,
        paypalRefundId,
        refundAmount: totalAmount
      });
    } catch (error: any) {
      console.error('Cancel and refund error:', error);
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

  // Admin Live Chat Management - Chat Sessions
  app.get("/api/admin/chat/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/chat/sessions/:sessionId/messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/chat/sessions/:sessionId/messages", requireAdmin, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ error: "Nachricht erforderlich" });
      }
      
      const message = await storage.createChatMessage({
        sessionId: req.params.sessionId,
        content: content.trim(),
        sender: 'admin',
      });
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/chat/sessions/:sessionId/close", requireAdmin, async (req, res) => {
    try {
      await storage.updateChatSessionStatus(req.params.sessionId, 'closed');
      res.json({ success: true });
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

  app.post("/api/perfume-finder", async (req, res) => {
    try {
      const { answers } = req.body;
      const products = await storage.getProductsWithVariants();
      
      const matchScores: Map<string, number> = new Map();
      
      for (const product of products) {
        let score = 50;
        
        if (answers.gender) {
          const gender = product.gender?.toLowerCase();
          if (answers.gender === 'male' && (gender === 'herren' || gender === 'male' || gender === 'maennlich')) {
            score += 15;
          } else if (answers.gender === 'female' && (gender === 'damen' || gender === 'female' || gender === 'weiblich')) {
            score += 15;
          } else if (answers.gender === 'unisex' && (gender === 'unisex' || !gender)) {
            score += 10;
          }
        }
        
        if (answers.intensity) {
          const category = product.category?.toLowerCase() || '';
          if (answers.intensity === 'light' && (category.includes('frisch') || category.includes('tester'))) {
            score += 10;
          } else if (answers.intensity === 'strong' && (category.includes('50ml') || category.includes('prestige'))) {
            score += 10;
          } else if (answers.intensity === 'medium') {
            score += 5;
          }
        }
        
        if (answers.notes?.length > 0 && product.scentNotes) {
          const productNotes = product.scentNotes.map((n: string) => n.toLowerCase());
          const matchedNotes = answers.notes.filter((n: string) => 
            productNotes.some((pn: string) => pn.includes(n) || n.includes(pn))
          );
          score += matchedNotes.length * 8;
        }
        
        if (answers.occasion) {
          if (answers.occasion === 'date' || answers.occasion === 'evening') {
            if (product.description?.toLowerCase().includes('verfuehr') || 
                product.description?.toLowerCase().includes('romantisch') ||
                product.description?.toLowerCase().includes('sinnlich')) {
              score += 12;
            }
          } else if (answers.occasion === 'business' || answers.occasion === 'daily') {
            if (product.description?.toLowerCase().includes('elegant') || 
                product.description?.toLowerCase().includes('professionell') ||
                product.description?.toLowerCase().includes('dezent')) {
              score += 12;
            }
          } else if (answers.occasion === 'sport') {
            if (product.description?.toLowerCase().includes('frisch') || 
                product.description?.toLowerCase().includes('aktiv') ||
                product.description?.toLowerCase().includes('leicht')) {
              score += 12;
            }
          }
        }
        
        if (answers.priceRange && product.variants?.length) {
          const minPrice = Math.min(...product.variants.map((v: any) => parseFloat(v.price) || 0));
          if (answers.priceRange === 'budget' && minPrice <= 30) {
            score += 15;
          } else if (answers.priceRange === 'mid' && minPrice > 30 && minPrice <= 70) {
            score += 15;
          } else if (answers.priceRange === 'premium' && minPrice > 70) {
            score += 15;
          }
        }
        
        matchScores.set(product.id, Math.min(score, 98));
      }
      
      const sortedProducts = products
        .map(p => ({ 
          ...p, 
          confidence: matchScores.get(p.id) || 50 
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      const matches = sortedProducts.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || 'Parfum',
        description: product.description || product.aiDescription || 'Ein exklusiver Duft aus unserer Kollektion.',
        confidence: product.confidence,
        notes: product.scentNotes || product.topNotes || [],
        image: product.image,
        variants: product.variants?.slice(0, 2) || [],
      }));
      
      res.json({
        matches,
        explanation: 'Basierend auf Ihren Praeferenzen haben wir diese Duefte aus unserem Sortiment fuer Sie ausgewaehlt:',
      });
    } catch (error: any) {
      console.error("Perfume finder error:", error);
      res.status(500).json({ error: error.message });
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

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Alle Felder sind erforderlich" });
      }
      
      // Try to send confirmation email via Resend
      try {
        const { sendContactFormConfirmationEmail } = await import("./resendClient");
        await sendContactFormConfirmationEmail(email, name, subject, message);
      } catch (emailError) {
        console.warn("Could not send contact confirmation email:", emailError);
      }
      
      res.json({ success: true, message: "Nachricht erfolgreich gesendet" });
    } catch (error: any) {
      res.status(500).json({ error: "Fehler beim Senden der Nachricht" });
    }
  });

  // ==================== BANK SETTINGS ====================
  
  // Get bank details for checkout (public)
  app.get("/api/settings/bank", async (req, res) => {
    try {
      const bankSettings = await storage.getBankSettings();
      if (bankSettings) {
        res.json(bankSettings);
      } else {
        res.json({
          recipient: process.env.BANK_RECIPIENT || 'ALDENAIR',
          iban: process.env.BANK_IBAN || '',
          bic: process.env.BANK_BIC || '',
          bankName: process.env.BANK_NAME || '',
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get bank details
  app.get("/api/admin/settings/bank", requireAdmin, async (req, res) => {
    try {
      const bankSettings = await storage.getBankSettings();
      res.json(bankSettings || {
        recipient: '',
        iban: '',
        bic: '',
        bankName: '',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Update bank details
  app.put("/api/admin/settings/bank", requireAdmin, async (req, res) => {
    try {
      const { bankSettingsSchema } = await import("../shared/schema");
      const validated = bankSettingsSchema.parse(req.body);
      await storage.setBankSettings(validated);
      res.json({ success: true, message: "Bankdaten erfolgreich gespeichert" });
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
      
      const earnings = await storage.getUserPaybackEarnings(req.session.userId!);
      const totalEarnings = earnings
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const orders = await storage.getUserOrders(req.session.userId!);
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
      const totalSpent = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      
      let tier = 'bronze';
      if (totalSpent >= 500) tier = 'platinum';
      else if (totalSpent >= 200) tier = 'gold';
      else if (totalSpent >= 50) tier = 'silver';
      
      const newsletterSub = await storage.getNewsletterSubscription(user.email);
      const isNewsletterSubscriber = !!newsletterSub || user.role === 'admin';
      
      res.json({
        points: Math.floor(totalEarnings * 100),
        lifetimePoints: Math.floor(totalEarnings * 100),
        tier,
        cashbackBalance: parseFloat(user.paybackBalance || '0'),
        totalEarnings: parseFloat(user.totalEarnings || '0'),
        isNewsletterSubscriber,
        transactions: earnings.slice(0, 10),
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
      const orders = await storage.getOrders(req.session.userId!);
      
      // For now, just check if the user has any completed orders
      // A more complete implementation would check order items
      const verified = orders.some(order => order.status === 'completed');
      
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

  // Admin Coupons
  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
      
      if (!code || !discountValue) {
        return res.status(400).json({ error: "Code and discount value are required" });
      }
      
      const validatedData = {
        code: String(code).toUpperCase(),
        discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
        discountValue: String(parseFloat(discountValue) || 0),
        minOrderAmount: String(parseFloat(minOrderAmount) || 0),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      };
      
      const coupon = await storage.createCoupon(validatedData);
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, isActive } = req.body;
      
      const validatedData: Record<string, any> = {};
      if (code !== undefined) validatedData.code = String(code).toUpperCase();
      if (discountType !== undefined) validatedData.discountType = discountType === 'fixed' ? 'fixed' : 'percentage';
      if (discountValue !== undefined) validatedData.discountValue = String(parseFloat(discountValue) || 0);
      if (minOrderAmount !== undefined) validatedData.minOrderAmount = String(parseFloat(minOrderAmount) || 0);
      if (maxUses !== undefined) validatedData.maxUses = maxUses ? parseInt(maxUses) : null;
      if (expiresAt !== undefined) validatedData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      if (isActive !== undefined) validatedData.isActive = Boolean(isActive);
      
      const coupon = await storage.updateCoupon(req.params.id, validatedData);
      res.json(coupon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Payback (placeholder - returns empty data for now)
  app.get("/api/admin/payback", requireAdmin, async (req, res) => {
    try {
      res.json({ earnings: [], payouts: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Contest Entries
  app.get("/api/admin/contests/entries", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getContestEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/contests/entries/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContestEntry(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin Shipping Options
  app.get("/api/admin/shipping", requireAdmin, async (req, res) => {
    try {
      const options = await storage.getAllShippingOptions();
      res.json(options);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/shipping", requireAdmin, async (req, res) => {
    try {
      const { name, description, price, estimatedDays, isExpress, isActive } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: "Name and price required" });
      }
      const option = await storage.createShippingOption({
        name,
        description: description || '',
        price: String(parseFloat(price) || 0),
        estimatedDays: estimatedDays || '3-5',
        isExpress: isExpress === true,
        isActive: isActive !== false,
      });
      res.json(option);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/shipping/:id", requireAdmin, async (req, res) => {
    try {
      const { name, description, price, estimatedDays, isExpress, isActive } = req.body;
      const validatedData: Record<string, any> = {};
      if (name !== undefined) validatedData.name = name;
      if (description !== undefined) validatedData.description = description;
      if (price !== undefined) validatedData.price = String(parseFloat(price) || 0);
      if (estimatedDays !== undefined) validatedData.estimatedDays = estimatedDays;
      if (isExpress !== undefined) validatedData.isExpress = Boolean(isExpress);
      if (isActive !== undefined) validatedData.isActive = Boolean(isActive);
      
      const option = await storage.updateShippingOption(req.params.id, validatedData);
      res.json(option);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/shipping/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteShippingOption(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

      const ai = getOpenAI();
      if (!ai) {
        return res.status(503).json({ error: "KI-Dienst nicht konfiguriert" });
      }

      const response = await ai.chat.completions.create({
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

  // ==================== STRIPE PAYMENTS ====================
  
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Stripe nicht konfiguriert" });
    }
  });

  // Create Stripe Checkout Session - uses server-side pricing for security
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { items, customerEmail, shippingAddress, shippingCost, shippingOptionName, discountAmount } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Keine Artikel im Warenkorb" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      // Build base URL from request or environment
      const replitDomains = process.env.REPLIT_DOMAINS;
      const baseUrl = replitDomains 
        ? `https://${replitDomains.split(',')[0]}`
        : `${req.protocol}://${req.get('host')}`;
      
      // Fetch authoritative pricing from database for each item
      const lineItems = await Promise.all(items.map(async (item: any) => {
        const variant = await storage.getProductVariant(item.variantId);
        if (!variant) {
          throw new Error(`Variante ${item.variantId} nicht gefunden`);
        }
        
        // Use server-side price, not client-provided price
        const serverPrice = parseFloat(variant.price);
        
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: variant.name,
              description: variant.description || undefined,
            },
            unit_amount: Math.round(serverPrice * 100),
          },
          quantity: item.quantity || 1,
        };
      }));

      // Add shipping as a line item if applicable
      const parsedShippingCost = parseFloat(shippingCost) || 0;
      if (parsedShippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: shippingOptionName || 'Versand',
              description: 'Versandkosten',
            },
            unit_amount: Math.round(parsedShippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Create order in database first
      const productTotal = lineItems.reduce((sum, item) => 
        sum + (item.price_data.unit_amount * item.quantity) / 100, 0
      );
      const totalAmount = productTotal - (discountAmount || 0);
      
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const order = await storage.createOrder({
        orderNumber,
        totalAmount: totalAmount.toString(),
        customerEmail: customerEmail || null,
        shippingAddressData: shippingAddress || null,
        paymentMethod: "stripe",
        userId: req.session.userId || null,
      });

      // Create discount coupon if applicable
      let discounts: any[] = [];
      if (discountAmount && discountAmount > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: 'eur',
          duration: 'once',
          name: 'Rabatt',
        });
        discounts = [{ coupon: coupon.id }];
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout-cancel`,
        customer_email: customerEmail,
        discounts: discounts.length > 0 ? discounts : undefined,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          shippingCost: parsedShippingCost.toString(),
        },
        shipping_address_collection: {
          allowed_countries: ['DE', 'AT', 'CH'],
        },
      });

      res.json({ url: session.url, sessionId: session.id, orderId: order.id });
    } catch (error: any) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: error.message || "Checkout fehlgeschlagen" });
    }
  });

  // Verify Stripe payment session and send confirmation email
  app.get("/api/stripe/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
      });
      
      console.log('Stripe session retrieved:', session.id, 'payment_status:', session.payment_status, 'orderId:', session.metadata?.orderId);
      
      // If payment successful, update order and send email
      if (session.payment_status === 'paid' && session.metadata?.orderId) {
        const order = await storage.getOrder(session.metadata.orderId);
        console.log('Order found:', order?.id, 'current paymentStatus:', order?.paymentStatus);
        
        // Always try to send email for paid orders (use flag in order to track if sent)
        if (order) {
          // Update order status if not already completed
          if (order.paymentStatus !== 'completed') {
            await storage.updateOrder(order.id, {
              paymentStatus: 'completed',
              status: 'processing',
            });
          }
          
          // Check if email was already sent (use notes field as flag)
          const emailSent = order.notes?.includes('EMAIL_SENT');
          
          if (!emailSent) {
            // Send confirmation email using Resend
            try {
              const { sendOrderConfirmationEmail } = await import('./resendClient');
              const emailItems = session.line_items?.data.map((item: any) => ({
                name: item.description || 'Produkt',
                quantity: item.quantity || 1,
                price: (item.amount_total || 0) / 100,
              })) || [];
              
              const shippingAddr = typeof order.shippingAddressData === 'object' && order.shippingAddressData 
                ? order.shippingAddressData as Record<string, string>
                : { street: '', city: '', postalCode: '' };
              
              const emailResult = await sendOrderConfirmationEmail({
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerEmail: session.customer_email || order.customerEmail || '',
                customerName: order.customerName || shippingAddr.name || 'Kunde',
                items: emailItems,
                totalAmount: (session.amount_total || 0) / 100,
                shippingCost: 0,
                shippingAddress: {
                  street: shippingAddr.street || shippingAddr.line1 || '',
                  city: shippingAddr.city || '',
                  postalCode: shippingAddr.postalCode || shippingAddr.postal_code || '',
                  country: shippingAddr.country || 'Deutschland',
                },
                paymentMethod: 'card',
              });
              
              if (emailResult) {
                // Mark email as sent
                await storage.updateOrder(order.id, {
                  notes: (order.notes || '') + ' EMAIL_SENT',
                });
                console.log('Order confirmation email sent for Stripe order:', order.orderNumber);
              }
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError);
            }
          } else {
            console.log('Email already sent for order:', order.orderNumber);
          }
        }
      }
      
      res.json({
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        orderNumber: session.metadata?.orderNumber,
      });
    } catch (error: any) {
      console.error("Session verify error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Product Recommendations API
  app.get("/api/products/:id/recommendations", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Produkt nicht gefunden" });
      }
      
      // Get all products
      const allProducts = await storage.getProducts();
      
      // Filter out current product and get products from same category
      const sameCategoryProducts = allProducts
        .filter(p => p.id !== productId && p.category === product.category && p.isActive)
        .slice(0, 2);
      
      // Get products from different categories
      const otherProducts = allProducts
        .filter(p => p.id !== productId && p.category !== product.category && p.isActive)
        .slice(0, 2);
      
      const recommendations = [...sameCategoryProducts, ...otherProducts].slice(0, 4);
      
      // Use AI to enhance recommendations if available
      const ai = getOpenAI();
      if (ai && recommendations.length > 0) {
        try {
          const response = await ai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
              role: "system",
              content: "Du bist ein Parfüm-Experte. Generiere eine kurze (max 50 Wörter) Empfehlung warum diese Düfte zusammenpassen könnten."
            }, {
              role: "user", 
              content: `Basierend auf ${product.name} (${product.category}), erkläre kurz warum ${recommendations.map(r => r.name).join(', ')} gute Ergänzungen sind.`
            }],
            max_tokens: 100,
          });
          
          res.json({
            recommendations,
            aiInsight: response.choices[0]?.message?.content || null,
          });
        } catch {
          res.json({ recommendations, aiInsight: null });
        }
      } else {
        res.json({ recommendations, aiInsight: null });
      }
    } catch (error: any) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Fehler beim Laden der Empfehlungen" });
    }
  });

  // Invoice Download API
  app.get("/api/orders/:orderNumber/invoice", requireAuth, async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ error: "Bestellung nicht gefunden" });
      }
      
      // Verify user owns this order
      if (order.userId !== req.session.userId) {
        const user = await storage.getUser(req.session.userId!);
        if (user?.role !== 'admin') {
          return res.status(403).json({ error: "Keine Berechtigung" });
        }
      }
      
      // Only allow invoice download for completed orders
      if (order.paymentStatus !== 'completed') {
        return res.status(400).json({ error: "Rechnung nur für bezahlte Bestellungen verfügbar" });
      }
      
      // Get order items for detailed invoice
      const orderItems = await storage.getOrderItems(order.id);
      
      // Generate HTML invoice
      const shippingAddr = typeof order.shippingAddressData === 'object' && order.shippingAddressData 
        ? order.shippingAddressData as Record<string, string>
        : { street: '', city: '', postalCode: '', country: 'Deutschland' };
      
      const invoiceDate = new Date().toLocaleDateString('de-DE');
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('de-DE') : invoiceDate;
      
      // Use correct field names from schema
      const totalAmount = parseFloat(order.totalAmount || '0');
      
      // Generate items HTML - either from orderItems or fallback to total
      let itemsHtml = '';
      if (orderItems.length > 0) {
        itemsHtml = orderItems.map(item => `
      <tr>
        <td>Artikel</td>
        <td>${item.quantity}</td>
        <td>${parseFloat(item.unitPrice).toFixed(2)} EUR</td>
        <td>${parseFloat(item.totalPrice).toFixed(2)} EUR</td>
      </tr>`).join('');
      } else {
        itemsHtml = `
      <tr>
        <td>Bestellung ${orderNumber}</td>
        <td>1</td>
        <td>${totalAmount.toFixed(2)} EUR</td>
        <td>${totalAmount.toFixed(2)} EUR</td>
      </tr>`;
      }
      
      // Calculate tax breakdown (19% MwSt.)
      const netAmount = totalAmount / 1.19;
      const taxAmount = totalAmount - netAmount;
      const shippingCost = parseFloat(order.shippingCost || '0');
      
      const invoiceHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Rechnung ${orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      background: #f8f9fa;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 40px auto;
      background: white;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 40px;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #d4a574 0%, #e8c097 50%, #d4a574 100%);
    }
    
    .logo {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 4px;
    }
    
    .tagline {
      font-size: 13px;
      font-weight: 300;
      letter-spacing: 2px;
      opacity: 0.8;
      text-transform: uppercase;
    }
    
    .invoice-badge {
      position: absolute;
      top: 40px;
      right: 40px;
      background: rgba(212, 165, 116, 0.15);
      border: 1px solid rgba(212, 165, 116, 0.3);
      color: #d4a574;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .content { padding: 40px; }
    
    .invoice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eee;
    }
    
    .meta-section h3 {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #888;
      margin-bottom: 12px;
    }
    
    .meta-section p {
      font-size: 14px;
      color: #444;
      margin-bottom: 4px;
    }
    
    .meta-section .highlight {
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .meta-right { text-align: right; }
    
    .invoice-number {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table th {
      background: #fafafa;
      padding: 14px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      text-align: left;
      border-bottom: 2px solid #eee;
    }
    
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    
    .items-table tbody tr:hover {
      background: #fafafa;
    }
    
    .totals {
      background: #fafafa;
      border-radius: 8px;
      padding: 24px;
      margin-top: 20px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .totals-row.subtotal {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 8px;
      padding-bottom: 16px;
    }
    
    .totals-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      border-top: 2px solid #d4a574;
      margin-top: 12px;
      padding-top: 16px;
    }
    
    .totals-label { color: #666; }
    .totals-value { font-weight: 500; }
    
    .paid-stamp {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .paid-stamp::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #4caf50;
      border-radius: 50%;
    }
    
    .footer {
      background: #fafafa;
      padding: 30px 40px;
      border-top: 1px solid #eee;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .footer-section h4 {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 8px;
    }
    
    .footer-section p {
      font-size: 13px;
      color: #666;
      margin-bottom: 2px;
    }
    
    .thank-you {
      text-align: center;
      padding: 30px 40px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
    }
    
    .thank-you p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .thank-you .signature {
      margin-top: 12px;
      font-weight: 600;
      color: #d4a574;
    }
    
    @media print {
      body { background: white; }
      .invoice-container { 
        box-shadow: none; 
        margin: 0;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">ALDENAIR</div>
      <div class="tagline">Premium Parfums & Luxusdüfte</div>
      <div class="invoice-badge">Rechnung</div>
    </div>
    
    <div class="content">
      <div class="invoice-meta">
        <div class="meta-section">
          <h3>Rechnungsempfänger</h3>
          <p class="highlight">${order.customerName || 'Kunde'}</p>
          <p>${shippingAddr.street || shippingAddr.line1 || ''}</p>
          <p>${shippingAddr.postalCode || shippingAddr.postal_code || ''} ${shippingAddr.city || ''}</p>
          <p>${shippingAddr.country || 'Deutschland'}</p>
        </div>
        <div class="meta-section meta-right">
          <div class="invoice-number">${orderNumber}</div>
          <p><strong>Rechnungsdatum:</strong> ${orderDate}</p>
          <p><strong>Zahlungsart:</strong> ${order.paymentMethod === 'card' ? 'Kreditkarte' : order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod === 'bank_transfer' ? 'Überweisung' : order.paymentMethod}</p>
          <div class="paid-stamp">Bezahlt</div>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Artikel</th>
            <th>Menge</th>
            <th>Einzelpreis</th>
            <th>Gesamt</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row subtotal">
          <span class="totals-label">Zwischensumme (netto)</span>
          <span class="totals-value">${netAmount.toFixed(2)} EUR</span>
        </div>
        <div class="totals-row">
          <span class="totals-label">MwSt. (19%)</span>
          <span class="totals-value">${taxAmount.toFixed(2)} EUR</span>
        </div>
        ${shippingCost > 0 ? `
        <div class="totals-row">
          <span class="totals-label">Versandkosten</span>
          <span class="totals-value">${shippingCost.toFixed(2)} EUR</span>
        </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span class="totals-label">Gesamtbetrag</span>
          <span class="totals-value">${totalAmount.toFixed(2)} EUR</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Kontakt</h4>
          <p>support@aldenairperfumes.de</p>
          <p>www.aldenairperfumes.de</p>
        </div>
        <div class="footer-section">
          <h4>Unternehmen</h4>
          <p>ALDENAIR GmbH</p>
          <p>Handelsregister: HRB XXXXX</p>
        </div>
        <div class="footer-section">
          <h4>Zahlungsinformationen</h4>
          <p>IBAN: DE XX XXXX XXXX XXXX XXXX XX</p>
          <p>BIC: XXXXXXXXXXX</p>
        </div>
      </div>
    </div>
    
    <div class="thank-you">
      <p>Vielen Dank für Ihr Vertrauen und Ihren Einkauf bei ALDENAIR.</p>
      <p class="signature">Ihr ALDENAIR Team</p>
    </div>
  </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="Rechnung-${orderNumber}.html"`);
      res.send(invoiceHtml);
    } catch (error: any) {
      console.error("Invoice error:", error);
      res.status(500).json({ error: "Fehler beim Erstellen der Rechnung" });
    }
  });

  // Payback Earning - award points after order completion
  app.post("/api/payback/earn", requireAuth, async (req, res) => {
    try {
      const { orderId } = req.body;
      const userId = req.session.userId!;
      
      if (!orderId) {
        return res.status(400).json({ error: "Bestell-ID fehlt" });
      }
      
      // Fetch the order and validate ownership
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Bestellung nicht gefunden" });
      }
      
      // Verify user owns this order
      if (order.userId !== userId) {
        return res.status(403).json({ error: "Keine Berechtigung für diese Bestellung" });
      }
      
      // Only award cashback for completed payments
      if (order.paymentStatus !== 'completed') {
        return res.status(400).json({ error: "Cashback nur für bezahlte Bestellungen verfügbar" });
      }
      
      // Check if cashback was already awarded (use notes field to track)
      if (order.notes?.includes('CASHBACK_AWARDED')) {
        return res.status(400).json({ error: "Cashback wurde bereits gutgeschrieben" });
      }
      
      // Calculate cashback (2% of order total) from actual order data
      const cashbackRate = 0.02;
      const orderTotal = parseFloat(order.totalAmount || '0');
      const earnedAmount = orderTotal * cashbackRate;
      
      // Update user's payback balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }
      
      const currentBalance = parseFloat(user.paybackBalance || '0');
      const newBalance = currentBalance + earnedAmount;
      
      // Update user balance and mark order as credited
      await storage.updateUser(userId, {
        paybackBalance: newBalance.toFixed(2),
      });
      
      await storage.updateOrder(orderId, {
        notes: (order.notes || '') + ' CASHBACK_AWARDED',
      });
      
      res.json({
        earned: earnedAmount.toFixed(2),
        newBalance: newBalance.toFixed(2),
        message: `Sie haben ${earnedAmount.toFixed(2)} EUR Cashback verdient!`,
      });
    } catch (error: any) {
      console.error("Payback earn error:", error);
      res.status(500).json({ error: "Fehler beim Cashback" });
    }
  });

  // ==========================================
  // PAYPAL INTEGRATION ROUTES
  // ==========================================
  
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });
}
