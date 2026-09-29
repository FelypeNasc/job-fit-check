export const dynamic = 'force-dynamic';

import { fetchApi } from '@/lib/api';
import type { ProfileResponse } from '@/lib/types';
import { ProfilePageClient } from '@/components/profile/profile-page-client';

export default async function ProfilePage() {
  let profile = null;
  try {
    const res = await fetchApi<ProfileResponse>('/profile');
    profile = res.data;
  } catch {
    // No profile yet — user will create one via import or manual form
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Usado como contexto em todas as análises do Ollama
        </p>
      </div>
      <ProfilePageClient initialProfile={profile} />
    </div>
  );
}
