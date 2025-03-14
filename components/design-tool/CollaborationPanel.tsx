'use client';

import { useState, useEffect } from 'react';
import { useOthers, useMyPresence, useSelf } from '@/lib/liveblocks';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
}

export const CollaborationPanel = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const others = useOthers();
  const [myPresence, updateMyPresence] = useMyPresence();
  const currentUser = useSelf();
  
  const [activeTab, setActiveTab] = useState('users');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Generate a share URL when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);
  
  // Handle copying the share URL
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message: Message = {
      id: crypto.randomUUID(),
      text: newMessage,
      userId: user.id,
      userName: user.fullName || user.username || 'Anonymous',
      userAvatar: user.imageUrl,
      createdAt: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // In a real app, you would broadcast this message to other users
    // using Liveblocks' broadcast functionality
  };
  
  // Format time for messages
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <div className="w-64 bg-white border-l p-2 overflow-hidden flex flex-col h-full dark:bg-gray-950 dark:border-gray-800 animate-in fade-in duration-300">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold mb-2">People in this document</h3>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-2">
              {/* Current user */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                  <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : 'ME'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.fullName || user?.username || 'You'}</p>
                  <p className="text-xs text-muted-foreground">You (editing)</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              
              {/* Other users */}
              {others.map(other => (
                <div key={other.connectionId} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={other.info?.avatar} alt={other.info?.name || ''} />
                    <AvatarFallback>{other.info?.name ? getInitials(other.info.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{other.info?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {other.presence.isTyping ? 'Typing...' : 'Viewing'}
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              ))}
              
              {others.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No one else is here yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="chat" className="flex flex-col h-full">
          <h3 className="text-sm font-semibold mb-2">Chat</h3>
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex gap-2 max-w-[90%]",
                      message.userId === user?.id ? "ml-auto" : "mr-auto"
                    )}
                  >
                    {message.userId !== user?.id && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={message.userAvatar} alt={message.userName} />
                        <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className={cn(
                        "rounded-lg p-2",
                        message.userId === user?.id 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted"
                      )}>
                        {message.text}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 text-muted-foreground",
                        message.userId === user?.id ? "text-right" : "text-left"
                      )}>
                        {message.userId !== user?.id && (
                          <span className="font-medium mr-1">{message.userName}</span>
                        )}
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                    {message.userId === user?.id && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={message.userAvatar} alt={message.userName} />
                        <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Textarea 
              placeholder="Type a message..." 
              className="min-h-[60px] resize-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="share" className="space-y-4">
          <h3 className="text-sm font-semibold mb-2">Share this document</h3>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Anyone with the link can view this document
            </p>
            
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                onChange={(e) => setShareUrl(e.target.value)}
                className="text-xs"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleCopyShareUrl}
                className="transition-all hover:scale-105"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Permissions</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Currently, this is a collaborative document that anyone with the link can edit.
              </p>
              
              <Button className="w-full mt-2">
                Manage Permissions
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 