import { pgTable, text, serial, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currency: text("currency").default("USD"),
  enableBudgetWarnings: integer("enable_budget_warnings").default(1),
  paymentIntegrations: text("payment_integrations").array(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  currency: true,
  enableBudgetWarnings: true,
  paymentIntegrations: true,
});

export const categoryEnum = pgEnum("category", [
  "housing",
  "food",
  "transportation",
  "utilities",
  "entertainment",
  "shopping",
  "healthcare",
  "education",
  "personal",
  "travel",
  "income",
  "other"
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum("category").notNull(),
  merchant: text("merchant"),
  notes: text("notes"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  monthYear: text("month_year").notNull(), // Format: "YYYY-MM"
  totalBudget: numeric("total_budget", { precision: 10, scale: 2 }).notNull(),
  housingBudget: numeric("housing_budget", { precision: 10, scale: 2 }),
  foodBudget: numeric("food_budget", { precision: 10, scale: 2 }),
  transportationBudget: numeric("transportation_budget", { precision: 10, scale: 2 }),
  utilitiesBudget: numeric("utilities_budget", { precision: 10, scale: 2 }),
  entertainmentBudget: numeric("entertainment_budget", { precision: 10, scale: 2 }),
  shoppingBudget: numeric("shopping_budget", { precision: 10, scale: 2 }),
  healthcareBudget: numeric("healthcare_budget", { precision: 10, scale: 2 }),
  educationBudget: numeric("education_budget", { precision: 10, scale: 2 }),
  personalBudget: numeric("personal_budget", { precision: 10, scale: 2 }),
  travelBudget: numeric("travel_budget", { precision: 10, scale: 2 }),
  otherBudget: numeric("other_budget", { precision: 10, scale: 2 }),
  savingsGoal: numeric("savings_goal", { precision: 10, scale: 2 }),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });

// CSV upload schema for validating structure
export const csvTransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.string(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

export const csvUploadSchema = z.array(csvTransactionSchema);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type CSVTransaction = z.infer<typeof csvTransactionSchema>;
export type CSVUpload = z.infer<typeof csvUploadSchema>;

// Special response types
export type MonthlySummary = {
  month: string;
  totalSpent: number;
  comparedToPrevious: number;
  categories: {
    [key: string]: number;
  };
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

export type BudgetRecommendation = {
  category: string;
  percentage: number;
  amount: number;
  icon: string;
};
