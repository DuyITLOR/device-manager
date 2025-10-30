'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication
    // For demo, redirect based on email
    if (email.includes('admin') || email.includes('manager')) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5' />

      <Card className='w-full max-w-md glass-card relative z-10'>
        <CardHeader className='space-y-4 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center'>
            <Package className='w-8 h-8 text-white' />
          </div>
          <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
          <CardDescription>Sign in to manage your devices</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='glass-card'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='glass-card'
              />
            </div>
            <Button type='submit' className='w-full h-11'>
              Sign In
            </Button>
            <div className='text-center text-sm text-muted-foreground'>
              Demo: Use admin@example.com for admin view or user@example.com for user view
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
