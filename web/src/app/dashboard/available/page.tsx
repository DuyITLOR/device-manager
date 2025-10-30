'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, QrCode, Package } from 'lucide-react';

const AvailableDevices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);

  // Mock data - available devices
  const devices = [
    { id: 5, name: 'MacBook Air M2', serialNumber: 'MBA-2024-005', status: 'available', category: 'Laptop' },
    { id: 6, name: 'iPhone 14', serialNumber: 'IP14-2024-012', status: 'available', category: 'Phone' },
    { id: 7, name: 'iPad Pro 11"', serialNumber: 'IPP-2024-034', status: 'available', category: 'Tablet' },
    { id: 8, name: 'Magic Keyboard', serialNumber: 'MK-2024-067', status: 'available', category: 'Accessory' },
    { id: 9, name: 'AirPods Pro', serialNumber: 'APP-2024-089', status: 'available', category: 'Accessory' },
    { id: 10, name: 'Dell Monitor 27"', serialNumber: 'DM-2024-045', status: 'available', category: 'Monitor' },
  ];

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Available Devices</h1>
        <p className='text-muted-foreground mt-1'>Browse and borrow available equipment</p>
      </div>

      {/* Search Bar */}
      <Card className='glass-card'>
        <CardContent className='pt-6'>
          <div className='flex gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search devices...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button className='flex-shrink-0'>
              <QrCode className='w-4 h-4 mr-2' />
              Scan QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Devices Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredDevices.map((device) => (
          <Card
            key={device.id}
            className='glass-card hover:shadow-xl transition-all cursor-pointer'
            onClick={() => {
              setSelectedDevice(device);
              setBorrowDialogOpen(true);
            }}
          >
            <CardHeader>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-3'>
                <Package className='w-6 h-6 text-white' />
              </div>
              <CardTitle className='text-lg'>{device.name}</CardTitle>
              <CardDescription>{device.serialNumber}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Badge variant='secondary' className='bg-green-500/10 text-green-600 dark:text-green-400'>
                {device.status}
              </Badge>
              <Badge variant='outline'>{device.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <Card className='glass-card'>
          <CardContent className='pt-6 text-center text-muted-foreground'>
            No devices found matching your search.
          </CardContent>
        </Card>
      )}

      {/* Borrow Dialog */}
      <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
        <DialogContent className='glass-card'>
          <DialogHeader>
            <DialogTitle>Borrow Device</DialogTitle>
            <DialogDescription>Request to borrow {selectedDevice?.name}</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Device Details</p>
              <div className='glass-card p-4 space-y-2'>
                <p className='text-sm'>
                  <span className='font-medium'>Name:</span> {selectedDevice?.name}
                </p>
                <p className='text-sm'>
                  <span className='font-medium'>Serial:</span> {selectedDevice?.serialNumber}
                </p>
                <p className='text-sm'>
                  <span className='font-medium'>Category:</span> {selectedDevice?.category}
                </p>
              </div>
            </div>
            <div className='space-y-2'>
              <label htmlFor='reason' className='text-sm font-medium'>
                Reason for borrowing
              </label>
              <Input id='reason' placeholder='Enter reason...' />
            </div>
            <div className='space-y-2'>
              <label htmlFor='duration' className='text-sm font-medium'>
                Expected duration (days)
              </label>
              <Input id='duration' type='number' placeholder='7' />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setBorrowDialogOpen(false)} className='glass-button'>
              Cancel
            </Button>
            <Button onClick={() => setBorrowDialogOpen(false)}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableDevices;
