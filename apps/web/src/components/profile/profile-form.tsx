'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { updateProfile } from '@/app/profile/actions';
import type { CandidateProfile } from '@/lib/types';

interface ProfileFormProps {
  profile: CandidateProfile;
}

function parseArray(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const data = {
      name: fd.get('name') as string,
      location: fd.get('location') as string,
      level: fd.get('level') as string,
      coreStack: parseArray(fd.get('coreStack') as string),
      secondaryStack: parseArray(fd.get('secondaryStack') as string),
      notExperiencedWith: parseArray(fd.get('notExperiencedWith') as string),
      targetRoles: fd.get('targetRoles') as string,
      languages: parseArray(fd.get('languages') as string),
    };

    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso.' });
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Erro ao salvar.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nome</label>
          <Input name="name" defaultValue={profile.name} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Localização</label>
          <Input name="location" defaultValue={profile.location} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nível</label>
          <Input name="level" defaultValue={profile.level} placeholder="ex: Pleno / Mid-level" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Stack principal</label>
          <p className="text-xs text-muted-foreground">Separado por vírgulas</p>
          <Textarea
            name="coreStack"
            defaultValue={profile.coreStack.join(', ')}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Stack secundária</label>
          <p className="text-xs text-muted-foreground">Separado por vírgulas</p>
          <Textarea
            name="secondaryStack"
            defaultValue={profile.secondaryStack.join(', ')}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Sem experiência em</label>
          <p className="text-xs text-muted-foreground">Separado por vírgulas</p>
          <Textarea
            name="notExperiencedWith"
            defaultValue={profile.notExperiencedWith.join(', ')}
            rows={2}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Cargos alvo</label>
          <Textarea name="targetRoles" defaultValue={profile.targetRoles} rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Idiomas</label>
          <p className="text-xs text-muted-foreground">Separado por vírgulas</p>
          <Input name="languages" defaultValue={profile.languages.join(', ')} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar perfil'}
        </Button>
        {message && (
          <p
            className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-destructive'}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
