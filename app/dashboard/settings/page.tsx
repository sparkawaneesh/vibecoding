'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const { isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // App preferences state
  const [preferences, setPreferences] = useState({
    theme: 'system',
    codeEditor: {
      fontSize: '14',
      tabSize: '2',
      lineNumbers: true,
      wordWrap: true,
      autoSave: true,
    },
    designTool: {
      showGrid: true,
      snapToGrid: true,
      darkCanvas: false,
      autosave: true,
    },
    notifications: {
      emailUpdates: true,
      collaborationAlerts: true,
      marketingEmails: false,
    }
  });
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    bio: '',
    website: '',
    company: '',
    jobTitle: '',
  });
  
  // Initialize profile from user data when loaded
  useEffect(() => {
    if (isLoaded && user) {
      setProfile({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: '',
        website: '',
        company: '',
        jobTitle: '',
      });
    }
  }, [isLoaded, user]);
  
  // Handle preference changes
  const handlePreferenceChange = (section: string, setting: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [setting]: value
      }
    }));
  };
  
  // Handle profile changes
  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save preferences
  const savePreferences = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences Saved",
        description: "Your application preferences have been successfully updated.",
      });
    }, 1000);
  };
  
  // Save profile
  const saveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update user profile via Clerk
      await user.update({
        firstName: profile.fullName.split(' ')[0],
        lastName: profile.fullName.split(' ').slice(1).join(' '),
        username: profile.username,
      });
      
      // For other fields, you would typically save to your database
      // This is simulated here
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Settings"
          text="Manage your profile and application preferences."
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
        heading="Settings"
        text="Manage your profile and application preferences."
      />
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Profile Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profile.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={profile.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://example.com"
                    value={profile.website}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={profile.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    value={profile.jobTitle}
                    onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Set preferences to customize your Vibe Studio experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={preferences.theme} 
                  onValueChange={(value) => setPreferences({...preferences, theme: value})}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System (Default)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Code Editor</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select 
                      value={preferences.codeEditor.fontSize} 
                      onValueChange={(value) => handlePreferenceChange('codeEditor', 'fontSize', value)}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12px</SelectItem>
                        <SelectItem value="14">14px</SelectItem>
                        <SelectItem value="16">16px</SelectItem>
                        <SelectItem value="18">18px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tabSize">Tab Size</Label>
                    <Select 
                      value={preferences.codeEditor.tabSize} 
                      onValueChange={(value) => handlePreferenceChange('codeEditor', 'tabSize', value)}
                    >
                      <SelectTrigger id="tabSize">
                        <SelectValue placeholder="Select tab size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 spaces</SelectItem>
                        <SelectItem value="4">4 spaces</SelectItem>
                        <SelectItem value="8">8 spaces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="lineNumbers" 
                      checked={preferences.codeEditor.lineNumbers}
                      onCheckedChange={(checked) => handlePreferenceChange('codeEditor', 'lineNumbers', checked)}
                    />
                    <Label htmlFor="lineNumbers">Show Line Numbers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="wordWrap" 
                      checked={preferences.codeEditor.wordWrap}
                      onCheckedChange={(checked) => handlePreferenceChange('codeEditor', 'wordWrap', checked)}
                    />
                    <Label htmlFor="wordWrap">Word Wrap</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoSave" 
                      checked={preferences.codeEditor.autoSave}
                      onCheckedChange={(checked) => handlePreferenceChange('codeEditor', 'autoSave', checked)}
                    />
                    <Label htmlFor="autoSave">Auto Save</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Design Tool</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="showGrid" 
                      checked={preferences.designTool.showGrid}
                      onCheckedChange={(checked) => handlePreferenceChange('designTool', 'showGrid', checked)}
                    />
                    <Label htmlFor="showGrid">Show Grid</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="snapToGrid" 
                      checked={preferences.designTool.snapToGrid}
                      onCheckedChange={(checked) => handlePreferenceChange('designTool', 'snapToGrid', checked)}
                    />
                    <Label htmlFor="snapToGrid">Snap to Grid</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="darkCanvas" 
                      checked={preferences.designTool.darkCanvas}
                      onCheckedChange={(checked) => handlePreferenceChange('designTool', 'darkCanvas', checked)}
                    />
                    <Label htmlFor="darkCanvas">Dark Canvas</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autosaveDesign" 
                      checked={preferences.designTool.autosave}
                      onCheckedChange={(checked) => handlePreferenceChange('designTool', 'autosave', checked)}
                    />
                    <Label htmlFor="autosaveDesign">Auto Save</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePreferences} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage your notification settings and control what types of notifications you receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailUpdates">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about important updates and features.
                    </p>
                  </div>
                  <Switch 
                    id="emailUpdates" 
                    checked={preferences.notifications.emailUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'emailUpdates', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="collaborationAlerts">Collaboration Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone comments on or changes your project.
                    </p>
                  </div>
                  <Switch 
                    id="collaborationAlerts" 
                    checked={preferences.notifications.collaborationAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'collaborationAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features, offers, and promotions.
                    </p>
                  </div>
                  <Switch 
                    id="marketingEmails" 
                    checked={preferences.notifications.marketingEmails}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'marketingEmails', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePreferences} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
} 