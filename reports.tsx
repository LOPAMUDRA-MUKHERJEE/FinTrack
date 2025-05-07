import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MonthlyComparison from "@/components/dashboard/monthly-comparison";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [comparisonMonths, setComparisonMonths] = useState(6);

  const { data: comparison, isLoading: isLoadingComparison } = useQuery({
    queryKey: [`/api/analytics/comparison/${comparisonMonths}`],
  });

  const handleMonthsChange = (months: number) => {
    setComparisonMonths(months);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getMonthName = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderSpendingTrendsChart = () => {
    if (isLoadingComparison || !comparison) {
      return <Skeleton className="h-80 w-full" />;
    }

    const data = [...comparison]
      .sort((a, b) => {
        // Sort by date (oldest first)
        return new Date(a.month.split('-')[0], parseInt(a.month.split('-')[1]) - 1, 1).getTime() - 
               new Date(b.month.split('-')[0], parseInt(b.month.split('-')[1]) - 1, 1).getTime();
      })
      .map(month => ({
        name: getMonthName(month.month),
        spending: month.totalSpent
      }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value) => [`$${value}`, 'Total Spending']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="spending" 
            name="Monthly Spending"
            stroke="#0466c8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderCategoryPieChart = () => {
    if (isLoadingComparison || !comparison || comparison.length === 0) {
      return <Skeleton className="h-80 w-full" />;
    }

    // Get the latest month data
    const latestMonth = comparison[0];
    
    if (!latestMonth.categories) {
      return <div className="text-center py-6 text-gray-500">No category data available</div>;
    }

    const data = Object.entries(latestMonth.categories).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));

    const COLORS = ['#0466c8', '#ff5400', '#38b000', '#9c9ca9', '#d00000', '#ffbe0b', '#4ea8de', '#8338ec', '#fb5607', '#3a86ff'];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
          <div className="flex space-x-1">
            <Button 
              variant={comparisonMonths === 3 ? "default" : "outline"} 
              size="sm"
              onClick={() => handleMonthsChange(3)}
            >
              3 Months
            </Button>
            <Button 
              variant={comparisonMonths === 6 ? "default" : "outline"} 
              size="sm"
              onClick={() => handleMonthsChange(6)}
            >
              6 Months
            </Button>
            <Button 
              variant={comparisonMonths === 12 ? "default" : "outline"} 
              size="sm"
              onClick={() => handleMonthsChange(12)}
            >
              12 Months
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Spending Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {renderSpendingTrendsChart()}
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                {isLoadingComparison ? (
                  Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : comparison && comparison.slice(0, 6).map((month) => {
                  const monthName = getMonthName(month.month);
                  const isPositiveChange = month.comparedToPrevious < 0;
                  
                  return (
                    <div key={month.month} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium mb-1">{monthName}</div>
                      <div className="text-lg font-semibold font-mono text-red-600">
                        {formatCurrency(month.totalSpent)}
                      </div>
                      <div className={`text-xs ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                        <i className={`ri-arrow-${isPositiveChange ? 'down' : 'up'}-s-line`}></i>
                        {Math.abs(month.comparedToPrevious).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryPieChart()}
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Top Spending Categories</h3>
                
                {isLoadingComparison ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : comparison && comparison.length > 0 && comparison[0].categories ? (
                  <div className="space-y-3">
                    {Object.entries(comparison[0].categories)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, amount]) => {
                        const percentage = (amount / comparison[0].totalSpent) * 100;
                        
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge className="capitalize">
                                {category}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                              <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">No category data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <MonthlyComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}
