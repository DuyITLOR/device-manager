import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ACTIVITY_ACTION_MAPPER } from '@/lib/mapper/activityLog';

interface ActivityFilterFormProps {
  selectedAction: string;
  onActionChange: (value: string) => void;
}

const ActivityFilterForm = ({ selectedAction, onActionChange }: ActivityFilterFormProps) => {
  return (
    <div className='flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4'>
      <Select value={selectedAction} onValueChange={onActionChange}>
        <SelectTrigger className='w-48'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Tất cả</SelectItem>
          {Object.entries(ACTIVITY_ACTION_MAPPER).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityFilterForm;
