import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(), slug: varchar("slug", { length: 140 }).notNull().unique(), name: varchar("name", { length: 180 }).notNull(), category: varchar("category", { length: 80 }).notNull(), description: text("description").notNull(), imageUrl: text("imageUrl").notNull(), price: int("price").notNull(), packSize: varchar("packSize", { length: 60 }).notNull(), available: boolean("available").default(true).notNull(), featured: boolean("featured").default(false).notNull(), popularity: int("popularity").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(), orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(), customerName: varchar("customerName", { length: 160 }).notNull(), phone: varchar("phone", { length: 40 }).notNull(), email: varchar("email", { length: 320 }), address: text("address").notNull(), areaCity: varchar("areaCity", { length: 160 }).notNull(), notes: text("notes"), subtotal: int("subtotal").notNull(), deliveryFee: int("deliveryFee").notNull(), total: int("total").notNull(), paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), status: mysqlEnum("status", ["NEW", "CONFIRMED", "PROCESSING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"]).default("NEW").notNull(), notificationStatus: mysqlEnum("notificationStatus", ["PENDING", "SENT", "FAILED"]).default("PENDING").notNull(), notificationError: text("notificationError"), idempotencyKey: varchar("idempotencyKey", { length: 100 }).notNull().unique(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(), orderId: int("orderId").notNull(), productId: int("productId"), productName: varchar("productName", { length: 180 }).notNull(), packSize: varchar("packSize", { length: 60 }).notNull(), unitPrice: int("unitPrice").notNull(), quantity: int("quantity").notNull(), lineTotal: int("lineTotal").notNull(),
});

export const customOrderRequests = mysqlTable("customOrderRequests", {
  id: int("id").autoincrement().primaryKey(), requestNumber: varchar("requestNumber", { length: 50 }).notNull().unique(), customerName: varchar("customerName", { length: 160 }).notNull(), phone: varchar("phone", { length: 40 }).notNull(), email: varchar("email", { length: 320 }), companyName: varchar("companyName", { length: 180 }), orderType: varchar("orderType", { length: 80 }).notNull(), productsRequired: text("productsRequired").notNull(), estimatedQuantity: varchar("estimatedQuantity", { length: 100 }).notNull(), preferredDeliveryDate: varchar("preferredDeliveryDate", { length: 40 }), deliveryArea: varchar("deliveryArea", { length: 180 }).notNull(), additionalRequirements: text("additionalRequirements"), status: mysqlEnum("customStatus", ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"]).default("NEW").notNull(), notificationStatus: mysqlEnum("customNotificationStatus", ["PENDING", "SENT", "FAILED"]).default("PENDING").notNull(), notificationError: text("notificationError"), idempotencyKey: varchar("idempotencyKey", { length: 100 }).notNull().unique(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contactMessages = mysqlTable("contactMessages", { id: int("id").autoincrement().primaryKey(), customerName: varchar("customerName", { length: 160 }).notNull(), phone: varchar("phone", { length: 40 }), email: varchar("email", { length: 320 }), message: text("message").notNull(), status: mysqlEnum("contactStatus", ["NEW", "READ", "CLOSED"]).default("NEW").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const galleryImages = mysqlTable("galleryImages", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 180 }).notNull(), imageUrl: text("imageUrl").notNull(), altText: varchar("altText", { length: 240 }).notNull(), sortOrder: int("sortOrder").default(0).notNull(), active: boolean("active").default(true).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });

export const hostingServers = mysqlTable("hostingServers", {
  id: int("id").autoincrement().primaryKey(), serverName: varchar("serverName", { length: 120 }).notNull(), address: varchar("address", { length: 180 }).notNull(), port: int("port").default(25565).notNull(), version: varchar("version", { length: 40 }).default("1.21").notNull(), status: mysqlEnum("serverStatus", ["ONLINE", "OFFLINE", "MAINTENANCE"]).default("OFFLINE").notNull(), playersOnline: int("playersOnline").default(0).notNull(), maxPlayers: int("maxPlayers").default(20).notNull(), productName: varchar("productName", { length: 120 }).notNull(), customerName: varchar("customerName", { length: 160 }).notNull(), expiresAt: timestamp("expiresAt").notNull(), lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const hostingRenewals = mysqlTable("hostingRenewals", {
  id: int("id").autoincrement().primaryKey(), renewalNumber: varchar("renewalNumber", { length: 50 }).notNull().unique(), serverId: int("serverId").notNull(), serverName: varchar("serverName", { length: 120 }).notNull(), customerName: varchar("customerName", { length: 160 }).notNull(), productName: varchar("productName", { length: 120 }).notNull(), amount: int("amount").notNull(), durationMonths: int("durationMonths").default(1).notNull(), status: mysqlEnum("renewalStatus", ["PENDING", "PAID", "EXPIRED", "CANCELLED"]).default("PENDING").notNull(), dueAt: timestamp("dueAt").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect; export type InsertUser = typeof users.$inferInsert; export type Product = typeof products.$inferSelect; export type Order = typeof orders.$inferSelect; export type OrderItem = typeof orderItems.$inferSelect; export type CustomOrderRequest = typeof customOrderRequests.$inferSelect; export type ContactMessage = typeof contactMessages.$inferSelect; export type GalleryImage = typeof galleryImages.$inferSelect; export type HostingServer = typeof hostingServers.$inferSelect; export type HostingRenewal = typeof hostingRenewals.$inferSelect;
