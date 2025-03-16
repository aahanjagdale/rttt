import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTaskSchema, insertBucketItemSchema, insertCouponSchema, insertHotReasonSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasks(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask({...taskData, creatorId: req.user.id});
    res.json(task);
  });

  app.patch("/api/tasks/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = await storage.completeTask(parseInt(req.params.id), req.user.id);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTask(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });

  // Bucket List
  app.get("/api/bucket-list", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getBucketList(req.user.id);
    res.json(items);
  });

  app.post("/api/bucket-list", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const itemData = insertBucketItemSchema.parse(req.body);
    const item = await storage.createBucketItem({...itemData, userId: req.user.id});
    res.json(item);
  });

  app.delete("/api/bucket-list/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteBucketItem(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });

  // Coupons
  app.get("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupons = await storage.getCoupons(req.user.id);
    res.json(coupons);
  });

  app.get("/api/coupons/inventory", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupons = await storage.getCouponInventory(req.user.id);
    res.json(coupons);
  });

  app.post("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const couponData = insertCouponSchema.parse(req.body);
    const coupon = await storage.createCoupon({...couponData, creatorId: req.user.id});
    res.json(coupon);
  });

  app.post("/api/coupons/:id/send", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupon = await storage.sendCoupon(parseInt(req.params.id), req.user.id, req.body.receiverId);
    res.json(coupon);
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCoupon(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });

  // Hot Reasons
  app.get("/api/hot-reasons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const reasons = await storage.getHotReasons(req.user.id);
    res.json(reasons);
  });

  app.post("/api/hot-reasons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const reasonData = insertHotReasonSchema.parse(req.body);
    const reason = await storage.createHotReason({...reasonData, authorId: req.user.id});
    res.json(reason);
  });

  // Add endpoint to get partner info
  app.get("/api/partner", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const partner = await storage.getUserByUsername(req.user.partnerUsername || "");
    res.json(partner || null);
  });

  const httpServer = createServer(app);
  return httpServer;
}