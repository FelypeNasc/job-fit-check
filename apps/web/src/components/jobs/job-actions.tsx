'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Bookmark, XCircle, RefreshCw } from 'lucide-react';
import { updateJobStatus, triggerAnalysis } from '@/app/jobs/[id]/actions';

interface JobActionsProps {
  jobId: string;
  currentStatus: string;
  jobUrl: string;
}

export function JobActions({ jobId, currentStatus, jobUrl }: JobActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const act = (fn: () => Promise<void>, successMsg: string) => {
    startTransition(async () => {
      try {
        await fn();
        setMessage(successMsg);
      } catch {
        setMessage('Erro ao atualizar status.');
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          disabled={isPending || currentStatus === 'applied'}
          onClick={() => {
            window.open(jobUrl, '_blank', 'noopener,noreferrer');
            act(() => updateJobStatus(jobId, 'applied'), 'Status atualizado para Aplicado.');
          }}
          className="gap-1.5"
        >
          <CheckCircle size={14} />
          Aplicar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={isPending || currentStatus === 'saved'}
          onClick={() =>
            act(() => updateJobStatus(jobId, 'saved'), 'Vaga salva.')
          }
          className="gap-1.5"
        >
          <Bookmark size={14} />
          Salvar
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || currentStatus === 'rejected'}
          onClick={() =>
            act(() => updateJobStatus(jobId, 'rejected'), 'Vaga rejeitada.')
          }
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <XCircle size={14} />
          Rejeitar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() =>
            act(() => triggerAnalysis(jobId), 'Análise adicionada à fila.')
          }
          className="gap-1.5"
        >
          <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
          Re-analisar
        </Button>
      </div>
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
