
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      login(userCredential.user);
      router.push('/');
    } catch (error) {
      toast({
        title: 'Invalid Credentials',
        description: 'Please check your email and password.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="mt-4">Welcome to RevUp</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your_email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <Button className="w-full" onClick={handleLogin}>Login</Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            New to RevUp? <Link href="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
