import { 
  users, type User, type InsertUser, 
  transactions, type Transaction, type InsertTransaction, 
  otps, type OTP, type InsertOTP,
  balanceRequests, type BalanceRequest, type InsertBalanceRequest,
  supportTickets, type SupportTicket, type InsertSupportTicket
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { desc, eq, and, not, ne, sql } from "drizzle-orm";
import { Store } from "express-session";

// Create a PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User>;
  getAllAdmins(): Promise<User[]>;
  setUserAsAdmin(userId: number, isAdmin: boolean): Promise<User>;
  
  // Balance request operations
  createBalanceRequest(request: InsertBalanceRequest): Promise<BalanceRequest>;
  getAllBalanceRequests(): Promise<BalanceRequest[]>;
  getPendingBalanceRequests(): Promise<BalanceRequest[]>;
  getBalanceRequestsByUser(userId: number): Promise<BalanceRequest[]>;
  approveBalanceRequest(requestId: number, adminId: number): Promise<BalanceRequest>;
  rejectBalanceRequest(requestId: number, adminId: number, reason: string): Promise<BalanceRequest>;
  
  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  getOpenSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  respondToSupportTicket(ticketId: number, adminId: number, response: string): Promise<SupportTicket>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // OTP operations
  createOtp(otp: InsertOTP): Promise<OTP>;
  getOtpsByUser(userId: number): Promise<OTP[]>;
  getActiveOtpByUserAndApp(userId: number, appName: string): Promise<OTP | undefined>;
  
  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const result = await db
      .update(users)
      .set({ walletBalance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    
    return result[0];
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createOtp(insertOtp: InsertOTP): Promise<OTP> {
    const result = await db
      .insert(otps)
      .values(insertOtp)
      .returning();
    
    return result[0];
  }

  async getOtpsByUser(userId: number): Promise<OTP[]> {
    return await db
      .select()
      .from(otps)
      .where(eq(otps.userId, userId))
      .orderBy(desc(otps.timestamp));
  }

  async getActiveOtpByUserAndApp(userId: number, appName: string): Promise<OTP | undefined> {
    const result = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.userId, userId),
          eq(otps.appName, appName),
          eq(otps.isUsed, false)
        )
      )
      .orderBy(desc(otps.timestamp))
      .limit(1);
    
    return result[0];
  }

  // Admin methods
  async getAllAdmins(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true));
  }

  async setUserAsAdmin(userId: number, isAdmin: boolean): Promise<User> {
    const result = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  // Balance request methods
  async createBalanceRequest(request: InsertBalanceRequest): Promise<BalanceRequest> {
    const result = await db
      .insert(balanceRequests)
      .values(request)
      .returning();
    
    return result[0];
  }

  async getAllBalanceRequests(): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .orderBy(desc(balanceRequests.timestamp));
  }

  async getPendingBalanceRequests(): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.status, 'pending'))
      .orderBy(desc(balanceRequests.timestamp));
  }

  async getBalanceRequestsByUser(userId: number): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.userId, userId))
      .orderBy(desc(balanceRequests.timestamp));
  }

  async approveBalanceRequest(requestId: number, adminId: number): Promise<BalanceRequest> {
    // First get the request to check its status
    const requestsResult = await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.id, requestId));
    
    if (!requestsResult[0]) {
      throw new Error(`Balance request with ID ${requestId} not found`);
    }
    
    const request = requestsResult[0];
    
    if (request.status !== 'pending') {
      throw new Error(`Balance request with ID ${requestId} is already ${request.status}`);
    }
    
    // Update the request status to approved
    const now = new Date();
    const result = await db
      .update(balanceRequests)
      .set({ 
        status: 'approved',
        approvedBy: adminId,
        approvedAt: now
      })
      .where(eq(balanceRequests.id, requestId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`Failed to approve balance request with ID ${requestId}`);
    }
    
    // Get the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, request.userId));
    
    if (!userResult[0]) {
      throw new Error(`User with ID ${request.userId} not found`);
    }
    
    const user = userResult[0];
    
    // Add the amount to the user's wallet
    const newBalance = user.walletBalance + request.amount;
    await this.updateUserBalance(user.id, newBalance);
    
    // Create a transaction record
    await this.createTransaction({
      userId: user.id,
      type: 'deposit',
      amount: request.amount,
      description: 'Wallet Deposit (Approved)',
      utrNumber: request.utrNumber,
      appName: null,
      balanceRequestId: requestId
    });
    
    return result[0];
  }

  async rejectBalanceRequest(requestId: number, adminId: number, reason: string): Promise<BalanceRequest> {
    // First get the request to check its status
    const requestsResult = await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.id, requestId));
    
    if (!requestsResult[0]) {
      throw new Error(`Balance request with ID ${requestId} not found`);
    }
    
    const request = requestsResult[0];
    
    if (request.status !== 'pending') {
      throw new Error(`Balance request with ID ${requestId} is already ${request.status}`);
    }
    
    // Update the request status to rejected
    const now = new Date();
    const result = await db
      .update(balanceRequests)
      .set({ 
        status: 'rejected',
        approvedBy: adminId,
        approvedAt: now,
        rejectionReason: reason
      })
      .where(eq(balanceRequests.id, requestId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`Failed to reject balance request with ID ${requestId}`);
    }
    
    return result[0];
  }

  // Support ticket methods
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const result = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    
    return result[0];
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.timestamp));
  }

  async getOpenSupportTickets(): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.status, 'open'))
      .orderBy(desc(supportTickets.timestamp));
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.timestamp));
  }

  async respondToSupportTicket(ticketId: number, adminId: number, response: string): Promise<SupportTicket> {
    // First get the ticket to check its status
    const ticketsResult = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId));
    
    if (!ticketsResult[0]) {
      throw new Error(`Support ticket with ID ${ticketId} not found`);
    }
    
    const ticket = ticketsResult[0];
    
    if (ticket.status !== 'open') {
      throw new Error(`Support ticket with ID ${ticketId} is already closed`);
    }
    
    // Update the ticket with response
    const now = new Date();
    const result = await db
      .update(supportTickets)
      .set({ 
        status: 'closed',
        respondedBy: adminId,
        respondedAt: now,
        response: response
      })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`Failed to respond to support ticket with ID ${ticketId}`);
    }
    
    return result[0];
  }
}

// Export an instance of DatabaseStorage to be used throughout the app
export const storage = new DatabaseStorage();
