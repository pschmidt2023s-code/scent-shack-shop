import { db } from "./db";
import { eq, and, desc, ilike, or, inArray } from "drizzle-orm";
import * as schema from "../shared/schema";
import type {
  User, InsertUser,
  Product, InsertProduct,
  ProductVariant, InsertProductVariant,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Review, InsertReview,
  Favorite, InsertFavorite,
  Partner, InsertPartner,
  NewsletterSubscription, InsertNewsletter,
  Address, InsertAddress,
  ContestEntry, InsertContestEntry,
  SampleSet, InsertSampleSet,
  ShippingOption, InsertShippingOption,
  AbandonedCart, InsertAbandonedCart,
  PaybackEarning,
  ShopSetting,
  BankSettings,
} from "../shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  getProducts(filters?: { category?: string; search?: string }): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProductsWithVariants(filters?: { category?: string; search?: string }): Promise<(Product & { variants: ProductVariant[] })[]>;
  getAllProductsWithVariants(): Promise<(Product & { variants: ProductVariant[] })[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductWithVariants(id: string): Promise<(Product & { variants: ProductVariant[] }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getProductVariants(productId: string): Promise<ProductVariant[]>;
  getProductVariant(id: string): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, data: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;

  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;

  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  getReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, perfumeId: string): Promise<boolean>;
  isFavorite(userId: string, perfumeId: string): Promise<boolean>;

  getPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  getPartnerByCode(code: string): Promise<Partner | undefined>;
  getPartnerByUserId(userId: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined>;

  getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined>;
  createNewsletterSubscription(subscription: InsertNewsletter): Promise<NewsletterSubscription>;

  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  createContestEntry(entry: InsertContestEntry): Promise<ContestEntry>;

  generatePartnerCode(): Promise<string>;
  generateOrderNumber(): Promise<string>;
  
  getUserOrders(userId: string): Promise<Order[]>;
  getUserPaybackEarnings(userId: string): Promise<PaybackEarning[]>;
  
  getAllShippingOptions(): Promise<ShippingOption[]>;
  createShippingOption(data: InsertShippingOption): Promise<ShippingOption>;
  updateShippingOption(id: string, data: Partial<InsertShippingOption>): Promise<ShippingOption | undefined>;
  deleteShippingOption(id: string): Promise<boolean>;
  
  getShopSetting(key: string): Promise<any>;
  setShopSetting(key: string, value: any): Promise<ShopSetting>;
  getBankSettings(): Promise<BankSettings | null>;
  setBankSettings(settings: BankSettings): Promise<ShopSetting>;
  
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date; usedAt: Date | null } | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(schema.users).values({
      ...user,
      email: user.email.toLowerCase(),
    }).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return true;
  }

  async getProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
    const conditions = [eq(schema.products.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(schema.products.category, filters.category));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(schema.products.name, `%${filters.search}%`),
          ilike(schema.products.brand, `%${filters.search}%`)
        )!
      );
    }
    
    return db.select().from(schema.products).where(and(...conditions));
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(schema.products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }

  async getProductWithVariants(id: string): Promise<(Product & { variants: ProductVariant[] }) | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const variants = await this.getProductVariants(id);
    return { ...product, variants };
  }

  async getProductsWithVariants(filters?: { category?: string; search?: string }): Promise<(Product & { variants: ProductVariant[] })[]> {
    // When searching, first check variants to find additional products
    let additionalProductIds: string[] = [];
    if (filters?.search) {
      const matchingVariants = await db.select()
        .from(schema.productVariants)
        .where(ilike(schema.productVariants.name, `%${filters.search}%`));
      additionalProductIds = [...new Set(matchingVariants.map(v => v.productId).filter((id): id is string => id !== null))];
    }
    
    // Get products matching filters
    let products = await this.getProducts(filters);
    
    // Add products found via variant search
    if (additionalProductIds.length > 0) {
      const existingProductIds = new Set(products.map(p => p.id));
      const newProductIds = additionalProductIds.filter(id => !existingProductIds.has(id));
      
      if (newProductIds.length > 0) {
        const additionalProducts = await db.select()
          .from(schema.products)
          .where(and(
            inArray(schema.products.id, newProductIds),
            eq(schema.products.isActive, true)
          ));
        products = [...products, ...additionalProducts];
      }
    }
    
    if (products.length === 0) return [];
    
    // Get all product IDs
    const productIds = products.map(p => p.id);
    
    // Fetch ALL variants for these products in ONE query (fixes N+1 problem)
    const allVariants = await db.select()
      .from(schema.productVariants)
      .where(inArray(schema.productVariants.productId, productIds));
    
    // Group variants by productId for efficient lookup
    const variantsByProductId = new Map<string, ProductVariant[]>();
    for (const variant of allVariants) {
      if (variant.productId) {
        const existing = variantsByProductId.get(variant.productId) || [];
        existing.push(variant);
        variantsByProductId.set(variant.productId, existing);
      }
    }
    
    // Map products with their variants using the lookup
    return products.map(product => ({
      ...product,
      variants: variantsByProductId.get(product.id) || [],
    }));
  }

  async getAllProductsWithVariants(): Promise<(Product & { variants: ProductVariant[] })[]> {
    const products = await this.getAllProducts();
    if (products.length === 0) return [];
    
    const productIds = products.map(p => p.id);
    const allVariants = await db.select()
      .from(schema.productVariants)
      .where(inArray(schema.productVariants.productId, productIds));
    
    const variantsByProductId = new Map<string, ProductVariant[]>();
    for (const variant of allVariants) {
      if (variant.productId) {
        const existing = variantsByProductId.get(variant.productId) || [];
        existing.push(variant);
        variantsByProductId.set(variant.productId, existing);
      }
    }
    
    return products.map(product => ({
      ...product,
      variants: variantsByProductId.get(product.id) || [],
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(schema.products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(schema.products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return true;
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return db.select().from(schema.productVariants)
      .where(eq(schema.productVariants.productId, productId));
  }

  async getProductVariant(id: string): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(schema.productVariants).where(eq(schema.productVariants.id, id));
    return variant;
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [created] = await db.insert(schema.productVariants).values(variant).returning();
    return created;
  }

  async updateProductVariant(id: string, data: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updated] = await db.update(schema.productVariants)
      .set(data)
      .where(eq(schema.productVariants.id, id))
      .returning();
    return updated;
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    await db.delete(schema.productVariants).where(eq(schema.productVariants.id, id));
    return true;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return db.select().from(schema.orders)
        .where(eq(schema.orders.userId, userId))
        .orderBy(desc(schema.orders.createdAt));
    }
    return db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, orderNumber));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(schema.orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(schema.orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    return updated;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(schema.orderItems).values(item).returning();
    return created;
  }

  async getReviews(productId: string, variantId?: string): Promise<Review[]> {
    if (variantId) {
      return db.select().from(schema.reviews)
        .where(and(
          eq(schema.reviews.perfumeId, productId),
          eq(schema.reviews.variantId, variantId)
        ))
        .orderBy(desc(schema.reviews.createdAt));
    }
    return db.select().from(schema.reviews)
      .where(eq(schema.reviews.perfumeId, productId))
      .orderBy(desc(schema.reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(schema.reviews).values(review).returning();
    return created;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(schema.favorites).where(eq(schema.favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(schema.favorites).values(favorite).returning();
    return created;
  }

  async removeFavorite(userId: string, perfumeId: string): Promise<boolean> {
    await db.delete(schema.favorites).where(
      and(
        eq(schema.favorites.userId, userId),
        eq(schema.favorites.perfumeId, perfumeId)
      )
    );
    return true;
  }

  async isFavorite(userId: string, perfumeId: string): Promise<boolean> {
    const [fav] = await db.select().from(schema.favorites).where(
      and(
        eq(schema.favorites.userId, userId),
        eq(schema.favorites.perfumeId, perfumeId)
      )
    );
    return !!fav;
  }

  async getPartners(): Promise<Partner[]> {
    return db.select().from(schema.partners).orderBy(desc(schema.partners.createdAt));
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(schema.partners).where(eq(schema.partners.id, id));
    return partner;
  }

  async getPartnerByCode(code: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(schema.partners).where(eq(schema.partners.partnerCode, code));
    return partner;
  }

  async getPartnerByUserId(userId: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(schema.partners).where(eq(schema.partners.userId, userId));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [created] = await db.insert(schema.partners).values(partner).returning();
    return created;
  }

  async updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [updated] = await db.update(schema.partners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.partners.id, id))
      .returning();
    return updated;
  }

  async getNewsletterSubscription(email: string): Promise<NewsletterSubscription | undefined> {
    const [sub] = await db.select().from(schema.newsletterSubscriptions)
      .where(eq(schema.newsletterSubscriptions.email, email.toLowerCase()));
    return sub;
  }

  async createNewsletterSubscription(subscription: InsertNewsletter): Promise<NewsletterSubscription> {
    const [created] = await db.insert(schema.newsletterSubscriptions)
      .values({ ...subscription, email: subscription.email.toLowerCase() })
      .returning();
    return created;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return db.select().from(schema.addresses).where(eq(schema.addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [created] = await db.insert(schema.addresses).values(address).returning();
    return created;
  }

  async updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(schema.addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.addresses.id, id))
      .returning();
    return updated;
  }

  async deleteAddress(id: string): Promise<boolean> {
    await db.delete(schema.addresses).where(eq(schema.addresses.id, id));
    return true;
  }

  async createContestEntry(entry: InsertContestEntry): Promise<ContestEntry> {
    const [created] = await db.insert(schema.contestEntries).values(entry).returning();
    return created;
  }

  async generatePartnerCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;
    
    while (exists) {
      code = 'ALN-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await this.getPartnerByCode(code);
      exists = !!existing;
    }
    
    return code!;
  }

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ALN-${timestamp}-${random}`;
  }

  async getPartnerSales(partnerId: string): Promise<any[]> {
    return db.select().from(schema.partnerSales)
      .where(eq(schema.partnerSales.partnerId, partnerId))
      .orderBy(desc(schema.partnerSales.createdAt));
  }

  async getPartnerPayouts(partnerId: string): Promise<any[]> {
    return [];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
    return db.select().from(schema.newsletterSubscriptions)
      .orderBy(desc(schema.newsletterSubscriptions.createdAt));
  }

  async getTopReviews(): Promise<any[]> {
    const reviews = await db.select()
      .from(schema.reviews)
      .where(eq(schema.reviews.rating, 5))
      .orderBy(desc(schema.reviews.createdAt))
      .limit(3);
    
    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title || 'Hervorragend',
      content: review.content || '',
      createdAt: review.createdAt,
      reviewerName: review.isVerifiedPurchase ? 'Verifizierter Kunde' : 'Kunde',
    }));
  }

  async deleteOrder(id: string): Promise<boolean> {
    await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id));
    await db.delete(schema.orders).where(eq(schema.orders.id, id));
    return true;
  }

  // ==================== SAMPLE SETS ====================
  async getSampleSets(): Promise<SampleSet[]> {
    return db.select().from(schema.sampleSets)
      .where(eq(schema.sampleSets.isActive, true))
      .orderBy(schema.sampleSets.price);
  }

  async getSampleSetById(id: string): Promise<SampleSet | undefined> {
    const [sampleSet] = await db.select().from(schema.sampleSets)
      .where(eq(schema.sampleSets.id, id));
    return sampleSet;
  }

  // ==================== SHIPPING OPTIONS ====================
  async getShippingOptions(): Promise<ShippingOption[]> {
    return db.select().from(schema.shippingOptions)
      .where(eq(schema.shippingOptions.isActive, true))
      .orderBy(schema.shippingOptions.price);
  }

  // ==================== ABANDONED CARTS ====================
  async saveAbandonedCart(data: InsertAbandonedCart): Promise<AbandonedCart> {
    const [cart] = await db.insert(schema.abandonedCarts)
      .values(data)
      .returning();
    return cart;
  }

  async recoverAbandonedCart(id: string): Promise<void> {
    await db.update(schema.abandonedCarts)
      .set({ recoveredAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.abandonedCarts.id, id));
  }

  async getAbandonedCartsForReminder(): Promise<AbandonedCart[]> {
    return db.select().from(schema.abandonedCarts)
      .where(
        and(
          eq(schema.abandonedCarts.reminderSent, false),
          eq(schema.abandonedCarts.recoveredAt, null as any)
        )
      )
      .orderBy(desc(schema.abandonedCarts.createdAt));
  }

  async markReminderSent(id: string): Promise<void> {
    await db.update(schema.abandonedCarts)
      .set({ reminderSent: true, reminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.abandonedCarts.id, id));
  }

  // ==================== COUPONS ====================
  async getCoupons(): Promise<any[]> {
    return db.select().from(schema.coupons).orderBy(desc(schema.coupons.createdAt));
  }

  async getCouponByCode(code: string): Promise<any | undefined> {
    const [coupon] = await db.select().from(schema.coupons)
      .where(eq(schema.coupons.code, code.toUpperCase()));
    return coupon;
  }

  async createCoupon(data: any): Promise<any> {
    const [coupon] = await db.insert(schema.coupons)
      .values({ ...data, code: data.code.toUpperCase() })
      .returning();
    return coupon;
  }

  async updateCoupon(id: string, data: any): Promise<any | undefined> {
    const [coupon] = await db.update(schema.coupons)
      .set(data)
      .where(eq(schema.coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
    return true;
  }

  // ==================== CONTEST ENTRIES ====================
  async getContestEntries(contestId?: string): Promise<any[]> {
    if (contestId) {
      return db.select().from(schema.contestEntries)
        .where(eq(schema.contestEntries.contestId, contestId))
        .orderBy(desc(schema.contestEntries.createdAt));
    }
    return db.select().from(schema.contestEntries).orderBy(desc(schema.contestEntries.createdAt));
  }

  async deleteContestEntry(id: string): Promise<boolean> {
    await db.delete(schema.contestEntries).where(eq(schema.contestEntries.id, id));
    return true;
  }

  // ==================== USER ORDERS & PAYBACK ====================
  async getUserOrders(userId: string): Promise<Order[]> {
    return db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));
  }

  async getUserPaybackEarnings(userId: string): Promise<PaybackEarning[]> {
    return db.select().from(schema.paybackEarnings)
      .where(eq(schema.paybackEarnings.userId, userId))
      .orderBy(desc(schema.paybackEarnings.createdAt));
  }

  // ==================== SHIPPING MANAGEMENT ====================
  async createShippingOption(data: InsertShippingOption): Promise<ShippingOption> {
    const [option] = await db.insert(schema.shippingOptions)
      .values(data)
      .returning();
    return option;
  }

  async updateShippingOption(id: string, data: Partial<InsertShippingOption>): Promise<ShippingOption | undefined> {
    const [option] = await db.update(schema.shippingOptions)
      .set(data)
      .where(eq(schema.shippingOptions.id, id))
      .returning();
    return option;
  }

  async deleteShippingOption(id: string): Promise<boolean> {
    await db.delete(schema.shippingOptions).where(eq(schema.shippingOptions.id, id));
    return true;
  }

  async getAllShippingOptions(): Promise<ShippingOption[]> {
    return db.select().from(schema.shippingOptions)
      .orderBy(schema.shippingOptions.price);
  }

  // ==================== SHOP SETTINGS ====================
  async getShopSetting(key: string): Promise<any> {
    const [setting] = await db.select().from(schema.shopSettings)
      .where(eq(schema.shopSettings.key, key));
    return setting?.value || null;
  }

  async setShopSetting(key: string, value: any): Promise<ShopSetting> {
    const existing = await this.getShopSetting(key);
    if (existing !== null) {
      const [updated] = await db.update(schema.shopSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(schema.shopSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(schema.shopSettings)
      .values({ key, value })
      .returning();
    return created;
  }

  async getBankSettings(): Promise<BankSettings | null> {
    const value = await this.getShopSetting('bank_settings');
    if (!value) return null;
    return value as BankSettings;
  }

  async setBankSettings(settings: BankSettings): Promise<ShopSetting> {
    return this.setShopSetting('bank_settings', settings);
  }

  // ==================== PASSWORD RESET ====================
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(schema.passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date; usedAt: Date | null } | undefined> {
    const [result] = await db.select().from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token));
    return result;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db.update(schema.passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordResetTokens.token, token));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(schema.users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }
}

export const storage = new DatabaseStorage();
