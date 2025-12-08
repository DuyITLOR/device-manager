import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Check, Package, X } from 'lucide-react';
import { Button } from '../ui/button';
import type { Device } from '@/lib/types/device';
import { TransferRequestDetail } from '@/lib/types/transfer';

interface TransferCardProps {
  transfer: TransferRequestDetail;
}

const TransferCard = ({ transfer }: TransferCardProps) => {
  return (
    <Card key={transfer.id} className='glass-card border-primary/50'>
      <CardContent className='pt-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-start gap-4'>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0'>
              <Package className='w-6 h-6 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-lg'>{transfer.device.name}</h3>
              <p className='text-sm text-primary mt-1'>Chuyển đến: {transfer.userRequestDevice.name} </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button size='sm' variant='default'>
              <Check className='w-4 h-4 mr-1' />
              Chấp nhận
            </Button>
            <Button size='sm' variant='outline' className='glass-button'>
              <X className='w-4 h-4 mr-1' />
              Từ chối
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferCard;
