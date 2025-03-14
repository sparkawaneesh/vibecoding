import { Canvas, Image, filters } from 'fabric';
import { Element } from '@/lib/store/useDesignToolStore';

interface FabricElement extends Element {
  fabricObject: Image;
}

export const applyFilter = (
  element: FabricElement,
  filterType: string,
  options: any = {}
): void => {
  if (!element.fabricObject) return;
  
  const fabricObj = element.fabricObject;
  
  switch (filterType) {
    case 'grayscale':
      fabricObj.filters = [new filters.Grayscale()];
      break;
      
    case 'blur':
      fabricObj.filters = [new filters.Blur({
        blur: options.blur || 0.5
      })];
      break;
      
    case 'brightness':
      fabricObj.filters = [new filters.Brightness({
        brightness: options.brightness || 0.1
      })];
      break;
      
    case 'contrast':
      fabricObj.filters = [new filters.Contrast({
        contrast: options.contrast || 0.1
      })];
      break;
      
    case 'saturation':
      fabricObj.filters = [new filters.Saturation({
        saturation: options.saturation || 0.1
      })];
      break;
      
    case 'noise':
      fabricObj.filters = [new filters.Noise({
        noise: options.noise || 100
      })];
      break;
      
    case 'pixelate':
      fabricObj.filters = [new filters.Pixelate({
        blocksize: options.blocksize || 4
      })];
      break;
      
    case 'none':
      fabricObj.filters = [];
      break;
  }
  
  // Apply filters and re-render
  fabricObj.applyFilters();
  fabricObj.canvas?.renderAll();
}; 