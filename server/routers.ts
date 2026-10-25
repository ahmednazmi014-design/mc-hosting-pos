import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
import {
  createGalleryImage,
  createHostingRenewal,
  createCustomOrder,
  createOrderRecord,
  getCustomByIdempotencyKey,
  getGalleryImages,
  listHostingRenewals,
  listHostingServers,
  getOrderByIdempotencyKey,
  getOrderWithItems,
  getProductBySlug,
  getProducts,
  listCustomOrders,
  listOrders,
  saveContactMessage,
  updateProductAvailability,
  updateCustomNotification,
  updateCustomOrderStatus,
  updateOrderNotification,
  updateOrderStatus,
  updateHostingServerStatus,
} from "./db";
import { customOrderRequests, orderItems, orders } from "../drizzle/schema";

const statusValues = ["NEW", "CONFIRMED", "PROCESSING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"] as const;
const customStatusValues = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
const recentSubmissions = new Map<string, number>();

const orderInput = z.object({
  customerName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  address: z.string().trim().min(8).max(800),
  areaCity: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(800).optional().or(z.literal("")),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).min(1).max(30),
  idempotencyKey: z.string().trim().min(12).max(100),
  website: z.string().max(0).optional().or(z.literal("")),
});

const customInput = z.object({
  customerName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  companyName: z.string().trim().max(180).optional().or(z.literal("")),
  orderType: z.string().trim().min(2).max(80),
  productsRequired: z.string().trim().min(2).max(1200),
  estimatedQuantity: z.string().trim().min(1).max(100),
  preferredDeliveryDate: z.string().trim().max(40).optional().or(z.literal("")),
  deliveryArea: z.string().trim().min(2).max(180),
  additionalRequirements: z.string().trim().max(1200).optional().or(z.literal("")),
  idempotencyKey: z.string().trim().min(12).max(100),
  website: z.string().max(0).optional().or(z.literal("")),
});

function ensureRateLimit(key: string) {
  const now = Date.now();
  const previous = recentSubmissions.get(key);
  if (previous && now - previous < 1200) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a moment and try again." });
  recentSubmissions.set(key, now);
  if (recentSubmissions.size > 500) {
    recentSubmissions.forEach((timestamp, entry) => {
      if (now - timestamp > 60_000) recentSubmissions.delete(entry);
    });
  }
}

function makeNumber(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

function rs(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

async function postDiscord(payload: unknown) {
  if (!ENV.discordWebhookUrl) throw new Error("DISCORD_WEBHOOK_URL is not configured");
  const response = await fetch(ENV.discordWebhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Discord webhook returned ${response.status}`);
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  store: router({
    products: publicProcedure.query(() => getProducts()),
    gallery: publicProcedure.query(() => getGalleryImages()),
    servers: publicProcedure.query(() => listHostingServers()),
    productBySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(140) })).query(({ input }) => getProductBySlug(input.slug)),
  }),

  orders: router({
    create: publicProcedure.input(orderInput).mutation(async ({ input }) => {
      if (input.website) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid submission." });
      ensureRateLimit(`order:${input.phone}:${input.idempotencyKey}`);
      const existing = await getOrderByIdempotencyKey(input.idempotencyKey);
      if (existing) return { order: await getOrderWithItems(existing.orderNumber), duplicate: true, notificationStatus: existing.notificationStatus };
      const products = await getProducts();
      const productMap = new Map(products.map(product => [product.id, product]));
      const items = input.items.map(item => {
        const product = productMap.get(item.productId);
        if (!product || !product.available) throw new TRPCError({ code: "BAD_REQUEST", message: "One of the selected products is unavailable." });
        return { product, quantity: item.quantity, lineTotal: product.price * item.quantity };
      });
      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const deliveryFee = subtotal >= ENV.freeDeliveryThreshold ? 0 : ENV.deliveryFee;
      const orderNumber = makeNumber("FRX");
      const record = await createOrderRecord({
        orderNumber,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        address: input.address,
        areaCity: input.areaCity,
        notes: input.notes || null,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        paymentMethod: "Cash on Delivery",
        status: "NEW",
        notificationStatus: "PENDING",
        notificationError: null,
        idempotencyKey: input.idempotencyKey,
      }, items.map(item => ({ productId: item.product.id, productName: item.product.name, packSize: item.product.packSize, unitPrice: item.product.price, quantity: item.quantity, lineTotal: item.lineTotal, orderId: 0 })));
      const discordPayload = {
        username: "FRIXO.PK Orders",
        embeds: [{ title: "🚨 NEW FRIXO ORDER", color: 0xE85D04, fields: [
          { name: "Order ID", value: record.orderNumber, inline: true },
          { name: "Customer", value: `${record.customerName}\n${record.phone}`, inline: true },
          { name: "Items", value: items.map(item => `• ${item.product.name} × ${item.quantity}`).join("\n") },
          { name: "Delivery", value: `${record.address}\n${record.areaCity}` },
          { name: "Payment", value: record.paymentMethod, inline: true },
          { name: "Subtotal", value: rs(record.subtotal), inline: true },
          { name: "Delivery", value: record.deliveryFee ? rs(record.deliveryFee) : "Free", inline: true },
          { name: "TOTAL", value: rs(record.total), inline: true },
          { name: "Status", value: "🔴 NEW", inline: true },
        ], timestamp: new Date().toISOString() }],
      };
      let notificationStatus: "SENT" | "FAILED" = "SENT";
      let notificationError: string | undefined;
      try { await postDiscord(discordPayload); } catch (error) { notificationStatus = "FAILED"; notificationError = error instanceof Error ? error.message : "Unknown notification failure"; }
      await updateOrderNotification(record.orderNumber, notificationStatus, notificationError);
      return { order: await getOrderWithItems(record.orderNumber), duplicate: false, notificationStatus };
    }),
    get: publicProcedure.input(z.object({ orderNumber: z.string().min(4), phone: z.string().min(7) })).query(({ input }) => getOrderWithItems(input.orderNumber, input.phone)),
  }),

  customOrders: router({
    create: publicProcedure.input(customInput).mutation(async ({ input }) => {
      if (input.website) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid submission." });
      ensureRateLimit(`custom:${input.phone}:${input.idempotencyKey}`);
      const existing = await getCustomByIdempotencyKey(input.idempotencyKey);
      if (existing) return { request: existing, duplicate: true, notificationStatus: existing.notificationStatus };
      const requestNumber = makeNumber("FRX-CUSTOM");
      const request = await createCustomOrder({
        requestNumber,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        companyName: input.companyName || null,
        orderType: input.orderType,
        productsRequired: input.productsRequired,
        estimatedQuantity: input.estimatedQuantity,
        preferredDeliveryDate: input.preferredDeliveryDate || null,
        deliveryArea: input.deliveryArea,
        additionalRequirements: input.additionalRequirements || null,
        status: "NEW",
        notificationStatus: "PENDING",
        notificationError: null,
        idempotencyKey: input.idempotencyKey,
      });
      let notificationStatus: "SENT" | "FAILED" = "SENT";
      let notificationError: string | undefined;
      try {
        await postDiscord({ username: "FRIXO.PK Custom Orders", embeds: [{ title: "🛠️ NEW FRIXO CUSTOM ORDER", color: 0x234E52, fields: [
          { name: "Request ID", value: request.requestNumber, inline: true },
          { name: "Customer", value: `${request.customerName}\n${request.phone}`, inline: true },
          { name: "Order Type", value: request.orderType, inline: true },
          { name: "Requested Products", value: request.productsRequired },
          { name: "Estimated Quantity", value: request.estimatedQuantity, inline: true },
          { name: "Preferred Delivery", value: request.preferredDeliveryDate || "Not specified", inline: true },
          { name: "Location", value: request.deliveryArea },
          { name: "Additional Requirements", value: request.additionalRequirements || "None provided" },
          { name: "Status", value: "🔴 NEW CUSTOM REQUEST" },
        ], timestamp: new Date().toISOString() }] });
      } catch (error) { notificationStatus = "FAILED"; notificationError = error instanceof Error ? error.message : "Unknown notification failure"; }
      await updateCustomNotification(request.requestNumber, notificationStatus, notificationError);
      return { request, duplicate: false, notificationStatus };
    }),
  }),

  contact: router({
    create: publicProcedure.input(z.object({ customerName: z.string().trim().min(2).max(160), phone: z.string().trim().max(40).optional().or(z.literal("")), email: z.string().trim().email().max(320).optional().or(z.literal("")), message: z.string().trim().min(5).max(2000), website: z.string().max(0).optional().or(z.literal("")) })).mutation(async ({ input }) => {
      if (input.website) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid submission." });
      ensureRateLimit(`contact:${input.email || input.phone || "anonymous"}`);
      await saveContactMessage({ customerName: input.customerName, phone: input.phone || null, email: input.email || null, message: input.message, status: "NEW" });
      return { success: true } as const;
    }),
  }),

  admin: router({
    orders: adminProcedure.input(z.object({ status: z.string().optional(), search: z.string().optional() }).optional()).query(({ input }) => listOrders(input)),
    customOrders: adminProcedure.query(() => listCustomOrders()),
    products: adminProcedure.query(() => getProducts()),
    servers: adminProcedure.query(() => listHostingServers()),
    renewals: adminProcedure.query(() => listHostingRenewals()),
    updateServerStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"]), playersOnline: z.number().int().min(0).default(0) })).mutation(({ input }) => updateHostingServerStatus(input.id, input.status, input.playersOnline)),
    createRenewal: adminProcedure.input(z.object({ serverId: z.number().int().positive(), serverName: z.string().min(2), customerName: z.string().min(2), productName: z.string().min(2), amount: z.number().int().nonnegative(), durationMonths: z.number().int().min(1).max(36), dueAt: z.coerce.date() })).mutation(({ input }) => createHostingRenewal({ ...input, renewalNumber: makeNumber("MCR"), status: "PENDING" })),
    gallery: adminProcedure.query(() => getGalleryImages()),
    uploadGalleryImage: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(180), altText: z.string().trim().min(2).max(240), dataUrl: z.string().max(12_000_000) })).mutation(async ({ input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PNG, JPG, or WebP image." });
      const [, contentType, encoded] = match;
      const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
      const uploaded = await storagePut(`gallery/${Date.now()}-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`, Buffer.from(encoded, "base64"), contentType);
      return createGalleryImage({ title: input.title, altText: input.altText, imageUrl: uploaded.url, sortOrder: Date.now(), active: true });
    }),
    updateProductAvailability: adminProcedure.input(z.object({ id: z.number().int().positive(), available: z.boolean() })).mutation(({ input }) => updateProductAvailability(input.id, input.available)),
    updateOrderStatus: adminProcedure.input(z.object({ orderNumber: z.string(), status: z.enum(statusValues) })).mutation(({ input }) => updateOrderStatus(input.orderNumber, input.status)),
    updateCustomStatus: adminProcedure.input(z.object({ requestNumber: z.string(), status: z.enum(customStatusValues) })).mutation(({ input }) => updateCustomOrderStatus(input.requestNumber, input.status)),
    retryOrderNotification: adminProcedure.input(z.object({ orderNumber: z.string() })).mutation(async ({ input }) => {
      const order = await getOrderWithItems(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      try {
        await postDiscord({ username: "FRIXO.PK Orders", embeds: [{ title: "🔁 FRIXO ORDER NOTIFICATION RETRY", color: 0xE85D04, fields: [{ name: "Order ID", value: order.orderNumber }, { name: "Customer", value: `${order.customerName}\n${order.phone}` }, { name: "Total", value: rs(order.total) }, { name: "Status", value: order.status }] }] });
        await updateOrderNotification(order.orderNumber, "SENT");
        return { success: true } as const;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown notification failure";
        await updateOrderNotification(order.orderNumber, "FAILED", message);
        throw new TRPCError({ code: "BAD_GATEWAY", message });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
