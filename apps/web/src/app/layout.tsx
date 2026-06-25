import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { ThemeSync } from '@/components/layout/ThemeSync';
import { ServiceWorkerReg } from '@/components/layout/ServiceWorkerReg';

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Dehna',
  description: 'Desk worker wellness breaks, tailored to how you feel.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Dehna',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="earth-terracotta"
      className={`${bricolage.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <meta name="theme-color" content="#d3643b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        <ServiceWorkerReg />
        {children}
      </body>
    </html>
  );
}
