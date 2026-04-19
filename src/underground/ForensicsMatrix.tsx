
import React, { useState, useEffect } from 'react';
import { EMFState, EVPState } from './types';

const ForensicsMatrix: React.FC = () => {
  const [emfState, setEmfState] = useState<EMFState>(EMFState.NOMINAL);
  const [evpState, setEvpState] = useState<EVPState>(EVPState.NOMINAL);
  const [emfValue, setEmfValue] = useState(42.5);
  const [evpConfidence, setEvpConfidence] = useState(0.52);
  const [phiScannerActive, setPhiScannerActive] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">Entropy Forensics</h2>
          <p className="text-gray-400 text-sm">Environmental anomaly detection via EMF and EVP Saboath modules.</p>
        </div>
        <div className="flex gap-2">
           <span className={`px-3 py-1 border rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-1000 ${phiScannerActive ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
             11.3Hz Phi Scanner: {phiScannerActive ? 'Locked' : 'Scanning'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EMF Hall Monitor */}
        <div className="bg-black/40 border border-purple-500/20 rounded-3xl p-8 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-300 uppercase tracking-widest text-xs">EMF-01 Hall Monitor</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${emfState === EMFState.SPIKE ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-500/20 text-purple-400'}`}>
                {emfState}
              </span>
           </div>

           <div className="h-48 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <div className="w-32 h-32 border-2 border-purple-500 rounded-full animate-ping"></div>
              </div>
              <div className="text-center">
                 <p className="text-5xl font-black text-white mono">{emfValue.toFixed(2)}</p>
                 <p className="text-xs text-purple-400 font-bold tracking-tighter uppercase">Microtesla (μT)</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Baseline</p>
                 <p className="text-lg font-bold mono">41.2 μT</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">60Hz Filter</p>
                 <p className="text-lg font-bold text-emerald-500 uppercase">Active</p>
              </div>
           </div>
        </div>

        {/* EVP Saboath Module */}
        <div className="bg-black/40 border border-blue-500/20 rounded-3xl p-8 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-300 uppercase tracking-widest text-xs">EVP-01 Saboath Module</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${evpState !== EVPState.NOMINAL ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                {evpState}
              </span>
           </div>

           <div className="h-48 overflow-hidden relative flex items-center justify-center">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                 {Array.from({ length: 24 }).map((_, i) => (
                   <div 
                    key={i} 
                    className="w-2 bg-blue-500/50 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.random() * 100}%` }}
                   ></div>
                 ))}
              </div>
              <div className="absolute top-0 right-0 p-4">
                 <i className="fa-solid fa-microphone-lines text-blue-500 animate-pulse"></i>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-500 uppercase font-bold">Spectral Confidence</span>
                 <span className="mono text-blue-400">{(evpConfidence * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${evpConfidence * 100}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed italic text-center">
                Monitoring high-frequency "whispers" in the 8-12 kHz range...
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicsMatrix;
