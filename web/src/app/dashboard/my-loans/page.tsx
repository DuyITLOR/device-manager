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
import { Search, QrCode, Package, ArrowLeftRight, Check, X } from 'lucide-react';

const MyLoanDevices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Mock data
  const devices = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      serialNumber: 'MBP-2024-001',
      status: 'active',
      pendingTransfer: true,
      from: 'John Doe',
      borrowDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      serialNumber: 'IP15-2024-042',
      status: 'active',
      pendingTransfer: false,
      borrowDate: '2024-01-10',
    },
    {
      id: 3,
      name: 'iPad Air',
      serialNumber: 'IPA-2024-123',
      status: 'active',
      pendingTransfer: false,
      borrowDate: '2024-01-20',
    },
    {
      id: 4,
      name: 'Magic Mouse',
      serialNumber: 'MM-2024-089',
      status: 'active',
      pendingTransfer: false,
      borrowDate: '2024-01-18',
    },
  ];

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDevices = filteredDevices.filter((d) => d.pendingTransfer);
  const activeDevices = filteredDevices.filter((d) => !d.pendingTransfer);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold gradient-text'>My Loan Devices</h1>
        <p className='text-muted-foreground mt-1'>Manage your borrowed equipment</p>
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

      {/* Pending Transfers */}
      {pendingDevices.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold flex items-center gap-2'>
            <ArrowLeftRight className='w-5 h-5 text-primary' />
            Pending Transfers
          </h2>
          <div className='grid gap-4'>
            {pendingDevices.map((device) => (
              <Card key={device.id} className='glass-card border-primary/50'>
                <CardContent className='pt-6'>
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0'>
                        <Package className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg'>{device.name}</h3>
                        <p className='text-sm text-muted-foreground'>{device.serialNumber}</p>
                        <p className='text-sm text-primary mt-1'>Transfer from: {device.from}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button size='sm' variant='default'>
                        <Check className='w-4 h-4 mr-1' />
                        Accept
                      </Button>
                      <Button size='sm' variant='outline' className='glass-button'>
                        <X className='w-4 h-4 mr-1' />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Devices */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>My Equipment</h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {activeDevices.map((device) => (
            <Card
              key={device.id}
              className='glass-card hover:shadow-xl transition-all cursor-pointer'
              onClick={() => {
                setSelectedDevice(device);
                setTransferDialogOpen(true);
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
                <Badge variant='secondary' className='bg-primary/10 text-primary'>
                  {device.status}
                </Badge>
                <p className='text-xs text-muted-foreground'>Borrowed: {device.borrowDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredDevices.length === 0 && (
        <Card className='glass-card'>
          <CardContent className='pt-6 text-center text-muted-foreground'>No loaned devices found.</CardContent>
        </Card>
      )}

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className='glass-card'>
          <DialogHeader>
            <DialogTitle>Request Transfer</DialogTitle>
            <DialogDescription>Transfer ownership of {selectedDevice?.name} to another user</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label htmlFor='recipient' className='text-sm font-medium'>
                Recipient Email
              </label>
              <Input id='recipient' placeholder='recipient@example.com' />
            </div>
            <div className='space-y-2'>
              <label htmlFor='note' className='text-sm font-medium'>
                Note (Optional)
              </label>
              <Input id='note' placeholder='Add a note...' />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setTransferDialogOpen(false)} className='glass-button'>
              Cancel
            </Button>
            <Button onClick={() => setTransferDialogOpen(false)}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLoanDevices;
