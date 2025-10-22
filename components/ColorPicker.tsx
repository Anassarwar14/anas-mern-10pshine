import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorButton from './ColorButton';

type Color = { id: number; color: string; name: string };

interface ColorPickerProps {
  colors?: Color[];
  showColorPicker: boolean;
  setShowColorPicker: (value: boolean) => void;
  handleNewNote?: (color: string) => void;
}

const defaultColors: Color[] = [
  { id: 1, color: '#F6B44B', name: 'Gold' },
  { id: 2, color: '#F9936B', name: 'Coral' },
  { id: 3, color: '#A78BFA', name: 'Lavender' },
  { id: 4, color: '#22D3EE', name: 'Cyan' },
  { id: 5, color: '#A3E635', name: 'Lime' },
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors = defaultColors,
  showColorPicker,
  setShowColorPicker,
  handleNewNote,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColorId, setHoveredColorId] = useState<number | null>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (handleNewNote) handleNewNote(color);
    setShowColorPicker(false);
    setHoveredColorId(null);
  };

  return (
    <>
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex flex-col items-center gap-1">
        <div className="w-full relative z-20">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-center p-3 rounded-full hover:bg-rose-600 bg-black text-white cursor-pointer transition-all shadow-md hover:shadow-lg font-medium group duration-300 active:scale-95"
          >
            <Plus
              className={`${
                !showColorPicker ? 'rotate-0' : 'rotate-[135deg]'
              } w-5 h-5 transition-transform duration-300`}
            />
          </button>
        </div>

        {showColorPicker && (
          <div className="flex flex-col items-center -mt-1 z-10 gooey">
            {colors.map((colorItem, index) => (
              <ColorButton
                key={colorItem.id}
                colorItem={colorItem}
                index={index}
                hoveredColorId={hoveredColorId}
                setHoveredColorId={setHoveredColorId}
                handleColorSelect={handleColorSelect}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ColorPicker;