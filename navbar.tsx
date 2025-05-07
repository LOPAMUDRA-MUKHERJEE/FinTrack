import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CSVUpload from "@/components/upload/csv-upload";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-primary flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
                />
              </svg>
              <span className="ml-2 text-xl font-semibold">FinTrack</span>
            </div>
          </div>
          <div className="hidden md:block">
            <nav className="flex space-x-8">
              <Link href="/">
                <a className={`${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} px-3 py-2 text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/expenses">
                <a className={`${isActive('/expenses') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} px-3 py-2 text-sm font-medium`}>
                  Expenses
                </a>
              </Link>
              <Link href="/budget-planner">
                <a className={`${isActive('/budget-planner') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} px-3 py-2 text-sm font-medium`}>
                  Budget Planner
                </a>
              </Link>
              <Link href="/reports">
                <a className={`${isActive('/reports') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} px-3 py-2 text-sm font-medium`}>
                  Reports
                </a>
              </Link>
              <Link href="/settings">
                <a className={`${isActive('/settings') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} px-3 py-2 text-sm font-medium`}>
                  Settings
                </a>
              </Link>
            </nav>
          </div>
          <div className="block md:hidden">
            <button 
              type="button" 
              className="p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
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
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <a 
                className={`${isActive('/') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
            </Link>
            <Link href="/expenses">
              <a 
                className={`${isActive('/expenses') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Expenses
              </a>
            </Link>
            <Link href="/budget-planner">
              <a 
                className={`${isActive('/budget-planner') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Budget Planner
              </a>
            </Link>
            <Link href="/reports">
              <a 
                className={`${isActive('/reports') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </a>
            </Link>
            <Link href="/settings">
              <a 
                className={`${isActive('/settings') ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </a>
            </Link>
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                <ThemeToggle />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                      />
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
          </div>
        </div>
      )}
    </header>
  );
}
