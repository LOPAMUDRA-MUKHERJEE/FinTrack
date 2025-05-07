import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CSVUpload from "@/components/upload/csv-upload";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ExpensesPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [`/api/transactions/${selectedMonth}`],
  });

  const { data: categoryBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: [`/api/analytics/breakdown/${selectedMonth}`],
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      housing: "home",
      food: "utensils",
      transportation: "car",
      utilities: "plug",
      shopping: "shopping-bag",
      entertainment: "film",
      healthcare: "heart-pulse",
      education: "graduation-cap",
      personal: "user",
      travel: "plane",
      income: "wallet",
      other: "circle"
    };
    
    return icons[category] || "circle";
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const renderBarChart = () => {
    if (isLoadingBreakdown || !categoryBreakdown) {
      return <Skeleton className="h-80 w-full" />;
    }

    const data = categoryBreakdown.map(cat => ({
      name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
      amount: cat.amount
    }));
    
    const colors = [
      "#0466c8", "#ff5400", "#38b000", "#9c9ca9", 
      "#d00000", "#ffbe0b", "#4ea8de", "#8338ec"
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
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
          <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
          <Legend />
          <Bar dataKey="amount" name="Amount" fill="#0466c8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div className="mt-3 sm:mt-0 flex items-center space-x-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {monthOptions().map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expenses
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Expenses</DialogTitle>
              </DialogHeader>
              <CSVUpload />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.merchant && (
                            <div className="text-sm text-gray-500">{transaction.merchant}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(transaction.category)}>
                            <i className={`ri-${getCategoryIcon(transaction.category)}-line mr-1`}></i>
                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-gray-500 mb-4">Upload a CSV file to import your transactions</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Expenses</DialogTitle>
                      </DialogHeader>
                      <CSVUpload />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {renderBarChart()}
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {isLoadingBreakdown ? (
                  Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : categoryBreakdown && categoryBreakdown.map((category) => (
                  <Card key={category.category}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 flex items-center justify-center rounded-full bg-${category.category === 'housing' ? 'blue' : category.category === 'food' ? 'orange' : category.category === 'transportation' ? 'green' : 'gray'}-100`}>
                            <i className={`ri-${getCategoryIcon(category.category)}-line text-${category.category === 'housing' ? 'blue' : category.category === 'food' ? 'orange' : category.category === 'transportation' ? 'green' : 'gray'}-600`}></i>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium capitalize">{category.category}</div>
                            <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of total</div>
                          </div>
                        </div>
                        <div className="font-mono font-medium">
                          {formatCurrency(category.amount)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
