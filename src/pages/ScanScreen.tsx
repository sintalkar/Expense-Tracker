import React, { useState, useRef } from 'react';
import { Camera, ImageIcon, CheckCircle, Save } from 'lucide-react';
import { parseReceipt } from '../lib/gemini';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export default function ScanScreen() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setStatus('idle');
      setResult(null);
    }
  };

  const scanReceipt = async () => {
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');
    
    try {
      // Allow overriding prompt from firestore, but fallback to default
      let promptText = `You are a receipt parser. Extract all line items from this receipt image. 
      Return ONLY valid JSON in this exact schema: 
      { "merchant": "string", "date": "YYYY-MM-DD", "total": number, "currency": "USD", "items": [ { "name": "string", "qty": number, "price": number, "category": "food|grocery|travel|subscription|trading|savings|others" } ], "dominantCategory": "food|grocery|travel|subscription|trading|savings|others" }`;
      
      try {
        const promptDoc = await getDoc(doc(db, 'admin_configs', 'ai_prompts'));
        if (promptDoc.exists() && promptDoc.data().receipt_parser) {
          promptText = promptDoc.data().receipt_parser;
        }
      } catch (e) {
        // ignore config fetch error, use default
      }
      
      const pResult = await parseReceipt(file, promptText);
      setResult(pResult);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse image');
      setStatus('error');
    }
  };

  const saveReceipt = async () => {
    if (!result || !user) return;
    
    try {
      const receiptId = Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'receipts', receiptId), {
        ...result,
        userId: user.uid,
        scannedAt: Date.now(),
        isSynced: false
      });
      
      // Reset
      setFile(null);
      setPreviewUrl(null);
      setResult(null);
      setStatus('idle');
      alert("Receipt saved successfully!");
    } catch (err: any) {
      alert("Failed to save receipt: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-10 border border-white/10 border-dashed bg-white/5 transition-colors hover:border-orange-500/50">
        {previewUrl ? (
          <div className="relative w-full max-w-sm rounded border border-white/10 overflow-hidden shadow-sm">
            <img src={previewUrl} alt="Receipt preview" className="w-full object-cover grayscale opacity-90" />
            <button 
              onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); setStatus('idle'); }}
              className="absolute top-2 right-2 bg-[#050505]/80 text-white p-2 text-xs backdrop-blur-sm hover:text-orange-500"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-white/20 mb-4 inline-block">
              <Camera className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/60">Upload a Receipt</h3>
            <p className="text-xs text-white/30 mt-2 max-w-xs mx-auto">Take a clear picture of your bill or upload an existing image</p>
            
            <div className="mt-8 flex gap-3 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2 hover:bg-white/20 text-xs font-bold uppercase tracking-widest transition"
              >
                <ImageIcon className="w-4 h-4" /> Browse
              </button>
            </div>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
      </div>

      {previewUrl && status === 'idle' && (
        <button 
          onClick={scanReceipt}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white p-4 text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition"
        >
          <Camera className="w-5 h-5" /> Scan with AI
        </button>
      )}

      {status === 'loading' && (
        <div className="p-10 text-center flex flex-col items-center space-y-6 bg-white/5 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-pulse"></div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-[10px] text-white/60 uppercase tracking-widest font-mono">Gemini Flash-1.5 scanning receipt...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-950/30 text-red-500 border border-red-500/30 text-center">
          <p className="text-xs uppercase tracking-wider font-mono mb-6">{errorMsg}</p>
          <button onClick={scanReceipt} className="border border-red-500/50 text-red-500 px-6 py-2 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition">Retry Scan</button>
        </div>
      )}

      {status === 'success' && result && (
        <div className="bg-white/5 p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="text-orange-500">
              <CheckCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-2xl font-light tracking-tighter uppercase text-white">{result.merchant}</h3>
              <p className="text-[10px] text-white/40 font-mono tracking-widest mt-1">{result.date} // {result.dominantCategory}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-4">Line Items</h4>
            {result.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <p className="font-mono text-sm text-white/80">{item.name}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{item.qty} × {result.currency} {item.price}</p>
                </div>
                <div className="font-mono text-white">
                  {result.currency} {(item.qty * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Total</span>
            <span className="font-mono text-2xl text-orange-500">{result.currency} {result.total?.toFixed(2)}</span>
          </div>

          <button 
            onClick={saveReceipt}
            className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white p-4 text-xs font-bold uppercase tracking-wider hover:bg-white/20 mt-8 transition"
          >
            <Save className="w-4 h-4" /> Save Receipt
          </button>
        </div>
      )}
    </div>
  );
}
