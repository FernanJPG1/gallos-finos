import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Heart,
  Plus,
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Syringe,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Badge, type BadgeColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { saludApi } from '../../api/endpoints/salud';
import toast from 'react-hot-toast';

const SaludPage: React.FC = () => {
  const [mesActual, setMesActual] = useState(new Date());
  const queryClient = useQueryClient();

  const mesStr = format(mesActual, 'yyyy-MM');

  const { data: calendario = [], isLoading } = useQuery({
    queryKey: ['salud-calendario', mesStr],
    queryFn: () => saludApi.getCalendario(mesStr),
  });

  const { data: vencidos = [] } = useQuery({
    queryKey: ['salud-vencidos'],
    queryFn: () => saludApi.getVencidos(),
  });

  const completarMutation = useMutation({
    mutationFn: (id: string) => saludApi.marcarCompletado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salud-calendario'] });
      queryClient.invalidateQueries({ queryKey: ['salud-proximos'] });
      queryClient.invalidateQueries({ queryKey: ['salud-vencidos'] });
      toast.success('Tratamiento marcado como administrado correctamente');
    },
  });

  const protocoloMutation = useMutation({
    mutationFn: () => saludApi.initProtocolo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salud-calendario'] });
      toast.success('Protocolo estacional de vacunación avícola aplicado');
    },
  });

  // Construir calendario
  const inicio = startOfMonth(mesActual);
  const fin = endOfMonth(mesActual);
  const dias = eachDayOfInterval({ start: inicio, end: fin });
  const primerDia = getDay(inicio); // 0=Dom

  const diasConEvento = new Set(calendario.map((e: any) => parseInt(e.dia)));

  const tipoColors: Record<string, { badge: BadgeColor; dot: string }> = {
    VACUNA:          { badge: 'green',  dot: 'bg-emerald-400' },
    MEDICAMENTO:     { badge: 'blue',   dot: 'bg-sky-400' },
    REVISION:        { badge: 'amber',  dot: 'bg-amber-400' },
    TRATAMIENTO:     { badge: 'red',    dot: 'bg-rose-400' },
    DESPARASITACION: { badge: 'purple', dot: 'bg-purple-400' },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Sanidad &amp; Vacunación de Criadero"
        rightAction={
          <button
            onClick={() => protocoloMutation.mutate()}
            disabled={protocoloMutation.isPending}
            className="btn-gold text-xs py-2 px-3 shadow-glow-gold flex items-center gap-1.5"
          >
            <Syringe size={14} />
            <span className="hidden sm:inline">Protocolo Estacional</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* BANNER INFORMATIVO SANITARIO */}
        <div className="card p-6 bg-gradient-to-r from-dark-surface via-dark-card to-dark-bg border border-dark-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 font-display">
                Bioseguridad &bull; Criadero Los Gavilanes
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vigilancia epidemiológica preventiva, vacunación y desparasitación para gallos de combate y pie de cría.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="badge-green">94% Cobertura Activa</span>
          </div>
        </div>

        {/* ALERTA DE TRATAMIENTOS VENCIDOS O URGENTES */}
        {vencidos.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertCircle size={18} className="text-rose-400" />
              <span>{vencidos.length} Tratamientos con Fecha Vencida</span>
            </div>
            {vencidos.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between text-xs text-rose-300/90 pl-6">
                <span>{v.nombre} &bull; {v.aveNombre || 'Criadero'}</span>
                <span className="font-bold text-rose-400">Vencido</span>
              </div>
            ))}
          </div>
        )}

        {/* CALENDARIO MENSUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Cuadrícula Calendario */}
          <div className="card p-6 flex flex-col gap-4 border border-dark-border/80">
            {/* Cabecera del Mes */}
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/80">
              <button
                onClick={() => setMesActual((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
                className="p-2 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <h3 className="font-extrabold text-base text-slate-100 font-display capitalize">
                {format(mesActual, 'MMMM yyyy', { locale: es })}
              </h3>
              <button
                onClick={() => setMesActual((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
                className="p-2 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-slate-500">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1.5">
              {[...Array(primerDia)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {dias.map((dia) => {
                const num = dia.getDate();
                const tieneEvento = diasConEvento.has(num);
                const hoy = isToday(dia);

                return (
                  <div
                    key={num}
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-xs font-bold transition-all ${
                      hoy
                        ? 'bg-primary-700 text-white shadow-glow-red'
                        : tieneEvento
                        ? 'bg-dark-surface border border-gold-500/40 text-gold-300'
                        : 'bg-dark-bg/60 text-slate-400 hover:bg-dark-surface/40'
                    }`}
                  >
                    <span>{num}</span>
                    {tieneEvento && (
                      <span
                        className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                          hoy ? 'bg-white' : 'bg-gold-400'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Leyenda de Categorías */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dark-border/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Vacunas Oficiales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Desparasitación</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Vitaminas &amp; Cuido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Inspección Sanitaria</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Lista de Eventos y Tareas */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-100 font-display">
                Tratamientos de {format(mesActual, 'MMMM', { locale: es })}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {calendario.length} programados
              </span>
            </div>

            {calendario.length === 0 ? (
              <div className="card p-10 text-center text-slate-400">
                <Heart size={36} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold">Sin tratamientos programados para este mes</p>
                <p className="text-xs mt-1">El lote se encuentra completamente inmunizado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {calendario.map((evento: any) => {
                  const cfg = tipoColors[evento.tipo] || { badge: 'gray', dot: 'bg-slate-400' };

                  return (
                    <div
                      key={evento.id}
                      className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                        evento.completado
                          ? 'border-dark-border/40 opacity-75'
                          : 'border-dark-border hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            evento.completado
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                              : 'bg-dark-surface text-slate-400 border border-dark-border'
                          }`}
                        >
                          {evento.completado ? <CheckCircle size={20} /> : <Clock size={20} />}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`font-bold text-sm ${
                                evento.completado ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {evento.nombre}
                            </h4>
                            <Badge color={cfg.badge} dot>
                              {evento.tipo}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-400 mt-1">
                            Para: <strong className="text-slate-200">{evento.aveNombre || 'Todo el Criadero'}</strong> &bull; Día {evento.dia} de {format(mesActual, 'MMMM', { locale: es })}
                            {evento.dosis && <span> &bull; Dosis: {evento.dosis}</span>}
                          </p>

                          {evento.observaciones && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              "{evento.observaciones}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {!evento.completado ? (
                          <button
                            onClick={() => completarMutation.mutate(evento.id)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-glow-red cursor-pointer"
                          >
                            <CheckCircle size={14} />
                            <span>Marcar Aplicado</span>
                          </button>
                        ) : (
                          <span className="badge-green text-xs">Administrado ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaludPage;
