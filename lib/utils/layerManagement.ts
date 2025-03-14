import { Object as FabricObject, Canvas } from 'fabric';
import { Element } from '@/lib/store/useDesignToolStore';

interface FabricElement extends Element {
  fabricObject: FabricObject;
  visible?: boolean;
  locked?: boolean;
}

export const toggleLayerVisibility = (
  element: FabricElement,
  visible?: boolean
): void => {
  if (!element.fabricObject) return;
  
  // If visible is provided, use it; otherwise toggle current state
  const newVisibility = visible !== undefined ? visible : !element.fabricObject.visible;
  
  element.fabricObject.visible = newVisibility;
  element.visible = newVisibility;
  
  // Re-render canvas
  element.fabricObject.canvas?.renderAll();
};

export const toggleLayerLock = (
  element: FabricElement,
  locked?: boolean
): void => {
  if (!element.fabricObject) return;
  
  // If locked is provided, use it; otherwise toggle current state
  const newLockState = locked !== undefined ? locked : !element.fabricObject.lockMovementX;
  
  // Lock all movement and controls
  element.fabricObject.lockMovementX = newLockState;
  element.fabricObject.lockMovementY = newLockState;
  element.fabricObject.lockRotation = newLockState;
  element.fabricObject.lockScalingX = newLockState;
  element.fabricObject.lockScalingY = newLockState;
  element.fabricObject.hasControls = !newLockState;
  element.fabricObject.selectable = !newLockState;
  
  element.locked = newLockState;
  
  // Re-render canvas
  element.fabricObject.canvas?.renderAll();
};

export const updateLayerOrder = (
  element: FabricElement,
  moveUp: boolean
): void => {
  if (!element.fabricObject || !element.fabricObject.canvas) return;
  
  const canvas = element.fabricObject.canvas;
  const objects = canvas.getObjects();
  const currentIndex = objects.indexOf(element.fabricObject);
  
  if (moveUp) {
    // Move layer up (increase z-index)
    if (currentIndex < objects.length - 1) {
      // Swap with the next object
      const nextIndex = currentIndex + 1;
      objects[currentIndex] = objects[nextIndex];
      objects[nextIndex] = element.fabricObject;
    }
  } else {
    // Move layer down (decrease z-index)
    if (currentIndex > 0) {
      // Swap with the previous object
      const prevIndex = currentIndex - 1;
      objects[currentIndex] = objects[prevIndex];
      objects[prevIndex] = element.fabricObject;
    }
  }
  
  canvas.renderAll();
}; 