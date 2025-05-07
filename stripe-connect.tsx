import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSettings } from '@/contexts/user-settings-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function StripeConnect() {
  const { toast } = useToast();
  const { settings, hasPaymentIntegration } = useUserSettings();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const isConnected = hasPaymentIntegration('stripe');
  
  const handleConnect = async () => {
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'Please enter your Stripe API Key',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const newIntegrations = [...(settings?.paymentIntegrations || []), 'stripe'];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: newIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'Stripe Connected',
          description: 'Your Stripe account has been connected successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
        setShowConnectDialog(false);
      } else {
        throw new Error('Failed to connect Stripe');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect Stripe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setIsConnecting(true);
      const updatedIntegrations = settings?.paymentIntegrations?.filter(
        p => p !== 'stripe'
      ) || [];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: updatedIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'Stripe Disconnected',
          description: 'Your Stripe account has been disconnected successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      } else {
        throw new Error('Failed to disconnect Stripe');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Stripe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-semibold">
                    S
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Stripe</p>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Connect your Stripe account to automatically import credit card transactions.
              </p>
              
              <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    disabled={isConnecting}
                    className="w-full"
                  >
                    Connect Stripe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect Stripe</DialogTitle>
                    <DialogDescription>
                      Enter your Stripe API key to connect your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Stripe API Key</Label>
                      <Input 
                        id="apiKey" 
                        placeholder="sk_test_..." 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        This should be your Stripe secret key starting with 'sk_test_' or 'sk_live_'
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConnectDialog(false)}>Cancel</Button>
                    <Button onClick={handleConnect} disabled={isConnecting}>
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}