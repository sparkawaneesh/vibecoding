import { Element, ElementType } from '@/lib/store/useDesignToolStore';
import { Canvas, Rect, Circle, Text, Image, Path, filters } from 'fabric';

// Extend Element with additional properties
interface FabricElement extends Omit<Element, 'type'> {
  type: ElementType;
  fabricObject?: any;
  visible?: boolean;
  locked?: boolean;
  text?: string;
  imageUrl?: string;
  filter?: string;
  points?: Array<{x: number, y: number}>;
  size?: string;
}

export const renderElement = (element: FabricElement, canvas: Canvas): void => {
  switch (element.type) {
    case 'rectangle':
      const rect = new Rect({
        left: element.x,
        top: element.y,
        width: element.width || 100,
        height: element.height || 100,
        fill: element.color,
        stroke: '#000000',
        strokeWidth: 1
      });
      canvas.add(rect);
      element.fabricObject = rect;
      break;
      
    case 'circle':
      const circle = new Circle({
        left: element.x,
        top: element.y,
        radius: (element.width || 50) / 2,
        fill: element.color,
        stroke: '#000000',
        strokeWidth: 1
      });
      canvas.add(circle);
      element.fabricObject = circle;
      break;
      
    case 'text':
      const text = new Text(element.text || '', {
        left: element.x,
        top: element.y,
        fill: element.color,
        fontSize: 20
      });
      canvas.add(text);
      element.fabricObject = text;
      break;
      
    case 'image':
      if (element.imageUrl) {
        Image.fromURL(element.imageUrl)
          .then((img) => {
            img.set({
              left: element.x,
              top: element.y,
              scaleX: (element.width || img.width) / img.width,
              scaleY: (element.height || img.height) / img.height
            });
            
            if (element.filter) {
              // Apply filter based on filter name
              switch(element.filter) {
                case 'Grayscale':
                  img.filters = [new filters.Grayscale()];
                  break;
                case 'Blur':
                  img.filters = [new filters.Blur({ blur: 0.5 })];
                  break;
                case 'Brightness':
                  img.filters = [new filters.Brightness({ brightness: 0.1 })];
                  break;
                // Add more filter cases as needed
              }
              img.applyFilters();
            }
            
            canvas.add(img);
            element.fabricObject = img;
          });
      }
      break;
      
    case 'pencil':
      if (element.points) {
        const path = new Path(element.points.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' '), {
          fill: 'transparent',
          stroke: element.color,
          strokeWidth: element.size === 'small' ? 2 : element.size === 'medium' ? 4 : 6
        });
        canvas.add(path);
        element.fabricObject = path;
      }
      break;
  }
}; 