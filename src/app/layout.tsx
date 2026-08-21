import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { BRAND } from '@/lib/brand';
import './globals.css';

/**
 * Geist Sans para la interfaz y Geist Mono para las cifras.
 *
 * Mono no es decorativo aquí: las cuotas, los puntos y los marcadores tienen
 * que alinearse en columna, y Geist Mono tiene numerales de ancho fijo de
 * verdad. Ambas se autoalojan a través del paquete, sin llamadas a Google.
 */

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg' }],
  },
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
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
