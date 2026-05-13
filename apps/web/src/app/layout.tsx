import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkedIn Job Analyzer',
  description: 'Analise vagas do LinkedIn com IA local',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Nav />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
