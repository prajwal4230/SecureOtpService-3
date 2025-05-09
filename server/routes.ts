import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertTransactionSchema, insertOtpSchema } from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get user wallet balance
  app.get("/api/wallet-balance", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ balance: user.walletBalance });
  });

  // Get user transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    const transactions = await storage.getUserTransactions(req.user!.id);
    res.json(transactions);
  });

  // Add balance (verify payment)
  app.post("/api/add-balance", requireAuth, async (req, res) => {
    const schema = z.object({
      utrNumber: z.string().min(10).max(30),
      amount: z.number().min(50)
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
    }
    
    const { utrNumber, amount } = result.data;
    
    // Add the amount to the user's wallet
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const newBalance = user.walletBalance + amount;
    await storage.updateUserBalance(user.id, newBalance);
    
    // Create a transaction record
    const transaction = await storage.createTransaction({
      userId: user.id,
      type: "deposit",
      amount: amount,
      description: "Wallet Deposit",
      utrNumber: utrNumber,
      appName: null,
    });
    
    res.json({ success: true, newBalance, transaction });
  });

  // Request OTP
  app.post("/api/request-otp", requireAuth, async (req, res) => {
    const schema = z.object({
      appName: z.string().min(1),
      price: z.number().min(0.1)
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
    }
    
    const { appName, price } = result.data;
    
    // Check if user has enough balance
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.walletBalance < price) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    // Deduct from user's wallet
    const newBalance = user.walletBalance - price;
    await storage.updateUserBalance(user.id, newBalance);
    
    // Create a transaction record
    await storage.createTransaction({
      userId: user.id,
      type: "otp",
      amount: -price,
      description: `OTP for ${appName}`,
      appName: appName,
      utrNumber: null,
    });
    
    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create an OTP record
    const otp = await storage.createOtp({
      userId: user.id,
      appName: appName,
      code: otpCode,
    });
    
    res.json({ success: true, newBalance });
  });

  // Get active OTP
  app.get("/api/active-otp/:appName", requireAuth, async (req, res) => {
    const appName = req.params.appName;
    const otp = await storage.getActiveOtpByUserAndApp(req.user!.id, appName);
    
    if (!otp) {
      return res.status(404).json({ message: "No active OTP found" });
    }
    
    res.json({ code: otp.code, timestamp: otp.timestamp });
  });

  const httpServer = createServer(app);
  return httpServer;
}
