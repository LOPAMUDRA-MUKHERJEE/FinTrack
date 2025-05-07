import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ExpenseSummaryProps {
  data: any;
  budget: any;
  isLoading: boolean;
  month: string;
}

export default function ExpenseSummary({ data, budget, isLoading, month }: ExpenseSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          
          <Skeleton className="h-64 w-full mb-4" />
          
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !budget) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No expense data available</h3>
            <p className="text-gray-500">Upload a CSV file to see your expense summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Get budgeting status (over or under)
  const getBudgetStatus = (spent: number, budgeted: number) => {
    if (spent > budgeted) {
      return { status: 'Over budget', color: 'text-red-600 bg-red-50 dark:bg-red-900 dark:bg-opacity-30' };
    } else {
      return { status: 'Under budget', color: 'text-green-600 bg-green-50 dark:bg-green-900 dark:bg-opacity-30' };
    }
  };

  // Find top category
  const getTopCategory = () => {
    if (!data.categories || Object.keys(data.categories).length === 0) {
      return { name: 'N/A', amount: 0, percentage: 0 };
    }
    
    const sortedCategories = Object.entries(data.categories)
      .map(([name, amount]: [string, any]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    const topCategory = sortedCategories[0];
    return {
      name: topCategory.name.charAt(0).toUpperCase() + topCategory.name.slice(1),
      amount: topCategory.amount,
      percentage: (topCategory.amount / data.totalSpent) * 100
    };
  };

  const topCategory = getTopCategory();

  // Prepare data for chart
  const prepareChartData = () => {
    if (!data.categories || Object.keys(data.categories).length === 0) {
      return [];
    }
    
    const categoryData = Object.entries(data.categories)
      .map(([name, amount]: [string, any]) => {
        const budgetAmount = budget[`${name}Budget`] || 0;
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          spent: amount,
          budgeted: budgetAmount
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5); // Top 5 categories
    
    return categoryData;
  };

  const chartData = prepareChartData();

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      housing: "home",
      food: "restaurant",
      transportation: "car",
      utilities: "service",
      shopping: "shopping-bag",
      entertainment: "film",
      healthcare: "heart-pulse",
      education: "graduation-cap",
      personal: "user",
      travel: "plane",
      other: "circle"
    };
    
    const lowercaseCategory = category.toLowerCase();
    return icons[lowercaseCategory] || "circle";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Monthly Overview</h2>
          <div className="flex space-x-2">
            <button className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">Total Expenses</div>
            <div className="text-2xl font-semibold font-mono text-red-600 dark:text-red-400">
              {formatCurrency(data.totalSpent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className={data.comparedToPrevious > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                <i className={`ri-arrow-${data.comparedToPrevious > 0 ? 'up' : 'down'}-s-line`}></i>
                {Math.abs(data.comparedToPrevious).toFixed(1)}%
              </span> vs last month
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">Monthly Budget</div>
            <div className="text-2xl font-semibold font-mono text-primary dark:text-blue-400">
              {formatCurrency(budget.totalBudget)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className={data.totalSpent < budget.totalBudget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                <i className={`ri-arrow-${data.totalSpent < budget.totalBudget ? 'down' : 'up'}-s-line`}></i>
                {formatCurrency(Math.abs(budget.totalBudget - data.totalSpent))}
              </span> {data.totalSpent < budget.totalBudget ? 'remaining' : 'over budget'}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">Top Category</div>
            <div className="text-2xl font-semibold font-mono text-orange-500 dark:text-orange-400">
              {topCategory.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(topCategory.amount)} ({topCategory.percentage.toFixed(1)}% of total)
            </div>
          </div>
        </div>

        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeOpacity={0.5} 
                             className="dark:opacity-30" />
              <XAxis dataKey="name" tick={{ fill: '#4b5563' }} tickLine={{ stroke: '#4b5563' }}
                    axisLine={{ stroke: '#d1d5db' }} className="dark:text-gray-300" />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#4b5563' }}
                    tickLine={{ stroke: '#4b5563' }} axisLine={{ stroke: '#d1d5db' }}
                    className="dark:text-gray-300" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  color: '#1f2937',
                }}
                itemStyle={{ color: '#1f2937' }}
                formatter={(value) => [`$${value}`, '']} 
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" 
              />
              <Legend />
              <Bar dataKey="spent" name="Spent" fill="#0466c8" />
              <Bar dataKey="budgeted" name="Budgeted" fill="#adb5bd" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(data.categories || {}).map(([category, amount]: [string, any]) => {
                const budgetKey = `${category}Budget`;
                const budgetAmount = budget[budgetKey] || 0;
                const { status, color } = getBudgetStatus(amount, budgetAmount);
                
                return (
                  <tr key={category}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary bg-opacity-10 dark:bg-opacity-20 text-primary dark:text-blue-400">
                          <i className={`ri-${getCategoryIcon(category)}-line`}></i>
                        </div>
                        <div className="ml-3 font-medium capitalize text-gray-900 dark:text-gray-100">{category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100">
                      {formatCurrency(amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-gray-900 dark:text-gray-100">
                      {formatCurrency(budgetAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
