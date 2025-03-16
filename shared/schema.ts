import { z } from "zod";

// Define schemas for data validation
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  partnerUsername: z.string().nullable(),
});

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  creatorId: z.number(),
  completed: z.boolean(),
  createdAt: z.string(),
});

export const bucketItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  userId: z.number(),
});

export const couponSchema = z.object({
  id: z.number(),
  title: z.string(),
  creatorId: z.number(),
  receiverId: z.number().nullable(),
  isInInventory: z.boolean(),
  redeemed: z.boolean(),
});

export const hotReasonSchema = z.object({
  id: z.number(),
  reason: z.string(),
  authorId: z.number(),
  createdAt: z.string(),
});

// Create insert schemas by omitting auto-generated fields
export const insertUserSchema = userSchema.omit({ id: true, partnerUsername: true });
export const insertTaskSchema = taskSchema.omit({ id: true, completed: true, creatorId: true, createdAt: true });
export const insertBucketItemSchema = bucketItemSchema.omit({ id: true, completed: true, userId: true });
export const insertCouponSchema = couponSchema.omit({ id: true, creatorId: true, receiverId: true, isInInventory: true, redeemed: true });
export const insertHotReasonSchema = hotReasonSchema.omit({ id: true, authorId: true, createdAt: true });

// Export types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = z.infer<typeof taskSchema>;
export type BucketItem = z.infer<typeof bucketItemSchema>;
export type Coupon = z.infer<typeof couponSchema>;
export type HotReason = z.infer<typeof hotReasonSchema>;