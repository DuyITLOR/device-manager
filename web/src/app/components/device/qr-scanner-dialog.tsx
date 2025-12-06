'use client';

import * as React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';
import { useState } from 'react';

interface QRScannerDialogProps {
  onScanSuccess: (result: string) => void;
}

export function QRScannerDialog({ onScanSuccess }: QRScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      setOpen(false);
      onScanSuccess(code);
    }
  };

  const handleError = (err: any) => {
    setError(err?.message || 'Lỗi camera');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <ScanLine className='h-4 w-4' />
          Quét QR Thiết bị
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Quét mã QR</DialogTitle>
          <DialogDescription>Đưa mã QR của thiết bị vào khung hình để tìm kiếm.</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col items-center justify-center p-2'>
          <div className='aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border-2 border-primary/50 relative'>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              components={{
                finder: true,
              }}
              constraints={{
                facingMode: 'environment',
              }}
            />
          </div>

          {error && <p className='text-destructive text-sm mt-4 text-center'>Lỗi: {error}. Hãy cấp quyền camera.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
