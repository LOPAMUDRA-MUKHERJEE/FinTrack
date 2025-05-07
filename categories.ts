/**
 * Map of categories to their display colors
 */
export const categoryColors: Record<string, string> = {
    housing: "#0466c8",
    food: "#ff5400",
    transportation: "#38b000",
    utilities: "#9c9ca9",
    shopping: "#d00000",
    entertainment: "#ffbe0b",
    healthcare: "#4ea8de",
    education: "#8338ec",
    personal: "#fb5607",
    travel: "#3a86ff",
    income: "#2ecc71",
    other: "#adb5bd"
  };
  
  /**
   * CSS class names for category badges
   */
  export const categoryColorClasses: Record<string, string> = {
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
  
  /**
   * Map of categories to their icons
   */
  export const categoryIcons: Record<string, string> = {
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
    income: "wallet",
    other: "circle"
  };
  
  /**
   * Get the icon for a category
   * 
   * @param category The category to get the icon for
   * @returns The icon name
   */
  export function getCategoryIcon(category: string): string {
    const normalizedCategory = category.toLowerCase();
    return categoryIcons[normalizedCategory] || "circle";
  }
  
  /**
   * Get the color for a category
   * 
   * @param category The category to get the color for
   * @returns The color hex code
   */
  export function getCategoryColor(category: string): string {
    const normalizedCategory = category.toLowerCase();
    return categoryColors[normalizedCategory] || "#adb5bd";
  }
  
  /**
   * Get the CSS class names for a category badge
   * 
   * @param category The category to get the class names for
   * @returns The CSS class names
   */
  export function getCategoryClasses(category: string): string {
    const normalizedCategory = category.toLowerCase();
    return categoryColorClasses[normalizedCategory] || "bg-gray-100 text-gray-800";
  }
  
  /**
   * All available categories
   */
  export const categories = [
    { value: "housing", label: "Housing", icon: "home" },
    { value: "food", label: "Food & Dining", icon: "restaurant" },
    { value: "transportation", label: "Transportation", icon: "car" },
    { value: "utilities", label: "Utilities", icon: "service" },
    { value: "shopping", label: "Shopping", icon: "shopping-bag" },
    { value: "entertainment", label: "Entertainment", icon: "film" },
    { value: "healthcare", label: "Healthcare", icon: "heart-pulse" },
    { value: "education", label: "Education", icon: "graduation-cap" },
    { value: "personal", label: "Personal", icon: "user" },
    { value: "travel", label: "Travel", icon: "plane" },
    { value: "income", label: "Income", icon: "wallet" },
    { value: "other", label: "Other", icon: "circle" }
  ];
  
  /**
   * Default budget allocation percentages (for recommendations)
   */
  export const defaultBudgetAllocations: Record<string, number> = {
    housing: 30,
    food: 15,
    transportation: 10,
    utilities: 10,
    shopping: 10,
    entertainment: 5,
    healthcare: 5,
    education: 5,
    personal: 5,
    travel: 5,
    other: 0
  };
  
  /**
   * Format a category name for display
   * 
   * @param category The category to format
   * @returns The formatted category name
   */
  export function formatCategoryName(category: string): string {
    const found = categories.find(c => c.value === category.toLowerCase());
    if (found) return found.label;
    
    // Fallback: capitalize first letter
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  