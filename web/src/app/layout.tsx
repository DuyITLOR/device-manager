import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ChatbotProvider } from './lib/contexts/chatbotContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Device Manager IoT',
  description: 'IoT Device Management System',
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
