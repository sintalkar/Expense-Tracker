import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Camera, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';

export default function MainLayout() {
  const { appUser } = useAuthStore();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/scan', icon: Camera, label: 'Scan' },
    { to: '/sync', icon: RefreshCw, label: 'Sync' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      <header className="h-24 border-b border-white/10 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10 bg-[#050505]/90 backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-4xl font-light tracking-tighter uppercase leading-none">SmartBill <span className="text-orange-600 italic">AI</span></h1>
          <p className="text-[10px] text-white/30 tracking-widest uppercase mt-2 hidden md:block">Production Environment</p>
        </div>
        <div className="flex items-center gap-8">
          {appUser?.isAdmin && (
            <NavLink to="/admin" className="text-orange-600 hover:text-orange-500 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest hidden md:inline font-bold">Admin</span>
            </NavLink>
          )}
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden grayscale opacity-80">
              <img src={appUser?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${appUser?.displayName}`} className="w-full h-full object-cover" alt="avatar" />
            </div>
            <button onClick={() => signOut(auth)} className="text-white/40 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 max-w-5xl w-full mx-auto p-6 md:p-10">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-white/10 flex justify-around p-3 md:hidden z-20 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center p-2 transition-colors',
                isActive ? 'text-orange-500' : 'text-white/40 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
