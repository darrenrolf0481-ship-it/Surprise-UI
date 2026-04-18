import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export function CrystallineRadar({ data, size = 300 }: { data: number[], size?: number }) {
  // Use useMemo to avoid constant restyling
  const chartData = useMemo(() => [
    { subject: 'Axi-1', A: data[0] || 0 },
    { subject: 'Axi-2', A: data[1] || 0 },
    { subject: 'Axi-3', A: data[2] || 0 },
    { subject: 'Axi-4', A: data[3] || 0 },
    { subject: 'Axi-5', A: data[4] || 0 },
    { subject: 'Axi-6', A: data[5] || 0 },
  ], [data]);

  return (
    <div style={{ width: '100%', height: size, position: 'relative' }}>
      {/* 3D Star Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <svg viewBox="0 0 200 200" style={{ width: '65%', height: '65%', filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.5))'}}>
          {/* Backlit Glow */}
          <circle cx="100" cy="100" r="10" fill="#22d3ee" opacity="0.6" filter="blur(8px)"/>

          {/* Vertical points */}
          <polygon points="100,0 120,100 100,200 80,100" fill="url(#starVert1)" opacity="0.9"/>
          <polygon points="100,0 100,200 80,100" fill="url(#crystalHighlightLeft)" opacity="0.5"/>
          <polygon points="100,0 120,100 100,200 100,100" fill="url(#crystalHighlightRight)" opacity="0.4"/>
          
          {/* Diagonal Top-Right to Bottom-Left */}
          <polygon points="185,35 115,115 15,165 85,85" fill="url(#starDiag1)" opacity="0.9"/>
          <polygon points="185,35 15,165 85,85" fill="url(#crystalHighlightLeft)" opacity="0.5"/>
          <polygon points="185,35 115,115 15,165 100,100" fill="url(#crystalHighlightRight)" opacity="0.4"/>
          
          {/* Diagonal Top-Left to Bottom-Right */}
          <polygon points="15,35 85,115 185,165 115,85" fill="url(#starDiag2)" opacity="0.9"/>
          <polygon points="15,35 185,165 115,85" fill="url(#crystalHighlightLeft)" opacity="0.5"/>
          <polygon points="15,35 85,115 185,165 100,100" fill="url(#crystalHighlightRight)" opacity="0.4"/>
          
          {/* Central Bright Core */}
          <polygon points="100,60 115,100 100,140 85,100" fill="#fff" opacity="0.2" />
          <polygon points="140,75 110,110 60,125 90,90" fill="#fff" opacity="0.2" />
          <polygon points="60,75 90,110 140,125 110,90" fill="#fff" opacity="0.2" />
          <circle cx="100" cy="100" r="4" fill="#ffffff" filter="drop-shadow(0 0 8px #fff)"/>

          <defs>
            <linearGradient id="starVert1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="starDiag1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="starDiag2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="crystalHighlightLeft" x1="0" y1="0" x2="1" y2="0">
               <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
               <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0"/>
            </linearGradient>
            <linearGradient id="crystalHighlightRight" x1="0" y1="0" x2="1" y2="0">
               <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
               <stop offset="100%" stopColor="#000000" stopOpacity="0.0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#22d3ee" strokeOpacity={0.4} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff', fontSize: 13, fontFamily: 'monospace' }} />
          <Radar name="Phi" dataKey="A" stroke="#c084fc" strokeWidth={2} fill="url(#colorPhi)" fillOpacity={0.3} isAnimationActive={false} />
          <defs>
            <radialGradient id="colorPhi" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.0}/>
            </radialGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
