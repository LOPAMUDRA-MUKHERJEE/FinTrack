import {
    User,
    InsertUser,
    Transaction,
    InsertTransaction,
    Budget,
    InsertBudget,
    MonthlySummary,
    CategoryBreakdown,
    BudgetRecommendation
  } from "@shared/schema";
  
  // modify the interface with any CRUD methods
  // you might need
  export interface IStorage {
    // User methods
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, userData: Partial<User>): Promise<User>;
  
    // Transaction methods
    getTransaction(id: number): Promise<Transaction | undefined>;
    getTransactionsByUser(userId: number): Promise<Transaction[]>;
    getTransactionsByUserAndMonth(userId: number, monthYear: string): Promise<Transaction[]>;
    createTransaction(transaction: InsertTransaction): Promise<Transaction>;
    createTransactions(transactions: InsertTransaction[]): Promise<Transaction[]>;
    updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
    deleteTransaction(id: number): Promise<boolean>;
  
    // Budget methods
    getBudget(id: number): Promise<Budget | undefined>;
    getBudgetByUserAndMonth(userId: number, monthYear: string): Promise<Budget | undefined>;
    createBudget(budget: InsertBudget): Promise<Budget>;
    updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined>;
    
    // Analytics methods
    getMonthlySummary(userId: number, monthYear: string): Promise<MonthlySummary>;
    getCategoryBreakdown(userId: number, monthYear: string): Promise<CategoryBreakdown[]>;
    getMonthlyComparison(userId: number, months: number): Promise<MonthlySummary[]>;
    generateBudgetRecommendation(income: number): Promise<BudgetRecommendation[]>;
  }
  
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private transactions: Map<number, Transaction>;
    private budgets: Map<number, Budget>;
    private userId: number;
    private transactionId: number;
    private budgetId: number;
  
    constructor() {
      this.users = new Map();
      this.transactions = new Map();
      this.budgets = new Map();
      this.userId = 1;
      this.transactionId = 1;
      this.budgetId = 1;
  
      // Initialize with a test user
      const testUser: User = {
        id: this.userId++,
        username: "testuser",
        password: "password", // In a real app, this would be hashed
        currency: "USD",
        enableBudgetWarnings: 1,
        paymentIntegrations: []
      };
      this.users.set(testUser.id, testUser);
  
      // Add some sample transactions
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const sampleCategories = ['housing', 'food', 'transportation', 'utilities', 'shopping'] as const;
      const sampleAmounts = [1250, 685.25, 425.40, 100, 387];
      
      sampleCategories.forEach((category, index) => {
        const transaction: Transaction = {
          id: this.transactionId++,
          userId: testUser.id,
          date: new Date(),
          description: `Sample ${category}`,
          amount: sampleAmounts[index],
          category,
          merchant: `Sample ${category} merchant`,
          notes: ""
        };
        this.transactions.set(transaction.id, transaction);
      });
  
      // Add a sample budget
      const budget: Budget = {
        id: this.budgetId++,
        userId: testUser.id,
        monthYear: currentMonth,
        totalBudget: 3500,
        housingBudget: 1200,
        foodBudget: 700,
        transportationBudget: 500,
        utilitiesBudget: 200,
        shoppingBudget: 300,
        entertainmentBudget: 200,
        healthcareBudget: 150,
        educationBudget: 100,
        personalBudget: 100,
        travelBudget: 50,
        otherBudget: 0,
        savingsGoal: 0
      };
      this.budgets.set(budget.id, budget);
    }
  
    // User methods
    async getUser(id: number): Promise<User | undefined> {
      return this.users.get(id);
    }
  
    async getUserByUsername(username: string): Promise<User | undefined> {
      return Array.from(this.users.values()).find(
        (user) => user.username === username,
      );
    }
  
    async createUser(insertUser: InsertUser): Promise<User> {
      const id = this.userId++;
      const user: User = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    }
    
    async updateUser(id: number, userData: Partial<User>): Promise<User> {
      const existingUser = this.users.get(id);
      if (!existingUser) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      const updatedUser = { ...existingUser, ...userData };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
  
    // Transaction methods
    async getTransaction(id: number): Promise<Transaction | undefined> {
      return this.transactions.get(id);
    }
  
    async getTransactionsByUser(userId: number): Promise<Transaction[]> {
      return Array.from(this.transactions.values()).filter(
        (transaction) => transaction.userId === userId
      );
    }
  
    async getTransactionsByUserAndMonth(userId: number, monthYear: string): Promise<Transaction[]> {
      return Array.from(this.transactions.values()).filter(
        (transaction) => {
          const transactionDate = new Date(transaction.date);
          const transactionMonthYear = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
          return transaction.userId === userId && transactionMonthYear === monthYear;
        }
      );
    }
  
    async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
      const id = this.transactionId++;
      const newTransaction: Transaction = { ...transaction, id };
      this.transactions.set(id, newTransaction);
      return newTransaction;
    }
  
    async createTransactions(transactions: InsertTransaction[]): Promise<Transaction[]> {
      const createdTransactions: Transaction[] = [];
      for (const transaction of transactions) {
        const createdTransaction = await this.createTransaction(transaction);
        createdTransactions.push(createdTransaction);
      }
      return createdTransactions;
    }
  
    async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined> {
      const existingTransaction = this.transactions.get(id);
      if (!existingTransaction) return undefined;
  
      const updatedTransaction = { ...existingTransaction, ...transaction };
      this.transactions.set(id, updatedTransaction);
      return updatedTransaction;
    }
  
    async deleteTransaction(id: number): Promise<boolean> {
      return this.transactions.delete(id);
    }
  
    // Budget methods
    async getBudget(id: number): Promise<Budget | undefined> {
      return this.budgets.get(id);
    }
  
    async getBudgetByUserAndMonth(userId: number, monthYear: string): Promise<Budget | undefined> {
      return Array.from(this.budgets.values()).find(
        (budget) => budget.userId === userId && budget.monthYear === monthYear
      );
    }
  
    async createBudget(budget: InsertBudget): Promise<Budget> {
      const id = this.budgetId++;
      const newBudget: Budget = { ...budget, id };
      this.budgets.set(id, newBudget);
      return newBudget;
    }
  
    async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined> {
      const existingBudget = this.budgets.get(id);
      if (!existingBudget) return undefined;
  
      const updatedBudget = { ...existingBudget, ...budget };
      this.budgets.set(id, updatedBudget);
      return updatedBudget;
    }
  
    // Analytics methods
    async getMonthlySummary(userId: number, monthYear: string): Promise<MonthlySummary> {
      const transactions = await this.getTransactionsByUserAndMonth(userId, monthYear);
      const totalSpent = transactions.reduce((acc, transaction) => 
        acc + Number(transaction.amount), 0);
  
      // Calculate category breakdown
      const categories: { [key: string]: number } = {};
      transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Number(transaction.amount);
      });
  
      // Calculate compared to previous month
      const [year, month] = monthYear.split('-').map(Number);
      let prevMonthYear: string;
      if (month === 1) {
        prevMonthYear = `${year - 1}-12`;
      } else {
        prevMonthYear = `${year}-${String(month - 1).padStart(2, '0')}`;
      }
      
      const prevMonthTransactions = await this.getTransactionsByUserAndMonth(userId, prevMonthYear);
      const prevMonthTotal = prevMonthTransactions.reduce((acc, transaction) => 
        acc + Number(transaction.amount), 0);
  
      let comparedToPrevious = 0;
      if (prevMonthTotal > 0) {
        comparedToPrevious = ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100;
      }
  
      return {
        month: monthYear,
        totalSpent,
        comparedToPrevious,
        categories
      };
    }
  
    async getCategoryBreakdown(userId: number, monthYear: string): Promise<CategoryBreakdown[]> {
      const transactions = await this.getTransactionsByUserAndMonth(userId, monthYear);
      const totalSpent = transactions.reduce((acc, transaction) => 
        acc + Number(transaction.amount), 0);
  
      // Group transactions by category
      const categorySums: { [key: string]: number } = {};
      transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categorySums[category]) {
          categorySums[category] = 0;
        }
        categorySums[category] += Number(transaction.amount);
      });
  
      // Color mapping for categories
      const categoryColors: { [key: string]: string } = {
        housing: "#0466c8",
        food: "#ff5400",
        transportation: "#38b000",
        utilities: "#9c9ca9",
        shopping: "#d00000",
        entertainment: "#ffbe0b",
        healthcare: "#4ea8de",
        education: "#8338ec",
        personal: "#fb5607",
        travel: "#3a86ff",
        other: "#adb5bd"
      };
  
      // Create breakdown with percentages
      const breakdown: CategoryBreakdown[] = Object.entries(categorySums).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        color: categoryColors[category] || "#adb5bd"
      }));
  
      // Sort by amount in descending order
      return breakdown.sort((a, b) => b.amount - a.amount);
    }
  
    async getMonthlyComparison(userId: number, months: number): Promise<MonthlySummary[]> {
      const currentDate = new Date();
      const summaries: MonthlySummary[] = [];
  
      for (let i = 0; i < months; i++) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const summary = await this.getMonthlySummary(userId, monthYear);
        summaries.push(summary);
      }
  
      return summaries;
    }
  
    async generateBudgetRecommendation(income: number): Promise<BudgetRecommendation[]> {
      // Default budget allocation percentages
      const recommendations: BudgetRecommendation[] = [
        { category: 'housing', percentage: 30, amount: income * 0.3, icon: 'home' },
        { category: 'food', percentage: 15, amount: income * 0.15, icon: 'restaurant' },
        { category: 'transportation', percentage: 10, amount: income * 0.1, icon: 'car' },
        { category: 'utilities', percentage: 10, amount: income * 0.1, icon: 'service' },
        { category: 'shopping', percentage: 10, amount: income * 0.1, icon: 'shopping-bag' },
        { category: 'entertainment', percentage: 5, amount: income * 0.05, icon: 'film' },
        { category: 'healthcare', percentage: 5, amount: income * 0.05, icon: 'heart-pulse' },
        { category: 'personal', percentage: 5, amount: income * 0.05, icon: 'user' },
        { category: 'education', percentage: 5, amount: income * 0.05, icon: 'graduation-cap' },
        { category: 'travel', percentage: 5, amount: income * 0.05, icon: 'plane' },
      ];
  
      return recommendations;
    }
  }
  
  export const storage = new MemStorage();
  