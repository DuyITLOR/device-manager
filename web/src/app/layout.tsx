import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ChatbotProvider } from './lib/contexts/chatbotContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Device Manager App',
  description: 'Ứng dụng quản lý thiết bị tại Câu lạc bộ Robotics IOT',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Device Manager App',
  },
};

export const viewport: Viewport = {
  themeColor: '#002a68',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ChatbotProvider>
          <Providers>{children}</Providers>
        </ChatbotProvider>
      </body>
    </html>
  );
}
