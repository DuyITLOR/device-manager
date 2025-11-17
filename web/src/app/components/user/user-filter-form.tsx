'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { UseFormRegister, UseFormSetValue, UseFormHandleSubmit } from 'react-hook-form';
import UserSelect from './user-select';

interface FilterFormData {
  name: string;
  code: string;
  role: string;
}

interface UserFilterFormProps {
  register: UseFormRegister<FilterFormData>;
  handleSubmit: UseFormHandleSubmit<FilterFormData>;
  setValue: UseFormSetValue<FilterFormData>;
  roleValue: string;
  onSubmit: (data: FilterFormData) => void;
}

export default function UserFilterForm({ register, handleSubmit, setValue, roleValue, onSubmit }: UserFilterFormProps) {
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
        <Input
          {...register('code')}
          placeholder='Tìm theo mã'
          className='flex-1'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        <UserSelect value={roleValue} onValueChange={(value) => setValue('role', value)} />
        <Button type='submit' className='w-full md:w-[120px]'>
          <Search className='w-4 h-4 mr-2' />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
