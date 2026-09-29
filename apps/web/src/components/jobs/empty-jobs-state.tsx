'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type Status = 'idle' | 'running' | 'error';

export function EmptyJobsState({ hasFilters }: { hasFilters: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    // Check if scraper is already running when component mounts
    fetch(`${API_BASE}/scraper/status`)
      .then((r) => r.json())
      .then((body: { data: { running: boolean } }) => {
        if (body.data.running) {
          setStatus('running');
          startPolling();
        }
      })
      .catch(() => undefined);

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/scraper/status`);
        const body: { data: { running: boolean } } = await res.json();
        if (!body.data.running) {
          stopPolling();
          setStatus('idle');
          router.refresh();
        }
      } catch {
        // keep polling — transient error
      }
    }, 3000);
  };

  const handleTrigger = async () => {
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/scraper/trigger`, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text();
        setErrorMsg(`Erro ao iniciar scraper: ${text}`);
        return;
      }
      setStatus('running');
      startPolling();
    } catch (err) {
      setErrorMsg(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="rounded-lg border border-border p-12 text-center space-y-4">
      <p className="text-muted-foreground">Nenhuma vaga encontrada.</p>

      {!hasFilters && (
        <>
          {status === 'running' ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Buscando vagas no LinkedIn...
              </p>
            </div>
          ) : (
            <button
              onClick={handleTrigger}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Buscar vagas no LinkedIn
            </button>
          )}

          {errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}
        </>
      )}
    </div>
  );
}
