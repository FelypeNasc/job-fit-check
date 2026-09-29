'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { MapPin, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { JobWithAnalysis } from '@/lib/types';
import type { JobsTableFeatures } from './jobs-table-features';

const columnHelper = createColumnHelper<JobsTableFeatures, JobWithAnalysis>();

function ScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    score >= 70
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : score >= 40
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30';
  return <Badge className={color}>{score}</Badge>;
}

function RecommendationBadge({ value }: { value: string | undefined }) {
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  const map: Record<string, { label: string; className: string }> = {
    apply: { label: 'Aplicar', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    maybe: { label: 'Talvez', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    skip: { label: 'Pular', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const entry = map[value] ?? { label: value, className: '' };
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    pending_analysis: { label: 'Aguardando', variant: 'outline' },
    analyzed: { label: 'Analisado', variant: 'secondary' },
    saved: { label: 'Salvo', variant: 'default' },
    applied: { label: 'Aplicado', variant: 'default' },
    rejected: { label: 'Rejeitado', variant: 'outline' },
  };
  const entry = map[status] ?? { label: status, variant: 'outline' as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export const jobColumns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Selecionar linha"
      />
    ),
  }),
  columnHelper.accessor('title', {
    header: 'Cargo',
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="font-medium max-w-xs">
          <div className="flex items-center gap-2">
            <span className="truncate">{job.title}</span>
            {job.isEasyApply && (
              <Zap size={12} className="text-blue-400 shrink-0" aria-label="Easy Apply" />
            )}
          </div>
          {job.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin size={10} />
              {job.location}
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('company', {
    header: 'Empresa',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: 'score',
    header: () => <div className="text-center">Score</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <ScoreBadge score={row.original.analysis?.fitScore} />
      </div>
    ),
  }),
  columnHelper.display({
    id: 'recommendation',
    header: () => <div className="text-center">Recomendação</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <RecommendationBadge value={row.original.analysis?.recommendation} />
      </div>
    ),
  }),
  columnHelper.display({
    id: 'levelMatch',
    header: () => <div className="text-center">Nível</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm text-muted-foreground">
        {row.original.analysis?.levelMatch ?? '—'}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'locationOk',
    header: () => <div className="text-center">Local OK</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm">
        {row.original.analysis == null ? (
          <span className="text-muted-foreground">—</span>
        ) : row.original.analysis.locationOk ? (
          <span className="text-green-400">✓</span>
        ) : (
          <span className="text-red-400">✗</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
]);
