import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { BRAND } from '@/lib/brand';
import './globals.css';

/** Inter variable, autoalojada: sin llamadas a Google en producción. */
const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  src: [
    { path: '../../public/fonts/inter-latin.woff2', weight: '100 900', style: 'normal' },
    { path: '../../public/fonts/inter-latin-ext.woff2', weight: '100 900', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#08090C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
