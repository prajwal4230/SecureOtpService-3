import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertOtpSchema, 
  insertBalanceRequestSchema,
  insertSupportTicketSchema 
} from "@shared/schema";

function requireAuth(req: Request, res: Response, next: NextFunction) {
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

  // Create a balance request
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
    
    // Create a balance request
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const balanceRequest = await storage.createBalanceRequest({
      userId: user.id,
      amount: amount,
      utrNumber: utrNumber
    });
    
    res.json({ 
      success: true, 
      message: "Balance addition request created successfully. It will be processed by an administrator.",
      request: balanceRequest 
    });
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

  // Check if user is admin
  app.get("/api/user/is-admin", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ isAdmin: user.isAdmin });
  });

  // Admin: Middleware to check if user is admin
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    storage.getUser(req.user!.id).then(user => {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      next();
    }).catch(err => {
      console.error("Error in requireAdmin middleware:", err);
      res.status(500).json({ message: "Internal server error" });
    });
  }

  // Admin: Get all balance requests
  app.get("/api/admin/balance-requests", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllBalanceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching balance requests:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch balance requests: ${errorMessage}` });
    }
  });

  // Admin: Get pending balance requests
  app.get("/api/admin/balance-requests/pending", requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getPendingBalanceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching pending balance requests:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch pending balance requests: ${errorMessage}` });
    }
  });

  // Setup a user as admin (special endpoint, remove or protect in production)
  app.post("/api/setup-admin", async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().email(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }
      
      const { username } = result.data;
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Set user as admin
      const updatedUser = await storage.setUserAsAdmin(user.id, true);
      
      res.json({ 
        success: true, 
        message: `User ${username} is now an admin`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error) {
      console.error("Error setting up admin:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to set up admin: ${errorMessage}` });
    }
  });

  // Admin: Approve balance request
  app.post("/api/admin/balance-requests/:id/approve", requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.approveBalanceRequest(requestId, req.user!.id);
      res.json({ success: true, request });
    } catch (error) {
      console.error("Error approving balance request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to approve balance request: ${errorMessage}` });
    }
  });

  // Admin: Reject balance request
  app.post("/api/admin/balance-requests/:id/reject", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        reason: z.string().min(1)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }
      
      const { reason } = result.data;
      const requestId = parseInt(req.params.id);
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.rejectBalanceRequest(requestId, req.user!.id, reason);
      res.json({ success: true, request });
    } catch (error) {
      console.error("Error rejecting balance request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to reject balance request: ${errorMessage}` });
    }
  });

  // User: Get my balance requests
  app.get("/api/balance-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getBalanceRequestsByUser(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching user balance requests:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch user balance requests: ${errorMessage}` });
    }
  });
  
  // Support Tickets Routes
  app.get("/api/support-tickets", requireAuth, requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch support tickets: ${errorMessage}` });
    }
  });
  
  app.get("/api/support-tickets/open", requireAuth, requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getOpenSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching open support tickets:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch open support tickets: ${errorMessage}` });
    }
  });
  
  app.get("/api/user/support-tickets", requireAuth, async (req, res) => {
    try {
      const tickets = await storage.getSupportTicketsByUser(req.user!.id);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user support tickets:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to fetch user support tickets: ${errorMessage}` });
    }
  });
  
  app.post("/api/support-tickets", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        subject: z.string().min(5).max(100),
        message: z.string().min(10)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }
      
      const { subject, message } = result.data;
      
      const ticket = await storage.createSupportTicket({
        userId: req.user!.id,
        subject,
        message,
      });
      
      res.status(201).json({ success: true, ticket });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to create support ticket: ${errorMessage}` });
    }
  });
  
  app.post("/api/support-tickets/:id/respond", requireAuth, requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        response: z.string().min(5)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }
      
      const { response } = result.data;
      const ticketId = parseInt(req.params.id);
      
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const ticket = await storage.respondToSupportTicket(ticketId, req.user!.id, response);
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error responding to support ticket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to respond to support ticket: ${errorMessage}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
