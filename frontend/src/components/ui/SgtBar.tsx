import React from 'react';
import { clsx } from 'clsx';

interface SgtBarProps {
  score?: number | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getSgtGradient(score: number): string {
  if (score >= 9.0) return 'bg-gradient-to-r from-amber-500 via-gold-400 to-emerald-400 shadow-glow-gold';
  if (score >= 8.0) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
  if (score >= 7.0) return 'bg-gradient-to-r from-sky-500 to-emerald-500';
  if (score >= 5.5) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
  return 'bg-gradient-to-r from-red-600 to-amber-600';
}

function getSgtLabel(score: number): { label: string; color: string } {
  if (score >= 9.5) return { label: 'Legendario', color: 'text-gold-400' };
  if (score >= 8.5) return { label: 'Casta Suprema Superior', color: 'text-emerald-400' };
  if (score >= 7.5) return { label: 'Alta Casta', color: 'text-teal-400' };
  if (score >= 6.0) return { label: 'Casta Regular', color: 'text-amber-400' };
  return { label: 'En Evaluación', color: 'text-red-400' };
}

export const SgtBar: React.FC<SgtBarProps> = ({
  score,
  showLabel = true,
  size = 'md',
}) => {
  if (score == null) {
    return (
      <div className="flex flex-col gap-1">
        {showLabel && <span className="text-xs text-slate-500">SGT sin calcular</span>}
        <div className="sgt-bar bg-dark-surface/60">
          <div className="sgt-bar-fill bg-slate-700" style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  const grad = getSgtGradient(score);
  const info = getSgtLabel(score);
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Puntaje Genético Total (SGT)</span>
          <span className={clsx('text-xs font-bold font-mono tracking-tight', info.color)}>
            {score.toFixed(1)}/10 &bull; {info.label}
          </span>
        </div>
      )}
      <div className={clsx('sgt-bar bg-dark-bg/80 border border-dark-border/80', heights[size])}>
        <div
          className={clsx('sgt-bar-fill', grad)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
