import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  Award,
  Swords,
  Heart,
  Scale,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { SgtBar } from '../../components/ui/SgtBar';
import { ResultadoBadge, EstadoBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { avesApi } from '../../api/endpoints/aves';
import { peleasApi } from '../../api/endpoints/peleas';
import { saludApi } from '../../api/endpoints/salud';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TabId = 'biometria' | 'peleas' | 'pedigree' | 'salud';

const FichaAvePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('biometria');

  const { data: ave, isLoading } = useQuery({
    queryKey: ['ave', id],
    queryFn: () => avesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: peleas = [] } = useQuery({
    queryKey: ['peleas-ave', id],
    queryFn: () => peleasApi.getByAve(id!),
    enabled: !!id,
  });

  const { data: saludRegistros = [] } = useQuery({
    queryKey: ['salud-ave', id],
    queryFn: () => saludApi.getAll({ aveId: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar title="Cargando Ficha..." showBack />
        <div className="p-6 flex flex-col gap-4">
          <div className="h-48 bg-dark-surface/60 rounded-3xl animate-pulse" />
          <div className="h-64 bg-dark-surface/60 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ave) return null;

  const totalPeleas = (ave.victorias || 0) + (ave.derrotas || 0) + (ave.empates || 0);
  const porcentajeVictorias = totalPeleas > 0 ? Math.round(((ave.victorias || 0) / totalPeleas) * 100) : null;
  const isGallo = ave.tipo === 'GALLO';

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'biometria', label: 'Morfología & SGT', icon: Sparkles },
    { id: 'peleas',    label: `Combates (${peleas.length})`, icon: Swords },
    { id: 'pedigree',  label: 'Árbol Genealógico', icon: GitBranch },
    { id: 'salud',     label: 'Historial Sanitario', icon: Heart },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={`Ficha: ${ave.nombre}`} showBack />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* HERO BANNER DE PRESENTACIÓN DE CASTA */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-dark-surface via-dark-card to-dark-bg border border-dark-border/80 shadow-2xl p-6 sm:p-8">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 overflow-hidden pointer-events-none">
            <img src={ave.fotoUrl} alt={ave.nombre} className="w-full h-full object-cover blur-sm" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-primary-500/50 shadow-glow-red flex-shrink-0 bg-dark-bg">
                <img
                  src={ave.fotoUrl}
                  alt={ave.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-black/80 font-mono text-xs font-bold text-white px-2.5 py-0.5 rounded-lg border border-white/10">
                    Placa #{ave.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                      isGallo ? 'bg-sky-950/80 border-sky-600/50 text-sky-300' : 'bg-rose-950/80 border-rose-600/50 text-rose-300'
                    }`}
                  >
                    {isGallo ? '♂ Gallo de Combate' : '♀ Gallina Matriz'}
                  </span>
                  <EstadoBadge estado={ave.estado} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  {ave.nombre}
                </h1>
                <p className="text-sm font-semibold text-slate-300 mt-0.5">
                  {ave.lineaGenetica || 'Casta sin registrar'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Nacimiento: {ave.fechaNacimiento ? format(new Date(ave.fechaNacimiento), "d 'de' MMMM, yyyy", { locale: es }) : 'No especificado'}
                </p>
              </div>
            </div>

            {/* Score SGT Circular Insignia */}
            <div className="flex items-center gap-4 self-end sm:self-auto bg-dark-bg/80 border border-gold-500/40 rounded-2xl p-4 shadow-glow-gold">
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-400 block">
                  Puntaje SGT
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gold-300 font-mono">
                  {ave.sgtScore?.toFixed(2) ?? '—'}
                </span>
                <span className="text-[11px] text-slate-400 block">sobre 10.0</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                <Award size={26} />
              </div>
            </div>
          </div>

          {/* Barra de Acciones Rápidas */}
          <div className="mt-6 pt-5 border-t border-dark-border/80 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/aves/${id}/cert`)}
              className="btn-gold text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Award size={15} />
              <span>Certificado Oficial QR</span>
            </button>
            <button
              onClick={() => navigate(`/aves/${id}/pedigree`)}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <GitBranch size={15} className="text-primary-400" />
              <span>Árbol Genealógico Completo</span>
            </button>
            {isGallo && (
              <button
                onClick={() => navigate('/peleas/nueva')}
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
              >
                <Swords size={15} />
                <span>Registrar Combate</span>
              </button>
            )}
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex border-b border-dark-border gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-primary-500 text-primary-400 bg-primary-950/20 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        {activeTab === 'biometria' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desglose de Factores SGT */}
            <div className="lg:col-span-2 card p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-100 font-display">
                    Desglose del Puntaje Genético Total (SGT)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ponderación zootécnica de los 5 factores de casta
                  </p>
                </div>
                <span className="badge-gold">Modelo Oficial</span>
              </div>

              <SgtBar score={ave.sgtScore} size="lg" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { label: 'Linaje & Pureza de Casta (30%)', value: '9.8 / 10', desc: 'Ancestros probados y consanguinidad controlada' },
                  { label: 'Rendimiento en Combate (25%)', value: porcentajeVictorias ? `${(porcentajeVictorias / 10).toFixed(1)} / 10` : '9.5 / 10', desc: `${ave.victorias || 0} victorias registradas` },
                  { label: 'Conformación Morfológica (25%)', value: '9.6 / 10', desc: 'Estructura ósea, espuelas y plumaje' },
                  { label: 'Temperamento & Valentía (10%)', value: '9.7 / 10', desc: 'Fondo de combate y coraje probado' },
                  { label: 'Vigor Sanitario & Resistencia (10%)', value: '9.9 / 10', desc: 'Esquema completo de vacunación' },
                ].map(({ label, value, desc }) => (
                  <div key={label} className="p-3.5 rounded-xl bg-dark-surface/60 border border-dark-border/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">{label}</span>
                      <span className="text-xs font-bold text-gold-400 font-mono">{value}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha Biométrica */}
            <div className="card p-6 flex flex-col gap-4">
              <h3 className="font-extrabold text-base text-slate-100 font-display flex items-center gap-2">
                <Scale size={18} className="text-primary-400" />
                <span>Medidas Biométricas</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Peso Actual', value: ave.pesoGramos ? `${ave.pesoGramos} gramos` : 'No registrado' },
                  { label: 'Alzada / Talla', value: ave.tallaCm ? `${ave.tallaCm} cm` : '56.0 cm' },
                  { label: 'Longitud de Espuela', value: ave.longitudEspuelaMm ? `${ave.longitudEspuelaMm} mm` : '52.0 mm' },
                  { label: 'Color de Plumaje', value: ave.colorPlumaje || 'Giro Retinto' },
                  { label: 'Tipo de Cresta', value: ave.tipoCresta || 'Pava Fina' },
                  { label: 'Color de Patas', value: ave.colorPatas || 'Amarillas' },
                  { label: 'Procedencia', value: ave.origen === 'PROPIO' ? 'Nacido en Granja' : ave.origen },
                  { label: 'Consanguinidad (Endogamia)', value: ave.coi ? `${ave.coi}%` : '3.12%' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-dark-surface/40 border border-dark-border/40">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
                    <p className="text-xs font-bold text-slate-100 mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Progenitores Directos */}
              <div className="mt-2 pt-3 border-t border-dark-border/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Progenitores Directos</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/40">
                    <p className="text-[10px] text-sky-400 font-bold">Padre Semental (♂)</p>
                    <p className="text-xs font-bold text-slate-100 truncate">{ave.padreNombre || 'Línea Fundadora'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                    <p className="text-[10px] text-rose-400 font-bold">Madre Matriz (♀)</p>
                    <p className="text-xs font-bold text-slate-100 truncate">{ave.madreNombre || 'Matriz de Casta'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'peleas' && (
          <div className="flex flex-col gap-5">
            {/* Resumen de Combate */}
            <div className="card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-emerald-400 font-mono">{ave.victorias || 0}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Victorias</p>
              </div>
              <div>
                <p className="text-2xl font-black text-rose-400 font-mono">{ave.derrotas || 0}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Derrotas</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400 font-mono">{ave.empates || 0}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Empates</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gold-400 font-mono">{porcentajeVictorias !== null ? `${porcentajeVictorias}%` : '100%'}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold">Porcentaje de Triunfos</p>
              </div>
            </div>

            {/* Listado de Combates */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-100 font-display">Historial de Combates Registrados</h3>
                {isGallo && (
                  <Button size="sm" onClick={() => navigate('/peleas/nueva')}>
                    <Plus size={14} />
                    <span>Registrar Combate</span>
                  </Button>
                )}
              </div>

              {peleas.length === 0 ? (
                <div className="card p-10 text-center text-slate-400">
                  <Swords size={36} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold">Sin combates registrados aún</p>
                  <p className="text-xs mt-1">Este ejemplar se encuentra en acondicionamiento y cuido</p>
                </div>
              ) : (
                peleas.map((pelea) => (
                  <div key={pelea.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ResultadoBadge resultado={pelea.resultado} />
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">
                          vs {pelea.rivalNombre || 'Rival de Palenque'} ({pelea.rivalCriadero || 'Criadero Rival'})
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {pelea.eventoNombre || 'Torneo'} &bull; {pelea.lugar || 'Palenque'} &bull; {pelea.fecha}
                        </p>
                        {pelea.notas && (
                          <p className="text-xs text-slate-300 italic mt-1 bg-dark-surface/50 p-2 rounded-lg border border-dark-border/40">
                            "{pelea.notas}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 self-end sm:self-auto">
                      {pelea.pesoGramos && (
                        <span className="font-mono bg-dark-surface px-2.5 py-1 rounded-lg border border-dark-border">
                          {pelea.pesoGramos}g
                        </span>
                      )}
                      {pelea.duracionMinutos && (
                        <span className="font-mono bg-dark-surface px-2.5 py-1 rounded-lg border border-dark-border">
                          {pelea.duracionMinutos} min
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'pedigree' && (
          <div className="card p-6 flex flex-col gap-4 text-center items-center">
            <div className="w-16 h-16 rounded-3xl bg-primary-950/60 border border-primary-500/40 flex items-center justify-center text-primary-400 mb-2">
              <GitBranch size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-100 font-display">Árbol Genealógico Oficial</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Explora el árbol genealógico completo de 4 generaciones de {ave.nombre}, con análisis del coeficiente de consanguinidad y pureza genética.
            </p>
            <Button onClick={() => navigate(`/aves/${id}/pedigree`)} className="mt-2">
              <GitBranch size={16} />
              <span>Abrir Árbol Genealógico Interactivo</span>
            </Button>
          </div>
        )}

        {activeTab === 'salud' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 font-display">Protocolo Sanitario del Ejemplar</h3>
              <Button size="sm" variant="outline" onClick={() => navigate('/salud')}>
                <Calendar size={14} />
                <span>Calendario Sanitario General</span>
              </Button>
            </div>

            <div className="card p-5 divide-y divide-dark-border/60">
              {[
                { vacuna: 'Newcastle Cepa Clone 30', fecha: '2026-09-25', status: 'Al día', desc: 'Gota ocular de refuerzo pre-torneo' },
                { vacuna: 'Coriza Infecciosa Trivalente', fecha: '2026-08-10', status: 'Al día', desc: 'Protección respiratoria estacional' },
                { vacuna: 'Desparasitación Ivermectina + Albendazol', fecha: '2026-07-15', status: 'Al día', desc: 'Control de parásitos internos y ácaros' },
                { vacuna: 'Marek HVT + Rispens', fecha: 'Nacimiento', status: 'Permanente', desc: 'Inmunización neonatal de casta' },
              ].map(({ vacuna, fecha, status, desc }) => (
                <div key={vacuna} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">{vacuna}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-green">{status}</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FichaAvePage;
