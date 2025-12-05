import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, ChevronDown } from 'lucide-react';

interface AccountDropdownProps {
  onLogout: () => void;
  onChangePassword: () => void;
  userName?: string;
}

export default function AccountDropdown({ onLogout, onChangePassword, userName = 'User' }: AccountDropdownProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className='focus:outline-none'>
          <div className='flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/ava.png' alt={userName} />
              <AvatarFallback>{userName}</AvatarFallback>
            </Avatar>
            <div className='hidden sm:flex flex-col items-start'>
              <span className='text-sm font-medium'>{userName}</span>
            </div>
            <ChevronDown className='h-4 w-4 text-muted-foreground hidden sm:block' />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium'>{userName}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onChangePassword}>
            <Settings className='mr-2 h-4 w-4' />
            <span>Đổi mật khẩu</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='text-red-600' onClick={onLogout}>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
