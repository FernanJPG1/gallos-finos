import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  Dna,
  Award,
  Zap,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/Badge';
import { pedigreeApi } from '../../api/endpoints/pedigree';
import { avesApi } from '../../api/endpoints/aves';
import type { NodoArbol } from '../../types';

// Componente para nodo individual del árbol con interactividad
const NodoArbolCard: React.FC<{
  nodo?: NodoArbol;
  onSelect?: (id: string) => void;
  isMain?: boolean;
}> = ({ nodo, onSelect, isMain = false }) => {
  if (!nodo) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-dark-border/60 bg-dark-surface/20 px-3 py-2 text-[11px] text-slate-500 min-w-[90px] h-16">
        No registrado
      </div>
    );
  }

  const isGallo = nodo.tipo === 'GALLO';

  return (
    <div
      onClick={() => onSelect && onSelect(nodo.id)}
      className={`rounded-2xl border p-2.5 min-w-[105px] max-w-[140px] cursor-pointer transition-all duration-200 hover:scale-105 shadow-md flex flex-col justify-between ${
        isMain
          ? 'bg-gradient-to-br from-gold-950/60 to-dark-card border-gold-500 shadow-glow-gold'
          : isGallo
          ? 'bg-sky-950/50 border-sky-800/70 hover:border-sky-500'
          : 'bg-rose-950/50 border-rose-800/70 hover:border-rose-500'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
            isGallo ? 'bg-sky-900/80 text-sky-200' : 'bg-rose-900/80 text-rose-200'
          }`}
        >
          {isGallo ? '♂ Gallo' : '♀ Gallina'}
        </span>
        {nodo.sgtScore && (
          <span className="text-[10px] font-mono font-bold text-gold-400">
            {nodo.sgtScore.toFixed(1)}
          </span>
        )}
      </div>

      <p className="text-xs font-extrabold text-slate-100 truncate">{nodo.nombre}</p>
      <p className="text-[10px] text-slate-400 truncate mt-0.5">{nodo.lineaGenetica || '—'}</p>
    </div>
  );
};

const PedigreePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const targetId = id || '001';

  // Estados para el Simulador de Cruce
  const [padreIdSim, setPadreIdSim] = useState('001');
  const [madreIdSim, setMadreIdSim] = useState('003');
  const [resultadoSim, setResultadoSim] = useState<any>(null);

  const { data: arbol, isLoading } = useQuery({
    queryKey: ['pedigree', targetId],
    queryFn: () => pedigreeApi.getArbol(targetId, 3),
  });

  const { data: coi } = useQuery({
    queryKey: ['coi', targetId],
    queryFn: () => pedigreeApi.calcularCOI(targetId),
  });

  const { data: todasAves = [] } = useQuery({
    queryKey: ['aves-selector'],
    queryFn: () => avesApi.getAll(),
  });

  const gallosSelector = todasAves.filter((a) => a.tipo === 'GALLO');
  const gallinasSelector = todasAves.filter((a) => a.tipo === 'GALLINA');

  const ejecutarSimulador = async () => {
    try {
      const res = await pedigreeApi.simularCruce(padreIdSim, madreIdSim);
      setResultadoSim(res);
    } catch {}
  };

  const coiVal = coi?.coi || 3.12;
  const coiColor = coiVal < 6.25 ? 'green' : coiVal < 12.5 ? 'amber' : 'red';

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={`Árbol Genealógico: ${arbol?.nombre || 'Ejemplar'}`} showBack />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* BANNER SUPERIOR DE CONSANGUINIDAD Y PUREZA */}
        <div className="card p-6 bg-gradient-to-r from-dark-surface via-dark-card to-dark-bg border border-dark-border/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-950/80 border border-primary-500/40 flex items-center justify-center text-primary-400 flex-shrink-0">
              <Dna size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-100 font-display">
                  {arbol?.nombre} &bull; Mapa de Linaje y Casta
                </h2>
                <Badge color={coiColor as any} dot>
                  Consanguinidad: {coiVal.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Línea de Casta: <strong className="text-slate-200">{arbol?.lineaGenetica || 'Sweater / Kelso'}</strong> &bull; {coi?.nivel || 'Línea Abierta'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/aves/${targetId}/cert`)}
              className="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Award size={15} />
              <span>Ver Certificado de Casta</span>
            </button>
          </div>
        </div>

        {/* ÁRBOL GENEALÓGICO MULTIGENERACIONAL */}
        <div className="card p-6 overflow-x-auto border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch size={18} className="text-primary-400" />
              <h3 className="font-extrabold text-base text-slate-100 font-display">
                Árbol Genealógico de 4 Generaciones
              </h3>
            </div>
            <span className="text-xs text-slate-500">Pulsa en cualquier ancestro para cargar su genealogía</span>
          </div>

          {isLoading ? (
            <div className="h-64 bg-dark-surface/60 rounded-2xl animate-pulse" />
          ) : arbol ? (
            <div className="min-w-[700px] flex flex-col gap-6 items-center py-4">
              {/* Gen 0: Ejemplar Actual */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-400 mb-1">
                  Ejemplar Principal (Generación 0)
                </span>
                <NodoArbolCard nodo={arbol} isMain />
              </div>

              {/* Conector */}
              <div className="w-px h-6 bg-dark-border" />

              {/* Gen 1: Progenitores Directos */}
              <div className="w-full flex justify-around gap-4 px-8">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-sky-400">Padre Semental (♂)</span>
                  <NodoArbolCard
                    nodo={arbol.padre}
                    onSelect={(nid) => navigate(`/aves/${nid}/pedigree`)}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-rose-400">Madre Matriz (♀)</span>
                  <NodoArbolCard
                    nodo={arbol.madre}
                    onSelect={(nid) => navigate(`/aves/${nid}/pedigree`)}
                  />
                </div>
              </div>

              {/* Conector */}
              <div className="w-3/4 h-px bg-dark-border" />

              {/* Gen 2: Abuelos */}
              <div className="w-full flex justify-between gap-2 px-2">
                {[
                  { nodo: arbol.padre?.padre, label: 'Abuelo Paterno (♂)', isGallo: true },
                  { nodo: arbol.padre?.madre, label: 'Abuela Paterna (♀)', isGallo: false },
                  { nodo: arbol.madre?.padre, label: 'Abuelo Materno (♂)', isGallo: true },
                  { nodo: arbol.madre?.madre, label: 'Abuela Materna (♀)', isGallo: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`text-[9px] font-bold ${item.isGallo ? 'text-sky-400' : 'text-rose-400'}`}>
                      {item.label}
                    </span>
                    <NodoArbolCard
                      nodo={item.nodo}
                      onSelect={(nid) => navigate(`/aves/${nid}/pedigree`)}
                    />
                  </div>
                ))}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-dark-border/60 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-sky-950 border border-sky-500" />
                  <span>♂ Línea Masculina (Gallos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rose-950 border border-rose-500" />
                  <span>♀ Línea Femenina (Gallinas Matrices)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gold-950 border border-gold-500" />
                  <span>★ Ejemplar Seleccionado</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* LABORATORIO VIRTUAL DE CRUCES GENÉTICOS */}
        <div className="card p-6 bg-gradient-to-br from-dark-surface/90 via-dark-card to-dark-bg border border-primary-900/60 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-100 font-display">
                  Laboratorio de Cruces &bull; Predicción Genética de Casta
                </h3>
                <p className="text-xs text-slate-400">
                  Pronostica el Puntaje SGT esperado, coeficiente de consanguinidad y compatibilidad zootécnica
                </p>
              </div>
            </div>
            <span className="badge-purple">Simulación Zootécnica</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Selector de Padre */}
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/40">
              <label className="text-xs font-extrabold text-sky-400 uppercase tracking-wider block mb-2">
                Seleccionar Semental Padre (♂)
              </label>
              <select
                className="input bg-dark-bg"
                value={padreIdSim}
                onChange={(e) => setPadreIdSim(e.target.value)}
              >
                {gallosSelector.map((g) => (
                  <option key={g.id} value={g.id}>
                    #{g.id} &bull; {g.nombre} ({g.lineaGenetica || 'Sweater'}) &bull; SGT: {g.sgtScore?.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Madre */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40">
              <label className="text-xs font-extrabold text-rose-400 uppercase tracking-wider block mb-2">
                Seleccionar Gallina Matriz Madre (♀)
              </label>
              <select
                className="input bg-dark-bg"
                value={madreIdSim}
                onChange={(e) => setMadreIdSim(e.target.value)}
              >
                {gallinasSelector.map((g) => (
                  <option key={g.id} value={g.id}>
                    #{g.id} &bull; {g.nombre} ({g.lineaGenetica || 'Kelso'}) &bull; SGT: {g.sgtScore?.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={ejecutarSimulador}
            className="w-full btn-gold py-3 text-sm shadow-glow-gold flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <Zap size={16} />
            <span>Simular Cruce &amp; Calcular Predicción Genética</span>
          </button>

          {/* Resultado de la Simulación */}
          {resultadoSim && (
            <div className="p-5 rounded-2xl bg-dark-bg/90 border border-gold-500/50 flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-border/80">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
                    Proyección de Progenie Híbrida
                  </span>
                  <h4 className="text-lg font-black text-white font-display">
                    {resultadoSim.projectedLineage}
                  </h4>
                  <p className="text-xs text-slate-400">{resultadoSim.healthEvaluation}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">Puntaje SGT Previsto</span>
                    <span className="text-2xl font-black text-gold-400 font-mono">
                      {resultadoSim.projectedSgt.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right pl-3 border-l border-dark-border">
                    <span className="text-[10px] text-slate-400 block font-bold">Consanguinidad</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {resultadoSim.projectedCoi.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {resultadoSim.traits.map((t: any) => (
                  <div key={t.label} className="p-3 rounded-xl bg-dark-surface/60 border border-dark-border/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.label}</p>
                    <p className="text-xs font-extrabold text-slate-100 mt-0.5">{t.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedigreePage;
