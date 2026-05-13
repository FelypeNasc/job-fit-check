export const dynamic = 'force-dynamic';

import { fetchApi } from '@/lib/api';
import type { ProfileResponse } from '@/lib/types';
import { ProfileForm } from '@/components/profile/profile-form';

export default async function ProfilePage() {
  const { data: profile } = await fetchApi<ProfileResponse>('/profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Usado como contexto em todas as análises do Ollama
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
