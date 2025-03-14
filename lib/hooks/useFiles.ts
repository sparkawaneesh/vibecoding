import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileType } from '@/components/design-tool/FileTypeSelector';
import {
  StoredFile,
  getAllFiles,
  getFileById,
  saveFile,
  deleteFile as deleteLocalFile,
  toggleStarFile as toggleStarLocalFile,
  duplicateFile as duplicateLocalFile,
  initializeStorage
} from '@/lib/services/fileStorage';

export interface File {
  id: string;
  name: string;
  type: FileType;
  createdAt: Date;
  updatedAt: Date;
  starred: boolean;
  content?: any;
}

export function useFiles() {
  const { user, isSignedIn } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert StoredFile to File (with proper Date objects)
  const convertStoredFile = (storedFile: StoredFile): File => ({
    ...storedFile,
    createdAt: new Date(storedFile.createdAt),
    updatedAt: new Date(storedFile.updatedAt)
  });

  // Load files from storage
  const loadFiles = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Initialize storage with sample files if needed
      initializeStorage(user.id);
      
      // Get files from local storage
      const storedFiles = getAllFiles(user.id);
      
      // Convert to File objects with proper Date objects
      const convertedFiles = storedFiles.map(convertStoredFile);
      
      setFiles(convertedFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user]);

  // Load files on mount and when user changes
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Create a new file
  const createFile = useCallback(async (name: string, type: FileType, content?: any): Promise<File | null> => {
    if (!isSignedIn || !user) return null;
    
    try {
      const now = new Date().toISOString();
      const newStoredFile: StoredFile = {
        id: Date.now().toString(),
        name,
        type,
        createdAt: now,
        updatedAt: now,
        starred: false,
        content,
        userId: user.id
      };
      
      // Save to local storage
      const savedFile = saveFile(newStoredFile);
      
      // Convert to File object
      const newFile = convertStoredFile(savedFile);
      
      // Update state
      setFiles(prev => [newFile, ...prev]);
      
      return newFile;
    } catch (err) {
      console.error('Error creating file:', err);
      setError('Failed to create file');
      return null;
    }
  }, [isSignedIn, user]);

  // Get a file by ID
  const getFile = useCallback((id: string): File | null => {
    const storedFile = getFileById(id);
    if (!storedFile) return null;
    
    return convertStoredFile(storedFile);
  }, []);

  // Update a file
  const updateFile = useCallback(async (id: string, updates: Partial<Omit<File, 'id' | 'createdAt' | 'updatedAt'>>): Promise<File | null> => {
    if (!isSignedIn || !user) return null;
    
    try {
      // Get the current file
      const currentFile = getFileById(id);
      if (!currentFile) return null;
      
      // Create updated file
      const updatedStoredFile: StoredFile = {
        ...currentFile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Save to local storage
      const savedFile = saveFile(updatedStoredFile);
      
      // Convert to File object
      const updatedFile = convertStoredFile(savedFile);
      
      // Update state
      setFiles(prev => prev.map(file => file.id === id ? updatedFile : file));
      
      return updatedFile;
    } catch (err) {
      console.error('Error updating file:', err);
      setError('Failed to update file');
      return null;
    }
  }, [isSignedIn, user]);

  // Delete a file
  const deleteFile = useCallback(async (id: string): Promise<boolean> => {
    if (!isSignedIn || !user) return false;
    
    try {
      // Delete from local storage
      const success = deleteLocalFile(id);
      
      if (success) {
        // Update state
        setFiles(prev => prev.filter(file => file.id !== id));
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
      return false;
    }
  }, [isSignedIn, user]);

  // Toggle star status
  const toggleStarFile = useCallback(async (id: string): Promise<File | null> => {
    if (!isSignedIn || !user) return null;
    
    try {
      // Toggle star in local storage
      const updatedStoredFile = toggleStarLocalFile(id);
      if (!updatedStoredFile) return null;
      
      // Convert to File object
      const updatedFile = convertStoredFile(updatedStoredFile);
      
      // Update state
      setFiles(prev => prev.map(file => file.id === id ? updatedFile : file));
      
      return updatedFile;
    } catch (err) {
      console.error('Error toggling star:', err);
      setError('Failed to update file');
      return null;
    }
  }, [isSignedIn, user]);

  // Duplicate a file
  const duplicateFile = useCallback(async (id: string): Promise<File | null> => {
    if (!isSignedIn || !user) return null;
    
    try {
      // Duplicate in local storage
      const duplicatedStoredFile = duplicateLocalFile(id);
      if (!duplicatedStoredFile) return null;
      
      // Convert to File object
      const duplicatedFile = convertStoredFile(duplicatedStoredFile);
      
      // Update state
      setFiles(prev => [duplicatedFile, ...prev]);
      
      return duplicatedFile;
    } catch (err) {
      console.error('Error duplicating file:', err);
      setError('Failed to duplicate file');
      return null;
    }
  }, [isSignedIn, user]);

  return {
    files,
    loading,
    error,
    createFile,
    getFile,
    updateFile,
    deleteFile,
    toggleStarFile,
    duplicateFile,
    refreshFiles: loadFiles
  };
} 