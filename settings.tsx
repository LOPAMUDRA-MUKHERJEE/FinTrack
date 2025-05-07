import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Integration components
import StripeConnect from '@/components/integrations/stripe-connect';
import PayPalConnect from '@/components/integrations/paypal-connect';
import UPIConnect from '@/components/integrations/upi-connect';

const currencies = [
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
  { code: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
];

// Remove unused paymentProviders variable
const settingsSchema = z.object({
  currency: z.string(),
  enableBudgetWarnings: z.boolean(),
  paymentIntegrations: z.array(z.string()),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState<Record<string, boolean>>({});

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency: 'USD',
      enableBudgetWarnings: true,
      paymentIntegrations: [],
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/settings');
      return response.json();
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        currency: settings.currency || 'USD',
        enableBudgetWarnings: settings.enableBudgetWarnings,
        paymentIntegrations: settings.paymentIntegrations || [],
      });

      // Update which payment providers are connected
      const connectedProviders: Record<string, boolean> = {};
      (settings.paymentIntegrations || []).forEach((id: string) => {
        connectedProviders[id] = true;
      });
      setIsConfigured(connectedProviders);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest('POST', '/api/user/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: SettingsFormValues) => {
    updateSettingsMutation.mutate(data);
  };

  const handlePaymentConnect = (providerId: string) => {
    // This would typically redirect to OAuth flow
    // For demonstration, we'll just toggle the status
    const newIntegrations = form.getValues().paymentIntegrations || [];
    
    if (newIntegrations.includes(providerId)) {
      const filtered = newIntegrations.filter(id => id !== providerId);
      form.setValue('paymentIntegrations', filtered);
    } else {
      newIntegrations.push(providerId);
      form.setValue('paymentIntegrations', newIntegrations);
    }
    
    setIsConfigured(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your application preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your preferred currency for displaying amounts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableBudgetWarnings"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Budget Warnings
                      </FormLabel>
                      <FormDescription>
                        Receive alerts when you're approaching or exceeding budget limits
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>
                Connect your accounts to automatically import transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stripe" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                  <TabsTrigger value="upi">UPI</TabsTrigger>
                </TabsList>
                <TabsContent value="stripe">
                  <StripeConnect />
                </TabsContent>
                <TabsContent value="paypal">
                  <PayPalConnect />
                </TabsContent>
                <TabsContent value="upi">
                  <UPIConnect />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}