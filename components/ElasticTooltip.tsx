import React, { useEffect, useRef } from 'react';

interface ElasticTooltipProps {
  colorName: string;
  colorHex: string;
  colorId: number;
  isHovered: boolean;
}

const ElasticTooltip: React.FC<ElasticTooltipProps> = ({
  colorName,
  colorHex,
  colorId,
  isHovered,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;

    if (isHovered) {
      // Show and animate entrance with more elastic bounce
      tooltip.style.display = 'flex';
      tooltip.style.transition = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(-50%) translateX(-30px) scale(0.5) rotate(-8deg)';

      animationRef.current = requestAnimationFrame(() => {
        tooltip.style.transition = 'all 1.5s cubic-bezier(0.18, 1.25, 0.4, 1)';
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-50%) translateX(0) scale(1) rotate(0deg)';
      });
    } else {
      // Fade out with spring
      tooltip.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(-50%) translateX(-20px) scale(0.6) rotate(-5deg)';

      const timeout = setTimeout(() => {
        tooltip.style.display = 'none';
      }, 400);

      return () => clearTimeout(timeout);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .gradient-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(34, 211, 238, 0.7) 25%,
            rgba(16, 185, 129, 0.7) 50%,
            rgba(34, 211, 238, 0.7) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={tooltipRef}
        className="absolute -top-8 left-[90%] ml-4 flex-col items-start justify-center rounded-xl bg-gradient-to-br from-gray-900 to-black z-50 px-4 py-3 min-w-28 pointer-events-none border border-gray-800"
        style={{
          display: 'none',
          opacity: 0,
          transform: 'translateY(-50%)',
        }}
      >
        {/* Animated gradient shimmer lines */}
        <div className="absolute inset-x-0 -bottom-px h-px gradient-shimmer" />
        <div className={`absolute left-0 right-0 top-0 h-px bg-[${colorHex}]  opacity-50`} />

        {/* Left arrow pointer */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2"
          style={{
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid rgb(17, 24, 39)',
          }}
        />

        {/* Color name */}
        <div className="font-bold text-white relative z-30 text-sm tracking-wide">
          {colorName}
        </div>

        {/* Color hex code */}
        <div className="text-gray-400 text-xs font-mono mt-0.5 tracking-wider">
          {colorHex}
        </div>
      </div>
    </>
  );
};

export default ElasticTooltip;