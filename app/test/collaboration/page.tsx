'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { RoomProvider } from '@/lib/liveblocks';
import { LiveMap } from '@liveblocks/client';
import { ClientSideSuspense } from '@liveblocks/react';
import { useMyPresence, useOthers } from '@/lib/liveblocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// Collaboration test component
function CollaborationTest() {
  const { user } = useUser();
  const others = useOthers();
  const [myPresence, updateMyPresence] = useMyPresence();
  const [message, setMessage] = useState('');
  
  // Update cursor position on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
        selection: myPresence.selection,
        isTyping: myPresence.isTyping,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateMyPresence, myPresence.selection, myPresence.isTyping]);
  
  // Update typing status when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    updateMyPresence({
      cursor: myPresence.cursor,
      selection: myPresence.selection,
      isTyping: e.target.value.length > 0,
    });
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Collaboration Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
            <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : 'ME'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.fullName || user?.username || 'Anonymous'}</p>
            <p className="text-sm text-gray-500">{user?.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Other Users ({others.length})</h2>
        
        {others.length === 0 ? (
          <p className="text-gray-500">No other users are currently in this room.</p>
        ) : (
          <div className="space-y-4">
            {others.map(other => (
              <div key={other.connectionId} className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={other.info?.avatar} alt={other.info?.name || ''} />
                  <AvatarFallback>{other.info?.name ? getInitials(other.info.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{other.info?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">
                    {other.presence.isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
                {other.presence.cursor && (
                  <div className="text-xs text-gray-500">
                    Cursor at: {other.presence.cursor.x}, {other.presence.cursor.y}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Typing Status</h2>
        <Input
          type="text"
          placeholder="Type something to update your status..."
          value={message}
          onChange={handleInputChange}
          className="mb-4"
        />
        <p className="text-sm text-gray-500">
          Your typing status: {myPresence.isTyping ? 'Typing' : 'Not typing'}
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/design-tool">Go to Design Tool</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/code-editor">Go to Code Editor</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CollaborationTestPage() {
  const { isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-500 mb-6">You need to sign in to access this page.</p>
        <Button asChild>
          <Link href="/auth/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <RoomProvider 
      id="collaboration-test" 
      initialPresence={{ cursor: null, selection: [], isTyping: false }}
      initialStorage={{ canvasObjects: new LiveMap(), version: 1 }}
    >
      <ClientSideSuspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        {() => <CollaborationTest />}
      </ClientSideSuspense>
    </RoomProvider>
  );
} 