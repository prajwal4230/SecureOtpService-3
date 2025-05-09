import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction, otps, type OTP, type InsertOTP } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private otps: Map<number, OTP>;
  
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private otpIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.otps = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.otpIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      walletBalance: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, walletBalance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createOtp(insertOtp: InsertOTP): Promise<OTP> {
    const id = this.otpIdCounter++;
    const otp: OTP = {
      ...insertOtp,
      id,
      timestamp: new Date(),
      isUsed: false,
    };
    this.otps.set(id, otp);
    return otp;
  }

  async getOtpsByUser(userId: number): Promise<OTP[]> {
    return Array.from(this.otps.values())
      .filter(otp => otp.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getActiveOtpByUserAndApp(userId: number, appName: string): Promise<OTP | undefined> {
    return Array.from(this.otps.values())
      .filter(otp => otp.userId === userId && otp.appName === appName && !otp.isUsed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
}

export const storage = new MemStorage();
