'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap } from 'lucide-react';
import type { JobWithAnalysis } from '@/lib/types';
import { EmptyJobsState } from './empty-jobs-state';

interface JobsTableProps {
  jobs: JobWithAnalysis[];
  hasFilters?: boolean;
}

function ScoreBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    score >= 70
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : score >= 40
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {score}
    </span>
  );
}

function RecommendationBadge({ value }: { value: string | undefined }) {
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  const map: Record<string, { label: string; className: string }> = {
    apply: { label: 'Aplicar', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    maybe: { label: 'Talvez', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    skip: { label: 'Pular', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const entry = map[value] ?? { label: value, className: '' };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${entry.className}`}
    >
      {entry.label}
    </span>
  );
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

export function JobsTable({ jobs, hasFilters = false }: JobsTableProps) {
  const router = useRouter();

  if (jobs.length === 0) {
    return <EmptyJobsState hasFilters={hasFilters} />;
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cargo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Recomendação</TableHead>
            <TableHead className="text-center">Nível</TableHead>
            <TableHead className="text-center">Local OK</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
              <TableCell className="font-medium max-w-xs">
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
              </TableCell>
              <TableCell className="text-muted-foreground">{job.company}</TableCell>
              <TableCell className="text-center">
                <ScoreBadge score={job.analysis?.fitScore} />
              </TableCell>
              <TableCell className="text-center">
                <RecommendationBadge value={job.analysis?.recommendation} />
              </TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">
                {job.analysis?.levelMatch ?? '—'}
              </TableCell>
              <TableCell className="text-center text-sm">
                {job.analysis == null ? (
                  <span className="text-muted-foreground">—</span>
                ) : job.analysis.locationOk ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
