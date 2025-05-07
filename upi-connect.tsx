import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSettings } from '@/contexts/user-settings-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// List of popular UPI services
const upiProviders = [
  { id: 'googlepay', name: 'Google Pay', logo: 'G' },
  { id: 'phonepe', name: 'PhonePe', logo: 'P' },
  { id: 'paytm', name: 'Paytm', logo: 'P' },
  { id: 'amazonpay', name: 'Amazon Pay', logo: 'A' },
  { id: 'bhim', name: 'BHIM', logo: 'B' },
  { id: 'whatsapp', name: 'WhatsApp Pay', logo: 'W' }
];

export default function UPIConnect() {
  const { toast } = useToast();
  const { settings, hasPaymentIntegration } = useUserSettings();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedUPI, setSelectedUPI] = useState('googlepay');
  const [upiId, setUpiId] = useState('');
  
  // Check which UPI providers are connected
  const connectedUPIs = upiProviders.filter(provider => 
    hasPaymentIntegration(`upi_${provider.id}`)
  );
  
  const handleConnect = async () => {
    if (!upiId) {
      toast({
        title: 'Error',
        description: 'Please enter your UPI ID',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const newIntegrations = [...(settings?.paymentIntegrations || []), `upi_${selectedUPI}`];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: newIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'UPI Connected',
          description: `Your ${upiProviders.find(p => p.id === selectedUPI)?.name} account has been connected successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
        setShowConnectDialog(false);
      } else {
        throw new Error('Failed to connect UPI');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect UPI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async (providerId: string) => {
    try {
      setIsConnecting(true);
      const updatedIntegrations = settings?.paymentIntegrations?.filter(
        p => p !== `upi_${providerId}`
      ) || [];
      
      const response = await apiRequest('POST', '/api/user/settings', {
        paymentIntegrations: updatedIntegrations
      });
      
      if (response.ok) {
        toast({
          title: 'UPI Disconnected',
          description: `Your ${upiProviders.find(p => p.id === providerId)?.name} account has been disconnected successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      } else {
        throw new Error('Failed to disconnect UPI');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect UPI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 9V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7V6C17 4.89543 16.1046 4 15 4H9C7.89543 4 7 4.89543 7 6V7" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 17V18C7 19.1046 7.89543 20 9 20H15C16.1046 20 17 19.1046 17 18V17" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          UPI Integration
        </CardTitle>
        <CardDescription>
          Connect your UPI accounts to automatically import transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {connectedUPIs.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Your connected UPI accounts:
              </p>
              {connectedUPIs.map(provider => (
                <div key={provider.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-semibold">
                      {provider.logo}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{provider.name}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={isConnecting}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Connect your preferred UPI account to automatically import transactions.
            </p>
          )}
          
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="default"
                disabled={isConnecting}
              >
                Add UPI Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect UPI</DialogTitle>
                <DialogDescription>
                  Select your UPI provider and enter your UPI ID to connect.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <RadioGroup value={selectedUPI} onValueChange={setSelectedUPI} className="grid grid-cols-2 gap-4">
                  {upiProviders.map(provider => (
                    <div key={provider.id} className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value={provider.id} id={provider.id} />
                      <Label htmlFor={provider.id} className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-semibold">
                          {provider.logo}
                        </div>
                        <span className="ml-2">{provider.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input 
                    id="upiId" 
                    placeholder="yourname@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
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
      </CardContent>
    </Card>
  );
}