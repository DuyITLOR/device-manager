'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { signin } from '@/lib/services/auth';
import { getRole, saveName, saveRole, saveToken } from '@/lib/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigation = () => {
    const userRole = getRole();
    if (userRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signin({ email, password });

      saveToken(res.data.accessToken);
      saveName(res.data.user.name);
      saveRole(res.data.user.role);

      handleNavigation();

      toast({ title: 'Đăng nhập thành công', description: `Xin chào ${res.data.user?.name}`, variant: 'success' });
    } catch (error: any) {
      console.error('Login failed:', error);
      let msg = error?.message ?? error?.data?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (error?.status === 401) {
        msg = 'Sai tên đăng nhập hoặc mật khẩu';
      }
      toast({ title: 'Đăng nhập thất bại', description: String(msg), variant: 'destructive' });
    } finally {
      setLoading(false);
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
          <CardTitle className='text-2xl font-bold'>Chào mừng quay trở lại</CardTitle>
          <CardDescription>Đăng nhập để quản lý thiết bị của bạn </CardDescription>
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
              <Label htmlFor='password'>Mật khẩu</Label>
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
            <Button type='submit' className='w-full h-11' disabled={loading}>
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
