'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Kezdőlap', icon: '🏆' },
  { href: '/matches', label: 'Meccsek', icon: '⚽' },
  { href: '/my-tips', label: 'Tippjeim', icon: '🎯' },
  { href: '/profile', label: 'Profil', icon: '👤' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: felső navigáció */}
      <header className="sticky top-0 z-10 hidden border-b border-zinc-200 bg-white md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
          <Link href="/" className="text-base font-bold">
            🏆 VB Tippelő
          </Link>
          <nav className="flex gap-1">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(pathname, item.href)
                    ? 'bg-green-50 text-pitch'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobil: alsó tab-sáv */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                isActive(pathname, item.href) ? 'font-semibold text-pitch' : 'text-zinc-500'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
