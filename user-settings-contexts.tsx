import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';

interface UserSettings {
  id: number;
  username: string;
  currency: string;
  enableBudgetWarnings: boolean;
  paymentIntegrations: string[];
}

interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  formatAmount: (amount: number) => string;
  isBudgetWarningEnabled: boolean;
  hasPaymentIntegration: (provider: string) => boolean;
}

const defaultSettings: UserSettings = {
  id: 1,
  username: 'user',
  currency: 'USD',
  enableBudgetWarnings: true,
  paymentIntegrations: [],
};

const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: defaultSettings,
  isLoading: false,
  error: null,
  formatAmount: (amount) => formatCurrency(amount, 'USD'),
  isBudgetWarningEnabled: true,
  hasPaymentIntegration: () => false,
});

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/settings');
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, settings?.currency || 'USD');
  };

  const isBudgetWarningEnabled = settings?.enableBudgetWarnings || false;

  const hasPaymentIntegration = (provider: string) => {
    return settings?.paymentIntegrations?.includes(provider) || false;
  };

  const value = {
    settings,
    isLoading,
    error,
    formatAmount,
    isBudgetWarningEnabled,
    hasPaymentIntegration,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}