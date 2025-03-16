// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import MongoStore from "connect-mongodb-session";

// server/db.ts
import { MongoClient } from "mongodb";
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be set");
}
console.log("Initializing MongoDB client...");
var clientPromise;
var client = new MongoClient(process.env.MONGO_URI, {
  // Connection options for better reliability
  connectTimeoutMS: 1e4,
  socketTimeoutMS: 45e3,
  serverSelectionTimeoutMS: 5e3
});
var connectToDatabase = async () => {
  if (!clientPromise) {
    clientPromise = client.connect().then((client2) => {
      console.log("Successfully connected to MongoDB");
      return client2;
    }).catch((error) => {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    });
  }
  return clientPromise;
};
var getDb = async () => {
  const client2 = await connectToDatabase();
  return client2.db("relationshipapp");
};
process.on("SIGINT", async () => {
  if (clientPromise) {
    const client2 = await clientPromise;
    await client2.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

// server/storage.ts
var Store = MongoStore(session);
var MongoStorage = class {
  sessionStore;
  constructor() {
    console.log("Initializing MongoDB storage...");
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }
    this.sessionStore = new Store({
      uri: process.env.MONGO_URI,
      collection: "sessions",
      connectionOptions: {
        serverSelectionTimeoutMS: 5e3,
        socketTimeoutMS: 45e3
      }
    });
    this.initialize();
  }
  async initialize() {
    try {
      const db = await getDb();
      console.log("MongoDB storage connected successfully");
      await db.collection("users").createIndex({ username: 1 }, { unique: true });
      await db.collection("tasks").createIndex({ creatorId: 1 });
      await db.collection("bucketList").createIndex({ userId: 1 });
      await db.collection("coupons").createIndex({ creatorId: 1 });
      await db.collection("hotReasons").createIndex({ authorId: 1 });
      console.log("MongoDB indexes created successfully");
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      throw error;
    }
  }
  // Helper method to get database instance
  async getDb() {
    return await getDb();
  }
  async getUser(id) {
    const db = await this.getDb();
    const user = await db.collection("users").findOne({ id });
    return user || void 0;
  }
  async getUserByUsername(username) {
    const db = await this.getDb();
    const user = await db.collection("users").findOne({ username });
    return user || void 0;
  }
  async createUser(insertUser) {
    const db = await this.getDb();
    const lastUser = await db.collection("users").findOne({}, { sort: { id: -1 } });
    const id = (lastUser?.id || 0) + 1;
    const user = { ...insertUser, id, partnerUsername: null };
    await db.collection("users").insertOne(user);
    return user;
  }
  async getTasks(userId) {
    const db = await this.getDb();
    return await db.collection("tasks").find({ creatorId: userId }).toArray();
  }
  async createTask(task) {
    const db = await this.getDb();
    const lastTask = await db.collection("tasks").findOne({}, { sort: { id: -1 } });
    const id = (lastTask?.id || 0) + 1;
    const newTask = {
      ...task,
      id,
      completed: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.collection("tasks").insertOne(newTask);
    return newTask;
  }
  async completeTask(taskId, userId) {
    const db = await this.getDb();
    const task = await db.collection("tasks").findOneAndUpdate(
      { id: taskId, creatorId: userId },
      { $set: { completed: true } },
      { returnDocument: "after" }
    );
    if (!task.value) throw new Error("Task not found");
    return task.value;
  }
  async deleteTask(taskId, userId) {
    const db = await this.getDb();
    const result = await db.collection("tasks").deleteOne({ id: taskId, creatorId: userId });
    if (result.deletedCount === 0) throw new Error("Task not found or unauthorized");
  }
  async getBucketList(userId) {
    const db = await this.getDb();
    return await db.collection("bucketList").find({ userId }).toArray();
  }
  async createBucketItem(item) {
    const db = await this.getDb();
    const lastItem = await db.collection("bucketList").findOne({}, { sort: { id: -1 } });
    const id = (lastItem?.id || 0) + 1;
    const newItem = {
      ...item,
      id,
      completed: false
    };
    await db.collection("bucketList").insertOne(newItem);
    return newItem;
  }
  async deleteBucketItem(itemId, userId) {
    const db = await this.getDb();
    const result = await db.collection("bucketList").deleteOne({ id: itemId, userId });
    if (result.deletedCount === 0) throw new Error("Item not found or unauthorized");
  }
  async getCoupons(userId) {
    const db = await this.getDb();
    return await db.collection("coupons").find({
      creatorId: userId,
      isInInventory: false
    }).toArray();
  }
  async getCouponInventory(userId) {
    const db = await this.getDb();
    return await db.collection("coupons").find({
      receiverId: userId,
      isInInventory: true
    }).toArray();
  }
  async createCoupon(coupon) {
    const db = await this.getDb();
    const lastCoupon = await db.collection("coupons").findOne({}, { sort: { id: -1 } });
    const id = (lastCoupon?.id || 0) + 1;
    const newCoupon = {
      ...coupon,
      id,
      receiverId: null,
      isInInventory: false,
      redeemed: false
    };
    await db.collection("coupons").insertOne(newCoupon);
    return newCoupon;
  }
  async sendCoupon(couponId, senderId, receiverId) {
    const db = await this.getDb();
    const result = await db.collection("coupons").findOneAndUpdate(
      { id: couponId, creatorId: senderId },
      { $set: { receiverId, isInInventory: true } },
      { returnDocument: "after" }
    );
    if (!result.value) throw new Error("Coupon not found or unauthorized");
    return result.value;
  }
  async deleteCoupon(couponId, userId) {
    const db = await this.getDb();
    const result = await db.collection("coupons").deleteOne({
      id: couponId,
      $or: [{ creatorId: userId }, { receiverId: userId }]
    });
    if (result.deletedCount === 0) throw new Error("Coupon not found or unauthorized");
  }
  async getHotReasons(userId) {
    const db = await this.getDb();
    return await db.collection("hotReasons").find({ authorId: userId }).toArray();
  }
  async createHotReason(reason) {
    const db = await this.getDb();
    const lastReason = await db.collection("hotReasons").findOne({}, { sort: { id: -1 } });
    const id = (lastReason?.id || 0) + 1;
    const newReason = {
      ...reason,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.collection("hotReasons").insertOne(newReason);
    return newReason;
  }
  async updateUserPoints(userId, newPoints) {
    const db = await this.getDb();
    const result = await db.collection("users").findOneAndUpdate(
      { id: userId },
      { $set: { points: newPoints } },
      { returnDocument: "after" }
    );
    if (!result.value) throw new Error("User not found");
    return result.value;
  }
};
var storage;
try {
  storage = new MongoStorage();
  console.log("Storage initialized successfully");
} catch (error) {
  console.error("Failed to initialize storage:", error);
  throw error;
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  partnerUsername: text("partner_username")
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creatorId: integer("creator_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var bucketList = pgTable("bucket_list", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  userId: integer("user_id").notNull()
});
var coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creatorId: integer("creator_id").notNull(),
  receiverId: integer("receiver_id"),
  isInInventory: boolean("is_in_inventory").default(false).notNull(),
  redeemed: boolean("redeemed").default(false).notNull()
});
var hotReasons = pgTable("hot_reasons", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  title: true
});
var insertBucketItemSchema = createInsertSchema(bucketList).pick({
  title: true
});
var insertCouponSchema = createInsertSchema(coupons).pick({
  title: true
});
var insertHotReasonSchema = createInsertSchema(hotReasons).pick({
  reason: true
});

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks2 = await storage.getTasks(req.user.id);
    res.json(tasks2);
  });
  app2.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask({ ...taskData, creatorId: req.user.id });
    res.json(task);
  });
  app2.patch("/api/tasks/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = await storage.completeTask(parseInt(req.params.id), req.user.id);
    res.json(task);
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTask(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });
  app2.get("/api/bucket-list", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getBucketList(req.user.id);
    res.json(items);
  });
  app2.post("/api/bucket-list", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const itemData = insertBucketItemSchema.parse(req.body);
    const item = await storage.createBucketItem({ ...itemData, userId: req.user.id });
    res.json(item);
  });
  app2.delete("/api/bucket-list/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteBucketItem(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });
  app2.get("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupons2 = await storage.getCoupons(req.user.id);
    res.json(coupons2);
  });
  app2.get("/api/coupons/inventory", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupons2 = await storage.getCouponInventory(req.user.id);
    res.json(coupons2);
  });
  app2.post("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const couponData = insertCouponSchema.parse(req.body);
    const coupon = await storage.createCoupon({ ...couponData, creatorId: req.user.id });
    res.json(coupon);
  });
  app2.post("/api/coupons/:id/send", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const coupon = await storage.sendCoupon(parseInt(req.params.id), req.user.id, req.body.receiverId);
    res.json(coupon);
  });
  app2.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCoupon(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });
  app2.get("/api/hot-reasons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const reasons = await storage.getHotReasons(req.user.id);
    res.json(reasons);
  });
  app2.post("/api/hot-reasons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const reasonData = insertHotReasonSchema.parse(req.body);
    const reason = await storage.createHotReason({ ...reasonData, authorId: req.user.id });
    res.json(reason);
  });
  app2.get("/api/partner", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const partner = await storage.getUserByUsername(req.user.partnerUsername || "");
    res.json(partner || null);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
