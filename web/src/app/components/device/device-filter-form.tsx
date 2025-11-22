'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { UseFormRegister, UseFormSetValue, UseFormHandleSubmit } from 'react-hook-form';
import DeviceStatusSelect from './device-status-select';

interface FilterFormData {
  name: string;
  status: string;
}

interface DeviceFilterFormProps {
  register: UseFormRegister<FilterFormData>;
  handleSubmit: UseFormHandleSubmit<FilterFormData>;
  setValue: UseFormSetValue<FilterFormData>;
  statusValue: string;
  onSubmit: (data: FilterFormData) => void;
}

export default function DeviceFilterForm({
  register,
  handleSubmit,
  setValue,
  statusValue,
  onSubmit,
}: DeviceFilterFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='flex flex-col md:flex-row gap-3'>
        <Input
          {...register('name')}
          placeholder='Tìm theo tên'
          className='flex-1'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        <DeviceStatusSelect value={statusValue} onValueChange={(value) => setValue('status', value)} />
        <Button type='submit' className='w-full md:w-[120px]'>
          <Search className='w-4 h-4 mr-2' />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
