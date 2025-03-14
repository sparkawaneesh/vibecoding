import { FileType } from '../design-tool/FileTypeSelector';
import { addFile } from './fileStorage';

interface ImportedContent {
  type: FileType;
  content: unknown;
  metadata: {
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface SlideContent {
  slides: Array<{
    title: string;
    content: unknown[];
  }>;
  theme: string;
}

interface DocumentContent {
  content: Array<{
    type: string;
    text: string;
  }>;
  metadata: {
    title: string;
  };
}

interface SpreadsheetContent {
  sheets: Array<{
    name: string;
    data: string[][];
  }>;
}

interface ImageContent {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Main function for importing files
 * @param file Browser file object
 * @param onSuccess Callback after successful import
 * @param onError Callback in case of error
 */
export const importFile = async (
  file: File,
  onSuccess: (fileId: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = file.name.split('.').slice(0, -1).join('.');
    
    let fileType: FileType;
    let content: ImportedContent['content'];
    
    switch (fileExtension) {
      case 'pptx':
        fileType = 'slide';
        content = await parseSlidePresentation(file);
        break;
        
      case 'docx':
        fileType = 'doc';
        content = await parseDocument(file);
        break;
        
      case 'xlsx':
        fileType = 'spreadsheet';
        content = await parseSpreadsheet(file);
        break;
        
      case 'csv':
        fileType = 'csv';
        content = await parseSpreadsheet(file);
        break;
        
      case 'tsv':
        fileType = 'tsv';
        content = await parseSpreadsheet(file);
        break;
        
      case 'json':
        const jsonContent = await file.text();
        const jsonData = JSON.parse(jsonContent);
        const jsonType = determineJsonType(jsonData);
        fileType = jsonType;
        content = jsonData;
        break;
        
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        fileType = 'image';
        content = await parseImage(file);
        break;
        
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
    
    // Save to file storage
    const fileId = await addFile({
      name: fileName,
      type: fileType,
      content,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    onSuccess(fileId);
  } catch (error) {
    console.error('Import error:', error);
    onError(error instanceof Error ? error.message : 'An error occurred while importing the file. Please try again.');
  }
};

/**
 * Determine the type of JSON data
 */
const determineJsonType = (data: unknown): FileType => {
  if (
    typeof data === 'object' && 
    data !== null && 
    ('slides' in data || 'presentation' in data)
  ) {
    return 'slide';
  } else if (
    typeof data === 'object' && 
    data !== null && 
    ('document' in data || 'content' in data)
  ) {
    return 'doc';
  } else if (
    typeof data === 'object' && 
    data !== null && 
    (
      'sheets' in data || 
      'cells' in data || 
      (Array.isArray(data) && Array.isArray(data[0]))
    )
  ) {
    return 'spreadsheet';
  } else {
    return 'doc'; // Default type
  }
};

/**
 * Parse slide presentation file
 */
const parseSlidePresentation = async (file: File): Promise<SlideContent> => {
  // Here would be PPTX parsing logic
  // For now, we return a basic structure
  return {
    slides: [
      { title: 'Slide 1', content: [] },
      { title: 'Slide 2', content: [] }
    ],
    theme: 'default'
  };
};

/**
 * Parse document file
 */
const parseDocument = async (file: File): Promise<DocumentContent> => {
  // Here would be DOCX parsing logic
  // For now, we return a basic structure
  return {
    content: [
      { type: 'paragraph', text: 'Imported document' }
    ],
    metadata: {
      title: file.name
    }
  };
};

/**
 * Parse spreadsheet file (XLSX, CSV, TSV)
 */
const parseSpreadsheet = async (file: File): Promise<SpreadsheetContent> => {
  if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
    const delimiter = file.name.endsWith('.csv') ? ',' : '\t';
    const content = await file.text();
    const rows = content.split('\n');
    
    const data = rows.map(row => row.split(delimiter));
    
    return {
      sheets: [
        {
          name: 'Sheet 1',
          data
        }
      ]
    };
  }
  
  // For XLSX
  return {
    sheets: [
      {
        name: 'Sheet 1',
        data: [['Imported data']]
      }
    ]
  };
};

/**
 * Parse image file
 */
const parseImage = async (file: File): Promise<ImageContent> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve({
        src: dataUrl,
        width: 0, // These will be updated when the image loads
        height: 0,
        alt: file.name
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading image file'));
    };
    
    reader.readAsDataURL(file);
  });
}; 