'use client';

import { ScrapeButton } from './scrape-button';

export function EmptyJobsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-border p-12 text-center space-y-4">
      <p className="text-muted-foreground">Nenhuma vaga encontrada.</p>
      {!hasFilters && <ScrapeButton />}
    </div>
  );
}
