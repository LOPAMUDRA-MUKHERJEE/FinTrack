import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { UserSettingsProvider } from "@/contexts/user-settings-context";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import BudgetPlanner from "@/pages/budget-planner";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/budget-planner" component={BudgetPlanner} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UserSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
