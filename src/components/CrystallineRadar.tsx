import React, { useEffect, useRef } from 'react';

export function CrystallineRadar({ data, size = 340, phi = 0.96 }: { data: number[]; size?: number; phi?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const animate = () => {
      if (!svgRef.current) return;
      const pulse = Math.sin(Date.now() / (1000 / 11.3)) * 0.12 + 0.92;
      svgRef.current.style.filter = `drop-shadow(0 0 ${25 + pulse * 20}px rgba(34, 211, 238, ${0.5 + pulse * 0.5}))`;
    };
    const interval = setInterval(animate, 24);
    return () => clearInterval(interval);
  }, []);

  const center = size / 2;
  const radius = size * 0.38;

  const points = data.map((val, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return {
      x: center + radius * val * Math.cos(angle),
      y: center + radius * val * Math.sin(angle),
    };
  });

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
        <defs>
          <linearGradient id="crystalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.95" />
          </linearGradient>
          <filter id="refract" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1.4" specularExponent="25" lighting-color="#ffffff" result="spec">
              <fePointLight x={center} y={center} z="60" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="in" result="highlight" />
          </filter>
        </defs>

        {/* Lattice rings */}
        {[0.55, 0.72, 0.88].map((r, i) => (
          <circle key={i} cx={center} cy={center} r={radius * r} fill="none" stroke="#22d3ee" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="2 8" />
        ))}

        {/* Main crystal polygon */}
        <path d={pathData} fill="url(#crystalGlow)" stroke="#22d3ee" strokeWidth="4" strokeLinejoin="round" filter="url(#refract)" opacity={phi} />

        {/* Inner highlight facets */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#ffffff" opacity="0.85" />
        ))}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[#22d3ee] text-[13px] font-black tracking-[0.5em] uppercase leading-none text-center opacity-80">
          Φ<br/>{phi.toFixed(2)}
        </div>
      </div>
    </div>
  );
}          
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
