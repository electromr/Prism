import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, Clock, History, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AFKPage() {
  const [connected, setConnected] = useState(false);
  const [nextReward, setNextReward] = useState(60000);
  const [coinsPerMinute, setCoinsPerMinute] = useState(1.5);
  const [totalEarned, setTotalEarned] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const ws = new WebSocket('/ws');
    ws.onopen = () => {
      setConnected(true);
      setError('');
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'afk_state') {
        setNextReward(data.nextRewardIn);
        setCoinsPerMinute(data.coinsPerMinute);
        setTotalEarned(prev => prev + (data.nextRewardIn === 0 ? data.coinsPerMinute : 0));
      }
    };
    ws.onclose = (event) => {
      setConnected(false);
      if (event.code === 4001) {
        setError('You must be logged in to earn AFK rewards');
      } else if (event.code === 4002) {
        setError('AFK rewards are already running in another tab');
      } else {
        setError('Connection lost. Please refresh the page.');
      }
    };
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          AFK Rewards
        </h1>
        <Badge 
          variant={connected ? "success" : "destructive"} 
          className={`px-5 py-2 text-sm font-medium backdrop-blur-md border ${
            connected 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 backdrop-blur-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-neutral-800/50 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 backdrop-blur-xl shadow-2xl
          before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-600/20 before:to-transparent before:opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">Earnings Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {coinsPerMinute.toFixed(1)} <span className="text-xl text-cyan-300">coins/min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-neutral-800/50 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 backdrop-blur-xl shadow-2xl
          before:absolute before:inset-0 before:bg-gradient-to-t before:from-emerald-600/20 before:to-transparent before:opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">Session Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white font-mono tracking-wider">
              {formatTime(sessionTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Reward Card — PRISM CORE */}
      <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10 backdrop-blur-2xl shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-600/30 before:via-purple-600/20 before:to-emerald-600/30 before:opacity-70
        after:absolute after:-inset-1 after:bg-gradient-to-r after:from-violet-500/40 after:via-transparent after:to-emerald-500/40 after:blur-3xl after:-z-10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <History className="w-5 h-5 text-cyan-300" />
            </div>
            Next Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress 
            value={((60000 - nextReward) / 60000) * 100} 
            className="h-4 bg-white/10"
            indicatorClassName="bg-gradient-to-r from-violet-500 to-emerald-500"
          />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {Math.ceil(nextReward / 1000)} <span className="text-lg text-cyan-300">seconds</span>
            </p>
            <p className="text-sm text-neutral-400 mt-1">Keep this tab open to earn automatically</p>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-neutral-800/50 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-neutral-300">
          <p className="text-sm leading-relaxed">
            Earn coins automatically just by keeping this page open! You'll receive <strong>{coinsPerMinute} coins every minute</strong>.
          </p>
          <p className="text-sm leading-relaxed">
            You can use these coins to purchase resources and upgrades in the store.
          </p>
          <p className="text-xs text-neutral-500 mt-4 italic">
            Pro tip: Keep this tab open in the background — it works even when minimized!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
