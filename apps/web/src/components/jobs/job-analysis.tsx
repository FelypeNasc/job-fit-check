import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { JobAnalysis } from '@/lib/types';

interface JobAnalysisProps {
  analysis: JobAnalysis;
}

function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`text-5xl font-bold tabular-nums ${color}`}>{score}</span>;
}

function RecommendationLabel({ value }: { value: string }) {
  const map: Record<string, { label: string; color: string }> = {
    apply: { label: 'Aplicar', color: 'text-green-400' },
    maybe: { label: 'Talvez', color: 'text-yellow-400' },
    skip: { label: 'Pular', color: 'text-red-400' },
  };
  const entry = map[value] ?? { label: value, color: 'text-muted-foreground' };
  return <span className={`font-semibold ${entry.color}`}>{entry.label}</span>;
}

function LevelLabel({ value }: { value: string }) {
  const map: Record<string, string> = { under: 'Abaixo', match: 'Compatível', over: 'Acima' };
  return <span>{map[value] ?? value}</span>;
}

export function JobAnalysisPanel({ analysis }: JobAnalysisProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Análise de Fit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <ScoreDisplay score={analysis.fitScore} />
            <span className="text-muted-foreground text-sm mb-1">/ 100</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Recomendação</p>
              <RecommendationLabel value={analysis.recommendation} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Nível</p>
              <LevelLabel value={analysis.levelMatch} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Local</p>
              <span className={analysis.locationOk ? 'text-green-400' : 'text-red-400'}>
                {analysis.locationOk ? 'Compatível' : 'Incompatível'}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground mb-2">Resumo</p>
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          {analysis.dealBreakers.length > 0 && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-xs font-medium text-destructive mb-1.5">Deal Breakers</p>
              <ul className="space-y-1">
                {analysis.dealBreakers.map((d, i) => (
                  <li key={i} className="text-xs text-destructive/80">
                    • {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400">Skills compatíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.matchingSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchingSkills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Skills faltantes</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.missingSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {analysis.coverLetter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {analysis.coverLetter}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
