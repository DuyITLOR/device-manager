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
              <span className='text-sm font-medium'>Device Management System</span>
            </div>

            <h1 className='text-5xl md:text-7xl font-bold tracking-tight'>
              Manage Your Devices
              <br />
              <span className='gradient-text'>With Ease</span>
            </h1>

            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
              Track, transfer, and manage all your equipment with QR code technology. Simple, secure, and efficient
              device management for modern teams.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button
                size='lg'
                onClick={() => router.push('/login')}
                className='text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all'
              >
                Get Started
              </Button>
              <Button size='lg' variant='outline' className='text-lg px-8 h-14 glass-button'>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='px-4 py-20 bg-muted/30'>
        <div className='container mx-auto max-w-6xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-16'>Everything You Need</h2>

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
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Get Started?</h2>
            <p className='text-lg text-muted-foreground mb-8'>Join teams already managing their devices efficiently</p>
            <Button
              size='lg'
              onClick={() => router.push('/login')}
              className='text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all'
            >
              Start Managing Now
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
    title: 'QR Code Tracking',
    description: 'Generate and scan QR codes to quickly identify and track devices',
  },
  {
    icon: Package,
    title: 'Device Management',
    description: 'Add, edit, and organize all your equipment in one centralized platform',
  },
  {
    icon: Users,
    title: 'Transfer Ownership',
    description: 'Seamlessly transfer device ownership between team members',
  },
  {
    icon: History,
    title: 'Activity History',
    description: 'Track all device movements and changes with detailed logs',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based permissions ensure data security and proper access control',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Get instant notifications for transfer requests and device status changes',
  },
];

export default Landing;
