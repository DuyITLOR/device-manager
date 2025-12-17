'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Package, QrCode, Users, History, Shield, Zap } from 'lucide-react';

const Landing = () => {
  const router = useRouter();

  return (
    <div className='min-h-screen'>
      <section className='relative overflow-hidden px-4 py-20 md:py-32'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pointer-events-none -z-10' />
        <div className='container relative mx-auto max-w-6xl'>
          <div className='text-center space-y-8'>
            <div className='inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full'>
              <Shield className='w-4 h-4 text-primary' />
              <span className='text-sm font-medium'>Hệ Thống Quản Lý Thiết Bị</span>
            </div>

            <h1 className='text-5xl md:text-7xl font-bold tracking-tight'>
              Quản Lý Thiết Bị
              <br />
              <span className='gradient-text'>Dễ Dàng Hơn Bao Giờ Hết</span>
            </h1>

            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
              Theo dõi, chuyển giao và quản lý tất cả thiết bị của bạn bằng công nghệ mã QR. Quản lý thiết bị đơn giản,
              an toàn và hiệu quả cho các câu lạc bộ/đội nhóm.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button
                size='lg'
                onClick={() => router.push('/login')}
                className='text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all'
              >
                Bắt Đầu Ngay
              </Button>
              <Button size='lg' variant='outline' className='text-lg px-8 h-14 glass-button'>
                Tìm Hiểu Thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-4 py-20 bg-muted/30'>
        <div className='container mx-auto max-w-6xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-16'>Mọi Thứ Bạn Cần</h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, index) => (
              <div key={index} className='glass-card p-8 rounded-2xl hover:shadow-xl transition-all'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4'>
                  <feature.icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-xl font-semibold mb-3'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-4 py-20'>
        <div className='container mx-auto max-w-4xl'>
          <div className='glass-card p-12 rounded-3xl text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Sẵn Sàng Bắt Đầu?</h2>
            <p className='text-lg text-muted-foreground mb-8'>Tham gia cùng các nhóm đang quản lý thiết bị hiệu quả</p>
            <Button
              size='lg'
              onClick={() => router.push('/login')}
              className='text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all'
            >
              Bắt Đầu Quản Lý Ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: QrCode,
    title: 'Theo Dõi Mã QR',
    description: 'Tạo và quét mã QR để nhận diện và theo dõi thiết bị nhanh chóng',
  },
  {
    icon: Package,
    title: 'Quản Lý Thiết Bị',
    description: 'Thêm, chỉnh sửa và sắp xếp tất cả thiết bị trên một nền tảng tập trung',
  },
  {
    icon: Users,
    title: 'Chuyển Giao Quyền Sở Hữu',
    description: 'Chuyển giao quyền sở hữu thiết bị giữa các thành viên một cách liền mạch',
  },
  {
    icon: History,
    title: 'Lịch Sử Hoạt Động',
    description: 'Theo dõi tất cả di chuyển và thay đổi của thiết bị với nhật ký chi tiết',
  },
  {
    icon: Shield,
    title: 'Truy Cập An Toàn',
    description: 'Phân quyền theo vai trò đảm bảo bảo mật dữ liệu và kiểm soát truy cập phù hợp',
  },
  {
    icon: Zap,
    title: 'Cập Nhật Thời Gian Thực',
    description: 'Nhận thông báo tức thì cho các yêu cầu chuyển giao và thay đổi trạng thái thiết bị',
  },
];

export default Landing;
