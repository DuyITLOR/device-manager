'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, QrCode, Download, Edit, Trash2, Users, Package, History, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';

const AdminDashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('devices');
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

  const members = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', devices: 3, lastActive: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', devices: 2, lastActive: '2024-01-14' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin', devices: 0, lastActive: '2024-01-15' },
  ];

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

        <div className='grid md:grid-cols-3 gap-4'>
          <Card className='glass-card'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center'>
                  <Package className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Devices</p>
                  <p className='text-2xl font-bold'>{devices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='glass-card'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center'>
                  <Users className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Active Users</p>
                  <p className='text-2xl font-bold'>{members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='glass-card'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center'>
                  <History className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Today&apos;s Activities</p>
                  <p className='text-2xl font-bold'>{activities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-6'>
          <TabsList className='glass-card'>
            <TabsTrigger value='devices'>Devices</TabsTrigger>
            <TabsTrigger value='members'>Members</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>
          <TabsContent value='devices' className='space-y-4'>
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
                            <Badge variant={device.status === 'available' ? 'secondary' : 'default'}>
                              {device.status}
                            </Badge>
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
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value='members' className='space-y-4'>
            <Card className='glass-card'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                  <div>
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>Manage team members and permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='rounded-lg border overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Devices</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className='font-medium'>{member.name}</TableCell>
                          <TableCell className='text-muted-foreground'>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>{member.role}</Badge>
                          </TableCell>
                          <TableCell>{member.devices}</TableCell>
                          <TableCell className='text-muted-foreground'>{member.lastActive}</TableCell>
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity' className='space-y-4'>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
