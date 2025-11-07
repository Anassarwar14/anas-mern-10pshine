import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ElasticTooltipProps {
  colorName: string;
  colorHex: string;
  colorId: number;
  isHovered: boolean;
  triggerRef: React.RefObject<HTMLElement | null>; // Reference to the element triggering the tooltip
}

const ElasticTooltip: React.FC<ElasticTooltipProps> = ({
  colorName,
  colorHex,
  colorId,
  isHovered,
  triggerRef,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 16, // 16px offset (ml-4)
      });
    };

    updatePosition();

    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [triggerRef, isHovered]);

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;

    if (isHovered) {
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

  if (!mounted) return null;

  return createPortal(
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
        className="fixed flex-col items-start justify-center rounded-xl bg-gradient-to-br from-gray-900 to-black z-[9999] px-4 py-3 min-w-28 pointer-events-none border border-gray-800"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          display: 'none',
          opacity: 0,
          transform: 'translateY(-50%)',
        }}
      >
        {/* Animated gradient shimmer lines */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-px gradient-shimmer" />
          <div className="absolute inset-x-0 top-0 h-px gradient-shimmer" />
        </div>
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
    </>,
    document.body
  );
};

export default ElasticTooltip;