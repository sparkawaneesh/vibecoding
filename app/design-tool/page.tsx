'use client';

import { Canvas } from '@/components/design-tool/Canvas';
import { ColorPicker } from '@/components/design-tool/ColorPicker';
import { BrushSizeSlider } from '@/components/design-tool/BrushSizeSlider';
import { LayerPanel } from '@/components/design-tool/LayerPanel';
import { Toolbar } from '@/components/design-tool/Toolbar';

export default function DesignToolPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Design Tool</h1>
          <div className="flex items-center gap-4">
            <ColorPicker />
            <BrushSizeSlider />
          </div>
        </div>
        
        <Toolbar />
        
        <div className="flex-1 bg-background rounded-lg border shadow-sm">
          <Canvas />
        </div>
      </div>
      
      <LayerPanel />
    </div>
  );
} 