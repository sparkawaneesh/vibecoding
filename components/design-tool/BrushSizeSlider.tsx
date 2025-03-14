import React from 'react';
import { useDesignToolStore } from '@/lib/store/useDesignToolStore';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface BrushSizeSliderProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export const BrushSizeSlider: React.FC<BrushSizeSliderProps> = ({
  defaultValue = 1,
  min = 1,
  max = 50,
  step = 1
}) => {
  const { brushSize, setBrushSize } = useDesignToolStore();

  return (
    <div className="grid gap-2 min-w-[200px]">
      <div className="flex items-center justify-between">
        <Label htmlFor="brush-size">Brush Size</Label>
        <span className="text-sm text-muted-foreground">
          {brushSize}px
        </span>
      </div>
      <Slider
        id="brush-size"
        defaultValue={[defaultValue]}
        value={[brushSize]}
        onValueChange={([value]) => setBrushSize(value)}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />
    </div>
  );
}; 