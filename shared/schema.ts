import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  walletBalance: doublePrecision("wallet_balance").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const balanceRequests = pgTable("balance_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  utrNumber: text("utr_number").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
});

export const insertBalanceRequestSchema = createInsertSchema(balanceRequests).pick({
  userId: true,
  amount: true,
  utrNumber: true,
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default('open'), // 'open', 'closed'
  response: text("response"),
  respondedBy: integer("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  subject: true,
  message: true,
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
  balanceRequestId: integer("balance_request_id").references(() => balanceRequests.id),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  description: true,
  appName: true,
  utrNumber: true,
  balanceRequestId: true,
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
export type BalanceRequest = typeof balanceRequests.$inferSelect;
export type InsertBalanceRequest = z.infer<typeof insertBalanceRequestSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
