'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Image, 
  Link, 
  Save,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentEditorProps {
  fileName: string;
  onSave: (content: string) => void;
  initialContent?: string;
}

export function DocumentEditor({ fileName, onSave, initialContent = '' }: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      updateCounts();
    }
  }, [content]);

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      setCharCount(text.length);
      setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      updateCounts();
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const fontSizes = [
    { value: '1', label: 'Small' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'Large' },
    { value: '4', label: 'X-Large' },
    { value: '5', label: 'XX-Large' },
    { value: '6', label: 'XXX-Large' },
    { value: '7', label: 'XXXX-Large' },
  ];

  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">{fileName}</h1>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
      
      <div className="p-2 border-b flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('undo')}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('redo')}>
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Select onValueChange={(value) => execCommand('fontName', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => execCommand('fontSize', value)}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('bold')}>
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('italic')}>
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('underline')}>
                  <Underline className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', '<h1>')}>
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', '<h2>')}>
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', '<h3>')}>
                  <Heading3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 3</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('formatBlock', '<p>')}>
                  <Type className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Paragraph</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('justifyLeft')}>
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('justifyCenter')}>
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('justifyRight')}>
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('justifyFull')}>
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Justify</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('insertUnorderedList')}>
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => execCommand('insertOrderedList')}>
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) execCommand('insertImage', url);
                }}>
                  <Image className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Image</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => {
                  const url = prompt('Enter link URL:');
                  if (url) execCommand('createLink', url);
                }}>
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Link</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-8 min-h-[calc(100vh-200px)]">
          <div 
            ref={editorRef}
            className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-sm rounded-lg min-h-[calc(100vh-250px)]"
            contentEditable
            onInput={handleInput}
            style={{ outline: 'none' }}
          />
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t flex items-center justify-between text-sm text-gray-500">
        <div>
          {wordCount} words | {charCount} characters
        </div>
        <div>
          Last saved: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 