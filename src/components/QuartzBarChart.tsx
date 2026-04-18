import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CrystalBar = (props: any) => {
  const { fill, x, y, width, height, value } = props;
  if (!y || height < 10) return null;
  
  const peakY = y;
  const shoulderY = y + 20;
  const bottomY = y + height;
  const midX = x + width / 2;
  const leftX = x;
  const rightX = x + width;

  return (
    <g>
      {/* Background glow stem */}
      <rect x={midX - 6} y={peakY} width={12} height={height} fill="#c084fc" opacity={0.6} filter="blur(8px)" />
      
      {/* Left Face */}
      <path 
        d={`M ${leftX},${bottomY} L ${leftX},${shoulderY} L ${midX},${peakY} L ${midX},${bottomY} Z`} 
        fill="url(#crystalLeft)" 
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeOpacity={0.5}
      />
      {/* Right Face */}
      <path 
        d={`M ${midX},${bottomY} L ${midX},${peakY} L ${rightX},${shoulderY} L ${rightX},${bottomY} Z`} 
        fill="url(#crystalRight)" 
        stroke="#ffffff"
        strokeWidth={0.5}
        strokeOpacity={0.2}
      />
      
      {/* Inner highlight lines for realism */}
      <path d={`M ${midX},${peakY} L ${midX},${bottomY}`} stroke="#ffffff" strokeWidth={2} strokeOpacity={0.7} />
      <path d={`M ${leftX},${shoulderY} L ${midX},${peakY} L ${rightX},${shoulderY}`} stroke="#22d3ee" strokeWidth={1.5} strokeOpacity={0.9} />
      
      {/* Top Facet Glare */}
      <polygon points={`${leftX},${shoulderY} ${midX},${peakY} ${midX},${peakY+15} ${leftX},${shoulderY+15}`} fill="#ffffff" opacity={0.15} />

      {/* Value text floating above */}
      <text x={midX} y={peakY - 15} fill="#ffffff" fontSize={12} fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity={0.9} filter="drop-shadow(0 0 5px #c084fc)">
        v-{value.toFixed(3)}
      </text>
    </g>
  );
};

export function QuartzBarChart({ data, height = 220, width }: { data: any[], height?: number, width?: number | string }) {
  return (
    <div style={{ width: width || '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 35, right: 15, left: 15, bottom: 0 }}>
          <XAxis dataKey="label" stroke="#fff" fontSize={16} fontFamily="monospace" tickLine={false} axisLine={{stroke: 'rgba(255,255,255,0.2)'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid rgba(34,211,238,0.5)', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }} 
            itemStyle={{ color: '#c084fc' }}
            cursor={{ fill: 'rgba(34,211,238,0.1)' }}
          />
          <Bar dataKey="value" shape={<CrystalBar />} isAnimationActive={false} />
          <defs>
            <linearGradient id="crystalLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="crystalRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6}/>
              <stop offset="100%" stopColor="#0a0a2a" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
