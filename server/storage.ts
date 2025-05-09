import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, otps, type OTP, type InsertOTP } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { desc, eq, and, not } from "drizzle-orm";

// Create a PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // OTP operations
  createOtp(otp: InsertOTP): Promise<OTP>;
  getOtpsByUser(userId: number): Promise<OTP[]>;
  getActiveOtpByUserAndApp(userId: number, appName: string): Promise<OTP | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
}

// Export an instance of DatabaseStorage to be used throughout the app
export const storage = new DatabaseStorage();
