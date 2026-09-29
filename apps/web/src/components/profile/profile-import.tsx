'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { importProfile } from '@/app/profile/actions';
import type { CandidateProfile } from '@/lib/types';

interface ProfileImportProps {
  onImport: (data: Omit<CandidateProfile, 'id' | 'updatedAt'>) => void;
}

export function ProfileImport({ onImport }: ProfileImportProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await importProfile(formData);
      if (result.success && result.data) {
        onImport(result.data);
      } else {
        setError(result.error ?? 'Erro ao importar currículo');
      }
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        id="cv-upload"
        onChange={handleFileChange}
        disabled={isPending}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? 'Analisando currículo...' : 'Importar currículo (PDF/DOCX)'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
