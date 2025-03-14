import React from 'react';
import { useDesignToolStore } from '@/store/useDesignToolStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
  '#808080', // Gray
];

export const ColorPicker: React.FC = () => {
  const { currentColor, setCurrentColor } = useDesignToolStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[4rem] h-[2.5rem] p-1"
        >
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: currentColor }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Color</h4>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-[4rem] h-[2.5rem] p-1"
              />
              <Input
                type="text"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-md border-2 ${
                    color === currentColor ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 