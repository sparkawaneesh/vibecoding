'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Home, 
  Code, 
  Paintbrush, 
  Users, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// Feature status types
type FeatureStatus = 'complete' | 'in-progress' | 'planned';

// Feature interface
interface Feature {
  name: string;
  description: string;
  status: FeatureStatus;
  path: string;
}

// Features by category
const features: Record<string, Feature[]> = {
  'Authentication': [
    {
      name: 'User Authentication',
      description: 'Secure user authentication with Clerk',
      status: 'complete',
      path: '/test/auth',
    },
    {
      name: 'User Profile',
      description: 'User profile management',
      status: 'complete',
      path: '/dashboard/profile',
    },
    {
      name: 'Settings',
      description: 'User and application preferences',
      status: 'complete',
      path: '/dashboard/settings',
    },
  ],
  'Code Editor': [
    {
      name: 'Code Editor',
      description: 'Code editing with Monaco Editor',
      status: 'complete',
      path: '/code-editor',
    },
    {
      name: 'Snippet Sharing',
      description: 'Share code snippets',
      status: 'complete',
      path: '/snippet',
    },
    {
      name: 'Real-time Collaboration',
      description: 'Real-time collaboration in the code editor',
      status: 'complete',
      path: '/test/collaboration',
    },
  ],
  'Design Tool': [
    {
      name: 'Design Canvas',
      description: 'Interactive design canvas',
      status: 'complete',
      path: '/design-tool',
    },
    {
      name: 'Productivity Tools',
      description: 'Notes, Pomodoro Timer, and Idea Board',
      status: 'complete',
      path: '/design-tool',
    },
    {
      name: 'Real-time Collaboration',
      description: 'Real-time collaboration in the design tool',
      status: 'complete',
      path: '/test/collaboration',
    },
  ],
  'Dashboard': [
    {
      name: 'Projects Dashboard',
      description: 'Overview of projects and activities',
      status: 'complete',
      path: '/dashboard',
    },
    {
      name: 'Documentation',
      description: 'Application documentation',
      status: 'complete',
      path: '/dashboard/docs',
    },
    {
      name: 'Collaboration Documentation',
      description: 'Documentation for collaboration features',
      status: 'complete',
      path: '/dashboard/docs/collaboration',
    },
  ],
};

export default function TestOverviewPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState<string>('Authentication');
  
  // Status badge component
  const StatusBadge = ({ status }: { status: FeatureStatus }) => {
    switch (status) {
      case 'complete':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Complete
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'planned':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="mr-1 h-3 w-3" />
            Planned
          </Badge>
        );
      default:
        return null;
    }
  };
  
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
        <p className="text-gray-500 mb-6">You need to sign in to view this page.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vibe Studio Feature Overview</h1>
          <p className="text-muted-foreground mt-2">
            Overview of all major features and their current status
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user?.fullName || 'Anonymous User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || 'No email'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/profile">
                    <Users className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/docs">
                    <FileText className="mr-2 h-4 w-4" />
                    Documentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 space-y-2">
            <Button className="w-full" asChild>
              <Link href="/code-editor">
                <Code className="mr-2 h-4 w-4" />
                Open Code Editor
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/design-tool">
                <Paintbrush className="mr-2 h-4 w-4" />
                Open Design Tool
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              {Object.keys(features).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(features).map(([category, featureList]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid gap-4">
                  {featureList.map(feature => (
                    <Card key={feature.name} className="overflow-hidden transition-all hover:shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                          <StatusBadge status={feature.status} />
                        </div>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-2">
                        {feature.status === 'complete' ? (
                          <Button asChild>
                            <Link href={feature.path}>
                              View <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled variant="outline">
                            {feature.status === 'in-progress' ? 'In Progress' : 'Coming Soon'}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                Current development status of Vibe Studio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Authentication and User Management</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">100%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Code Editor and Snippet Sharing</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">100%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Design Tool and Productivity Features</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">100%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Real-time Collaboration</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">100%</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Dashboard and Documentation</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">100%</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Vibe Studio development is complete with all major features. You can now use it!
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 