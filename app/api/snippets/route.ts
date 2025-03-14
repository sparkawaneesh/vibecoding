import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be stored in a database
const snippets: Record<string, {
  code: string;
  language: string;
  timestamp: string;
}> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, language, timestamp } = body;
    
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }
    
    const id = uuidv4();
    snippets[id] = { code, language, timestamp };
    
    return NextResponse.json(
      { 
        id,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/snippet/${id}` 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating snippet:', error);
    return NextResponse.json(
      { error: 'Failed to create snippet' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Snippet ID is required' },
      { status: 400 }
    );
  }
  
  const snippet = snippets[id];
  
  if (!snippet) {
    return NextResponse.json(
      { error: 'Snippet not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(snippet);
} 