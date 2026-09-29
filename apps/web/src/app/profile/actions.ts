'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api';
import type { CandidateProfile, ProfileResponse } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

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

export async function importProfile(
  formData: FormData,
): Promise<{ success: boolean; data?: Omit<CandidateProfile, 'id' | 'updatedAt'>; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/profile/import`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${await res.text()}`);
    }
    const { data } = (await res.json()) as { data: Omit<CandidateProfile, 'id' | 'updatedAt'> };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}
