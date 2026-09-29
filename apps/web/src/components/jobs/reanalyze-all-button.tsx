'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
      <Button variant="secondary" size="sm" onClick={handleClick} disabled={loading} className="gap-2">
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <RefreshCw size={14} />
        )}
        Reanalisar todas
      </Button>
      {feedback && <span className="text-xs text-muted-foreground">{feedback}</span>}
    </div>
  );
}
