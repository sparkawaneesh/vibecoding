import { Image } from 'fabric';
import { Element } from '@/lib/store/useDesignToolStore';

interface FabricElement extends Element {
  fabricObject: Image;
}

interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const cropImage = (
  element: FabricElement,
  cropRect: CropRect
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!element.fabricObject || !(element.fabricObject instanceof Image)) {
      reject(new Error('Element is not an image'));
      return;
    }

    const image = element.fabricObject;
    
    // Create temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    // Set temp canvas dimensions to crop rect
    tempCanvas.width = cropRect.width;
    tempCanvas.height = cropRect.height;
    
    // Draw portion of original image to temp canvas
    tempCtx.drawImage(
      image.getElement() as HTMLImageElement,
      cropRect.left,
      cropRect.top,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height
    );
    
    // Create new image from cropped canvas
    Image.fromURL(tempCanvas.toDataURL())
      .then((croppedImg) => {
        // Update original image object
        image.setElement(croppedImg.getElement());
        image.width = cropRect.width;
        image.height = cropRect.height;
        image.setCoords();
        
        // Update element properties
        element.width = cropRect.width;
        element.height = cropRect.height;
        
        // Re-render canvas
        image.canvas?.renderAll();
        resolve();
      })
      .catch(reject);
  });
}; 