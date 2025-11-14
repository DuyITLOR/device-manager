'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';
import AdminNavigation from '@/components/admin/admin-navigation';
import UsersTable from '@/components/admin/users-table';
import CreateUserDialog from '@/components/admin/create-user-dialog';
import EditUserDialog from '@/components/admin/edit-user-dialog';
import type { User } from '@/lib/types/user';
import { fetchAllUsers, deleteUser } from '@/lib/services/users';

const AdminUsersPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await fetchAllUsers();
      setMembers(list);
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi lấy danh sách người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?');
    if (!confirmed) return;
    try {
      await deleteUser(userId);
      toast({ title: 'Thành công', description: 'Đã xóa người dùng', variant: 'success' });
      loadUsers();
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi xóa người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold gradient-text'>Bảng điều khiển Admin</h1>
            <p className='text-muted-foreground mt-1'>Quản lý thiết bị, người dùng và hoạt động hệ thống</p>
          </div>
          <Button variant='outline' onClick={() => router.push('/')} className='glass-button'>
            <LogOut className='w-4 h-4 mr-2' />
            Đăng xuất
          </Button>
        </div>

        <AdminNavigation />

        <Card className='glass-card'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <CardTitle>Quản lý người dùng</CardTitle>
                <CardDescription>Quản lý người dùng và quyền hạn</CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Thêm người dùng
              </Button>
            </div>
          </CardHeader>
          {loading ? (
            <CardContent>
              <div className='flex justify-center items-center h-48'>
                <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <UsersTable
                users={members}
                onEdit={(u) => {
                  setEditingUser(u);
                  setEditDialogOpen(true);
                }}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          )}
        </Card>

        <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={loadUsers} />
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={editingUser}
          onSuccess={(updated: User) => {
            setEditDialogOpen(false);
            setEditingUser(null);
          }}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
