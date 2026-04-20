import React, { useState } from 'react';
import { RefreshCw, Mail, LayoutTemplate, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function SyncScreen() {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = () => {
    // In a real app we'd redirect to an OAuth consent screen here
    alert("Opening Google OAuth flow...");
    setTimeout(() => setIsConnected(true), 1500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white/5 border border-white/10 rounded-lg p-10 text-center">
        {!isConnected ? (
          <div className="py-8 space-y-6">
            <div className="bg-[#050505] border border-white/20 text-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8">
              <Mail className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-light tracking-tighter uppercase text-white">Connect Gmail</h2>
            <p className="text-white/40 max-w-sm mx-auto text-sm">
              Automatically extract receipts from Uber, Netflix, and trading platforms directly from your inbox.
            </p>
            <button 
              onClick={handleConnect}
              className="mt-8 bg-orange-600 text-white px-6 py-3 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition"
            >
              Connect with Gmail
            </button>
          </div>
        ) : (
          <div className="py-2 text-left space-y-10">
            <div className="flex justify-between items-center bg-[#050505] p-6 rounded border border-white/10">
              <div className="flex items-center gap-4">
                <div className="border border-white/20 text-orange-500 p-2 rounded-full"><Mail className="w-4 h-4"/></div>
                <div>
                  <h3 className="font-mono text-white/90">{user?.email}</h3>
                  <p className="text-[10px] text-orange-500 uppercase tracking-widest mt-1">Connected</p>
                </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`flex justify-center items-center p-3 border ${isSyncing ? 'bg-[#050505] border-white/10 text-white/20' : 'bg-white/5 border-white/20 text-orange-500 hover:bg-white/10'}`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4">Synced Transactions</h4>
              
              <div className="p-4 bg-orange-950/30 text-orange-500/80 rounded border border-orange-500/30 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs uppercase tracking-wider leading-relaxed">
                  Gmail auto-syncing is simulated in developer preview mode. Data below is mocked.
                </p>
              </div>

              {[
                { merchant: 'Netflix', amount: 15.99, cat: 'Subscription', display: 'from: netflix.com' },
                { merchant: 'Uber', amount: 24.50, cat: 'Travel', display: 'from: uber.com' }
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-white/20 transition-colors rounded">
                  <div>
                     <p className="font-mono text-white/90">{tx.merchant}</p>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{tx.display}</p>
                  </div>
                  <div className="text-right">
                     <p className="font-mono text-orange-500">${tx.amount.toFixed(2)}</p>
                     <p className="text-[10px] text-white/60 uppercase tracking-widest border border-white/10 px-2 py-0.5 mt-2 inline-block">{tx.cat}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
