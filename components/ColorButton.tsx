import { useRef, useState } from 'react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (hoveredColorId === colorItem.id) {
      setMousePos({ x: event.clientX, y: event.clientY });
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

      {/* Color button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => handleColorSelect(colorItem.color)}
          onMouseEnter={() => setHoveredColorId(colorItem.id)}
          onMouseLeave={() => setHoveredColorId(null)}
          className="relative w-11 h-11 rounded-full hover:ring-4 ring-white hover:scale-90 cursor-pointer cell-divide color-btn overflow-hidden transition-transform active:scale-90"
          style={{
            backgroundColor: colorItem.color,
            animationDelay: `${index * 0.08}s`,
            opacity: 0,
          }}
          aria-label={`Select ${colorItem.name}`}
        />

        <ElasticTooltip
          colorName={colorItem.name}
          colorHex={colorItem.color}
          colorId={colorItem.id}
          isHovered={hoveredColorId === colorItem.id}
          triggerRef={buttonRef}
        />
      </div>
    </div>
  );
};

export default ColorButton;