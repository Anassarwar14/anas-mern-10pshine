import { useRef } from 'react';
import ElasticTooltip from './ElasticTooltip';

type Color = { id: number; color: string; name: string };

interface ColorButtonProps {
  colorItem: Color;
  index: number;
  hoveredColorId: number | null;
  setHoveredColorId: (id: number | null) => void;
  handleColorSelect: (color: string) => void;
}

const ColorButton: React.FC<ColorButtonProps> = ({
  colorItem,
  index,
  hoveredColorId,
  setHoveredColorId,
  handleColorSelect,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (hoveredColorId === colorItem.id && tooltipRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const halfHeight = rect.height / 2;
      const yOffset = offsetY - halfHeight;
      const rotate = (yOffset / halfHeight) * 8;
      const tilt = (yOffset / halfHeight) * 4;

      tooltipRef.current.style.transition = 'transform 0.8s cubic-bezier(0.18, 1.25, 0.4, 1)';
      tooltipRef.current.style.transform = `translateY(calc(-50% + ${tilt}px)) translateX(0) scale(1) rotate(${rotate}deg)`;
    }
  };

  return (
    <div className="relative flex flex-col items-center -mt-3">
      {/* Stretchy connecting neck */}
      <div
        className="w-3 rounded-full stretch-neck"
        style={{
          backgroundColor: colorItem.color,
          animationDelay: `${index * 0.08}s`,
          transformOrigin: 'top center',
        }}
      />

      {/* Color button with tooltip */}
      <div className="relative">
        <button
          onClick={() => handleColorSelect(colorItem.color)}
          onMouseEnter={() => setHoveredColorId(colorItem.id)}
          onMouseLeave={() => setHoveredColorId(null)}
          onMouseMove={handleMouseMove}
          className="relative w-11 h-11 rounded-full hover:ring-4 ring-white hover:scale-90 cursor-pointer cell-divide color-btn overflow-hidden transition-transform active:scale-90"
          style={{
            backgroundColor: colorItem.color,
            animationDelay: `${index * 0.08}s`,
            opacity: 0,
          }}
          aria-label={`Select ${colorItem.name}`}
        />

        <div ref={tooltipRef}>
          <ElasticTooltip
            colorName={colorItem.name}
            colorHex={colorItem.color}
            colorId={colorItem.id}
            isHovered={hoveredColorId === colorItem.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorButton;