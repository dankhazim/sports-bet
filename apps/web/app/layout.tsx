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
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        <div className="mx-auto max-w-lg px-3 pt-4 pb-24">{children}</div>
        {user && <NavBar />}
      </body>
    </html>
  );
}
