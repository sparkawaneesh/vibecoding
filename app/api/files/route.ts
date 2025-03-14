import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllFiles, 
  getFileById, 
  saveFile, 
  deleteFile, 
  toggleStarFile, 
  duplicateFile,
  addFile,
  StoredFile
} from '@/lib/services/fileStorage';

/**
 * Get files
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    
    if (fileId) {
      // Get a specific file
      const file = getFileById(fileId);
      
      if (!file) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(file);
    } else {
      // Get all files
      const files = getAllFiles();
      return NextResponse.json(files);
    }
  } catch (error) {
    console.error('Error in GET /api/files:', error);
    return NextResponse.json(
      { error: 'Error retrieving files' },
      { status: 500 }
    );
  }
}

/**
 * Create or update file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;
    
    if (action === 'create') {
      // Create new file
      const { name, type, content } = body;
      
      if (!name || !type) {
        return NextResponse.json(
          { error: 'Name and type are required' },
          { status: 400 }
        );
      }
      
      const fileId = addFile({
        name,
        type,
        starred: false,
        content: content || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newFile = getFileById(fileId);
      
      if (!newFile) {
        return NextResponse.json(
          { error: 'Error creating file' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(newFile);
    } else if (action === 'update') {
      // Update existing file
      const { updates } = body;
      
      if (!id) {
        return NextResponse.json(
          { error: 'File ID is required' },
          { status: 400 }
        );
      }
      
      const existingFile = getFileById(id);
      
      if (!existingFile) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      const updatedFile = saveFile({
        ...existingFile,
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      return NextResponse.json(updatedFile);
    } else if (action === 'star') {
      // Star/unstar file
      if (!id) {
        return NextResponse.json(
          { error: 'File ID is required' },
          { status: 400 }
        );
      }
      
      const updatedFile = toggleStarFile(id);
      
      if (!updatedFile) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(updatedFile);
    } else if (action === 'duplicate') {
      // Duplicate file
      if (!id) {
        return NextResponse.json(
          { error: 'File ID is required' },
          { status: 400 }
        );
      }
      
      const duplicatedFile = duplicateFile(id);
      
      if (!duplicatedFile) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(duplicatedFile);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/files:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}

/**
 * Delete file
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    const success = deleteFile(fileId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/files:', error);
    return NextResponse.json(
      { error: 'Error deleting file' },
      { status: 500 }
    );
  }
} 