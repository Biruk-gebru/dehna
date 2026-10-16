import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import { PrefsProvider } from '@/context/PrefsContext';
import { ThemeSync } from '@/components/layout/ThemeSync';
import { ServiceWorkerReg } from '@/components/layout/ServiceWorkerReg';
import { InstallPrompt } from '@/components/layout/InstallPrompt';

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

const DESCRIPTION = 'A desk buddy who gets you moving: a focus timer with short guided stretches for your neck, back, wrists and eyes. Free, no sign-up.';

// On Vercel this resolves to the production domain; locally it's the dev server.
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Dehna: a desk buddy who gets you moving', template: '%s · Dehna' },
  description: DESCRIPTION,
  applicationName: 'Dehna',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Dehna',
    title: 'Dehna: a desk buddy who gets you moving',
    description: DESCRIPTION,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dehna: a desk buddy who gets you moving',
    description: DESCRIPTION,
  },
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
      data-theme="sand-teal"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <meta name="theme-color" content="#036564" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <PrefsProvider>
          <ThemeSync />
          <ServiceWorkerReg />
          <InstallPrompt />
          {children}
        </PrefsProvider>
        {/* Anonymous, cookie-free page-view counts on Vercel; does nothing in development */}
        <Analytics />
      </body>
    </html>
  );
}
