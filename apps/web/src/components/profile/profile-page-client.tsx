'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './profile-form';
import { ProfileImport } from './profile-import';
import type { CandidateProfile } from '@/lib/types';

interface ProfilePageClientProps {
  initialProfile: CandidateProfile | null;
}

const EMPTY_PROFILE: CandidateProfile = {
  id: '',
  name: '',
  location: '',
  level: '',
  coreStack: [],
  secondaryStack: [],
  notExperiencedWith: [],
  targetRoles: '',
  languages: [],
  updatedAt: new Date(),
};

export function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile ?? EMPTY_PROFILE);
  const [formKey, setFormKey] = useState(0);

  const handleImport = (data: Omit<CandidateProfile, 'id' | 'updatedAt'>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    setFormKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <ProfileImport onImport={handleImport} />
        <p className="text-xs text-muted-foreground mt-2">
          O Ollama extrai os campos automaticamente. Revise antes de salvar.
        </p>
      </div>
      <Separator />
      <ProfileForm key={formKey} profile={profile} />
    </div>
  );
}
