'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api';
import type { JobDetailResponse } from '@/lib/types';

export async function updateJobStatus(id: string, status: string): Promise<void> {
  await fetchApi<JobDetailResponse>(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  revalidatePath('/');
  revalidatePath(`/jobs/${id}`);
}

export async function triggerAnalysis(id: string): Promise<void> {
  await fetchApi(`/jobs/${id}/analyze`, { method: 'POST' });
  revalidatePath(`/jobs/${id}`);
}
