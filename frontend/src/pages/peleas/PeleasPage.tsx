import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Swords,
  Plus,
  Trophy,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Scale,
  Award,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { ResultadoBadge } from '../../components/ui/Badge';
import { peleasApi } from '../../api/endpoints/peleas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PeleasPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtroRes, setFiltroRes] = useState<string>('TODAS');

  const { data: peleas = [], isLoading } = useQuery({
    queryKey: ['peleas'],
    queryFn: () => peleasApi.getAll(),
  });

  const victorias = peleas.filter((p) => p.resultado === 'VICTORIA').length;
  const derrotas = peleas.filter((p) => p.resultado === 'DERROTA' || p.resultado === 'MUERTE').length;
  const empates = peleas.filter((p) => p.resultado === 'EMPATE').length;
  const winRate = peleas.length > 0 ? Math.round((victorias / peleas.length) * 100) : 0;

  const peleasFiltradas = peleas.filter((p) => {
    if (filtroRes === 'TODAS') return true;
    return p.resultado === filtroRes;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Registro de Combates & Palenques"
        rightAction={
          <button
            onClick={() => navigate('/peleas/nueva')}
            className="btn-primary text-xs py-2 px-3 shadow-glow-red flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Registrar Pelea</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* KPI RESUMEN DE COMBATES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
            <span className="text-xs font-semibold text-slate-400">Total Combates</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-100 font-display mt-1">
              {peleas.length}
            </p>
            <span className="text-[11px] text-slate-500">Historial verificado</span>
          </div>

          <div className="card p-4 bg-gradient-to-br from-emerald-950/30 to-dark-card border-emerald-800/40">
            <span className="text-xs font-semibold text-emerald-400">Victorias</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
              {victorias}
            </p>
            <span className="text-[11px] text-emerald-500/80">Nocauts y decisiones</span>
          </div>

          <div className="card p-4 bg-gradient-to-br from-rose-950/30 to-dark-card border-rose-800/40">
            <span className="text-xs font-semibold text-rose-400">Derrotas</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-300 font-mono mt-1">
              {derrotas}
            </p>
            <span className="text-[11px] text-rose-500/80">Recuperados en cuido</span>
          </div>

          <div className="card p-4 bg-gradient-to-br from-amber-950/30 to-dark-card border-gold-500/40">
            <span className="text-xs font-semibold text-gold-400">Efectividad Global</span>
            <p className="text-2xl sm:text-3xl font-black text-gold-300 font-mono mt-1">
              {winRate}%
            </p>
            <span className="text-[11px] text-gold-500/80">Porcentaje de Triunfos</span>
          </div>
        </div>

        {/* FILTROS DE RESULTADO */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['TODAS', 'VICTORIA', 'DERROTA', 'EMPATE'].map((r) => (
            <button
              key={r}
              onClick={() => setFiltroRes(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filtroRes === r
                  ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-glow-red'
                  : 'bg-dark-surface/80 border-dark-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === 'TODAS' ? 'Todos los Resultados' : r === 'VICTORIA' ? '✓ Victorias' : r === 'DERROTA' ? '✗ Derrotas' : '= Empates'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-mono">
            {peleasFiltradas.length} registros
          </span>
        </div>

        {/* LISTADO DE COMBATES */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-surface/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : peleasFiltradas.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center gap-3">
            <Swords size={40} className="text-slate-600 mb-1" />
            <h3 className="font-bold text-base text-slate-200">Sin combates en este filtro</h3>
            <p className="text-xs text-slate-400">Registra el resultado de un nuevo compromiso o cambia el filtro</p>
            <Button onClick={() => navigate('/peleas/nueva')} className="mt-2">
              <Plus size={16} />
              <span>Registrar Combate</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {peleasFiltradas.map((pelea) => (
              <div
                key={pelea.id}
                className="card p-5 hover:border-slate-600 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex-shrink-0 mt-1 sm:mt-0">
                    <ResultadoBadge resultado={pelea.resultado} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-base text-slate-100 font-display">
                        {pelea.galloNombre || `Gallo #${pelea.galloId}`}
                      </h4>
                      <span className="text-xs text-primary-400 font-bold">contra</span>
                      <span className="text-sm font-bold text-slate-200">
                        {pelea.rivalNombre || 'Rival'}
                      </span>
                      {pelea.rivalCriadero && (
                        <span className="text-xs text-slate-400">({pelea.rivalCriadero})</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Trophy size={13} className="text-gold-400" />
                        <span>{pelea.eventoNombre || 'Torneo Oficial'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-500" />
                        <span>{pelea.lugar || 'Palenque Central'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        <span>{pelea.fecha}</span>
                      </span>
                    </div>

                    {pelea.notas && (
                      <p className="text-xs text-slate-300 italic mt-2 bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border/40">
                        "{pelea.notas}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-auto text-xs">
                  {pelea.pesoGramos && (
                    <div className="flex items-center gap-1 bg-dark-surface px-3 py-1.5 rounded-xl border border-dark-border text-slate-300 font-mono">
                      <Scale size={13} className="text-slate-400" />
                      <span>{pelea.pesoGramos}g</span>
                    </div>
                  )}

                  {pelea.duracionMinutos && (
                    <div className="flex items-center gap-1 bg-dark-surface px-3 py-1.5 rounded-xl border border-dark-border text-slate-300 font-mono">
                      <Clock size={13} className="text-slate-400" />
                      <span>{pelea.duracionMinutos} min</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeleasPage;
