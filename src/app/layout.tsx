import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShopProvider } from '../context/ShopContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import { OrderTrackingModal } from '../components/orders/OrderTrackingModal';
import { PWAInstallPrompt } from '../components/common/PWAInstallPrompt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'HUDA ABAYA DUBAI — ร้านจำหน่ายชุดอาบายะห์และน้ำหอมแท้ส่งตรงจากดูไบ',
  description: 'นำเข้าชุดอาบายะห์ดูไบ ชุดคัฟทาน เดรสอาหรับปักดิ้นทอง และน้ำหอมดูไบแท้ 100% สั่งซื้อง่าย คิดเงินครบทุกช่องทาง พร้อมเพย์ QR, บัตรเครดิต, โอนแนบสลิป, COD',
  manifest: '/manifest.json',
  openGraph: {
    title: 'HUDA ABAYA DUBAI — ร้านจำหน่ายชุดอาบายะห์และน้ำหอมแท้ส่งตรงจากดูไบ',
    description: 'นำเข้าชุดอาบายะห์ดูไบ ชุดคัฟทาน เดรสอาหรับปักดิ้นทอง และน้ำหอมดูไบแท้ 100% สั่งซื้อง่าย ส่งฟรีทั่วไทย',
    url: 'https://hudaabaya.vercel.app',
    siteName: 'HUDA ABAYA DUBAI',
    images: [
      {
        url: 'https://hudaabaya.vercel.app/logo.jpg',
        width: 800,
        height: 800,
        alt: 'HUDA ABAYA DUBAI Official Logo',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HUDA ABAYA DUBAI',
    description: 'นำเข้าชุดอาบายะห์ดูไบ ชุดคัฟทาน และน้ำหอมดูไบแท้ 100%',
    images: ['https://hudaabaya.vercel.app/logo.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HUDA ABAYA',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="shortcut icon" href="/logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="HUDA ABAYA" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#D4AF37" />
      </head>
      <body className="bg-dubai-black text-amber-100 min-h-screen flex flex-col justify-between antialiased selection:bg-gold-500 selection:text-dubai-black">
        <ShopProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <PWAInstallPrompt />
          <CartDrawer />
          <OrderTrackingModal />
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}
