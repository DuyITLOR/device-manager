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
      action: 'Borrowed device',
      time: '2024-01-15 10:30',
    },
    {
      id: 2,
      type: 'Transfer',
      user: 'Jane Smith',
      device: 'iPhone 15 Pro',
      action: 'Accepted transfer',
      time: '2024-01-15 09:15',
    },
    {
      id: 3,
      type: 'Device',
      user: 'Admin User',
      device: 'iPad Air',
      action: 'Added new device',
      time: '2024-01-14 16:45',
    },
  ];

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
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
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Track all system activities and changes</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Select defaultValue='all'>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='loan'>Loan</SelectItem>
                    <SelectItem value='transfer'>Transfer</SelectItem>
                    <SelectItem value='device'>Device</SelectItem>
                    <SelectItem value='user'>User</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant='outline' className='glass-button'>
                  <Download className='w-4 h-4 mr-2' />
                  Export
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
                        {activity.type}
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

