import { FileType } from '../../components/FileTypeSelector';

// Storage key
const STORAGE_KEY = 'vibe-studio-files';

// Stored file interface
export interface StoredFile {
  id: string;
  name: string;
  type: FileType;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  content?: any;
  userId?: string;
}

/**
 * Get all files
 */
export const getAllFiles = (userId?: string): StoredFile[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const filesJson = localStorage.getItem(STORAGE_KEY);
    if (!filesJson) return [];
    
    const files: StoredFile[] = JSON.parse(filesJson);
    
    // If userId is provided, return only files for that user
    if (userId) {
      return files.filter(file => !file.userId || file.userId === userId);
    }
    
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
};

/**
 * Get file by ID
 */
export const getFileById = (fileId: string): StoredFile | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const files = getAllFiles();
    return files.find(file => file.id === fileId) || null;
  } catch (error) {
    console.error('Error getting file by ID:', error);
    return null;
  }
};

/**
 * Save file
 */
export const saveFile = (file: StoredFile): StoredFile => {
  if (typeof window === 'undefined') return file;
  
  try {
    const files = getAllFiles();
    const existingFileIndex = files.findIndex(f => f.id === file.id);
    
    if (existingFileIndex >= 0) {
      // Update existing file
      files[existingFileIndex] = {
        ...file,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new file
      files.push({
        ...file,
        id: file.id || crypto.randomUUID(),
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    return files.find(f => f.id === file.id) || file;
  } catch (error) {
    console.error('Error saving file:', error);
    return file;
  }
};

/**
 * Add file
 */
export const addFile = (file: Omit<StoredFile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Date, updatedAt?: Date }): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const newFile: StoredFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      starred: file.starred || false,
      createdAt: file.createdAt ? file.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: file.updatedAt ? file.updatedAt.toISOString() : new Date().toISOString(),
      content: file.content,
      userId: file.userId
    };
    
    const files = getAllFiles();
    files.push(newFile);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    return newFile.id;
  } catch (error) {
    console.error('Error adding file:', error);
    return '';
  }
};

/**
 * Delete file
 */
export const deleteFile = (fileId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const files = getAllFiles();
    const newFiles = files.filter(file => file.id !== fileId);
    
    if (newFiles.length === files.length) {
      return false; // File not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Star/unstar file
 */
export const toggleStarFile = (fileId: string): StoredFile | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const files = getAllFiles();
    const fileIndex = files.findIndex(file => file.id === fileId);
    
    if (fileIndex === -1) {
      return null; // File not found
    }
    
    // Toggle star status
    files[fileIndex] = {
      ...files[fileIndex],
      starred: !files[fileIndex].starred,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    return files[fileIndex];
  } catch (error) {
    console.error('Error toggling star:', error);
    return null;
  }
};

/**
 * Duplicate file
 */
export const duplicateFile = (fileId: string): StoredFile | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const files = getAllFiles();
    const fileToDuplicate = files.find(file => file.id === fileId);
    
    if (!fileToDuplicate) {
      return null; // File not found
    }
    
    // Create new file
    const newFile: StoredFile = {
      ...fileToDuplicate,
      id: crypto.randomUUID(),
      name: `${fileToDuplicate.name} (Copy)`,
      starred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    files.push(newFile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    
    return newFile;
  } catch (error) {
    console.error('Error duplicating file:', error);
    return null;
  }
};

/**
 * Initialize storage
 */
export const initializeStorage = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const files = getAllFiles();
    
    // If files already exist, associate them with the user
    if (files.length > 0) {
      const updatedFiles = files.map(file => ({
        ...file,
        userId: file.userId || userId
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}; 