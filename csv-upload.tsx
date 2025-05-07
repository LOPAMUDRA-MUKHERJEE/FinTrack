import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Papa from "papaparse";

export default function CSVUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (csvData: any[]) => {
      const response = await apiRequest("POST", "/api/upload/csv", csvData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: `${data.transactions.length} transactions imported.`,
      });
      
      // Reset file
      setFile(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = () => {
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV parsing error",
            description: "There was an error parsing your CSV file.",
            variant: "destructive",
          });
          console.error("CSV parsing errors:", results.errors);
          return;
        }
        
        // Clean the data to ensure consistency
        const cleanedData = results.data.map((row: any) => {
          // Get the keys from the CSV that best match our expected fields
          const dateKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('date') || key.toLowerCase().includes('time')
          ) || 'Date';
          
          const descriptionKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('desc') || key.toLowerCase().includes('detail') || key.toLowerCase().includes('narration')
          ) || 'Description';
          
          const amountKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('amount') || key.toLowerCase().includes('sum') || key.toLowerCase().includes('value')
          ) || 'Amount';
          
          // Get values from the row
          return {
            date: row[dateKey] || '',
            description: row[descriptionKey] || '',
            amount: row[amountKey] || '0',
            category: row['Category'] || '',
            merchant: row['Merchant'] || '',
            notes: row['Notes'] || ''
          };
        });
        
        // Upload to server
        uploadMutation.mutate(cleanedData);
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Expenses</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'
          } ${file ? 'border-green-500 bg-green-50/20' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-700 mb-2">Drag and drop your CSV file here</p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".csv"
                onChange={handleFileChange}
              />
              <p className="mt-4 text-xs text-gray-500">Supports CSV format from most banks and credit cards</p>
            </div>
          ) : (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{Math.round(file.size / 1024)} KB</span>
                </div>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-700"
                  onClick={removeFile}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={uploadMutation.isPending}
                  onClick={processFile}
                >
                  {uploadMutation.isPending ? "Processing..." : "Process File"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
