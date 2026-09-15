import React from 'react';

interface TylLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtext?: string;
  className?: string;
}

export const TylLogo: React.FC<TylLogoProps> = ({
  size = 'md',
  showText = true,
  subtext = 'Empowered by Innovation',
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-black',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Faceted Origami Geometric Emblem */}
      <div className={`relative shrink-0 ${iconDimensions} flex items-center justify-center transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 500 420"
          className="w-full h-full drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Left Wing Gradients */}
            <linearGradient id="tyl-l-top" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FF3823" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#FFA800" />
            </linearGradient>

            <linearGradient id="tyl-l-mid" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="45%" stopColor="#FF9800" />
              <stop offset="100%" stopColor="#FFD600" />
            </linearGradient>

            <linearGradient id="tyl-l-lower" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D81B60" />
              <stop offset="60%" stopColor="#E91E63" />
              <stop offset="100%" stopColor="#FF1744" />
            </linearGradient>

            <linearGradient id="tyl-l-tip" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#AD1457" />
              <stop offset="100%" stopColor="#D81B60" />
            </linearGradient>

            {/* Right Wing Gradients */}
            <linearGradient id="tyl-r-top" x1="100%" y1="0%" x2="0%" y2="80%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="55%" stopColor="#00A2FF" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>

            <linearGradient id="tyl-r-mid" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0091EA" />
              <stop offset="50%" stopColor="#2979FF" />
              <stop offset="100%" stopColor="#3D5AFE" />
            </linearGradient>

            <linearGradient id="tyl-r-lower" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#651FFF" />
              <stop offset="60%" stopColor="#7C4DFF" />
              <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>

            <linearGradient id="tyl-r-tip" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#4A148C" />
              <stop offset="100%" stopColor="#7B1FA2" />
            </linearGradient>
          </defs>

          {/* LEFT WING POLYGONS */}
          <g>
            {/* Top apex triangle */}
            <polygon points="40,20 244,124 165,195" fill="url(#tyl-l-top)" />
            <polygon points="40,20 165,195 175,135" fill="#FF4500" opacity="0.85" />

            {/* Mid-inner golden facet */}
            <polygon points="165,195 244,124 244,285 175,240" fill="url(#tyl-l-mid)" />

            {/* Lower magenta/crimson facet */}
            <polygon points="165,195 175,240 175,310 185,325 175,240" fill="#C2185B" opacity="0.9" />
            <polygon points="175,240 244,285 244,395 185,310" fill="url(#tyl-l-lower)" />
            <polygon points="185,310 244,395 244,405 180,315" fill="url(#tyl-l-tip)" />
          </g>

          {/* RIGHT WING POLYGONS */}
          <g>
            {/* Top apex triangle */}
            <polygon points="460,20 256,124 335,195" fill="url(#tyl-r-top)" />
            <polygon points="460,20 335,195 325,135" fill="#0091EA" opacity="0.85" />

            {/* Mid-inner azure facet */}
            <polygon points="335,195 256,124 256,285 325,240" fill="url(#tyl-r-mid)" />

            {/* Lower violet/purple facet */}
            <polygon points="335,195 325,240 325,310 315,325 325,240" fill="#651FFF" opacity="0.9" />
            <polygon points="325,240 256,285 256,395 315,310" fill="url(#tyl-r-lower)" />
            <polygon points="315,310 256,395 256,405 320,315" fill="url(#tyl-r-tip)" />
          </g>
        </svg>
      </div>

      {/* Brand Text Branding */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5">
            <span className={`${titleSize} text-white tracking-tight leading-none font-bold`}>
              TYL Traffic
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              PRO
            </span>
          </div>
          {subtext && (
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase leading-tight mt-0.5">
              Techyard Labs • {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
