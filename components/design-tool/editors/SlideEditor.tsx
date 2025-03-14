'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Copy, 
  Layout, 
  Image, 
  Type, 
  Square, 
  Circle, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Canvas } from '../Canvas';

interface Slide {
  id: string;
  title: string;
  elements: any[];
  thumbnail?: string;
}

interface SlideEditorProps {
  fileName: string;
  onSave: (slides: Slide[]) => void;
  initialSlides?: Slide[];
}

export function SlideEditor({ fileName, onSave, initialSlides = [] }: SlideEditorProps) {
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999999'%3ESlide Preview%3C/text%3E%3C/svg%3E";
  
  const [slides, setSlides] = useState<Slide[]>(initialSlides.length > 0 ? initialSlides : [
    {
      id: '1',
      title: 'Title Slide',
      elements: [],
      thumbnail: placeholderImage
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('slides');

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      elements: [],
      thumbnail: placeholderImage
    };
    
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    } else if (currentSlideIndex === index) {
      setCurrentSlideIndex(Math.max(0, index - 1));
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const newSlide: Slide = {
      ...slideToClone,
      id: Date.now().toString(),
      title: `${slideToClone.title} (Copy)`,
    };
    
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  const handleSave = () => {
    onSave(slides);
  };

  const slideLayouts = [
    { id: 'title', name: 'Title Slide', icon: <Layout className="h-5 w-5" /> },
    { id: 'title-content', name: 'Title and Content', icon: <Layout className="h-5 w-5" /> },
    { id: 'section', name: 'Section Header', icon: <Layout className="h-5 w-5" /> },
    { id: 'two-content', name: 'Two Content', icon: <Layout className="h-5 w-5" /> },
    { id: 'title-two-content', name: 'Title and Two Content', icon: <Layout className="h-5 w-5" /> },
    { id: 'blank', name: 'Blank', icon: <Layout className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">{fileName}</h1>
        <Button onClick={handleSave}>Save</Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r flex flex-col">
          <Tabs defaultValue="slides" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 px-4 py-2">
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="slides" className="flex-1 p-0 flex flex-col">
              <div className="p-2 border-b">
                <Button onClick={addSlide} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  New Slide
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {slides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className={`p-2 rounded-lg cursor-pointer relative group ${
                        index === currentSlideIndex ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <div className="aspect-video bg-white dark:bg-gray-800 rounded border overflow-hidden mb-2">
                        {slide.thumbnail ? (
                          <img 
                            src={slide.thumbnail} 
                            alt={slide.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Preview
                          </div>
                        )}
                      </div>
                      <div className="text-sm truncate">{slide.title}</div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 bg-white dark:bg-gray-800 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSlide(index);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 bg-white dark:bg-gray-800 shadow-sm text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-2 right-2 bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="layouts" className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid grid-cols-2 gap-2">
                  {slideLayouts.map((layout) => (
                    <div 
                      key={layout.id}
                      className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex flex-col items-center gap-2"
                      onClick={() => {
                        // Apply layout to current slide
                      }}
                    >
                      <div className="aspect-video w-full bg-white dark:bg-gray-800 rounded flex items-center justify-center">
                        {layout.icon}
                      </div>
                      <span className="text-xs text-center">{layout.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Image className="h-4 w-4" />
                Add Image
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Type className="h-4 w-4" />
                Add Text
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Square className="h-4 w-4" />
                Add Shape
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8 overflow-auto">
            <div className="aspect-[16/9] w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <Canvas />
            </div>
          </div>
          
          <div className="p-4 border-t flex items-center justify-between">
            <Button variant="outline" size="sm">
              Present
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                100%
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 