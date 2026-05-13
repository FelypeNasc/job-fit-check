'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Vagas', icon: Briefcase },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center gap-6">
        <span className="font-semibold text-sm">Job Analyzer</span>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
