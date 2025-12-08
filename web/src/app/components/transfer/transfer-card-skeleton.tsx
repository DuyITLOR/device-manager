import { Card, CardContent, CardHeader } from '../ui/card';

export const TransferCardSkeleton = () => (
  <Card className='glass-card animate-pulse'>
    <CardHeader className='space-y-2'>
      <div className='h-4 bg-muted rounded w-3/4'></div>
      <div className='h-3 bg-muted rounded w-1/2'></div>
    </CardHeader>
    <CardContent className='space-y-2'>
      <div className='h-3 bg-muted rounded w-full'></div>
      <div className='h-3 bg-muted rounded w-2/3'></div>
    </CardContent>
  </Card>
);
