
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { deleteUser } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { type Unit } from '@/app/page';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [unit, setUnit] = useState<Unit>('kgs');

  useEffect(() => {
    if (user) {
      const savedUnit = localStorage.getItem(`unit_${user.uid}`) as Unit;
      if (savedUnit) {
        setUnit(savedUnit);
      }
    }
  }, [user]);

  const handleUnitChange = (value: Unit) => {
    setUnit(value);
    if (user) {
      localStorage.setItem(`unit_${user.uid}`, value);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (user) {
      try {
        await deleteUser(user);
        toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });
        router.push('/signup');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            toast({
                title: "Authentication Required",
                description: "This is a sensitive action. Please log out and log back in to delete your account.",
                variant: "destructive",
                duration: 5000,
            });
        } else {
            toast({
                title: "Deletion Failed",
                description: "An error occurred while deleting your account. Please try again.",
                variant: "destructive",
            });
        }
      }
    }
  };


  return (
    <div className="container mx-auto max-w-4xl p-4 pt-6 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Settings</h1>
        </div>
      </header>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set your default units.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Units</Label>
              <RadioGroup value={unit} onValueChange={(val) => handleUnitChange(val as Unit)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kgs" id="kgs" />
                  <Label htmlFor="kgs">Kilograms (kg)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lbs" id="lbs" />
                  <Label htmlFor="lbs">Pounds (lbs)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Information about the application.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>RevUp</strong> is a smart workout logger built to demonstrate the capabilities of an AI coding assistant.</p>
                <p>It was created with Next.js, React, ShadCN, Tailwind CSS, Firebase, and Genkit.</p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
                Log Out
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and all your workout data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
