import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  walletBalance: doublePrecision("wallet_balance").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'deposit' or 'otp'
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  appName: text("app_name"), // only for OTP transactions
  utrNumber: text("utr_number"), // only for deposit transactions
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  description: true,
  appName: true,
  utrNumber: true,
});

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  appName: text("app_name").notNull(),
  code: text("code").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isUsed: boolean("is_used").notNull().default(false),
});

export const insertOtpSchema = createInsertSchema(otps).pick({
  userId: true,
  appName: true,
  code: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type OTP = typeof otps.$inferSelect;
export type InsertOTP = z.infer<typeof insertOtpSchema>;
