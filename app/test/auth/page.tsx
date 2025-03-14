'use client';

import { useState } from 'react';
import { useUser, useAuth, SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, Calendar, Shield, LogOut, Home } from 'lucide-react';
import Link from 'next/link';

export default function AuthTestPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Format date
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // Get JWT token
  const handleGetToken = async () => {
    setIsLoadingToken(true);
    try {
      const jwt = await getToken();
      setToken(jwt);
    } catch (error) {
      console.error('Error getting token:', error);
    } finally {
      setIsLoadingToken(false);
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
        <p className="text-gray-500 mb-6">You need to sign in to access this page.</p>
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
        <h1 className="text-3xl font-bold">Authentication Test</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              User Profile
            </CardTitle>
            <CardDescription>
              Your account information from Clerk authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{user?.fullName || 'Anonymous User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.username || 'No username'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {user?.primaryEmailAddress?.emailAddress || 'No email address'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created: {formatDate(user?.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Last Updated: {formatDate(user?.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  User ID: {user?.id}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">
                Edit Profile
              </Link>
            </Button>
            <SignOutButton>
              <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </SignOutButton>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Tests</CardTitle>
            <CardDescription>
              Test various authentication features and capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="token">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="token">JWT Token</TabsTrigger>
                <TabsTrigger value="session">Session Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="token" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Get a JWT token for the current user. This token can be used to authenticate API requests.
                </p>
                
                <Button 
                  onClick={handleGetToken} 
                  disabled={isLoadingToken}
                  className="w-full"
                >
                  {isLoadingToken ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Token...
                    </>
                  ) : (
                    'Get JWT Token'
                  )}
                </Button>
                
                {token && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Your JWT Token:</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs break-all">{token}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This token can be used to authenticate API requests. It expires after a short period.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="session" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Information about your current authentication session.
                </p>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Session Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs">Signed In:</div>
                      <div className="text-xs font-medium">
                        {isSignedIn ? (
                          <span className="text-green-500">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </div>
                      
                      <div className="text-xs">Auth Provider:</div>
                      <div className="text-xs font-medium">
                        {user?.primaryEmailAddress?.verification.strategy || 'Unknown'}
                      </div>
                      
                      <div className="text-xs">Email Verified:</div>
                      <div className="text-xs font-medium">
                        {user?.primaryEmailAddress?.verification.status === 'verified' ? (
                          <span className="text-green-500">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/test/collaboration">
                Go to Collaboration Test
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 