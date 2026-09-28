import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SgtBar } from '../ui/SgtBar';
import { EstadoBadge } from '../ui/Badge';
import type { Ave } from '../../types';
import { Swords, GitBranch, Scale, Sparkles } from 'lucide-react';

interface AveCardProps {
  ave: Ave;
}

const DEFAULT_GALLO_IMG = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80';
const DEFAULT_GALLINA_IMG = 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&w=600&q=80';

export const AveCard: React.FC<AveCardProps> = ({ ave }) => {
  const navigate = useNavigate();

  const totalPeleas = (ave.victorias || 0) + (ave.derrotas || 0);
  const pctVic = totalPeleas > 0 ? Math.round(((ave.victorias || 0) / totalPeleas) * 100) : null;
  const isGallo = ave.tipo === 'GALLO';

  return (
    <div
      className="group relative bg-dark-card/90 backdrop-blur-md rounded-2xl border border-dark-border/80 overflow-hidden 
                 hover:border-primary-500/50 hover:shadow-card-dark transition-all duration-300 flex flex-col cursor-pointer"
      onClick={() => navigate(`/aves/${ave.id}`)}
    >
      {/* Imagen & Capa Decorativa */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-dark-surface to-dark-bg">
        <img
          src={ave.fotoUrl || (isGallo ? DEFAULT_GALLO_IMG : DEFAULT_GALLINA_IMG)}
          alt={ave.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = isGallo ? DEFAULT_GALLO_IMG : DEFAULT_GALLINA_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-black/40" />

        {/* Distintivos Superiores */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="bg-black/75 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
            #{ave.id}
          </span>
          <EstadoBadge estado={ave.estado} />
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-md border ${
              isGallo
                ? 'bg-sky-950/80 border-sky-600/60 text-sky-300'
                : 'bg-rose-950/80 border-rose-600/60 text-rose-300'
            }`}
          >
            {isGallo ? '♂ Gallo' : '♀ Gallina'}
          </span>
        </div>

        {/* Puntaje SGT flotante */}
        {ave.sgtScore != null && (
          <div className="absolute bottom-2 right-2.5 bg-black/85 backdrop-blur-md border border-gold-500/50 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
            <Sparkles size={12} className="text-gold-400" />
            <span className="text-xs font-extrabold text-gold-300 font-mono">
              {ave.sgtScore.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Contenedor de Información */}
      <div className="p-3.5 flex flex-col flex-1 gap-2.5">
        <div>
          <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-primary-400 transition-colors truncate">
            {ave.nombre}
          </h3>
          <p className="text-xs font-medium text-slate-400 truncate">
            {ave.lineaGenetica || 'Casta Tradicional'}
          </p>
        </div>

        {/* Barra de Puntaje SGT */}
        <SgtBar score={ave.sgtScore} size="sm" showLabel={false} />

        {/* Datos Rápidos */}
        <div className="flex items-center justify-between pt-1 border-t border-dark-border/60 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Scale size={13} className="text-slate-500" />
            <span>{ave.pesoGramos ? `${ave.pesoGramos}g` : '—'}</span>
          </div>

          {isGallo ? (
            <div className="flex items-center gap-1 font-medium">
              <Swords size={13} className="text-primary-500" />
              {totalPeleas > 0 ? (
                <span>
                  <span className="text-emerald-400 font-bold">{ave.victorias} Vic</span>
                  {' · '}
                  <span className="text-rose-400 font-bold">{ave.derrotas} Der</span>
                  {pctVic !== null && <span className="text-slate-500 font-mono ml-1">({pctVic}%)</span>}
                </span>
              ) : (
                <span className="text-slate-500">En postura</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <GitBranch size={13} className="text-rose-400" />
              <span>Pie de Cría</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
