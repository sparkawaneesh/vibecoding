'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Upload, 
  FileSpreadsheet,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Cell {
  value: string;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    format?: 'text' | 'number' | 'currency' | 'percentage';
    backgroundColor?: string;
    textColor?: string;
  };
}

interface Sheet {
  id: string;
  name: string;
  cells: Record<string, Cell>;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
}

interface SpreadsheetEditorProps {
  fileName: string;
  fileType: 'spreadsheet' | 'csv' | 'tsv';
  onSave: (data: Sheet[]) => void;
  initialData?: Sheet[];
}

export function SpreadsheetEditor({ 
  fileName, 
  fileType, 
  onSave, 
  initialData = [] 
}: SpreadsheetEditorProps) {
  const [sheets, setSheets] = useState<Sheet[]>(initialData.length > 0 ? initialData : [
    {
      id: '1',
      name: 'Sheet 1',
      cells: {},
      columnWidths: {},
      rowHeights: {}
    }
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState('');
  const [columnCount, setColumnCount] = useState(26); // A to Z
  const [rowCount, setRowCount] = useState(100);
  
  const activeSheet = sheets[activeSheetIndex];
  
  useEffect(() => {
    if (selectedCell && activeSheet.cells[selectedCell]) {
      setCellValue(activeSheet.cells[selectedCell].value);
    } else {
      setCellValue('');
    }
  }, [selectedCell, activeSheet]);
  
  const handleCellChange = (cellId: string, value: string) => {
    const updatedSheets = [...sheets];
    const sheet = updatedSheets[activeSheetIndex];
    
    if (!sheet.cells[cellId]) {
      sheet.cells[cellId] = { value: '' };
    }
    
    sheet.cells[cellId].value = value;
    setSheets(updatedSheets);
  };
  
  const handleCellSelect = (cellId: string) => {
    setSelectedCell(cellId);
    if (activeSheet.cells[cellId]) {
      setCellValue(activeSheet.cells[cellId].value);
    } else {
      setCellValue('');
    }
  };
  
  const handleFormulaChange = (value: string) => {
    setCellValue(value);
    if (selectedCell) {
      handleCellChange(selectedCell, value);
    }
  };
  
  const addSheet = () => {
    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: `Sheet ${sheets.length + 1}`,
      cells: {},
      columnWidths: {},
      rowHeights: {}
    };
    
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  };
  
  const deleteSheet = (index: number) => {
    if (sheets.length <= 1) return;
    
    const newSheets = [...sheets];
    newSheets.splice(index, 1);
    setSheets(newSheets);
    
    if (activeSheetIndex >= newSheets.length) {
      setActiveSheetIndex(newSheets.length - 1);
    }
  };
  
  const renameSheet = (index: number, name: string) => {
    const newSheets = [...sheets];
    newSheets[index].name = name;
    setSheets(newSheets);
  };
  
  const handleSave = () => {
    onSave(sheets);
  };
  
  const getColumnLabel = (index: number) => {
    let label = '';
    while (index >= 0) {
      label = String.fromCharCode(65 + (index % 26)) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };
  
  const getCellId = (rowIndex: number, colIndex: number) => {
    return `${getColumnLabel(colIndex)}${rowIndex + 1}`;
  };
  
  const applyCellStyle = (style: Partial<Cell['style']>) => {
    if (!selectedCell) return;
    
    const updatedSheets = [...sheets];
    const sheet = updatedSheets[activeSheetIndex];
    
    if (!sheet.cells[selectedCell]) {
      sheet.cells[selectedCell] = { value: '' };
    }
    
    sheet.cells[selectedCell].style = {
      ...sheet.cells[selectedCell].style,
      ...style
    };
    
    setSheets(updatedSheets);
  };
  
  const getCellStyle = (cellId: string) => {
    const cell = activeSheet.cells[cellId];
    if (!cell || !cell.style) return {};
    
    const style: Record<string, any> = {};
    
    if (cell.style.bold) style.fontWeight = 'bold';
    if (cell.style.italic) style.fontStyle = 'italic';
    if (cell.style.underline) style.textDecoration = 'underline';
    if (cell.style.align) style.textAlign = cell.style.align;
    if (cell.style.backgroundColor) style.backgroundColor = cell.style.backgroundColor;
    if (cell.style.textColor) style.color = cell.style.textColor;
    
    return style;
  };
  
  const formatCellValue = (cellId: string) => {
    const cell = activeSheet.cells[cellId];
    if (!cell) return '';
    
    if (cell.style?.format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cell.value) || 0);
    } else if (cell.style?.format === 'percentage') {
      return new Intl.NumberFormat('en-US', { style: 'percent' }).format(Number(cell.value) / 100 || 0);
    } else if (cell.style?.format === 'number') {
      return new Intl.NumberFormat('en-US').format(Number(cell.value) || 0);
    }
    
    return cell.value;
  };
  
  const exportToCSV = () => {
    const sheet = sheets[activeSheetIndex];
    let csv = '';
    
    // Find the maximum row and column
    let maxRow = 0;
    let maxCol = 0;
    
    Object.keys(sheet.cells).forEach(cellId => {
      const match = cellId.match(/([A-Z]+)(\d+)/);
      if (match) {
        const col = match[1];
        const row = parseInt(match[2]);
        
        let colIndex = 0;
        for (let i = 0; i < col.length; i++) {
          colIndex = colIndex * 26 + (col.charCodeAt(i) - 64);
        }
        
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, colIndex);
      }
    });
    
    // Generate CSV content
    for (let row = 1; row <= maxRow; row++) {
      const rowData = [];
      for (let col = 1; col <= maxCol; col++) {
        const colLabel = getColumnLabel(col - 1);
        const cellId = `${colLabel}${row}`;
        const cell = sheet.cells[cellId];
        rowData.push(cell ? `"${cell.value.replace(/"/g, '""')}"` : '');
      }
      csv += rowData.join(',') + '\n';
    }
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">{fileName}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="p-2 border-b flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Input
              value={cellValue}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="Cell value or formula"
              className="w-64"
            />
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ bold: true })}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ italic: true })}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ underline: true })}
                >
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ align: 'left' })}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ align: 'center' })}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ align: 'right' })}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ format: 'text' })}
                >
                  <Hash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Text Format</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ format: 'number' })}
                >
                  <Hash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Number Format</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ format: 'currency' })}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Currency Format</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => applyCellStyle({ format: 'percentage' })}
                >
                  <Percent className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Percentage Format</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b">
          {sheets.map((sheet, index) => (
            <div 
              key={sheet.id}
              className={`flex items-center px-4 py-2 border-r cursor-pointer ${
                index === activeSheetIndex ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveSheetIndex(index)}
            >
              <span className="mr-2">{sheet.name}</span>
              {sheets.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(index);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={addSheet}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="relative">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-20 bg-gray-100 dark:bg-gray-800 border p-1 w-10"></th>
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <th 
                      key={colIndex}
                      className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 border p-1 min-w-[80px]"
                      style={{ width: activeSheet.columnWidths[getColumnLabel(colIndex)] || 80 }}
                    >
                      {getColumnLabel(colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 border p-1 text-center">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: columnCount }).map((_, colIndex) => {
                      const cellId = getCellId(rowIndex, colIndex);
                      return (
                        <td 
                          key={cellId}
                          className={`border p-1 ${
                            selectedCell === cellId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => handleCellSelect(cellId)}
                          style={getCellStyle(cellId)}
                        >
                          {formatCellValue(cellId)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-2 border-t flex items-center justify-between text-sm text-gray-500">
        <div>
          {selectedCell || 'No cell selected'}
        </div>
        <div>
          {fileType === 'spreadsheet' ? 'Spreadsheet' : fileType.toUpperCase()}
        </div>
      </div>
    </div>
  );
} 