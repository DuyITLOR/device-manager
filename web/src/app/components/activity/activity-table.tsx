import { Badge } from '@/components/ui/badge';
import type { activityLogItem } from '@/lib/types/log';
import { formatTime } from '@/lib/utils/time';
import {
  ACTIVITY_ACTION_MAPPER,
  ACTIVITY_TARGET_TYPE_MAPPER,
  TARGET_TYPE_COLOR_MAPPER,
} from '@/lib/mapper/activityLog';

interface ActivityTableProps {
  activities: activityLogItem[];
}

const ActivityTable = ({ activities }: ActivityTableProps) => {
  if (activities.length === 0) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='text-muted-foreground'>Chưa có hoạt động nào</div>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {activities.map((activity) => (
        <div key={activity.id} className='flex items-start gap-4 p-4 rounded-lg glass-card'>
          <div
            className={`w-2 h-2 rounded-full mt-2 ${TARGET_TYPE_COLOR_MAPPER[activity.targetType] || 'bg-gray-500'}`}
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant='outline' className='text-xs'>
                {ACTIVITY_TARGET_TYPE_MAPPER[activity.targetType]}
              </Badge>
              <span className='font-medium'>{activity.actor?.name || 'Người dùng'}</span>
              <span className='text-muted-foreground'>•</span>
              <span className='text-sm text-muted-foreground'>
                {activity.details?.deviceName || activity.details?.name || 'Thiết bị'}
              </span>
            </div>
            <p className='text-sm mt-1'>{ACTIVITY_ACTION_MAPPER[activity.action]}</p>
            <p className='text-xs text-muted-foreground mt-1'>{formatTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTable;
