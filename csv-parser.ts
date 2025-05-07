import Papa from 'papaparse';
import { CSVTransaction, csvTransactionSchema, CSVUpload } from '@shared/schema';
import { ZodError } from 'zod';

interface ParsedResult {
  data: CSVUpload;
  errors: string[];
}

interface ParseOptions {
  headers?: string[];
  dateFormat?: string;
}

/**
 * Parse CSV file to extract transaction data
 * 
 * @param file The CSV file to parse
 * @param options Parsing options
 * @returns Parsed transaction data and any errors
 */
export async function parseCSVFile(file: File, options: ParseOptions = {}): Promise<ParsedResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          // Collect parsing errors
          results.errors.forEach(err => {
            errors.push(`Line ${err.row}: ${err.message}`);
          });
        }
        
        try {
          // Map parsed data to our transaction schema
          const transactions: CSVTransaction[] = results.data.map((row: any) => mapCSVRowToTransaction(row));
          
          // Validate with zod schema
          const validatedData = transactions.map(transaction => {
            try {
              return csvTransactionSchema.parse(transaction);
            } catch (error) {
              if (error instanceof ZodError) {
                error.errors.forEach(err => {
                  errors.push(`Validation error in row: ${JSON.stringify(transaction)} - ${err.message}`);
                });
              }
              // Return minimal valid object so parsing can continue
              return {
                date: new Date().toISOString(),
                description: 'Invalid entry',
                amount: '0',
                category: 'other',
                merchant: '',
                notes: 'Error in parsing'
              };
            }
          });
          
          resolve({
            data: validatedData,
            errors
          });
        } catch (error) {
          errors.push(`Failed to process CSV data: ${error instanceof Error ? error.message : String(error)}`);
          resolve({
            data: [],
            errors
          });
        }
      },
      error: (error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({
          data: [],
          errors
        });
      }
    });
  });
}

/**
 * Map CSV row data to transaction object
 * 
 * @param row Raw CSV data row
 * @returns Transaction object
 */
function mapCSVRowToTransaction(row: any): CSVTransaction {
  // Find the appropriate column names in the CSV
  // Different banks/credit cards use different header names
  const dateKey = findKeyByPattern(row, ['date', 'time', 'posted', 'transaction date']);
  const descriptionKey = findKeyByPattern(row, ['description', 'desc', 'detail', 'narration', 'transaction', 'memo']);
  const amountKey = findKeyByPattern(row, ['amount', 'sum', 'value', 'transaction amount']);
  const merchantKey = findKeyByPattern(row, ['merchant', 'payee', 'vendor', 'store', 'retailer']);
  const categoryKey = findKeyByPattern(row, ['category', 'type', 'transaction type', 'classification']);
  const notesKey = findKeyByPattern(row, ['notes', 'note', 'comment', 'comments', 'memo']);
  
  // Clean amount value - handle negatives, currency symbols, etc.
  let amount = row[amountKey] || '0';
  
  // Some CSVs use separate debit/credit columns
  const debitKey = findKeyByPattern(row, ['debit', 'withdrawal', 'expense']);
  const creditKey = findKeyByPattern(row, ['credit', 'deposit', 'income']);
  
  if (debitKey && row[debitKey]) {
    amount = `-${row[debitKey].replace(/[^0-9.]/g, '')}`;
  } else if (creditKey && row[creditKey]) {
    amount = row[creditKey].replace(/[^0-9.]/g, '');
  } else {
    // Handle amount formatting (remove currency symbols, handle negative values)
    amount = amount.toString().replace(/[^0-9.-]/g, '');
  }
  
  // Create transaction object
  return {
    date: row[dateKey] || new Date().toISOString(),
    description: row[descriptionKey] || 'Unknown transaction',
    amount: amount,
    category: row[categoryKey] || '',
    merchant: row[merchantKey] || '',
    notes: row[notesKey] || ''
  };
}

/**
 * Find a matching key in an object case-insensitively
 * 
 * @param obj Object to search in
 * @param patterns Array of patterns to match against keys
 * @returns Matching key or undefined
 */
function findKeyByPattern(obj: any, patterns: string[]): string | undefined {
  const keys = Object.keys(obj);
  
  // First try exact matches
  for (const pattern of patterns) {
    const exactMatch = keys.find(key => key.toLowerCase() === pattern.toLowerCase());
    if (exactMatch) return exactMatch;
  }
  
  // Then try includes matches
  for (const pattern of patterns) {
    const includesMatch = keys.find(key => key.toLowerCase().includes(pattern.toLowerCase()));
    if (includesMatch) return includesMatch;
  }
  
  return undefined;
}

/**
 * Auto-detect category based on transaction description
 * 
 * @param description Transaction description
 * @returns Detected category
 */
export function detectCategory(description: string): string {
  const desc = description.toLowerCase();
  
  // Common category patterns
  const patterns: Record<string, string[]> = {
    housing: ['rent', 'mortgage', 'apartment', 'property', 'housing', 'hoa', 'management'],
    food: ['grocery', 'restaurant', 'food', 'meal', 'dining', 'cafe', 'coffee', 'dinner', 'lunch', 'breakfast'],
    transportation: ['gas', 'uber', 'lyft', 'taxi', 'car', 'auto', 'vehicle', 'bus', 'train', 'subway', 'transport'],
    utilities: ['electric', 'water', 'gas bill', 'internet', 'phone', 'cell', 'utility', 'cable', 'heating'],
    entertainment: ['movie', 'theatre', 'theater', 'concert', 'netflix', 'spotify', 'subscription', 'entertainment'],
    shopping: ['amazon', 'walmart', 'target', 'shop', 'store', 'mall', 'purchase', 'retail'],
    healthcare: ['doctor', 'medical', 'health', 'dental', 'pharmacy', 'hospital', 'clinic', 'insurance'],
    education: ['tuition', 'school', 'university', 'college', 'course', 'book', 'education'],
    personal: ['haircut', 'salon', 'spa', 'gym', 'fitness', 'personal'],
    travel: ['hotel', 'airbnb', 'flight', 'airline', 'vacation', 'travel', 'trip'],
    income: ['salary', 'paycheck', 'deposit', 'income', 'direct deposit', 'payment received', 'refund'],
  };
  
  // Check for matches
  for (const [category, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}
