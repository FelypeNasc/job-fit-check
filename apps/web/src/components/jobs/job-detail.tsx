import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, MapPin, Building2, Calendar, Zap, Briefcase, BarChart2 } from 'lucide-react';
import type { JobWithAnalysis } from '@/lib/types';

const WORKPLACE_LABELS: Record<string, string> = {
  '1': 'Presencial',
  '2': 'Remoto',
  '3': 'Híbrido',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  '1': 'Estágio',
  '2': 'Júnior',
  '3': 'Pleno',
  '4': 'Sênior',
  '5': 'Diretor',
  '6': 'Executivo',
};

interface JobDetailProps {
  job: JobWithAnalysis;
}

export function JobDetail({ job }: JobDetailProps) {
  const posted = job.postedAt ? new Date(job.postedAt).toLocaleDateString('pt-BR') : null;
  const workplace = job.workplaceType ? (WORKPLACE_LABELS[job.workplaceType] ?? job.workplaceType) : null;
  const level = job.experienceLevel ? (EXPERIENCE_LABELS[job.experienceLevel] ?? job.experienceLevel) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 size={13} />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {job.location}
                </span>
              )}
              {workplace && (
                <span className="flex items-center gap-1">
                  <Briefcase size={13} />
                  {workplace}
                </span>
              )}
              {level && (
                <span className="flex items-center gap-1">
                  <BarChart2 size={13} />
                  {level}
                </span>
              )}
              {posted && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {posted}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {job.isEasyApply && (
              <Badge variant="secondary" className="gap-1">
                <Zap size={11} />
                Easy Apply
              </Badge>
            )}
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={13} />
              LinkedIn
            </a>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-3">Descrição</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pr-2">
          {job.description}
        </div>
      </CardContent>
    </Card>
  );
}
