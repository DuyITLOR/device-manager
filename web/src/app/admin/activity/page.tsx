'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';
import AdminNavigation from '@/components/admin/admin-navigation';
import AdminHeader from '@/components/layout/admin-header';

const AdminActivityPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Mock data
  const activities = [
    {
      id: 1,
      type: 'Loan',
      user: 'John Doe',
      device: 'MacBook Pro 16"',
      action: 'Đã mượn thiết bị',
      time: '2024-01-15 10:30',
    },
    {
      id: 2,
      type: 'Transfer',
      user: 'Jane Smith',
      device: 'iPhone 15 Pro',
      action: 'Đã chấp nhận chuyển giao',
      time: '2024-01-15 09:15',
    },
    {
      id: 3,
      type: 'Device',
      user: 'Admin User',
      device: 'iPad Air',
      action: 'Đã thêm thiết bị mới',
      time: '2024-01-14 16:45',
    },
  ];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Loan: 'Cho mượn',
      Transfer: 'Chuyển giao',
      Device: 'Thiết bị',
      User: 'Người dùng',
    };
    return labels[type] || type;
  };

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <AdminHeader />

        <AdminNavigation />

        <Card className='glass-card'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <CardTitle>Nhật ký hoạt động</CardTitle>
                <CardDescription>Theo dõi tất cả hoạt động và thay đổi hệ thống</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Select defaultValue='all'>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả loại</SelectItem>
                    <SelectItem value='loan'>Cho mượn</SelectItem>
                    <SelectItem value='transfer'>Chuyển giao</SelectItem>
                    <SelectItem value='device'>Thiết bị</SelectItem>
                    <SelectItem value='user'>Người dùng</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant='outline' className='glass-button'>
                  <Download className='w-4 h-4 mr-2' />
                  Xuất file
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {activities.map((activity) => (
                <div key={activity.id} className='flex items-start gap-4 p-4 rounded-lg glass-card'>
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'Loan'
                        ? 'bg-primary'
                        : activity.type === 'Transfer'
                        ? 'bg-secondary'
                        : 'bg-accent'
                    }`}
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Badge variant='outline' className='text-xs'>
                        {getTypeLabel(activity.type)}
                      </Badge>
                      <span className='font-medium'>{activity.user}</span>
                      <span className='text-muted-foreground'>•</span>
                      <span className='text-sm text-muted-foreground'>{activity.device}</span>
                    </div>
                    <p className='text-sm mt-1'>{activity.action}</p>
                    <p className='text-xs text-muted-foreground mt-1'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminActivityPage;
