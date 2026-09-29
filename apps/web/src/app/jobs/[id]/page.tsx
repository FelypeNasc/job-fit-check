export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import type { JobDetailResponse } from '@/lib/types';
import { JobDetail } from '@/components/jobs/job-detail';
import { JobAnalysisPanel } from '@/components/jobs/job-analysis';
import { JobActions } from '@/components/jobs/job-actions';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default async function JobPage({ params }: PageProps) {
  let job;
  try {
    const res = await fetchApi<JobDetailResponse>(`/jobs/${params.id}`);
    job = res.data;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between align-center gap-4 h-100">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          Voltar
        </Link>
        <JobActions jobId={job.id} currentStatus={job.status} jobUrl={job.url} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          <JobDetail job={job} />
        </div>
        <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          {job.analysis ? (
            <JobAnalysisPanel analysis={job.analysis} />
          ) : (
            <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
              Esta vaga ainda não foi analisada.
              <br />
              Use o botão &quot;Re-analisar&quot; para iniciar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
