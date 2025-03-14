'use client';

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Share2, Code, Palette, Lock, Globe } from "lucide-react";
import Link from "next/link";

export default function CollaborationDocsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Collaboration Documentation"
        text="Learn how to collaborate with others in real-time."
      />
      
      <div className="grid gap-8 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Real-time Collaboration
            </CardTitle>
            <CardDescription>
              Vibe Studio offers powerful real-time collaboration features that allow multiple users to work on the same document simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our collaboration features are powered by Liveblocks, providing a seamless and responsive experience for all users.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Presence Awareness
                </h3>
                <p className="text-sm text-muted-foreground">
                  See who's currently viewing and editing the document in real-time.
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  In-Document Chat
                </h3>
                <p className="text-sm text-muted-foreground">
                  Communicate with collaborators directly within the document.
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Sharing Controls
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share documents with specific permissions for viewing or editing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="design-tool">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design-tool" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Design Tool Collaboration
            </TabsTrigger>
            <TabsTrigger value="code-editor" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code Editor Collaboration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="design-tool" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Design Tool Collaboration</CardTitle>
                <CardDescription>
                  Collaborate on designs with your team in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>See other users' cursors and selections in real-time</li>
                  <li>View who's currently editing which elements</li>
                  <li>Chat with collaborators directly in the design tool</li>
                  <li>Share designs with view-only or edit permissions</li>
                  <li>See a history of changes and who made them</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-6">How to Use</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Open a design file in the Design Tool</li>
                  <li>Click the <Users className="inline h-4 w-4" /> icon in the toolbar to open the collaboration panel</li>
                  <li>Use the "Share" tab to invite others to collaborate</li>
                  <li>Use the "Chat" tab to communicate with collaborators</li>
                  <li>Use the "Users" tab to see who's currently viewing the document</li>
                </ol>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Pro Tip</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You can press the "C" key to quickly toggle the collaboration panel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="code-editor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor Collaboration</CardTitle>
                <CardDescription>
                  Write and debug code together with your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>See other users' cursors and selections in real-time</li>
                  <li>View who's currently editing which parts of the code</li>
                  <li>Share code snippets with collaborators</li>
                  <li>Run and debug code together</li>
                  <li>Use the integrated terminal collaboratively</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-6">How to Use</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Open a file in the Code Editor</li>
                  <li>Click the <Share2 className="inline h-4 w-4" /> button to share your code</li>
                  <li>Use the collaboration panel to see who's currently editing</li>
                  <li>Use the chat feature to communicate with collaborators</li>
                  <li>Run and debug code together in real-time</li>
                </ol>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Pro Tip</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You can use the "Share" button to generate a link that others can use to join your coding session.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-500" />
              Permissions and Privacy
            </CardTitle>
            <CardDescription>
              Control who can access and edit your documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Vibe Studio provides flexible permission controls to ensure your work is shared only with the right people.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Sharing Options
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">View Only</span>
                    <span>Recipients can view but not edit the document</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Can Edit</span>
                    <span>Recipients can view and edit the document</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">Can Comment</span>
                    <span>Recipients can view and comment but not edit</span>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  Access Controls
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Private</span>
                    <span>Only you can access the document</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Invite Only</span>
                    <span>Only specific people you invite can access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Anyone with Link</span>
                    <span>Anyone with the link can access based on permissions</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center mt-4">
          <Button asChild>
            <Link href="/test/collaboration">Try Collaboration Test</Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
} 