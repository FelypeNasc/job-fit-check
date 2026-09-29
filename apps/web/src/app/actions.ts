'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api';

export async function deleteJobs(ids: string[]): Promise<void> {
  await fetchApi('/jobs', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
  revalidatePath('/');
}
