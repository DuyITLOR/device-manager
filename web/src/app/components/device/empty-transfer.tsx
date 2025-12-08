import { Inbox } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export const EmptyTransfers = () => (
  <Card className='glass-card'>
    <CardContent className='flex flex-col items-center justify-center py-12'>
      <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
        <Inbox className='w-8 h-8 text-muted-foreground' />
      </div>
      <h3 className='text-lg font-semibold mb-2'>Không có yêu cầu chuyển thiết bị</h3>
      <p className='text-sm text-muted-foreground text-center max-w-sm'>
        Bạn chưa có yêu cầu chuyển thiết bị nào. Các yêu cầu sẽ hiển thị ở đây khi có.
      </p>
    </CardContent>
  </Card>
);
