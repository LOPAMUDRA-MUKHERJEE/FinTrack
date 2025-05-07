import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetPlanner from "@/components/budget/budget-planner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

export default function BudgetPlannerPage() {
  const { toast } = useToast();
  const [income, setIncome] = useState(5000);
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/budget/recommendation', income],
    enabled: false,
  });
  
  const getRecommendations = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/budget/recommendation', { income });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Budget Recommendations Generated",
        description: "We've created personalized budget recommendations based on your income."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate recommendations",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });
  
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setIncome(parseFloat(value) || 0);
  };
  
  const handleGetRecommendations = () => {
    getRecommendations.mutate();
  };
  
  const renderPieChart = () => {
    if (getRecommendations.isPending || !getRecommendations.data) return <Skeleton className="h-64 w-full" />;
    
    const data = getRecommendations.data.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.amount
    }));
    
    const COLORS = ['#0466c8', '#ff5400', '#38b000', '#9c9ca9', '#d00000', '#ffbe0b', '#4ea8de', '#8338ec', '#fb5607', '#3a86ff'];
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
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
      <h1 className="text-2xl font-bold">Budget Planner</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income & Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    value={income.toLocaleString()}
                    onChange={handleIncomeChange}
                    className="pl-8 block w-full border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleGetRecommendations}
                disabled={getRecommendations.isPending || income <= 0}
                className="w-full"
              >
                Generate Budget Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommended Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {getRecommendations.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : getRecommendations.data ? (
              <div>
                {renderPieChart()}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Enter your income and click "Generate Budget Recommendations" to see our suggestions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BudgetPlanner compact={false} />
    </div>
  );
}
