import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEVICE_STATUS_MAP } from '@/lib/mapper/deviceStatus';

interface DeviceStatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function DeviceStatusSelect({ value, onValueChange }: DeviceStatusSelectProps) {
  return (
    <Select value={value || 'all'} onValueChange={onValueChange}>
      <SelectTrigger className='w-full md:w-[180px]'>
        <SelectValue placeholder='Chọn trạng thái' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả</SelectItem>
        <SelectItem value='AVAILABLE'>{DEVICE_STATUS_MAP.AVAILABLE}</SelectItem>
        <SelectItem value='BORROWED'>{DEVICE_STATUS_MAP.BORROWED}</SelectItem>
        <SelectItem value='MAINTENANCE'>{DEVICE_STATUS_MAP.MAINTENANCE}</SelectItem>
      </SelectContent>
    </Select>
  );
}
