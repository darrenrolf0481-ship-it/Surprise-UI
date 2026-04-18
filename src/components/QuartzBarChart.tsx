import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

export function QuartzBarChart({ data, height = 280 }: { data: any[]; height?: number }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
          <XAxis dataKey="label" stroke="#ffffff" fontSize={13} fontFamily="monospace" tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.15)' }} />
          <Bar dataKey="value" shape={(props: any) => {
            const { x, y, width, height: h, value } = props;
            const midX = x + width / 2;
            return (
              <g>
                {/* Glow stem */}
                <rect x={midX - 8} y={y} width="16" height={h} fill="#c084fc" opacity="0.4" filter="blur(12px)" />
                {/* Left crystal face */}
                <path d={`M ${x},${y + h} L ${x},${y + 22} L ${midX},${y} L ${midX},${y + h} Z`} fill="#c084fc" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.6" />
                {/* Right crystal face */}
                <path d={`M ${midX},${y + h} L ${midX},${y} L ${x + width},${y + 22} L ${x + width},${y + h} Z`} fill="#22d3ee" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
                {/* Top facet glare */}
                <polygon points={`${x},${y + 22} ${midX},${y} ${x + width},${y + 22}`} fill="#ffffff" opacity="0.35" />
                {/* Value label */}
                <text x={midX} y={y - 12} fill="#ffffff" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="700" opacity="0.95">{value.toFixed(3)}</text>
              </g>
            );
          }} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}              <stop offset="100%" stopColor="#0a0a2a" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
