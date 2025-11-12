'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signup } from '@/lib/services/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'MANAGER',
  });

  useEffect(() => {
    if (!open) {
      // Reset form and password visibility when dialog closes
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      });
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await signup(formData);
      toast({
        title: 'Thành công',
        description: 'Tạo tài khoản thành công',
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      });
      setShowPassword(false);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const msg = error?.message ?? 'Tạo tài khoản thất bại. Vui lòng thử lại.';
      toast({
        title: 'Lỗi',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Tạo tài khoản mới</DialogTitle>
          <DialogDescription>Điền thông tin để tạo tài khoản người dùng mới</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Tên</Label>
              <Input
                id='name'
                placeholder='Nguyen Van A'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                  minLength={6}
                  className='pr-10'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <Eye className='h-4 w-4 text-muted-foreground' />
                  )}
                  <span className='sr-only'>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                </Button>
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='role'>Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'USER' | 'ADMIN' | 'MANAGER') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={loading}
              >
                <SelectTrigger id='role'>
                  <SelectValue placeholder='Chọn vai trò' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USER'>USER</SelectItem>
                  <SelectItem value='ADMIN'>ADMIN</SelectItem>
                  <SelectItem value='MANAGER'>MANAGER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

