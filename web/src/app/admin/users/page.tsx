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
import type { User } from '@/lib/types/user';
import { fetchAllUsers } from '@/lib/services/users';

const AdminUsersPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
            <h1 className='text-3xl font-bold gradient-text'>Admin Dashboard</h1>
            <p className='text-muted-foreground mt-1'>Manage devices, users, and system activity</p>
          </div>
          <Button variant='outline' onClick={() => router.push('/')} className='glass-button'>
            <LogOut className='w-4 h-4 mr-2' />
            Logout
          </Button>
        </div>

        <AdminNavigation />

        <Card className='glass-card'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>Manage team members and permissions</CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Add Member
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
              <UsersTable users={members} />
            </CardContent>
          )}
        </Card>

        <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={loadUsers} />
      </div>
    </div>
  );
};

export default AdminUsersPage;
