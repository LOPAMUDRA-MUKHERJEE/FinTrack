import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function MonthlyComparison() {
  const [months, setMonths] = useState(6);

  const { data: comparison, isLoading } = useQuery({
    queryKey: [`/api/analytics/comparison/${months}`],
  });

  const handleMonthsChange = (newMonths: number) => {
    setMonths(newMonths);
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

  const prepareChartData = () => {
    if (!comparison) return [];

    return [...comparison]
      .sort((a, b) => {
        // Sort by date (oldest first)
        return new Date(a.month.split('-')[0], parseInt(a.month.split('-')[1]) - 1, 1).getTime() - 
               new Date(b.month.split('-')[0], parseInt(b.month.split('-')[1]) - 1, 1).getTime();
      })
      .map(month => ({
        name: getMonthName(month.month),
        expenses: month.totalSpent
      }));
  };

  const chartData = prepareChartData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Monthly Comparison</CardTitle>
        <div className="flex space-x-1">
          <Button 
            variant={months === 3 ? "default" : "outline"} 
            size="sm"
            onClick={() => handleMonthsChange(3)}
          >
            3 Months
          </Button>
          <Button 
            variant={months === 6 ? "default" : "outline"} 
            size="sm"
            onClick={() => handleMonthsChange(6)}
          >
            6 Months
          </Button>
          <Button 
            variant={months === 12 ? "default" : "outline"} 
            size="sm"
            onClick={() => handleMonthsChange(12)}
          >
            12 Months
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-64 w-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </>
        ) : comparison && comparison.length > 0 ? (
          <>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Expenses']} />
                  <Legend />
                  <Bar dataKey="expenses" name="Monthly Expenses" fill="#0466c8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {comparison.slice(0, 6).map((month) => {
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
          </>
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No comparison data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
