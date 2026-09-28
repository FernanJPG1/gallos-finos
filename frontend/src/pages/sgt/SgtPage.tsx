import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  RefreshCw,
  Target,
  Swords,
  Scale,
  Calendar,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { SgtBar } from '../../components/ui/SgtBar';
import { Input } from '../../components/ui/Input';
import { sgtApi } from '../../api/endpoints/sgt';
import { avesApi } from '../../api/endpoints/aves';
import toast from 'react-hot-toast';

const SgtPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pesoEvento, setPesoEvento] = useState('2150');
  const [fechaEvento, setFechaEvento] = useState('2026-10-15');
  const [recomendaciones, setRecomendaciones] = useState<any[]>([]);

  const { data: gallos = [] } = useQuery({
    queryKey: ['gallos-activos'],
    queryFn: () => avesApi.getAll({ tipo: 'GALLO', estado: 'ACTIVO' }),
  });

  const recalcularMutation = useMutation({
    mutationFn: () => sgtApi.calcularTodos(),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['aves'] });
      queryClient.invalidateQueries({ queryKey: ['gallos-activos'] });
      toast.success(`Puntaje SGT recalculado con éxito para ${results.length} ejemplares`);
    },
    onError: () => toast.error('Error al recalcular SGT'),
  });

  const buscarRecomendaciones = async () => {
    if (!pesoEvento) {
      toast.error('Ingresa el peso pactado para el evento');
      return;
    }
    try {
      const data = await sgtApi.getRecomendaciones(parseInt(pesoEvento), fechaEvento);
      setRecomendaciones(data);
      if (data.length === 0) {
        toast('Sin gallos en ese rango de peso pactado', { icon: 'ℹ️' });
      } else {
        toast.success(`Se encontraron ${data.length} gallos ideales para el peso pactado`);
      }
    } catch {
      toast.error('Error al buscar recomendaciones');
    }
  };

  const clasificacion = [...gallos]
    .filter((g) => g.sgtScore != null)
    .sort((a, b) => (b.sgtScore || 0) - (a.sgtScore || 0));

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Puntaje Genético Total (SGT)" />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* BANNER EXPLICATIVO DEL ALGORITMO SGT */}
        <div className="card p-6 bg-gradient-to-r from-dark-surface via-dark-card to-dark-bg border border-dark-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-gold">Modelo Zootécnico Oficial</span>
              <span className="text-xs text-slate-400">Puntaje Científico de 5 Factores</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Índice SGT &bull; Evaluación de Alta Casta
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              El Puntaje Genético Total (SGT) valora la capacidad zootécnica y competitiva del ave según:{' '}
              <strong className="text-slate-100">Linaje y Pureza (30%)</strong>, <strong className="text-slate-100">Rendimiento en Combate (25%)</strong>,{' '}
              <strong className="text-slate-100">Morfología y Espuelas (25%)</strong>, <strong className="text-slate-100">Temperamento y Valentía (10%)</strong> y{' '}
              <strong className="text-slate-100">Sanidad y Vigor (10%)</strong>.
            </p>
          </div>

          <button
            onClick={() => recalcularMutation.mutate()}
            disabled={recalcularMutation.isPending}
            className="btn-gold py-2.5 px-4 text-xs shadow-glow-gold flex items-center gap-2 self-start lg:self-auto cursor-pointer"
          >
            <RefreshCw size={15} className={recalcularMutation.isPending ? 'animate-spin' : ''} />
            <span>Recalcular Puntajes SGT de la Crianza</span>
          </button>
        </div>

        {/* SELECTOR PARA PALENQUES Y TORNEOS */}
        <div className="card p-6 border border-primary-900/60 bg-gradient-to-br from-dark-surface/90 to-dark-card shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 font-display">
                Selector Inteligente para Palenques &amp; Torneos
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona al instante los gallos en peso exacto y con tiempo de descanso reglamentario
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Input
              label="Peso Pactado en Báscula (gramos)"
              type="number"
              placeholder="ej: 2150"
              value={pesoEvento}
              onChange={(e) => setPesoEvento(e.target.value)}
            />
            <Input
              label="Fecha del Compromiso / Palenque"
              type="date"
              value={fechaEvento}
              onChange={(e) => setFechaEvento(e.target.value)}
            />
            <div className="flex items-end">
              <button
                onClick={buscarRecomendaciones}
                className="w-full btn-primary py-2.5 text-xs h-[42px] flex items-center justify-center gap-2 shadow-glow-red cursor-pointer"
              >
                <Target size={16} />
                <span>Buscar Gallos Calificados</span>
              </button>
            </div>
          </div>

          {/* Resultados del Selector */}
          {recomendaciones.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Gallos Calificados para {pesoEvento}g &bull; ({recomendaciones.length} encontrados)
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Tolerancia ±60g aplicada</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recomendaciones.map((ave, i) => (
                  <div
                    key={ave.id}
                    onClick={() => navigate(`/aves/${ave.id}`)}
                    className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border hover:border-gold-500/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs font-mono flex-shrink-0 ${
                          i === 0
                            ? 'bg-amber-500/20 text-gold-400 border border-gold-500/50'
                            : 'bg-dark-surface text-slate-300 border border-dark-border'
                        }`}
                      >
                        #{i + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100 hover:text-primary-400">
                            {ave.nombre}
                          </h4>
                          {ave.listo_para_pelea ? (
                            <span className="badge-green text-[10px]">Listo en Peso</span>
                          ) : (
                            <span className="badge-amber text-[10px]">Descanso Reciente</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ave.peso_gramos}g &bull; {ave.semanas_descanso ?? 4} sem. descanso &bull; {ave.linea_genetica}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-black text-gold-400 font-mono">
                        {parseFloat(ave.sgt_score || '9.0').toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">Puntaje SGT</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CLASIFICACIÓN GENERAL SGT DE GALLOS */}
        <div className="card p-6 border border-dark-border/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold-400" />
              <h3 className="font-extrabold text-base text-slate-100 font-display">
                Clasificación SGT &bull; Todos los Gallos Activos
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{clasificacion.length} ejemplares calificados</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {clasificacion.map((ave, i) => (
              <div
                key={ave.id}
                onClick={() => navigate(`/aves/${ave.id}`)}
                className="p-3.5 rounded-2xl bg-dark-surface/40 hover:bg-dark-surface/80 border border-dark-border/60 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono flex-shrink-0 ${
                    i === 0
                      ? 'bg-amber-500/20 text-gold-400 border border-gold-500/50'
                      : i === 1
                      ? 'bg-slate-700/30 text-slate-200 border border-slate-500/40'
                      : i === 2
                      ? 'bg-orange-700/20 text-orange-300 border border-orange-500/40'
                      : 'text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>

                <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark-bg border border-white/5 flex-shrink-0">
                  <img src={ave.fotoUrl} alt={ave.nombre} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-slate-100 truncate">{ave.nombre}</p>
                    <span className="text-sm font-black text-gold-400 font-mono ml-2">
                      {ave.sgtScore?.toFixed(2)}
                    </span>
                  </div>
                  <SgtBar score={ave.sgtScore} size="sm" showLabel={false} />
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 border-l border-dark-border pl-3">
                  <span>{ave.pesoGramos}g</span>
                  <span className="text-emerald-400 font-bold">{ave.victorias} Vic</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SgtPage;
