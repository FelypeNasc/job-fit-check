'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ScrapeModal, type SearchConfig } from './scrape-modal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface ScrapeButtonProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm';
  showIcon?: boolean;
}

export function ScrapeButton({ variant = 'default', size = 'default', showIcon = false }: ScrapeButtonProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/scraper/status`);
        const body: { data: { running: boolean } } = await res.json();
        if (!body.data.running) {
          stopPolling();
          setRunning(false);
          router.refresh();
        }
      } catch {
        // transient — keep polling
      }
    }, 3000);
  };

  useEffect(() => {
    fetch(`${API_BASE}/scraper/status`)
      .then((r) => r.json())
      .then((body: { data: { running: boolean } }) => {
        if (body.data.running) {
          setRunning(true);
          startPolling();
        }
      })
      .catch(() => undefined);

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async (config: SearchConfig) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/scraper/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        setError('Erro ao iniciar scraper.');
        return;
      }
      setRunning(true);
      startPolling();
    } catch {
      setError('Erro ao conectar com a API.');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <Button
          variant={variant}
          size={size}
          onClick={() => setModalOpen(true)}
          disabled={running}
          className="gap-2"
        >
          {running ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            showIcon && <Search size={14} />
          )}
          {running ? 'Buscando...' : 'Buscar vagas'}
        </Button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <ScrapeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
