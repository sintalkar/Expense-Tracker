import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'users', user.uid, 'receipts'),
      orderBy('scannedAt', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      let total = 0;
      const data = snap.docs.map(doc => {
        const d = doc.data();
        total += d.total || 0;
        return { id: doc.id, ...d };
      });
      setReceipts(data);
      setTotalSpend(total);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const categoryColors: Record<string, string> = {
    food: '#fb923c', grocery: '#4ade80', travel: '#60a5fa',
    subscription: '#c084fc', trading: '#f87171', savings: '#2dd4bf', others: '#9ca3af'
  };

  const chartData = receipts.map((r) => ({
    name: r.merchant.substring(0, 8),
    amount: r.total,
    category: r.dominantCategory || 'others'
  }));

  if (loading) return <div className="p-4">Loading stats...</div>;

  return (
    <div className="space-y-10">
      <div className="bg-white/5 border border-white/10 rounded-lg p-10 text-white relative">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Monthly Spending</h2>
        <div className="text-6xl font-light tracking-tighter text-orange-500 opacity-90">${totalSpend.toFixed(2)}</div>
        <div className="mt-8 flex gap-4 text-[10px] uppercase tracking-widest text-white/60">
          <div className="border border-white/20 px-4 py-2 rounded-full">
            {receipts.length} Receipts
          </div>
        </div>
      </div>

      {receipts.length > 0 && (
        <div className="bg-white/5 rounded-lg p-10 border border-white/10">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8">Recent Spending</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={10} tick={{fill: 'rgba(255,255,255,0.4)'}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '12px'}} />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || categoryColors.others} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
          <FileText className="w-4 h-4 text-white/20" />
          Recent Receipts
        </h3>
        {receipts.length === 0 ? (
          <div className="text-center py-10 text-white/20 bg-white/5 rounded-lg border border-white/10 border-dashed text-[10px] uppercase tracking-widest">
            No receipts yet. Go scan one!
          </div>
        ) : (
          <div className="space-y-2">
            {receipts.map(r => (
              <div key={r.id} className="flex items-center justify-between p-5 bg-white/5 rounded border border-white/5 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-10 h-10 border border-white/10 rounded text-white/40 bg-[#050505]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm text-white/90 font-mono">{r.merchant}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{r.dominantCategory} • {format(r.scannedAt, 'MMM d, yyyy')}</div>
                  </div>
                </div>
                <div className="font-mono text-orange-500 font-medium">
                  {r.currency} {r.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
