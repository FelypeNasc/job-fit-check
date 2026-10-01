'use client';

import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysisSocket } from '@/hooks/use-analysis-socket';

export function AnalysisProgressBar() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => router.refresh(), 800);
  }, [router]);

  const progress = useAnalysisSocket(debouncedRefresh, () => router.refresh());

  if (!progress.active) return null;

  const { completed, total, currentJob } = progress;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
      <div className="container flex items-center gap-3">
        <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-sm font-medium text-foreground truncate">
              {currentJob
                ? `Analisando: ${currentJob.title} — ${currentJob.company}`
                : 'Preparando análises...'}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {completed} / {total}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
