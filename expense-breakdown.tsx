import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface ExpenseBreakdownProps {
  data: any[];
  isLoading: boolean;
}

export default function ExpenseBreakdown({ data, isLoading }: ExpenseBreakdownProps) {
  const [breakdown, setBreakdown] = useState("category");

  const handleBreakdownChange = (value: string) => {
    setBreakdown(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-gray-500">No expense data to display</p>
        </CardContent>
      </Card>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium capitalize">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">{`${payload[0].payload.percentage.toFixed(1)}% of total`}</p>
        </div>
      );
    }
  
    return null;
  };

  // Format data for pie chart
  const formatDataForPieChart = () => {
    return data.map(category => ({
      name: category.category.charAt(0).toUpperCase() + category.category.slice(1),
      value: category.amount,
      percentage: category.percentage,
      color: category.color
    }));
  };

  const pieData = formatDataForPieChart();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Expense Breakdown</CardTitle>
        <Select value={breakdown} onValueChange={handleBreakdownChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="By Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="merchant">By Merchant</SelectItem>
              <SelectItem value="day">By Day</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          {pieData.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="ml-2 text-sm">{category.name}</span>
              </div>
              <span className="text-sm font-medium">{category.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
