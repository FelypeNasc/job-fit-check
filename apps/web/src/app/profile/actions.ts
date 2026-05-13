'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api';
import type { ProfileResponse } from '@/lib/types';

export async function updateProfile(data: {
  name?: string;
  location?: string;
  level?: string;
  coreStack?: string[];
  secondaryStack?: string[];
  notExperiencedWith?: string[];
  targetRoles?: string;
  languages?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchApi<ProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    revalidatePath('/profile');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}
