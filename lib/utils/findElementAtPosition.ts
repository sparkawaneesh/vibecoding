import { Element, Point } from '@/lib/store/useDesignToolStore';

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const findElementAtPosition = (
  x: number,
  y: number,
  elements: Element[]
): Element | null => {
  // Search from top to bottom (last element is on top)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    
    // Get element bounds
    const bounds: ElementBounds = {
      x: element.x,
      y: element.y,
      width: element.width || 100,
      height: element.height || 100
    };
    
    switch (element.type) {
      case 'circle':
        const radius = bounds.width / 2;
        const centerX = bounds.x + radius;
        const centerY = bounds.y + radius;
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (distance <= radius) {
          return element;
        }
        break;
        
      case 'pencil':
        if (element.points && element.points.length > 1) {
          // Check if point is near any point in the path
          for (let j = 0; j < element.points.length - 1; j++) {
            const p1 = element.points[j];
            const p2 = element.points[j + 1];
            const distance = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < 5) { // 5px threshold
              return element;
            }
          }
        }
        break;
        
      default:
        // Rectangle, text, and image use bounding box
        if (
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        ) {
          return element;
        }
    }
  }
  
  return null;
};

// Helper function to calculate distance from point to line segment
const distanceToLineSegment = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}; 