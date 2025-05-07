/**
 * Map of currency codes to their symbols and formatting options
 */
export const currencyFormatters: Record<string, {
    symbol: string;
    placement: 'before' | 'after';
    format: Intl.NumberFormatOptions;
  }> = {
    USD: {
      symbol: '$',
      placement: 'before',
      format: { style: 'currency', currency: 'USD' }
    },
    EUR: {
      symbol: '€',
      placement: 'after',
      format: { style: 'currency', currency: 'EUR' }
    },
    GBP: {
      symbol: '£',
      placement: 'before',
      format: { style: 'currency', currency: 'GBP' }
    },
    JPY: {
      symbol: '¥',
      placement: 'before',
      format: { style: 'currency', currency: 'JPY' }
    },
    CAD: {
      symbol: 'C$',
      placement: 'before',
      format: { style: 'currency', currency: 'CAD' }
    },
    AUD: {
      symbol: 'A$',
      placement: 'before',
      format: { style: 'currency', currency: 'AUD' }
    },
    CNY: {
      symbol: '¥',
      placement: 'before',
      format: { style: 'currency', currency: 'CNY' }
    },
    INR: {
      symbol: '₹',
      placement: 'before',
      format: { style: 'currency', currency: 'INR' }
    },
    BRL: {
      symbol: 'R$',
      placement: 'before',
      format: { style: 'currency', currency: 'BRL' }
    },
    ZAR: {
      symbol: 'R',
      placement: 'before',
      format: { style: 'currency', currency: 'ZAR' }
    }
  };
  
  /**
   * Format a number as currency based on the provided currency code
   * 
   * @param amount The amount to format
   * @param currencyCode The currency code (e.g., 'USD', 'EUR')
   * @returns Formatted currency string
   */
  export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
    // Use Intl.NumberFormat for proper currency formatting
    try {
      const formatter = currencyFormatters[currencyCode] || currencyFormatters['USD'];
      
      return new Intl.NumberFormat('en-US', formatter.format).format(amount);
    } catch (error) {
      // Fallback to basic formatting if Intl.NumberFormat fails
      const formatter = currencyFormatters[currencyCode] || currencyFormatters['USD'];
      
      // Format with 2 decimal places
      const formattedAmount = Math.abs(amount).toFixed(2);
      
      // Add thousand separators
      const withSeparators = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      // Add currency symbol in the right position
      return formatter.placement === 'before' 
        ? `${formatter.symbol}${withSeparators}`
        : `${withSeparators} ${formatter.symbol}`;
    }
  }
  
  /**
   * Get currency symbol for a currency code
   * 
   * @param currencyCode The currency code
   * @returns The currency symbol
   */
  export function getCurrencySymbol(currencyCode: string = 'USD'): string {
    return (currencyFormatters[currencyCode] || currencyFormatters['USD']).symbol;
  }
  
  /**
   * Create a currency formatter function that always uses the same currency
   * 
   * @param currencyCode The currency code to use for formatting
   * @returns A function that formats amounts using the specified currency
   */
  export function createCurrencyFormatter(currencyCode: string = 'USD') {
    return (amount: number) => formatCurrency(amount, currencyCode);
  }
  
  /**
   * Format a number as a percentage
   * 
   * @param value The value to format as percentage
   * @param decimalPlaces Number of decimal places to include
   * @returns Formatted percentage string
   */
  export function formatPercentage(value: number, decimalPlaces: number = 1): string {
    return `${value.toFixed(decimalPlaces)}%`;
  }