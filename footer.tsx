import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left mb-3 sm:mb-0">
            <div className="text-sm text-gray-700 dark:text-gray-300">&copy; {currentYear} FinTrack. All rights reserved.</div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="#">
              <a className="text-gray-700 dark:text-gray-300 hover:text-primary text-sm">Privacy Policy</a>
            </Link>
            <Link href="#">
              <a className="text-gray-700 dark:text-gray-300 hover:text-primary text-sm">Terms of Service</a>
            </Link>
            <Link href="#">
              <a className="text-gray-700 dark:text-gray-300 hover:text-primary text-sm">Help Center</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
