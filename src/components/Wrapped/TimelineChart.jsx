import React, { useState, useEffect } from 'react';

export default function TimelineChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) return null;

  const width = 400;
  const height = 180;
  const paddingX = 20;
  const paddingYTop = 30;
  const paddingYBottom = 30;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingYTop - paddingYBottom;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const minCount = 0;

  const getX = (index) => paddingX + (index / Math.max(1, data.length - 1)) * graphWidth;
  const getY = (count) => height - paddingYBottom - ((count - minCount) / (maxCount - minCount)) * graphHeight;

  let pathData = `M ${getX(0)} ${getY(data[0].count)}`;
  data.forEach((d, i) => {
    if (i > 0) {
      pathData += ` L ${getX(i)} ${getY(d.count)}`;
    }
  });

  const fillPathData = `${pathData} L ${getX(data.length - 1)} ${height - paddingYBottom} L ${paddingX} ${height - paddingYBottom} Z`;

  const formatMonth = (str) => {
    const parts = str.split('-');
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
    return str;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="timeline-chart" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.8)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Animated Fill Area */}
        <path 
          d={fillPathData} 
          fill="url(#chartGradient)" 
          style={{ 
            opacity: drawn ? 1 : 0, 
            transition: 'opacity 1s ease-in-out' 
          }} 
        />
        
        {/* Main Line */}
        <path 
          d={pathData} 
          fill="none" 
          stroke="#000" 
          strokeWidth="5" 
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: drawn ? 0 : 2000,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        />
        
        {/* X-axis labels */}
        {data.map((d, i) => {
          const totalPoints = data.length;
          const step = Math.ceil(totalPoints / 5);
          if (i === 0 || i === totalPoints - 1 || i % step === 0) {
            return (
              <text 
                key={`label-${i}`} 
                x={getX(i)} 
                y={height - 5} 
                fill="#000" 
                fontSize="12" 
                fontWeight="900"
                textAnchor={i === 0 ? "start" : i === totalPoints - 1 ? "end" : "middle"}
                style={{ opacity: drawn ? 0.8 : 0, transition: 'opacity 0.5s ease 1s' }}
              >
                {formatMonth(d.month)}
              </text>
            );
          }
          return null;
        })}

        {/* Hover points */}
        {data.map((d, i) => (
          <g 
            key={`point-${i}`}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Invisible larger circle for easier hovering */}
            <circle cx={getX(i)} cy={getY(d.count)} r="20" fill="transparent" />
            
            <circle 
              cx={getX(i)} 
              cy={getY(d.count)} 
              r={hoverIndex === i ? "8" : "4"} 
              fill={hoverIndex === i ? "#1ED760" : "#000"}
              stroke="#000"
              strokeWidth={hoverIndex === i ? "3" : "0"}
              style={{ 
                opacity: drawn ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: `${getX(i)}px ${getY(d.count)}px`,
                transform: hoverIndex === i ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Tooltip HTML */}
      {hoverIndex !== null && (
        <div 
          style={{
            position: 'absolute',
            left: `${(getX(hoverIndex) / width) * 100}%`,
            top: `${(getY(data[hoverIndex].count) / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: '#000',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '1rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontWeight: 800,
            animation: 'modal-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>
            {formatMonth(data[hoverIndex].month)}
          </div>
          <div style={{ fontSize: '1.2rem', color: '#1ED760' }}>
            {data[hoverIndex].count.toLocaleString()} <span style={{ color: '#fff', fontSize: '0.9rem' }}>MSGS</span>
          </div>
        </div>
      )}
    </div>
  );
}
