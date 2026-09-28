import React from 'react';
import { clsx } from 'clsx';

export type BadgeColor = 'red' | 'green' | 'amber' | 'blue' | 'gray' | 'purple' | 'gold';

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const colorClasses: Record<BadgeColor, string> = {
  red:    'bg-red-950/80 border border-red-800/60 text-red-300',
  green:  'bg-emerald-950/80 border border-emerald-800/60 text-emerald-300',
  amber:  'bg-amber-950/80 border border-amber-800/60 text-amber-300',
  blue:   'bg-sky-950/80 border border-sky-800/60 text-sky-300',
  gray:   'bg-slate-800/80 border border-slate-700 text-slate-300',
  purple: 'bg-purple-950/80 border border-purple-800/60 text-purple-300',
  gold:   'bg-amber-900/60 border border-gold-500/60 text-gold-300',
};

const dotColors: Record<BadgeColor, string> = {
  red:    'bg-red-400',
  green:  'bg-emerald-400',
  amber:  'bg-amber-400',
  blue:   'bg-sky-400',
  gray:   'bg-slate-400',
  purple: 'bg-purple-400',
  gold:   'bg-gold-400 animate-pulse',
};

export const Badge: React.FC<BadgeProps> = ({ color = 'gray', children, className, dot = false }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm',
      colorClasses[color],
      className,
    )}
  >
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[color])} />}
    {children}
  </span>
);

export const ResultadoBadge: React.FC<{ resultado: string }> = ({ resultado }) => {
  const map: Record<string, { color: BadgeColor; label: string }> = {
    VICTORIA: { color: 'green', label: '✓ Victoria' },
    DERROTA:  { color: 'red',   label: '✗ Derrota' },
    EMPATE:   { color: 'amber', label: '= Empate' },
    MUERTE:   { color: 'gray',  label: '† Muerte' },
  };
  const { color, label } = map[resultado] || { color: 'gray', label: resultado };
  return <Badge color={color} dot>{label}</Badge>;
};

export const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const map: Record<string, { color: BadgeColor; label: string }> = {
    ACTIVO:   { color: 'green', label: 'Activo' },
    RETIRADO: { color: 'gold',  label: 'Retirado' },
    MUERTO:   { color: 'gray',  label: 'Muerto' },
    VENDIDO:  { color: 'blue',  label: 'Vendido' },
    DESCARTE: { color: 'red',   label: 'Descarte' },
  };
  const { color, label } = map[estado] || { color: 'gray', label: estado };
  return <Badge color={color} dot>{label}</Badge>;
};
