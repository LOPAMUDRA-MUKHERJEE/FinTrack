import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ExpenseSummary from "@/components/dashboard/expense-summary";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import ExpenseBreakdown from "@/components/dashboard/expense-breakdown";
import MonthlyComparison from "@/components/dashboard/monthly-comparison";
import CSVUpload from "@/components/upload/csv-upload";
import BudgetPlanner from "@/components/budget/budget-planner";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: monthlySummary, isLoading: isLoadingMonthlySummary } = useQuery({
    queryKey: [`/api/analytics/summary/${selectedMonth}`],
  });

  const { data: categoryBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: [`/api/analytics/breakdown/${selectedMonth}`],
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [`/api/transactions/${selectedMonth}`],
  });

  const { data: budget, isLoading: isLoadingBudget } = useQuery({
    queryKey: [`/api/budget/${selectedMonth}`],
  });

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  // Generate month options for the dropdown
  const monthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-darkest dark:text-white">Financial Dashboard</h1>
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-10 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {monthOptions().map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100">{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExpenseSummary 
            data={monthlySummary} 
            budget={budget} 
            isLoading={isLoadingMonthlySummary || isLoadingBudget} 
            month={selectedMonth} 
          />
          <RecentTransactions transactions={transactions} isLoading={isLoadingTransactions} />
        </div>
        
        <div className="space-y-6">
          <CSVUpload />
          <ExpenseBreakdown data={categoryBreakdown} isLoading={isLoadingBreakdown} />
          <BudgetPlanner compact={true} />
        </div>
      </div>

      <div className="mt-6">
        <MonthlyComparison />
      </div>
    </>
  );
}
