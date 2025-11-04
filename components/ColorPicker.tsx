import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorButton from './ColorButton';

type Color = { id: number; color: string; name: string };

interface ColorPickerProps {
  colors?: Color[];
  showColorPicker: boolean;
  setShowColorPicker: (value: boolean) => void;
  handleNewNote?: (color: string, folderId?: number) => void;
  horizontal?: boolean 
  folderId?: number | null
}

const defaultColors: Color[] = [
  { id: 1, color: '#FFE28A', name: 'Soft Gold' },     // warm + cheerful
  { id: 2, color: '#FFB5A7', name: 'Peach Coral' },   // friendly + comforting
  { id: 3, color: '#CDB4DB', name: 'Lilac Mist' },    // calm + creative
  { id: 4, color: '#A0E7E5', name: 'Aqua Glow' },     // fresh + modern
  { id: 5, color: '#B9FBC0', name: 'Mint Leaf' },     // natural + balanced
];


const ColorPicker: React.FC<ColorPickerProps> = ({
  colors = defaultColors,
  showColorPicker,
  setShowColorPicker,
  handleNewNote,
  horizontal,
  folderId
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColorId, setHoveredColorId] = useState<number | null>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (handleNewNote){
      if(folderId){
        handleNewNote(color, folderId);
      }
      else{
        handleNewNote(color);
      }
    } 
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

      <div className={`flex flex-col items-center gap-1 ${horizontal && showColorPicker && 'animate-in slide-in-from-left duration-200'}`}>
        <div className="w-full relative z-20">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`${horizontal ? 'p-2' : 'p-3'} w-full flex items-center justify-center rounded-full hover:bg-rose-600 bg-black text-white cursor-pointer transition-all shadow-md hover:shadow-lg font-medium group duration-300`}
          >
            <Plus
              className={`
              ${!showColorPicker ? 'rotate-0' : 'rotate-[135deg]'} 
                w-5 h-5 transition-transform duration-300`}
            />
          </button>
        </div>

        {showColorPicker && (
          <div className={`flex ${horizontal ? 'flex-row -ml-1' : 'flex-col -mt-1'} items-center z-10 gooey`}>
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