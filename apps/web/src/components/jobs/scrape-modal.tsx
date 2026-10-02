'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SearchConfig {
  keywords: string;
  location: string;
  workplaceType: string;
  sortBy: string;
  timePosted: string;
  experienceLevel: string;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  keywords:
    '("backend software engineer" OR "backend developer") OR ("nodejs" or "node js" or "typescript") remote',
  location: 'Brazil',
  workplaceType: '2',
  sortBy: 'DD',
  timePosted: 'r86400',
  experienceLevel: '4',
};

interface ScrapeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: SearchConfig) => void;
}

export function ScrapeModal({ open, onClose, onConfirm }: ScrapeModalProps) {
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG);

  const set = (key: keyof SearchConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const handleConfirm = () => {
    onConfirm(config);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Configurar busca de vagas</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Palavras-chave</label>
            <Textarea
              rows={3}
              value={config.keywords}
              onChange={(e) => set('keywords', e.target.value)}
              className="resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Localização</label>
              <Input
                value={config.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Tipo de trabalho</label>
              <Select value={config.workplaceType} onValueChange={(v) => set('workplaceType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Remoto</SelectItem>
                  <SelectItem value="1">Presencial</SelectItem>
                  <SelectItem value="3">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Publicado em</label>
              <Select value={config.timePosted} onValueChange={(v) => set('timePosted', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="r3600">Última hora</SelectItem>
                  <SelectItem value="r86400">Últimas 24h</SelectItem>
                  <SelectItem value="r604800">Última semana</SelectItem>
                  <SelectItem value="r2592000">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Nível de experiência</label>
              <Select value={config.experienceLevel} onValueChange={(v) => set('experienceLevel', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Estágio</SelectItem>
                  <SelectItem value="2">Júnior</SelectItem>
                  <SelectItem value="3">Pleno</SelectItem>
                  <SelectItem value="4">Sênior</SelectItem>
                  <SelectItem value="5">Diretor</SelectItem>
                  <SelectItem value="6">Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={config.sortBy} onValueChange={(v) => set('sortBy', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD">Data</SelectItem>
                  <SelectItem value="R">Relevância</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Buscar vagas</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
