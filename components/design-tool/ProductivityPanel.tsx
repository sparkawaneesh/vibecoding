'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotesPanel } from '../productivity/NotesPanel';
import { PomodoroTimer } from '../productivity/PomodoroTimer';
import { IdeaBoard } from '../productivity/IdeaBoard';
import { StickyNote, ListTodo, Clock, Lightbulb } from 'lucide-react';

export function ProductivityPanel() {
  const [activeTab, setActiveTab] = useState('notes');
  
  return (
    <div className="flex flex-col h-full border-l bg-white dark:bg-gray-950">
      <Tabs defaultValue="notes" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 px-4 py-2">
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Ideas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="flex-1 p-0">
          <NotesPanel />
        </TabsContent>
        
        <TabsContent value="tasks" className="flex-1 p-0">
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Task Manager coming soon</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="pomodoro" className="flex-1 p-0">
          <PomodoroTimer />
        </TabsContent>
        
        <TabsContent value="ideas" className="flex-1 p-0">
          <IdeaBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
} 