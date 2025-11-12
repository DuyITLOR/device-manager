'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types/user';

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <div className='rounded-lg border overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((member) => (
            <TableRow key={member.id}>
              <TableCell className='font-medium'>{member.name}</TableCell>
              <TableCell className='text-muted-foreground'>{member.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>{member.role}</Badge>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Button size='sm' variant='ghost'>
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button size='sm' variant='ghost'>
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

