import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bird, Plus, Sparkles, Scale, GitBranch } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { avesApi } from '../../api/endpoints/aves';

const NuevaAvePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: todasAves = [] } = useQuery({
    queryKey: ['aves-padres'],
    queryFn: () => avesApi.getAll(),
  });

  const gallos = todasAves.filter((a) => a.tipo === 'GALLO');
  const gallinas = todasAves.filter((a) => a.tipo === 'GALLINA');

  const [form, setForm] = useState({
    id: String(todasAves.length + 1).padStart(3, '0'),
    nombre: '',
    tipo: 'GALLO' as 'GALLO' | 'GALLINA',
    fechaNacimiento: new Date().toISOString().split('T')[0],
    origen: 'PROPIO',
    lineaGenetica: 'Sweater 5000 / Kelso',
    colorPlumaje: 'Colorado Giro',
    tipoCresta: 'Pava Fina',
    colorPatas: 'Amarillas',
    pesoGramos: '2150',
    tallaCm: '56.0',
    longitudEspuelaMm: '52.0',
    padreId: gallos[0]?.id || '',
    madreId: gallinas[0]?.id || '',
    notas: '',
  });

  const mutation = useMutation({
    mutationFn: () =>
      avesApi.create({
        ...form,
        pesoGramos: form.pesoGramos ? parseInt(form.pesoGramos) : undefined,
        tallaCm: form.tallaCm ? parseFloat(form.tallaCm) : undefined,
        longitudEspuelaMm: form.longitudEspuelaMm ? parseFloat(form.longitudEspuelaMm) : undefined,
        padreId: form.padreId || undefined,
        madreId: form.madreId || undefined,
      } as any),
    onSuccess: (ave) => {
      queryClient.invalidateQueries({ queryKey: ['aves'] });
      queryClient.invalidateQueries({ queryKey: ['gallos-activos'] });
      toast.success(`Ejemplar '${ave.nombre}' registrado con éxito en el criadero`);
      navigate(`/aves/${ave.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar el ave');
    },
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Registrar Nueva Ave de Casta" showBack />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
        <div className="card p-6 sm:p-8 flex flex-col gap-6 border border-dark-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-gold">Alta Zootécnica</span>
              <span className="text-xs text-slate-400">Libro Genealógico Oficial</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 font-display">
              Ficha de Ingreso &bull; Criadero Los Gavilanes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Completa los datos biométricos y de linaje para la asignación de placa y cálculo SGT inicial.
            </p>
          </div>

          {/* Selector Tipo de Ave */}
          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
              Tipo de Ejemplar *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'GALLO', label: '♂ Gallo de Combate / Semental', desc: 'Espuelas, peso de palenque y cuido' },
                { type: 'GALLINA', label: '♀ Gallina Matriz Reproductora', desc: 'Línea materna y fecundidad de casta' },
              ].map(({ type, label, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('tipo', type as any)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    form.tipo === type
                      ? type === 'GALLO'
                        ? 'bg-sky-950/60 border-sky-500 shadow-glow-red'
                        : 'bg-rose-950/60 border-rose-500 shadow-glow-red'
                      : 'bg-dark-surface/50 border-dark-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-sm text-slate-100">{label}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Datos de Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Número de Placa / Anillo *"
              placeholder="ej: 013"
              value={form.id}
              onChange={(e) => set('id', e.target.value)}
              hint="Código alfanumérico grabado en placa"
            />
            <Input
              label="Nombre del Ejemplar *"
              placeholder="ej: El Tornado"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Línea Genética / Casta *"
              placeholder="ej: Sweater 5000, Kelso Out-and-Out, Hatch"
              value={form.lineaGenetica}
              onChange={(e) => set('lineaGenetica', e.target.value)}
            />
            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => set('fechaNacimiento', e.target.value)}
            />
          </div>

          {/* Rasgos Físicos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Color de Plumaje"
              placeholder="ej: Giro Dorado, Colorado Retinto"
              value={form.colorPlumaje}
              onChange={(e) => set('colorPlumaje', e.target.value)}
            />
            <Input
              label="Tipo de Cresta"
              placeholder="ej: Pava, Sierra, Nuez"
              value={form.tipoCresta}
              onChange={(e) => set('tipoCresta', e.target.value)}
            />
            <Input
              label="Color de Patas"
              placeholder="ej: Amarillas, Blancas, Verdes"
              value={form.colorPatas}
              onChange={(e) => set('colorPatas', e.target.value)}
            />
          </div>

          {/* Biometría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Peso Actual (gramos)"
              type="number"
              placeholder="ej: 2160"
              value={form.pesoGramos}
              onChange={(e) => set('pesoGramos', e.target.value)}
            />
            <Input
              label="Talla / Alzada (cm)"
              type="number"
              step="0.5"
              placeholder="ej: 56.5"
              value={form.tallaCm}
              onChange={(e) => set('tallaCm', e.target.value)}
            />
            <Input
              label="Longitud Espuela (mm)"
              type="number"
              step="0.5"
              placeholder="ej: 54.0"
              value={form.longitudEspuelaMm}
              onChange={(e) => set('longitudEspuelaMm', e.target.value)}
            />
          </div>

          {/* Asignación de Pedigree Directo */}
          <div className="p-4 rounded-2xl bg-dark-surface/40 border border-dark-border/80 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-primary-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                Progenitores de Crianza (Árbol Genealógico)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-sky-400 font-bold block mb-1.5">
                  Padre Semental (♂)
                </label>
                <select
                  className="input bg-dark-bg"
                  value={form.padreId}
                  onChange={(e) => set('padreId', e.target.value)}
                >
                  <option value="">Sin padre registrado</option>
                  {gallos.map((g) => (
                    <option key={g.id} value={g.id}>
                      #{g.id} &bull; {g.nombre} ({g.lineaGenetica || 'Sweater'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-rose-400 font-bold block mb-1.5">
                  Madre Matriz (♀)
                </label>
                <select
                  className="input bg-dark-bg"
                  value={form.madreId}
                  onChange={(e) => set('madreId', e.target.value)}
                >
                  <option value="">Sin madre registrada</option>
                  {gallinas.map((g) => (
                    <option key={g.id} value={g.id}>
                      #{g.id} &bull; {g.nombre} ({g.lineaGenetica || 'Kelso'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
              Observaciones &bull; Notas de Crianza
            </label>
            <textarea
              className="input bg-dark-bg min-h-[70px]"
              placeholder="Comentarios adicionales sobre el temperamento, desarrollo del plumaje o fondo del ejemplar..."
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!form.id || !form.nombre}
            >
              Registrar Ejemplar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaAvePage;
