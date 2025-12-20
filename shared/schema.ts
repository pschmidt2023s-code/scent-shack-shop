import { pgTable, text, integer, boolean, numeric, timestamp, uuid, jsonb, unique } from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("customer"),
  paybackBalance: numeric("payback_balance").default("0"),
  totalEarnings: numeric("total_earnings").default("0"),
  iban: text("iban"),
  bic: text("bic"),
  accountHolder: text("account_holder"),
  bankName: text("bank_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  description: text("description"),
  category: text("category"),
  gender: text("gender"),
  image: text("image"),
  size: text("size"),
  scentNotes: text("scent_notes").array(),
  topNotes: text("top_notes").array(),
  middleNotes: text("middle_notes").array(),
  baseNotes: text("base_notes").array(),
  ingredients: text("ingredients").array(),
  inspiredBy: text("inspired_by"),
  aiDescription: text("ai_description"),
  seasons: text("seasons").array(),
  occasions: text("occasions").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  size: text("size"),
  price: numeric("price").notNull(),
  originalPrice: numeric("original_price"),
  stock: integer("stock").default(0),
  sku: text("sku"),
  inStock: boolean("in_stock").default(true),
  inspiredByFragrance: text("inspired_by_fragrance"),
  isActive: boolean("is_active").default(true),
  // Extended product-like fields
  image: text("image"),
  aiDescription: text("ai_description"),
  topNotes: text("top_notes").array(),
  middleNotes: text("middle_notes").array(),
  baseNotes: text("base_notes").array(),
  ingredients: text("ingredients").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  currency: text("currency").default("EUR"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  shippingAddressData: jsonb("shipping_address_data"),
  billingAddressData: jsonb("billing_address_data"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  partnerId: uuid("partner_id").references(() => partners.id),
  stripeSessionId: text("stripe_session_id"),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  perfumeId: uuid("perfume_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  perfumeId: uuid("perfume_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id).notNull(),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  unique: unique().on(table.reviewId, table.userId),
}));

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  perfumeId: uuid("perfume_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  unique: unique().on(table.userId, table.perfumeId),
}));

export const partners = pgTable("partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  partnerCode: text("partner_code").notNull().unique(),
  status: text("status").default("pending"),
  commissionRate: numeric("commission_rate").default("2.50"),
  totalEarnings: numeric("total_earnings").default("0"),
  pendingEarnings: numeric("pending_earnings").default("0"),
  applicationData: jsonb("application_data"),
  bankDetails: jsonb("bank_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const partnerSales = pgTable("partner_sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partner_id").references(() => partners.id).notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  commissionAmount: numeric("commission_amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paybackEarnings = pgTable("payback_earnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  guestEmail: text("guest_email"),
  amount: numeric("amount").notNull(),
  percentage: numeric("percentage").default("5.0"),
  status: text("status").default("pending"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paybackPayouts = pgTable("payback_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: numeric("amount").notNull(),
  bankDetails: jsonb("bank_details"),
  status: text("status").default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  preferences: jsonb("preferences").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  status: text("status").default("active"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => chatSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  senderType: text("sender_type").notNull(),
  content: text("content").notNull(),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productViews = pgTable("product_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const stockNotifications = pgTable("stock_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  email: text("email"),
  notified: boolean("notified").default(false),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").default("percentage"),
  discountValue: numeric("discount_value").notNull(),
  minOrderAmount: numeric("min_order_amount").default("0"),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contests = pgTable("contests", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prize: text("prize"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contestEntries = pgTable("contest_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  contestId: uuid("contest_id").references(() => contests.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  unique: unique().on(table.contestId, table.email),
}));

export const bundleProducts = pgTable("bundle_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  totalPrice: numeric("total_price").notNull(),
  discountPercentage: numeric("discount_percentage").default("0"),
  quantityRequired: integer("quantity_required").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").default("Germany"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  tableName: text("table_name"),
  recordId: text("record_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sample Sets / Probensets
export const sampleSets = pgTable("sample_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  maxSamples: integer("max_samples").default(5),
  price: numeric("price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sampleSetItems = pgTable("sample_set_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sampleSetId: uuid("sample_set_id").references(() => sampleSets.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shipping Options
export const shippingOptions = pgTable("shipping_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  estimatedDays: text("estimated_days"),
  isExpress: boolean("is_express").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Abandoned Carts
export const abandonedCarts = pgTable("abandoned_carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  email: text("email"),
  cartData: jsonb("cart_data").notNull(),
  totalAmount: numeric("total_amount"),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  recoveredAt: timestamp("recovered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shop Settings (singleton table for store configuration)
export const shopSettings = pgTable("shop_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  favorites: many(favorites),
  addresses: many(addresses),
  paybackEarnings: many(paybackEarnings),
  paybackPayouts: many(paybackPayouts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  partner: one(partners, {
    fields: [orders.partnerId],
    references: [partners.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.perfumeId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
  paybackBalance: z.string().optional(),
  totalEarnings: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  accountHolder: z.string().optional(),
  bankName: z.string().optional(),
});

export const insertProductSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  scentNotes: z.array(z.string()).optional().nullable(),
  topNotes: z.array(z.string()).optional().nullable(),
  middleNotes: z.array(z.string()).optional().nullable(),
  baseNotes: z.array(z.string()).optional().nullable(),
  ingredients: z.array(z.string()).optional().nullable(),
  inspiredBy: z.string().optional().nullable(),
  aiDescription: z.string().optional().nullable(),
  seasons: z.array(z.string()).optional().nullable(),
  occasions: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const insertProductVariantSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  size: z.string().optional(),
  price: z.string(),
  stock: z.number().optional(),
  inStock: z.boolean().optional(),
  inspiredByFragrance: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertOrderSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  orderNumber: z.string(),
  status: z.string().optional(),
  totalAmount: z.string(),
  currency: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  shippingAddressData: z.any().optional(),
  billingAddressData: z.any().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
  partnerId: z.string().uuid().optional().nullable(),
  stripeSessionId: z.string().optional(),
  paypalOrderId: z.string().optional(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().uuid().optional(),
  perfumeId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  quantity: z.number(),
  unitPrice: z.string(),
  totalPrice: z.string(),
});

export const insertReviewSchema = z.object({
  userId: z.string().uuid(),
  perfumeId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
  isVerifiedPurchase: z.boolean().optional(),
  helpfulCount: z.number().optional(),
});

export const insertFavoriteSchema = z.object({
  userId: z.string().uuid(),
  perfumeId: z.string().uuid().optional(),
});

export const insertPartnerSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  partnerCode: z.string(),
  status: z.string().optional(),
  commissionRate: z.string().optional(),
  totalEarnings: z.string().optional(),
  pendingEarnings: z.string().optional(),
  applicationData: z.any().optional(),
  bankDetails: z.any().optional(),
});

export const insertNewsletterSchema = z.object({
  email: z.string().email(),
  preferences: z.any().optional(),
  isActive: z.boolean().optional(),
});

export const insertAddressSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const insertContestEntrySchema = z.object({
  contestId: z.string().uuid().optional(),
  userId: z.string().uuid().optional().nullable(),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const insertSampleSetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  maxSamples: z.number().optional(),
  price: z.string(),
  isActive: z.boolean().optional(),
});

export const insertShippingOptionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string(),
  estimatedDays: z.string().optional(),
  isExpress: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const insertAbandonedCartSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  email: z.string().email().optional(),
  cartData: z.any(),
  totalAmount: z.string().optional(),
  reminderSent: z.boolean().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type ContestEntry = typeof contestEntries.$inferSelect;
export type InsertContestEntry = z.infer<typeof insertContestEntrySchema>;
export type SampleSet = typeof sampleSets.$inferSelect;
export type InsertSampleSet = z.infer<typeof insertSampleSetSchema>;
export type ShippingOption = typeof shippingOptions.$inferSelect;
export type InsertShippingOption = z.infer<typeof insertShippingOptionSchema>;
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = z.infer<typeof insertAbandonedCartSchema>;
export type ShopSetting = typeof shopSettings.$inferSelect;
export type PaybackEarning = typeof paybackEarnings.$inferSelect;

// Bank settings type for admin panel
export const bankSettingsSchema = z.object({
  recipient: z.string().min(1, "Empfängername erforderlich"),
  iban: z.string().min(15, "IBAN muss mindestens 15 Zeichen haben"),
  bic: z.string().optional(),
  bankName: z.string().optional(),
});
export type BankSettings = z.infer<typeof bankSettingsSchema>;

// Update schemas with strict field allowlists for security
export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
  image: z.string().optional(),
  size: z.string().optional(),
  scentNotes: z.array(z.string()).optional(),
  topNotes: z.array(z.string()).optional(),
  middleNotes: z.array(z.string()).optional(),
  baseNotes: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  inspiredBy: z.string().optional(),
  aiDescription: z.string().optional(),
  seasons: z.array(z.string()).optional(),
  occasions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updateProductVariantSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ungültiger Preis").optional(),
  stock: z.number().int().min(0).optional(),
  inStock: z.boolean().optional(),
  inspiredByFragrance: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "completed", "cancelled"]).optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).optional(),
}).strict();

export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  accountHolder: z.string().optional(),
  bankName: z.string().optional(),
}).strict();

export const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "partner", "admin"]),
}).strict();

export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
