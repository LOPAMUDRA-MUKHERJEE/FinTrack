import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { csvUploadSchema, insertTransactionSchema, insertBudgetSchema } from "@shared/schema";
import { z, ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Transactions endpoints
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      // In a real app, userId would come from auth session
      const userId = 1;
      const transactions = await storage.getTransactionsByUser(userId);
      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:month", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const { month } = req.params;
      const transactions = await storage.getTransactionsByUserAndMonth(userId, month);
      return res.json(transactions);
    } catch (error) {
      console.error("Error fetching monthly transactions:", error);
      return res.status(500).json({ message: "Failed to fetch monthly transactions" });
    }
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const transactionData = { ...req.body, userId };
      const validatedData = insertTransactionSchema.parse(transactionData);
      const transaction = await storage.createTransaction(validatedData);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error creating transaction:", error);
      return res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // CSV Upload endpoint
  app.post("/api/upload/csv", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const csvData = req.body;

      // Validate CSV structure
      const validatedCsvData = csvUploadSchema.parse(csvData);

      // Process CSV data into transactions
      const transactions = validatedCsvData.map(row => {
        // Parse date
        const date = new Date(row.date);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${row.date}`);
        }

        // Parse amount
        const amountString = row.amount.replace(/[^0-9.-]/g, '');
        const amount = parseFloat(amountString);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount format: ${row.amount}`);
        }

        // Determine category (simple heuristic)
        const lowercaseDesc = row.description.toLowerCase();
        let category = row.category?.toLowerCase() || 'other';

        // Default category mapping if not provided
        if (!row.category) {
          if (lowercaseDesc.includes('rent') || lowercaseDesc.includes('mortgage')) {
            category = 'housing';
          } else if (lowercaseDesc.includes('grocery') || lowercaseDesc.includes('restaurant')) {
            category = 'food';
          } else if (lowercaseDesc.includes('gas') || lowercaseDesc.includes('uber') || lowercaseDesc.includes('lyft')) {
            category = 'transportation';
          } else if (lowercaseDesc.includes('electric') || lowercaseDesc.includes('water') || lowercaseDesc.includes('internet')) {
            category = 'utilities';
          } else if (lowercaseDesc.includes('amazon') || lowercaseDesc.includes('walmart') || lowercaseDesc.includes('target')) {
            category = 'shopping';
          }
        }

        return {
          userId,
          date,
          description: row.description,
          amount,
          category,
          merchant: row.merchant || '',
          notes: row.notes || '',
        };
      });

      // Save transactions
      const createdTransactions = await storage.createTransactions(transactions);
      return res.status(201).json({
        message: `Successfully imported ${createdTransactions.length} transactions`,
        transactions: createdTransactions
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid CSV data format", errors: error.errors });
      }
      console.error("Error processing CSV upload:", error);
      return res.status(500).json({ message: "Failed to process CSV upload" });
    }
  });

  // Budget endpoints
  app.get("/api/budget/:month", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const { month } = req.params;
      const budget = await storage.getBudgetByUserAndMonth(userId, month);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found for the specified month" });
      }
      
      return res.json(budget);
    } catch (error) {
      console.error("Error fetching budget:", error);
      return res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/budget", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const budgetData = { ...req.body, userId };
      const validatedData = insertBudgetSchema.parse(budgetData);
      
      // Check if budget already exists for this month
      const existingBudget = await storage.getBudgetByUserAndMonth(userId, validatedData.monthYear);
      
      if (existingBudget) {
        // Update existing budget
        const updatedBudget = await storage.updateBudget(existingBudget.id, validatedData);
        return res.json(updatedBudget);
      } else {
        // Create new budget
        const budget = await storage.createBudget(validatedData);
        return res.status(201).json(budget);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      console.error("Error creating/updating budget:", error);
      return res.status(500).json({ message: "Failed to save budget" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/summary/:month", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const { month } = req.params;
      const summary = await storage.getMonthlySummary(userId, month);
      return res.json(summary);
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
      return res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
  });

  app.get("/api/analytics/breakdown/:month", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const { month } = req.params;
      const breakdown = await storage.getCategoryBreakdown(userId, month);
      return res.json(breakdown);
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      return res.status(500).json({ message: "Failed to fetch category breakdown" });
    }
  });

  app.get("/api/analytics/comparison/:months", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const months = parseInt(req.params.months, 10) || 6;
      const comparison = await storage.getMonthlyComparison(userId, months);
      return res.json(comparison);
    } catch (error) {
      console.error("Error fetching monthly comparison:", error);
      return res.status(500).json({ message: "Failed to fetch monthly comparison" });
    }
  });

  app.post("/api/budget/recommendation", async (req: Request, res: Response) => {
    try {
      const { income } = req.body;
      
      if (!income || typeof income !== 'number' || income <= 0) {
        return res.status(400).json({ message: "Valid income amount is required" });
      }
      
      const recommendations = await storage.generateBudgetRecommendation(income);
      return res.json(recommendations);
    } catch (error) {
      console.error("Error generating budget recommendations:", error);
      return res.status(500).json({ message: "Failed to generate budget recommendations" });
    }
  });
  
  // User preferences endpoints
  app.get("/api/user/settings", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        currency: user.currency || "USD",
        enableBudgetWarnings: user.enableBudgetWarnings === 1,
        paymentIntegrations: user.paymentIntegrations || []
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  
  app.post("/api/user/settings", async (req: Request, res: Response) => {
    try {
      const userId = 1; // From auth
      const { currency, enableBudgetWarnings, paymentIntegrations } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        currency: currency || user.currency,
        enableBudgetWarnings: enableBudgetWarnings !== undefined ? 
          (enableBudgetWarnings ? 1 : 0) : user.enableBudgetWarnings,
        paymentIntegrations: paymentIntegrations || user.paymentIntegrations
      });
      
      return res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        currency: updatedUser.currency || "USD",
        enableBudgetWarnings: updatedUser.enableBudgetWarnings === 1,
        paymentIntegrations: updatedUser.paymentIntegrations || []
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      return res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
