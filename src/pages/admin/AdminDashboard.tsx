import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  ToggleRight, SquareTerminal, Sliders, Users, 
  Rss, BarChart3, AlertOctagon, LogOut, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const { appUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flags');

  // Simple admin gate check
  if (!appUser || !appUser.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-8">You do not have administrative privileges.</p>
        <button onClick={() => navigate('/')} className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">Return Home</button>
      </div>
    );
  }

  const tabs = [
    { id: 'flags', icon: ToggleRight, label: 'Flags' },
    { id: 'prompts', icon: SquareTerminal, label: 'Prompts' },
    { id: 'config', icon: Sliders, label: 'Config' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'broadcast', icon: Rss, label: 'Broadcast' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'emergency', icon: AlertOctagon, label: 'Emergency' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="border-r border-white/10 w-full md:w-64 flex-shrink-0 flex flex-col bg-[#050505]">
        <div className="h-24 px-6 md:px-10 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-light tracking-tighter uppercase leading-none text-white whitespace-nowrap">SmartBill <span className="text-orange-600">AD</span></h1>
          </div>
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-x-auto md:overflow-y-auto flex md:flex-col p-6 gap-2 items-center md:items-stretch scrollbar-hide border-r border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 p-3 whitespace-nowrap transition-colors w-full border ${activeTab === tab.id ? 'bg-white/5 border-white/10 text-orange-500' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] uppercase font-bold tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-[#050505]">
        <header className="h-24 border-b border-white/10 flex items-center justify-between px-10">
          <div>
            <h1 className="text-4xl font-light tracking-tighter uppercase leading-none">SmartBill <span className="text-orange-600">AI</span></h1>
            <p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">Admin Master Production Environment</p>
          </div>
        </header>

        <section className="flex-1 flex flex-col md:flex-row">
          <div className="flex-1 p-6 md:p-10 border-b md:border-b-0 md:border-r border-white/10">
             <header className="mb-10 pb-6 border-b border-white/10">
               <h2 className="text-4xl font-light tracking-tighter uppercase leading-none">{tabs.find(t => t.id === activeTab)?.label}</h2>
             </header>

            {activeTab === 'flags' && <FeatureFlagsTab />}
            {activeTab === 'prompts' && <PromptsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'emergency' && <EmergencyTab />}
            {['config', 'broadcast', 'analytics'].includes(activeTab) && (
              <div className="p-10 text-center border border-white/10 border-dashed text-white/30 text-[10px] uppercase tracking-widest">
                Module active in backend. UI in stub mode.
              </div>
            )}
          </div>
          
          <div className="w-full md:w-[320px] p-6 md:p-10 flex flex-col gap-8 bg-[#050505] shrink-0">
             <EmergencyTab />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureFlagsTab() {
  const flags = [
    { id: 'scan_enabled', name: 'Receipt Scanning', enabled: true },
    { id: 'gmail_sync_enabled', name: 'Gmail Auto-Sync', enabled: true },
    { id: 'ai_suggestions', name: 'AI Budget Suggestions', enabled: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      {flags.map(f => (
        <div key={f.id} className="p-4 bg-white/5 border border-white/5 hover:border-white/20 flex items-center justify-between transition-colors">
          <div>
            <h4 className="text-sm font-sans">{f.name}</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 opacity-50">{f.id}</p>
          </div>
          <button 
             className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${f.enabled ? 'bg-orange-600' : 'bg-white/20'}`}
          >
            <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PromptsTab() {
  const prompt = `You are a receipt parser. Extract all line items from this receipt image. \nReturn ONLY valid JSON in this exact schema...`;
  
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
         <h3 className="text-4xl font-light tracking-tighter italic leading-none text-white/80">Prompt v1.5</h3>
         <span className="px-3 py-1 border border-white/20 text-[10px] uppercase tracking-widest text-white/60">LIVE ENABLED</span>
      </div>
      <div className="relative flex-1">
        <textarea 
          className="w-full h-full min-h-[300px] p-6 font-mono text-sm leading-relaxed bg-white/5 text-white/80 border border-white/10 focus:outline-none focus:border-white/40"
          defaultValue={prompt}
        />
        <div className="absolute top-0 right-0 p-4">
          <button className="text-[10px] bg-orange-600 px-4 py-2 uppercase font-bold tracking-wider hover:bg-orange-700 transition">Publish Changes</button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="border border-white/10 border-dashed p-10 text-center text-white/30">
      <Users className="w-12 h-12 mx-auto mb-6 opacity-30 stroke-[1]" />
      <p className="text-[10px] uppercase tracking-widest">Connects directly to Firebase Auth.</p>
      <p className="text-[10px] uppercase tracking-widest mt-2">Export CSV and Block operations mode.</p>
    </div>
  );
}

function EmergencyTab() {
  return (
    <div className="bg-red-950/30 border border-red-500/30 p-6">
      <h4 className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
        <span className="block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        Emergency Red Zone
      </h4>
      
      <div className="space-y-3">
        <button className="w-full py-4 border border-red-500/50 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition">
           Maintenance Mode
        </button>
        <button className="w-full py-4 border border-red-500/20 text-red-500/50 text-[10px] font-bold uppercase tracking-widest hover:border-red-500/50 hover:text-red-500 transition">
           Global Purge
        </button>
      </div>
    </div>
  );
}
