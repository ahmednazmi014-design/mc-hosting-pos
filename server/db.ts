import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import { productSeed } from "./catalog";
import { InsertUser, contactMessages, customOrderRequests, galleryImages, hostingRenewals, hostingServers, orderItems, orders, products, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getProducts() {
  const db = await getDb();
  if (!db) return productSeed.map((item, index) => ({ ...item, id: index + 1, createdAt: new Date(), updatedAt: new Date() }));
  let result = await db.select().from(products).orderBy(desc(products.popularity));
  if (result.length === 0) {
    await db.insert(products).values(productSeed);
    result = await db.select().from(products).orderBy(desc(products.popularity));
  }
  return result;
}

export async function getProductBySlug(slug: string) {
  const list = await getProducts();
  return list.find(product => product.slug === slug);
}

export async function listHostingServers() {
  const db = await getDb();
  if (!db) return [
    { id: 1, serverName: "Skyblock Realm", address: "play.mc-hosting.local", port: 25565, version: "1.21.1", status: "ONLINE" as const, playersOnline: 12, maxPlayers: 50, productName: "Iron Survival", customerName: "Demo Customer", expiresAt: new Date(Date.now() + 18 * 86400000), lastCheckedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { id: 2, serverName: "Modded SMP", address: "modded.mc-hosting.local", port: 25565, version: "1.20.4", status: "MAINTENANCE" as const, playersOnline: 0, maxPlayers: 25, productName: "Diamond Network", customerName: "Demo Community", expiresAt: new Date(Date.now() + 4 * 86400000), lastCheckedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
  ];
  return db.select().from(hostingServers).orderBy(asc(hostingServers.expiresAt));
}

export async function listHostingRenewals() {
  const db = await getDb();
  if (!db) return [{ id: 1, renewalNumber: "MCR-DEMO-001", serverId: 1, serverName: "Skyblock Realm", customerName: "Demo Customer", productName: "Iron Survival", amount: 899, durationMonths: 1, status: "PENDING" as const, dueAt: new Date(Date.now() + 4 * 86400000), createdAt: new Date(), updatedAt: new Date() }];
  return db.select().from(hostingRenewals).orderBy(desc(hostingRenewals.createdAt));
}

export async function createHostingRenewal(values: typeof hostingRenewals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(hostingRenewals).values(values);
  const result = await db.select().from(hostingRenewals).where(eq(hostingRenewals.renewalNumber, values.renewalNumber)).limit(1);
  return result[0];
}

export async function updateHostingServerStatus(id: number, status: "ONLINE" | "OFFLINE" | "MAINTENANCE", playersOnline = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(hostingServers).set({ status, playersOnline, lastCheckedAt: new Date(), updatedAt: new Date() }).where(eq(hostingServers.id, id));
  const result = await db.select().from(hostingServers).where(eq(hostingServers.id, id)).limit(1);
  return result[0];
}

export async function getGalleryImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryImages).where(eq(galleryImages.active, true)).orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
}

export async function createGalleryImage(values: typeof galleryImages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(galleryImages).values(values);
  const result = await db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt)).limit(1);
  return result[0];
}

export async function updateProductAvailability(id: number, available: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(products).set({ available, updatedAt: new Date() }).where(eq(products.id, id));
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createOrderRecord(values: typeof orders.$inferInsert, items: Array<typeof orderItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured. Orders cannot be stored yet.");
  await db.insert(orders).values(values);
  const saved = await db.select().from(orders).where(eq(orders.orderNumber, values.orderNumber)).limit(1);
  if (!saved[0]) throw new Error("Order was not created");
  await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: saved[0].id })));
  return saved[0];
}

export async function getOrderByIdempotencyKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.idempotencyKey, key)).limit(1);
  return result[0];
}

export async function getOrderWithItems(orderNumber: string, phone?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const filters = phone ? and(eq(orders.orderNumber, orderNumber), eq(orders.phone, phone)) : eq(orders.orderNumber, orderNumber);
  const order = await db.select().from(orders).where(filters).limit(1);
  if (!order[0]) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
  return { ...order[0], items };
}

export async function listOrders(filters?: { status?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  const clauses = [];
  if (filters?.status && filters.status !== "ALL") clauses.push(eq(orders.status, filters.status as never));
  if (filters?.search) {
    const q = `%${filters.search}%`;
    clauses.push(or(like(orders.orderNumber, q), like(orders.customerName, q), like(orders.phone, q)));
  }
  const result = await db.select().from(orders).where(clauses.length ? and(...clauses) : undefined).orderBy(desc(orders.createdAt)).limit(100);
  return Promise.all(result.map(async order => ({ ...order, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) })));
}

export async function updateOrderStatus(orderNumber: string, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(orders).set({ status: status as never, updatedAt: new Date() }).where(eq(orders.orderNumber, orderNumber));
  return getOrderWithItems(orderNumber);
}

export async function updateOrderNotification(orderNumber: string, status: "PENDING" | "SENT" | "FAILED", error?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ notificationStatus: status, notificationError: error ?? null, updatedAt: new Date() }).where(eq(orders.orderNumber, orderNumber));
}

export async function createCustomOrder(values: typeof customOrderRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured. Custom requests cannot be stored yet.");
  await db.insert(customOrderRequests).values(values);
  const result = await db.select().from(customOrderRequests).where(eq(customOrderRequests.requestNumber, values.requestNumber)).limit(1);
  return result[0];
}

export async function getCustomByIdempotencyKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customOrderRequests).where(eq(customOrderRequests.idempotencyKey, key)).limit(1);
  return result[0];
}

export async function listCustomOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customOrderRequests).orderBy(desc(customOrderRequests.createdAt)).limit(100);
}

export async function updateCustomOrderStatus(requestNumber: string, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(customOrderRequests).set({ status: status as never, updatedAt: new Date() }).where(eq(customOrderRequests.requestNumber, requestNumber));
  const result = await db.select().from(customOrderRequests).where(eq(customOrderRequests.requestNumber, requestNumber)).limit(1);
  return result[0];
}

export async function updateCustomNotification(requestNumber: string, status: "PENDING" | "SENT" | "FAILED", error?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(customOrderRequests).set({ notificationStatus: status, notificationError: error ?? null, updatedAt: new Date() }).where(eq(customOrderRequests.requestNumber, requestNumber));
}

export async function saveContactMessage(values: typeof contactMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured. Contact messages cannot be stored yet.");
  await db.insert(contactMessages).values(values);
}

export { asc };
