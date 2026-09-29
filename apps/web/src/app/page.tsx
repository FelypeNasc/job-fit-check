export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { fetchApi } from '@/lib/api';
import type { JobsListResponse } from '@/lib/types';
import { JobsTable } from '@/components/jobs/jobs-table';
import { JobsFilters } from '@/components/jobs/jobs-filters';
import { Pagination } from '@/components/jobs/pagination';
import { ReanalyzeAllButton } from '@/components/jobs/reanalyze-all-button';

interface SearchParams {
  page?: string;
  status?: string;
  recommendation?: string;
  minScore?: string;
  search?: string;
}

async function JobsList({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1);
  const params = new URLSearchParams({ page: String(page), limit: '20' });

  const hasFilters = !!(
    searchParams.status ||
    searchParams.recommendation ||
    searchParams.minScore ||
    searchParams.search
  );

  if (searchParams.status) params.set('status', searchParams.status);
  if (searchParams.recommendation) params.set('recommendation', searchParams.recommendation);
  if (searchParams.minScore) params.set('minScore', searchParams.minScore);
  if (searchParams.search) params.set('search', searchParams.search);

  const { data: jobs, meta } = await fetchApi<JobsListResponse>(`/jobs?${params.toString()}`);

  return (
    <div className="space-y-4">
      <JobsTable jobs={jobs} hasFilters={hasFilters} />
      <Pagination page={meta.page} limit={meta.limit} total={meta.total} />
    </div>
  );
}

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vagas</h1>
      </div>
      <Suspense fallback={null}>
        <p className="text-muted-foreground text-sm mt-1">
          Vagas rankeadas por score de compatibilidade
        </p>
        <div className='flex justify-between w-100'>
          <JobsFilters />
          <ReanalyzeAllButton />
        </div>
      </Suspense>
      <Suspense
        fallback={
          <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
            Carregando vagas...
          </div>
        }
      >
        <JobsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
