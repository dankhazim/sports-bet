import type { Metadata, Viewport } from 'next';
import { createClient } from '@/lib/supabase/server';
import { NavBar } from '@/components/nav-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'VB Tippelő',
  description: 'Baráti tippverseny a 2026-os labdarúgó-világbajnokságra',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="hu">
      <body className="min-h-screen text-zinc-100 antialiased">
        {user && <NavBar />}
        <div className="mx-auto w-full max-w-lg px-3 pt-4 pb-24 md:max-w-6xl md:px-8 md:pt-8 md:pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}
