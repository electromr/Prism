import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Plus,
  RefreshCw,
  Coins
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function StorePage() {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { data: storeConfig } = useQuery({
    queryKey: ['storeConfig'],
    queryFn: async () => {
      const response = await axios.get('/api/store/config');
      return response.data;
    },
    retry: false
  });

  const resourceLabels = {
    ram: 'MB RAM',
    disk: 'MB Storage',
    cpu: '% CPU',
    servers: 'Server Slots'
  };

  const buyResource = async (type, amount) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError('');
      await axios.post('/api/store/buy', {
        resourceType: type,
        amount: parseInt(amount)
      });
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to make purchase');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
      setConfirmDialog(null);
    }
  };

  const ResourceCard = ({ title, icon: Icon, type, description, pricePerUnit }) => {
    const [amount, setAmount] = useState(1);
    const totalPrice = amount * pricePerUnit;
    const canAfford = storeConfig?.canAfford?.[type] && storeConfig.userBalance >= totalPrice;
    const resourceAmount = amount * (storeConfig?.multipliers?.[type] || 0);
    const maxAmount = storeConfig?.limits?.[type] || 10;

    const handlePurchaseClick = () => {
      setConfirmDialog({
        type,
        amount,
        resourceAmount,
        totalPrice,
        title,
        unit: resourceLabels[type]
      });
    };

    // Prism gradient per resource type
    const gradients = {
      ram: 'from-purple-500 to-pink-500',
      disk: 'from-cyan-500 to-blue-500',
      cpu: 'from-orange-500 to-red-500',
      servers: 'from-emerald-500 to-teal-500'
    };

    return (
      <Card className={`relative overflow-hidden border-2 border-transparent bg-gradient-to-br ${gradients[type]}/10 backdrop-blur-xl shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/5 before:to-transparent
        after:absolute after:-inset-1 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:blur-xl after:-z-10
        hover:before:opacity-100 before:opacity-60 before:transition-opacity`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[type]} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl text-white">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(maxAmount, parseInt(e.target.value) || 1)))}
              className="w-28 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
            <span className="text-sm text-gray-400">units × {storeConfig?.multipliers?.[type]} {resourceLabels[type].split(' ')[1]}</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">You get:</span>
              <span className="font-bold text-white text-lg">+{resourceAmount} {resourceLabels[type]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cost:</span>
              <span className={`font-bold text-xl ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPrice} coins
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full h-12 text-lg font-medium transition-all duration-300 ${
              canAfford 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg' 
                : 'bg-neutral-800 cursor-not-allowed'
            }`}
            onClick={handlePurchaseClick}
            disabled={!canAfford || loading[type]}
          >
            {loading[type] ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : canAfford ? (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Purchase Now
              </>
            ) : (
              'Insufficient Coins'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (!storeConfig) {
    return (
      <div className="p-6">
        <Alert className="border-neutral-700 bg-neutral-900/50 backdrop-blur">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading store configuration...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Resource Store
        </h1>
        <Badge variant="outline" className="px-6 py-3 text-lg font-medium bg-white/10 backdrop-blur-md border-white/20">
          <Coins className="w-5 h-5 mr-2 text-yellow-400" />
          <span className="text-white">{storeConfig.userBalance.toLocaleString()} coins</span>
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 backdrop-blur-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ResourceCard
          title="Memory"
          icon={MemoryStick}
          type="ram"
          description="Boost your servers with extra RAM for smoother performance"
          pricePerUnit={storeConfig.prices.resources.ram}
        />
        <ResourceCard
          title="Storage"
          icon={HardDrive}
          type="disk"
          description="Expand storage to host larger projects and databases"
          pricePerUnit={storeConfig.prices.resources.disk}
        />
        <ResourceCard
          title="CPU Power"
          icon={Cpu}
          type="cpu"
          description="Increase CPU allocation for faster processing and lower latency"
          pricePerUnit={storeConfig.prices.resources.cpu}
        />
        <ResourceCard
          title="Server Slots"
          icon={Server}
          type="servers"
          description="Create more servers and run multiple instances"
          pricePerUnit={storeConfig.prices.resources.servers}
        />
      </div>

      {/* Info Card */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Purchase Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">
            You can purchase up to:
            {Object.entries(storeConfig.limits).map(([type, limit]) => (
              <span key={type} className="mx-2 text-white font-medium">
                {limit}× {resourceLabels[type]}
              </span>
            ))}
            per session.
          </p>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-neutral-950/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-gray-300 pt-4 space-y-4">
              <div className="bg-white/5 rounded-lg p-5 space-y-3 border border-white/10">
                <div className="flex justify-between">
                  <span>Resource</span>
                  <span className="font-bold text-white">{confirmDialog?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-bold text-emerald-400">+{confirmDialog?.resourceAmount} {confirmDialog?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost</span>
                  <span className="font-bold text-xl text-yellow-400">{confirmDialog?.totalPrice} coins</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span>Remaining Balance</span>
                  <span className="font-bold text-white">
                    {storeConfig.userBalance - (confirmDialog?.totalPrice || 0)} coins
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => buyResource(confirmDialog.type, confirmDialog.amount)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
            >
              Confirm & Buy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
