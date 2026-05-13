'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function JobsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    searchParams.has('status') ||
    searchParams.has('recommendation') ||
    searchParams.has('minScore') ||
    searchParams.has('search');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Buscar por cargo ou empresa..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => setParam('search', e.target.value || undefined)}
        className="w-56"
      />

      <Select
        value={searchParams.get('status') ?? 'all'}
        onValueChange={(v) => setParam('status', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="pending_analysis">Aguardando análise</SelectItem>
          <SelectItem value="analyzed">Analisado</SelectItem>
          <SelectItem value="saved">Salvo</SelectItem>
          <SelectItem value="applied">Aplicado</SelectItem>
          <SelectItem value="rejected">Rejeitado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('recommendation') ?? 'all'}
        onValueChange={(v) => setParam('recommendation', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Recomendação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas recomendações</SelectItem>
          <SelectItem value="apply">Aplicar</SelectItem>
          <SelectItem value="maybe">Talvez</SelectItem>
          <SelectItem value="skip">Pular</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Score mínimo"
        min={0}
        max={100}
        defaultValue={searchParams.get('minScore') ?? ''}
        onChange={(e) => setParam('minScore', e.target.value || undefined)}
        className="w-36"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          className="gap-1.5"
        >
          <X size={14} />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
