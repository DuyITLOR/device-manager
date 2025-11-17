'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';
import { useForm } from 'react-hook-form';
import AdminHeader from '@/components/layout/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import UsersTable from '@/components/admin/users-table';
import CreateUserDialog from '@/components/admin/create-user-dialog';
import EditUserDialog from '@/components/admin/edit-user-dialog';
import UserFilterForm from '@/components/user/user-filter-form';
import UsersPagination from '@/components/user/users-pagination';
import type { User, UserParams } from '@/lib/types/user';
import { fetchAllUsers, deleteUser } from '@/lib/services/users';

interface FilterFormData {
  name: string;
  code: string;
  role: string;
}

const AdminUsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, setValue, watch } = useForm<FilterFormData>({
    defaultValues: {
      name: searchParams.get('name') || '',
      code: searchParams.get('code') || '',
      role: searchParams.get('role') || '',
    },
  });

  const roleValue = watch('role');

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: UserParams = {
        limit: 10,
        page: curPage,
        name: searchParams.get('name') || '',
        code: searchParams.get('code') || '',
        role: searchParams.get('role') || '',
      };

      const res = await fetchAllUsers(params);
      setMembers(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi tải danh sách người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [searchParams, curPage, toast]);

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
    }
  }, [hasAccess, loadUsers]);

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams();
    if (data.name.trim()) params.set('name', data.name.trim());
    if (data.code.trim()) params.set('code', data.code.trim());
    if (data.role && data.role !== 'all') params.set('role', data.role);
    params.set('page', '1');
    setCurPage(1);
    router.replace(`?${params.toString()}`);
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?');
    if (!confirmed) return;
    try {
      await deleteUser(userId);
      toast({ title: 'Thành công', description: 'Đã xóa người dùng' });
      loadUsers();
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi xóa người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    setCurPage(newPage);
    router.replace(`?${params.toString()}`);
  };

  if (hasAccess === null || hasAccess === false) return null;

  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <AdminHeader />
        <AdminNavigation />

        <Card className='glass-card'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
              <div>
                <CardTitle className='text-2xl'>Quản lý người dùng</CardTitle>
                <CardDescription className='mt-1'>Quản lý người dùng và quyền hạn trong hệ thống</CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} size='lg'>
                <Plus className='w-4 h-4 mr-2' />
                Thêm người dùng
              </Button>
            </div>

            <UserFilterForm
              register={register}
              handleSubmit={handleSubmit}
              setValue={setValue}
              roleValue={roleValue}
              onSubmit={onSubmit}
            />
          </CardHeader>

          {loading ? (
            <CardContent>
              <div className='flex flex-col justify-center items-center h-64 space-y-4'>
                <Loader2 className='w-8 h-8 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
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

              <UsersPagination currentPage={curPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </CardContent>
          )}
        </Card>

        <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={loadUsers} />
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={editingUser}
          onSuccess={() => {
            setEditDialogOpen(false);
            setEditingUser(null);
            loadUsers();
          }}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
