'use client';

import { Suspense, useEffect, useState, lazy } from 'react';
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
import { Search, QrCode, Package, ArrowLeftRight, Check, X, Loader2, Inbox } from 'lucide-react';
import { TransferRequestDetail } from '@/lib/types/transfer';
import { fetchAllTransferRequests } from '@/lib/services/transfer';
import { EmptyTransfers } from '@/components/device/empty-transfer';
import { TransferCardSkeleton } from '@/components/device/transfer-card-skeleton';

const TransferCard = lazy(() => import('@/components/device/transfer-card'));

const MyLoanDevices = () => {
  const [transferRequests, setTransferRequests] = useState<TransferRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransferRequests = async () => {
      setLoading(true);
      try {
        const response = await fetchAllTransferRequests();
        setTransferRequests(response);
      } catch (error) {
        console.error('Error fetching transfer requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferRequests();
  }, []);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Yêu cầu chuyển</h1>
        <p className='text-muted-foreground mt-1'>Quản lý các yêu cầu chuyển thiết bị</p>
      </div>

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold flex items-center gap-2'>
          <ArrowLeftRight className='w-5 h-5 text-primary' />
          Yêu cầu chuyển thiết bị
          {!loading && transferRequests.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {transferRequests.length}
            </Badge>
          )}
        </h2>

        {loading && (
          <div className='grid gap-4'>
            <TransferCardSkeleton />
            <TransferCardSkeleton />
          </div>
        )}

        {!loading && transferRequests.length === 0 && <EmptyTransfers />}
        {!loading && transferRequests.length > 0 && (
          <div
            className='overflow-y-auto space-y-4 pr-2'
            style={{
              maxHeight: 'calc(4 * (180px + 1rem))',
            }}
          >
            <Suspense
              fallback={
                <div className='flex justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-primary' />
                </div>
              }
            >
              {transferRequests.map((transfer: TransferRequestDetail) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoanDevices;
