import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn } from 'lucide-react';

export default function LoginScreen() {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full text-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-6xl font-light tracking-tighter uppercase leading-none">SmartBill <span className="text-orange-600 italic">AI</span></h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Production Environment</p>
        </div>
        
        <div className="pt-8 w-full max-w-xs mx-auto">
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-colors py-4 px-6 text-xs font-bold uppercase tracking-wider"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-6">{error}</p>
        )}

        <div className="pt-20 text-[10px] text-white/20 uppercase tracking-widest hover:text-white/60 cursor-pointer transition-colors" onDoubleClick={() => window.location.href='/admin'}>
          v1.0.0 (Double tap for admin)
        </div>
      </div>
    </div>
  );
}
