import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserSettings } from '@/contexts/user-settings-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PayPalConnect() {
  const { toast } = useToast();
  const { settings, hasPaymentIntegration } = useUserSettings();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  
  const isConnected = hasPaymentIntegration('paypal');
  
  const handleConnect = async () => {
    if (!clientId || !clientSecret) {
      toast({
        title: 'Error',
        description: 'Please enter both your PayPal Client ID and Secret',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const newIntegrations = [...(settings?.paymentIntegrations || []), 'paypal'];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: newIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'PayPal Connected',
          description: 'Your PayPal account has been connected successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
        setShowConnectDialog(false);
      } else {
        throw new Error('Failed to connect PayPal');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect PayPal. Please try again.',
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
        p => p !== 'paypal'
      ) || [];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: updatedIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'PayPal Disconnected',
          description: 'Your PayPal account has been disconnected successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      } else {
        throw new Error('Failed to disconnect PayPal');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect PayPal. Please try again.',
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
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold">
                    P
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">PayPal</p>
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
                Connect your PayPal account to automatically import transactions.
              </p>
              
              <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    disabled={isConnecting}
                    className="w-full"
                  >
                    Connect PayPal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect PayPal</DialogTitle>
                    <DialogDescription>
                      Enter your PayPal API credentials to connect your account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client ID</Label>
                      <Input 
                        id="clientId" 
                        placeholder="Your PayPal Client ID" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <Input 
                        id="clientSecret" 
                        type="password"
                        placeholder="Your PayPal Client Secret" 
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        You can find these in your PayPal Developer Dashboard
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