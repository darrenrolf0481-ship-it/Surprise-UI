import React, { useEffect, useRef } from 'react';

function CrystallineRadar({ data, size = 340, phi = 0.96 }: { data: number[]; size?: number; phi?: number }) {
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

export default CrystallineRadar;
