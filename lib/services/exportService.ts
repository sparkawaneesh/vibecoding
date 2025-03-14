import { FileType } from '@/design-tool/FileTypeSelector';
import { StoredFile } from './fileStorage';
import jsPDF from 'jspdf';

interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'json';
  quality?: number;
  scale?: number;
}

// Extend StoredFile type instead of creating new one
type FileData = StoredFile & {
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
};

/**
 * Main function to export a file
 * @param file Stored file object
 */
export const exportFile = async (
  file: StoredFile,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> => {
  try {
    // Add metadata to match FileData type
    const fileWithMetadata: FileData = {
      ...file,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    switch (options.format) {
      case 'pdf':
        await exportToPDF(fileWithMetadata);
        break;
      case 'png':
      case 'jpg':
        await exportToImage(fileWithMetadata, options);
        break;
      case 'svg':
        await exportToSVG(fileWithMetadata);
        break;
      case 'json':
        exportJSON(fileWithMetadata);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export file');
  }
};

/**
 * Export slide presentation
 */
const exportSlidePresentation = (file: StoredFile): void => {
  // Here would be PPTX export logic
  // For now, we'll export as JSON
  
  const content = JSON.stringify(file.content || {}, null, 2);
  const filename = `${file.name}.json`;
  
  downloadFile(filename, content, 'application/json');
};

/**
 * Export document
 */
const exportDocument = (file: StoredFile): void => {
  // If content is HTML string
  if (typeof file.content === 'string') {
    const content = file.content;
    const filename = `${file.name}.html`;
    
    downloadFile(filename, content, 'text/html');
    return;
  }
  
  // If content is in rich text format
  if (file.content && file.content.content) {
    let htmlContent = '<html><head><meta charset="UTF-8"><title>' + file.name + '</title></head><body>';
    
    // Simple conversion logic
    const content = file.content.content || [];
    content.forEach((block: any) => {
      if (block.type === 'paragraph') {
        htmlContent += `<p>${block.text || ''}</p>`;
      } else if (block.type === 'heading') {
        const level = block.level || 1;
        htmlContent += `<h${level}>${block.text || ''}</h${level}>`;
      } else if (block.type === 'list') {
        const listType = block.listType === 'ordered' ? 'ol' : 'ul';
        htmlContent += `<${listType}>`;
        (block.items || []).forEach((item: string) => {
          htmlContent += `<li>${item}</li>`;
        });
        htmlContent += `</${listType}>`;
      }
    });
    
    htmlContent += '</body></html>';
    const filename = `${file.name}.html`;
    
    downloadFile(filename, htmlContent, 'text/html');
    return;
  }
  
  // Fallback: JSON export
  const content = JSON.stringify(file.content || {}, null, 2);
  const filename = `${file.name}.json`;
  
  downloadFile(filename, content, 'application/json');
};

/**
 * Export spreadsheet
 */
const exportSpreadsheet = (file: StoredFile, format: 'xlsx' | 'csv' | 'tsv'): void => {
  const content = file.content as Record<string, unknown>;
  const sheets = (content.sheets as Array<{ name: string; data: unknown[][] }>) || [{ name: 'Sheet 1', data: [] }];
  
  if (format === 'csv' || format === 'tsv') {
    const sheet = sheets[0];
    const delimiter = format === 'csv' ? ',' : '\t';
    
    let csvContent = '';
    
    if (sheet.data && Array.isArray(sheet.data)) {
      sheet.data.forEach((row: unknown[]) => {
        const rowStr = row.map(cell => {
          if (cell === null || cell === undefined) {
            return '';
          }
          
          const cellStr = String(cell);
          if (cellStr.includes(delimiter) || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(delimiter);
        
        csvContent += rowStr + '\n';
      });
    }
    
    const filename = `${file.name}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
    
    downloadFile(filename, csvContent, mimeType);
  } else {
    const workbook = {
      SheetNames: sheets.map(sheet => sheet.name),
      Sheets: {} as Record<string, Record<string, { v: unknown }>>
    };
    
    sheets.forEach((sheet, index) => {
      const sheetData: Record<string, { v: unknown }> = {};
      
      if (sheet.data && Array.isArray(sheet.data)) {
        sheet.data.forEach((row: unknown[], rowIndex: number) => {
          row.forEach((cell: unknown, colIndex: number) => {
            const cellRef = getColumnLabel(colIndex) + (rowIndex + 1);
            sheetData[cellRef] = { v: cell };
          });
        });
      }
      
      workbook.Sheets[sheet.name] = sheetData;
    });
    
    const content = JSON.stringify(workbook, null, 2);
    const filename = `${file.name}.json`;
    
    downloadFile(filename, content, 'application/json');
  }
};

/**
 * Export canvas/image
 */
const exportCanvas = (file: StoredFile): void => {
  // If file has a data URL
  if (file.content && file.content.src && file.content.src.startsWith('data:')) {
    const dataUrl = file.content.src;
    const extension = dataUrl.split(';')[0].split('/')[1];
    const filename = `${file.name}.${extension || 'png'}`;
    
    // Create blob from data URL and download
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    
    return;
  }
  
  // Fallback: JSON export
  exportJSON(file);
};

/**
 * Export as JSON format
 */
const exportJSON = (file: StoredFile): void => {
  const data = JSON.stringify(file.content, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${file.name}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download file
 */
const downloadFile = (filename: string, content: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};

/**
 * Get spreadsheet column label (A, B, C, ... Z, AA, AB, ...)
 */
const getColumnLabel = (index: number): string => {
  let label = '';
  
  while (index >= 0) {
    label = String.fromCharCode(65 + (index % 26)) + label;
    index = Math.floor(index / 26) - 1;
  }
  
  return label;
};

const exportToPDF = async (file: FileData): Promise<void> => {
  const doc = new jsPDF();
  
  // Add content to PDF based on file type
  switch (file.type) {
    case 'doc':
      if (typeof file.content === 'string') {
        doc.text(file.content, 10, 10);
      }
      break;
    case 'slide':
      // Handle slide content
      break;
    case 'spreadsheet':
    case 'csv':
    case 'tsv':
      // Handle spreadsheet content
      break;
    default:
      throw new Error(`PDF export not supported for file type: ${file.type}`);
  }
  
  doc.save(`${file.name}.pdf`);
};

const exportToImage = async (
  file: FileData,
  options: ExportOptions
): Promise<void> => {
  if (!file.content || typeof file.content !== 'string') {
    throw new Error('Invalid file content for image export');
  }
  
  const link = document.createElement('a');
  link.href = file.content;
  link.download = `${file.name}.${options.format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToSVG = async (file: FileData): Promise<void> => {
  if (!file.content || typeof file.content !== 'string') {
    throw new Error('Invalid file content for SVG export');
  }
  
  const blob = new Blob([file.content], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${file.name}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Add type assertion for file content
const getFileContent = (file: FileData): Record<string, unknown> => {
  if (!file.content || typeof file.content !== 'object') {
    throw new Error('Invalid file content');
  }
  return file.content as Record<string, unknown>;
}; 