'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types/user';

interface UsersTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className='rounded-lg border overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className='hidden md:table-cell'>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead className='text-right'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((member) => (
            <TableRow key={member.id}>
              <TableCell className='font-medium'>{member.name}</TableCell>
              <TableCell className='text-muted-foreground'>{member.code}</TableCell>
              <TableCell className=' hidden md:table-cell text-muted-foreground'>{member.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>{member.role}</Badge>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Button size='sm' variant='ghost' onClick={() => onEdit?.(member)}>
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button size='sm' variant='ghost' onClick={() => onDelete?.(member.id)}>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
