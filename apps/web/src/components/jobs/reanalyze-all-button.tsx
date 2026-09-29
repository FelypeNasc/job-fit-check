'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function ReanalyzeAllButton() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch(`${API_BASE}/jobs/reanalyze-all`, { method: 'POST' });
      if (!res.ok) {
        setFeedback('Erro ao enfileirar análises.');
        return;
      }
      const body: { data: { count: number } } = await res.json();
      setFeedback(`${body.data.count} vaga(s) enfileirada(s) para análise.`);
    } catch {
      setFeedback('Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Reanalisar todas
      </button>
      {feedback && <span className="text-xs text-muted-foreground">{feedback}</span>}
    </div>
  );
}
