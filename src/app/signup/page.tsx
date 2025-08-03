
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }
    if (password.length < 6) {
      toast({
          title: "Password too short",
          description: "Password must be at least 6 characters.",
          variant: "destructive",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const user = userCredential.user;
      if (user) {
        // Also initialize their workout data
        localStorage.setItem(`workouts_${user.uid}`, JSON.stringify({}));
        localStorage.setItem(`templates_${user.uid}`, JSON.stringify({}));
        localStorage.setItem(`finishedWorkouts_${user.uid}`, JSON.stringify([]));
        localStorage.setItem(`unit_${user.uid}`, 'kgs');

        toast({
          title: 'Account Created!',
          description: "Welcome to RevUp! Let's create your first workout template.",
        });
        
        login(user);
        router.push('/templates/edit/new');
      }
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast({
                title: 'Email already in use',
                description: 'Please use a different email address.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Signup Failed',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-12">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle>Create your RevUp Account</CardTitle>
          <CardDescription>Join us to track your fitness journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your_email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (at least 6 characters)</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" />
          </div>
          <Button className="w-full" onClick={handleSignup}>Create Account</Button>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
            <Logo/>
            <p className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
