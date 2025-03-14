'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Code, Paintbrush, Search, Clock, Star, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

// Project type definition
interface Project {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'code';
  updatedAt: Date;
  collaborators: number;
  starred: boolean;
}

// Activity type definition
interface Activity {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'create';
  projectName: string;
  projectId: string;
  timestamp: Date;
  user: {
    name: string;
    avatar: string;
  };
}

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Web Application UI',
    description: 'UI design for modern web application',
    type: 'design',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    collaborators: 3,
    starred: true,
  },
  {
    id: '2',
    name: 'API Integration',
    description: 'Integration code with third-party APIs',
    type: 'code',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    collaborators: 2,
    starred: false,
  },
  {
    id: '3',
    name: 'Landing Page',
    description: 'New landing page for company website',
    type: 'design',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    collaborators: 1,
    starred: true,
  },
  {
    id: '4',
    name: 'Data Visualization',
    description: 'Data visualization components',
    type: 'code',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    collaborators: 0,
    starred: false,
  },
];

// Mock data for recent activities
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'edit',
    projectName: 'Web Application UI',
    projectId: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    user: {
      name: 'You',
      avatar: '',
    },
  },
  {
    id: '2',
    type: 'comment',
    projectName: 'API Integration',
    projectId: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    user: {
      name: 'Amit Sharma',
      avatar: '',
    },
  },
  {
    id: '3',
    type: 'share',
    projectName: 'Landing Page',
    projectId: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    user: {
      name: 'Priya Patel',
      avatar: '',
    },
  },
  {
    id: '4',
    type: 'create',
    projectName: 'Data Visualization',
    projectId: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    user: {
      name: 'You',
      avatar: '',
    },
  },
];

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };
  
  // Filter projects based on search and active tab
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') {
      return matchesSearch;
    } else if (activeTab === 'design') {
      return matchesSearch && project.type === 'design';
    } else if (activeTab === 'code') {
      return matchesSearch && project.type === 'code';
    } else if (activeTab === 'starred') {
      return matchesSearch && project.starred;
    }
    
    return matchesSearch;
  });
  
  if (!isLoaded) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="View an overview of your projects and activities."
        />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Hello, ${user?.firstName || 'User'}!`}
        text="View an overview of your projects and activities."
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/design-tool">
              <Paintbrush className="mr-2 h-4 w-4" />
              New Design
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/code-editor">
              <Code className="mr-2 h-4 w-4" />
              New Code
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Projects</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">No projects found</p>
                    <Button asChild>
                      <Link href={activeTab === 'code' ? '/code-editor' : '/design-tool'}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Project
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-4">
              <div className="grid gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">No design projects found</p>
                    <Button asChild>
                      <Link href="/design-tool">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Design
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="mt-4">
              <div className="grid gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">No code projects found</p>
                    <Button asChild>
                      <Link href="/code-editor">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Code Project
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="starred" className="mt-4">
              <div className="grid gap-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">No starred projects found</p>
                    <p className="text-sm text-muted-foreground">
                      Click the star icon on projects to star them
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Recent activities on your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback>
                        {activity.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>{' '}
                        {activity.type === 'edit' && 'edited'}
                        {activity.type === 'comment' && 'commented on'}
                        {activity.type === 'share' && 'shared'}
                        {activity.type === 'create' && 'created'}{' '}
                        <Link href={`/project/${activity.projectId}`} className="font-medium hover:underline">
                          {activity.projectName}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/activity">
                  View All Activities
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/docs">
                    <FileText className="mr-2 h-4 w-4" />
                    Documentation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/settings">
                    <Users className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/test/collaboration">
                    <Users className="mr-2 h-4 w-4" />
                    Collaboration Test
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/test/auth">
                    <Users className="mr-2 h-4 w-4" />
                    Authentication Test
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/test/overview">
                    <FileText className="mr-2 h-4 w-4" />
                    Feature Overview
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/project/${project.id}`} className="hover:underline">
                {project.name}
              </Link>
            </CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge variant={project.type === 'design' ? 'default' : 'secondary'}>
            {project.type === 'design' ? 'Design' : 'Code'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {project.collaborators > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-3 w-3" />
                <span>{project.collaborators}</span>
              </div>
            )}
            <Star className={`h-4 w-4 ${project.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 