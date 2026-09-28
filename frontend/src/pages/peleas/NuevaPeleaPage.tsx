import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Swords, Calendar, Scale, MapPin, AlertTriangle } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { avesApi } from '../../api/endpoints/aves';
import { peleasApi } from '../../api/endpoints/peleas';
import type { ResultadoPelea } from '../../types';

const RESULTADOS: { value: ResultadoPelea; label: string; color: string }[] = [
  { value: 'VICTORIA', label: '✓ Victoria', color: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green border-emerald-400' },
  { value: 'DERROTA',  label: '✗ Derrota',  color: 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500' },
  { value: 'EMPATE',   label: '= Empate',   color: 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400' },
  { value: 'MUERTE',   label: '† Muerte',   color: 'bg-slate-900 hover:bg-black text-slate-300 border-slate-700' },
];

const NuevaPeleaPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [galloId, setGalloId] = useState('');
  const [resultado, setResultado] = useState<ResultadoPelea | ''>('VICTORIA');
  const [form, setForm] = useState({
    eventoNombre: 'Gran Derby de Palenque 2026',
    fecha: new Date().toISOString().split('T')[0],
    lugar: 'Palenque San Marcos',
    pesoGramos: '',
    rivalNombre: '',
    rivalCriadero: '',
    duracionMinutos: '5',
    lesiones: 'Sin lesiones de gravedad',
    notas: '',
  });

  const { data: gallos = [] } = useQuery({
    queryKey: ['gallos-activos'],
    queryFn: () => avesApi.getAll({ tipo: 'GALLO', estado: 'ACTIVO' }),
  });

  const handleSelectGallo = (id: string) => {
    setGalloId(id);
    const selected = gallos.find((g) => g.id === id);
    if (selected && selected.pesoGramos) {
      setForm((prev) => ({ ...prev, pesoGramos: String(selected.pesoGramos) }));
    }
  };

  const mutation = useMutation({
    mutationFn: () =>
      peleasApi.create({
        galloId,
        resultado: resultado as ResultadoPelea,
        fecha: form.fecha,
        eventoNombre: form.eventoNombre || undefined,
        lugar: form.lugar || undefined,
        pesoGramos: form.pesoGramos ? parseInt(form.pesoGramos) : undefined,
        rivalNombre: form.rivalNombre || undefined,
        rivalCriadero: form.rivalCriadero || undefined,
        duracionMinutos: form.duracionMinutos ? parseInt(form.duracionMinutos) : undefined,
        lesiones: form.lesiones || undefined,
        notas: form.notas || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peleas'] });
      queryClient.invalidateQueries({ queryKey: ['aves'] });
      toast.success('Combate registrado y estadísticas del ave actualizadas');
      navigate('/peleas');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar combate');
    },
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit = galloId && resultado;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Registrar Combate" showBack />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex flex-col gap-6">
        <div className="card p-6 sm:p-8 flex flex-col gap-5 border border-dark-border/80">
          <div>
            <h2 className="text-xl font-black text-slate-100 font-display flex items-center gap-2">
              <Swords size={20} className="text-primary-500" />
              <span>Acta de Combate Oficial</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Registra los datos del pesaje, rival y resultado para el cómputo del porcentaje de victorias y el SGT.
            </p>
          </div>

          {/* Selector de Gallo */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
              Gallo Participante (♂) *
            </label>
            <select
              className="input bg-dark-bg"
              value={galloId}
              onChange={(e) => handleSelectGallo(e.target.value)}
            >
              <option value="">Seleccionar gallo del criadero...</option>
              {gallos.map((g) => (
                <option key={g.id} value={g.id}>
                  #{g.id} &bull; {g.nombre} ({g.lineaGenetica || 'Sweater'}) &bull; {g.pesoGramos}g
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Resultado */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
              Resultado del Combate *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESULTADOS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setResultado(value)}
                  className={clsx(
                    'py-3 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer active:scale-95',
                    resultado === value
                      ? color
                      : 'bg-dark-surface/60 border-dark-border text-slate-400 hover:text-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Datos del Evento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha del Combate *"
              type="date"
              value={form.fecha}
              onChange={(e) => set('fecha', e.target.value)}
            />
            <Input
              label="Peso en Báscula (gramos)"
              type="number"
              placeholder="ej: 2160"
              value={form.pesoGramos}
              onChange={(e) => set('pesoGramos', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre del Torneo / Derby"
              placeholder="ej: Derby de Campeones"
              value={form.eventoNombre}
              onChange={(e) => set('eventoNombre', e.target.value)}
            />
            <Input
              label="Palenque / Lugar"
              placeholder="ej: Palenque San Marcos"
              value={form.lugar}
              onChange={(e) => set('lugar', e.target.value)}
            />
          </div>

          {/* Datos del Rival */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre del Gallo Rival"
              placeholder="ej: El Espartaco"
              value={form.rivalNombre}
              onChange={(e) => set('rivalNombre', e.target.value)}
            />
            <Input
              label="Criadero Rival"
              placeholder="ej: Rancho El Sol"
              value={form.rivalCriadero}
              onChange={(e) => set('rivalCriadero', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duración (minutos)"
              type="number"
              placeholder="ej: 4"
              value={form.duracionMinutos}
              onChange={(e) => set('duracionMinutos', e.target.value)}
            />
            <Input
              label="Lesiones / Estado Físico"
              placeholder="ej: Corte superficial en ala"
              value={form.lesiones}
              onChange={(e) => set('lesiones', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
              Observaciones &bull; Estilo de Combate
            </label>
            <textarea
              className="input bg-dark-bg min-h-[80px]"
              placeholder="Describe cómo se desenvolvió el gallo, estilo de tiro, ritmo de combate y recuperación..."
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
            />
          </div>

          {resultado === 'MUERTE' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Aviso Zootécnico:</strong> Al registrar muerte, el ejemplar pasará automáticamente al estado MUERTO en el inventario activo del criadero, preservando su historial para cálculos de linaje y descendencia.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Registrar Combate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaPeleaPage;
