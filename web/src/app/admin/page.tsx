'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, QrCode, Edit, Trash2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';
import AdminNavigation from '@/components/admin/admin-navigation';

const AdminDashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);

  // Mock data
  const devices = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      serialNumber: 'MBP-2024-001',
      status: 'in-use',
      assignedTo: 'John Doe',
      lastActivity: '2024-01-15',
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      serialNumber: 'IP15-2024-042',
      status: 'available',
      assignedTo: '-',
      lastActivity: '2024-01-10',
    },
    {
      id: 3,
      name: 'iPad Air',
      serialNumber: 'IPA-2024-123',
      status: 'in-use',
      assignedTo: 'Jane Smith',
      lastActivity: '2024-01-14',
    },
  ];

  const toggleDeviceSelection = (id: number) => {
    setSelectedDevices((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleExportQR = () => {
    console.log('Exporting QR codes for devices:', selectedDevices);
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
                <CardTitle>Device Management</CardTitle>
                <CardDescription>Add, edit, and manage all equipment</CardDescription>
              </div>
              <div className='flex gap-2'>
                {selectedDevices.length > 0 && (
                  <Button variant='outline' onClick={handleExportQR} className='glass-button'>
                    <QrCode className='w-4 h-4 mr-2' />
                    Export QR ({selectedDevices.length})
                  </Button>
                )}
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Device
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='mb-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  placeholder='Search devices...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='rounded-lg border overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>
                      <input type='checkbox' className='rounded' aria-label='Chọn tất cả thiết bị' />
                    </TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <input
                          type='checkbox'
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          className='rounded'
                          aria-label={`Chọn thiết bị ${device.name}`}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>{device.name}</TableCell>
                      <TableCell className='text-muted-foreground'>{device.serialNumber}</TableCell>
                      <TableCell>
                        <Badge variant={device.status === 'available' ? 'secondary' : 'default'}>{device.status}</Badge>
                      </TableCell>
                      <TableCell>{device.assignedTo}</TableCell>
                      <TableCell className='text-muted-foreground'>{device.lastActivity}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button size='sm' variant='ghost'>
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button size='sm' variant='ghost'>
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
