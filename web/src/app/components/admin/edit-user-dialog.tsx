'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/lib/types/user';
import { updateUser } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: (updated: User) => void;
}

export default function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('USER');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setCode(user.code ?? '');
      setRole(user.role ?? 'USER');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUser(user.id, { name, code, role });
      toast({ title: 'Cập nhật thành công' });
      onOpenChange(false);
      onSuccess?.(updated as User);
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi cập nhật người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Tên</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Mã</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Vai trò</label>
            <Select onValueChange={(v) => setRole(v)} value={role}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>ADMIN</SelectItem>
                <SelectItem value='MANAGER'>MANAGER</SelectItem>
                <SelectItem value='USER'>USER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
