import { Element, Connection } from '@/lib/store/useDesignToolStore';

interface Point {
  x: number;
  y: number;
}

export const calculateConnectionPath = (
  sourceElement: Element,
  targetElement: Element,
  connection: Connection
): string => {
  const sourceCenter = getElementCenter(sourceElement);
  const targetCenter = getElementCenter(targetElement);
  
  // Calculate control points for curved path
  const midX = (sourceCenter.x + targetCenter.x) / 2;
  const midY = (sourceCenter.y + targetCenter.y) / 2;
  
  // Add some curvature based on connection type
  const curvature = connection.type === 'hover' ? 30 : 50;
  const controlPoint1 = {
    x: midX + curvature,
    y: sourceCenter.y
  };
  const controlPoint2 = {
    x: midX - curvature,
    y: targetCenter.y
  };
  
  // Create SVG path
  return `M ${sourceCenter.x} ${sourceCenter.y} 
          C ${controlPoint1.x} ${controlPoint1.y},
            ${controlPoint2.x} ${controlPoint2.y},
            ${targetCenter.x} ${targetCenter.y}`;
};

const getElementCenter = (element: Element): Point => {
  const width = element.width || 100;
  const height = element.height || 100;
  
  switch (element.type) {
    case 'circle':
      const radius = width / 2;
      return {
        x: element.x + radius,
        y: element.y + radius
      };
      
    case 'text':
      // Approximate text center
      return {
        x: element.x + (width / 2),
        y: element.y + 10 // Half of default text height
      };
      
    case 'pencil':
      if (element.points && element.points.length > 0) {
        // Use middle point of the path
        const middleIndex = Math.floor(element.points.length / 2);
        return element.points[middleIndex];
      }
      // Fallback to element position
      return {
        x: element.x,
        y: element.y
      };
      
    default:
      // For rectangles and images
      return {
        x: element.x + (width / 2),
        y: element.y + (height / 2)
      };
  }
}; 