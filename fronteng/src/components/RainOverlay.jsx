import React from "react";

export default function RainOverlay({ className = "" }) {
  return (
    <div className={`${className} pointer-events-none`} aria-hidden="true">
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="rainGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>

          <filter id="dropBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feBlend in="SourceGraphic" in2="b" mode="normal" />
          </filter>
        </defs>

        {/* subtle overlay tint */}
        <rect width="100%" height="100%" fill="url(#rainGrad)" />

        {/* raindrops */}
        <g
          className="raindrops"
          stroke="rgba(30,60,90,0.65)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#dropBlur)"
        >
          <line x1="120" y1="40" x2="120" y2="110" className="d1" />
          <line x1="220" y1="10" x2="220" y2="80" className="d2" />
          <line x1="320" y1="30" x2="320" y2="100" className="d3" />
          <line x1="420" y1="20" x2="420" y2="90" className="d4" />
          <line x1="520" y1="5"  x2="520" y2="75" className="d5" />
          <line x1="640" y1="35" x2="640" y2="105" className="d6" />
        </g>

        {/* lightning bolt */}
        <g className="lightning" transform="translate(560,40) scale(0.9)">
          <polygon
            points="20,0 40,30 28,30 50,80 18,50 30,50"
            fill="rgba(255,240,180,0.98)"
          />
        </g>
      </svg>

      <style>{`
        .raindrops line {
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
          animation: rainDrop 1.0s linear infinite;
        }
        .raindrops .d1 { animation-delay: 0s; }
        .raindrops .d2 { animation-delay: 0.15s; }
        .raindrops .d3 { animation-delay: 0.30s; }
        .raindrops .d4 { animation-delay: 0.45s; }
        .raindrops .d5 { animation-delay: 0.60s; }
        .raindrops .d6 { animation-delay: 0.75s; }

        @keyframes rainDrop {
          0%   { opacity: 0; transform: translateY(-6px) scaleY(0.88); }
          10%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(28px) scaleY(1.12); }
        }

        .lightning {
          opacity: 0;
          animation: flash 4.6s linear infinite;
          filter: drop-shadow(0 0 6px rgba(255,240,180,0.6));
        }
        @keyframes flash {
          0%, 82%  { opacity: 0; }
          83%      { opacity: 1; }
          86%      { opacity: 0.9; }
          88%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
