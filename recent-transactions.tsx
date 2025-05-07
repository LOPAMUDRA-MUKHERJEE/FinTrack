import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentTransactionsProps {
  transactions: any[];
  isLoading: boolean;
}

export default function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const [displayCount, setDisplayCount] = useState(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No transactions to display</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      housing: "bg-blue-100 text-blue-800",
      food: "bg-orange-100 text-orange-800",
      transportation: "bg-green-100 text-green-800",
      utilities: "bg-slate-100 text-slate-800",
      shopping: "bg-red-100 text-red-800",
      entertainment: "bg-yellow-100 text-yellow-800",
      healthcare: "bg-cyan-100 text-cyan-800",
      education: "bg-purple-100 text-purple-800",
      personal: "bg-pink-100 text-pink-800",
      travel: "bg-indigo-100 text-indigo-800",
      income: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const viewMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="link" className="text-sm text-primary p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, displayCount).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium">{transaction.description}</div>
                    {transaction.merchant && (
                      <div className="text-xs text-gray-500">{transaction.merchant}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge className={getCategoryColor(transaction.category)}>
                      {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(transaction.date)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-right font-mono font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length > displayCount && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={viewMore}>
                Show More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
