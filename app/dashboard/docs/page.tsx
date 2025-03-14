'use client';

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Code, 
  Palette, 
  Users, 
  FileText, 
  Settings, 
  Keyboard, 
  Zap, 
  PanelRight, 
  Clock, 
  Lightbulb,
  BookOpen
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Documentation"
        text="Learn how to use Vibe Studio effectively."
      />
      
      <div className="grid gap-6 mt-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to Vibe Studio Documentation</h2>
          <p className="text-white/90 mb-4">
            Explore our comprehensive guides to get the most out of Vibe Studio's powerful features.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" asChild>
              <Link href="#getting-started">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" asChild>
              <Link href="https://github.com/yourusername/vibe-studio" target="_blank">
                GitHub Repository
              </Link>
            </Button>
          </div>
        </div>
        
        <h2 id="getting-started" className="text-2xl font-bold mt-8 mb-4">Getting Started</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Code Editor</CardTitle>
              <Code className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn how to use our powerful code editor with syntax highlighting, debugging, and AI assistance.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/docs/code-editor">
                  View Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Design Tool</CardTitle>
              <Palette className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover how to create beautiful designs with our intuitive canvas and collaborative tools.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/docs/design-tool">
                  View Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Collaboration</CardTitle>
              <Users className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn how to collaborate with your team in real-time using our powerful collaboration features.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/docs/collaboration">
                  View Guide
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-blue-500" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>
                Boost your productivity with keyboard shortcuts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm">Save</span>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm">Open File</span>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Ctrl+O</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm">Focus Mode</span>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">F</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm">Collaboration</span>
                    <kbd className="px-2 py-1 bg-background rounded text-xs">C</kbd>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/docs/shortcuts">
                    View All Shortcuts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PanelRight className="h-5 w-5 text-purple-500" />
                Productivity Tools
              </CardTitle>
              <CardDescription>
                Enhance your workflow with built-in productivity tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Pomodoro Timer for focused work sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Notes Panel for quick thoughts and reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Idea Board for brainstorming and organizing concepts</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/docs/productivity">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Additional Resources</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Documentation</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Explore our API documentation for integrating with Vibe Studio.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/dashboard/docs/api">
                  View API Docs
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutorials</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Step-by-step tutorials to help you master Vibe Studio.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/dashboard/docs/tutorials">
                  View Tutorials
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure Vibe Studio to match your preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/dashboard/settings">
                  Go to Settings
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="bg-muted rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium mb-2">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            If you can't find what you're looking for in our documentation, feel free to reach out to our support team.
          </p>
          <Button asChild>
            <Link href="mailto:support@vibestudio.com">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
} 