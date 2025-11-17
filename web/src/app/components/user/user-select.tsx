import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function UserSelect({ value, onValueChange }: UserSelectProps) {
  return (
    <Select value={value || 'all'} onValueChange={onValueChange}>
      <SelectTrigger className='w-full md:w-[180px]'>
        <SelectValue placeholder='Chọn vai trò' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả</SelectItem>
        <SelectItem value='ADMIN'>ADMIN</SelectItem>
        <SelectItem value='MANAGER'>MANAGER</SelectItem>
        <SelectItem value='USER'>USER</SelectItem>
      </SelectContent>
    </Select>
  );
}
