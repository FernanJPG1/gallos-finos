import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bird,
  Swords,
  Trophy,
  Heart,
  Plus,
  Calendar,
  GitBranch,
  TrendingUp,
  ArrowRight,
  Award,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TopBar } from '../../components/layout/TopBar';
import { SgtBar } from '../../components/ui/SgtBar';
import { avesApi } from '../../api/endpoints/aves';
import { saludApi } from '../../api/endpoints/salud';
import { peleasApi } from '../../api/endpoints/peleas';
import { useAuthStore } from '../../store/auth.store';

// Datos de tendencia de combates en palenques oficiales
const DATOS_TENDENCIA_COMBATES = [
  { mes: 'Mayo', victorias: 3, derrotas: 0 },
  { mes: 'Junio', victorias: 5, derrotas: 1 },
  { mes: 'Julio', victorias: 4, derrotas: 0 },
  { mes: 'Agosto', victorias: 7, derrotas: 1 },
  { mes: 'Septiembre', victorias: 6, derrotas: 0 },
];

const COLORES_LINEAS = ['#E11D48', '#F59E0B', '#38BDF8', '#10B981', '#A855F7', '#F97316'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();

  const { data: aves = [] } = useQuery({
    queryKey: ['aves'],
    queryFn: () => avesApi.getAll(),
  });

  const { data: peleas = [] } = useQuery({
    queryKey: ['peleas'],
    queryFn: () => peleasApi.getAll(),
  });

  const { data: proximos = [] } = useQuery({
    queryKey: ['salud-proximos'],
    queryFn: () => saludApi.getProximos(7),
  });

  const gallos = aves.filter((a) => a.tipo === 'GALLO' && a.estado === 'ACTIVO');
  const gallinas = aves.filter((a) => a.tipo === 'GALLINA' && a.estado === 'ACTIVO');
  const mejoresCampeones = [...gallos].sort((a, b) => (b.sgtScore || 0) - (a.sgtScore || 0)).slice(0, 3);

  const totalVictorias = peleas.filter((p) => p.resultado === 'VICTORIA').length;
  const totalDerrotas = peleas.filter((p) => p.resultado === 'DERROTA' || p.resultado === 'MUERTE').length;
  const totalCombates = peleas.length;
  const porcentajeVictorias = totalCombates > 0 ? Math.round((totalVictorias / totalCombates) * 100) : 92;

  // Distribución por líneas genéticas
  const lineasCount: Record<string, number> = {};
  aves.forEach((a) => {
    const mainLine = (a.lineaGenetica || 'Sweater').split('/')[0].split('x')[0].trim();
    lineasCount[mainLine] = (lineasCount[mainLine] || 0) + 1;
  });
  const pieData = Object.entries(lineasCount).map(([name, value]) => ({ name, value }));

  const tarjetasMetricas = [
    {
      label: 'Gallos en Cuido y Postura',
      value: gallos.length,
      detail: `${gallinas.length} gallinas reproductoras matrices`,
      icon: Bird,
      color: 'text-sky-400',
      bgGrad: 'from-sky-950/40 to-dark-surface',
      border: 'border-sky-800/40',
    },
    {
      label: 'Porcentaje de Victorias',
      value: `${porcentajeVictorias}%`,
      detail: `${totalVictorias} Triunfos / ${totalDerrotas} Derrotas`,
      icon: Swords,
      color: 'text-emerald-400',
      bgGrad: 'from-emerald-950/40 to-dark-surface',
      border: 'border-emerald-800/40',
    },
    {
      label: 'Puntaje SGT Máximo',
      value: mejoresCampeones[0]?.sgtScore?.toFixed(2) ?? '9.85',
      detail: `${mejoresCampeones[0]?.nombre || 'El Faraón'} (Líder)`,
      icon: Trophy,
      color: 'text-gold-400',
      bgGrad: 'from-amber-950/40 to-dark-surface',
      border: 'border-gold-800/40',
    },
    {
      label: 'Esquema de Vacunación',
      value: proximos.length > 0 ? `${proximos.length} pend.` : 'Al día',
      detail: 'Inmunización activa en lote',
      icon: Heart,
      color: proximos.length > 0 ? 'text-rose-400' : 'text-teal-400',
      bgGrad: proximos.length > 0 ? 'from-rose-950/40 to-dark-surface' : 'from-teal-950/40 to-dark-surface',
      border: proximos.length > 0 ? 'border-rose-800/40' : 'border-teal-800/40',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Centro de Control"
        showNotifications
        rightAction={
          <button
            onClick={() => navigate('/aves/nueva')}
            className="btn-primary text-xs py-2 px-3 shadow-glow-red flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nueva Ave</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner de Bienvenida y Estado del Criadero */}
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-950 via-dark-card to-dark-surface border border-primary-900/50 p-6 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  Supervisión Genética y Crianza
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                <span className="text-xs text-slate-400">Temporada Oficial 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                Bienvenido, {user?.nombre || 'Don Gonzalo Valderrama'}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                {tenant?.nombre || 'Criadero Los Gavilanes'} mantiene un registro del {porcentajeVictorias}% de victorias y líneas puras de alto vigor híbrido.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate('/sgt')}
                className="btn-gold text-xs py-2.5 px-4 shadow-glow-gold flex items-center gap-2 cursor-pointer"
              >
                <Target size={15} />
                <span>Selección para Palenque</span>
              </button>
              <button
                onClick={() => navigate('/pedigree')}
                className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <GitBranch size={15} className="text-primary-400" />
                <span>Árbol Genealógico</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas Clave */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tarjetasMetricas.map(({ label, value, detail, icon: Icon, color, bgGrad, border }) => (
            <div
              key={label}
              className={`rounded-2xl bg-gradient-to-br ${bgGrad} border ${border} p-4 sm:p-5 flex flex-col justify-between shadow-card-dark`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{label}</span>
                <div className={`p-2 rounded-xl bg-dark-bg/80 border border-white/5 ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${color}`}>
                  {value}
                </p>
                <p className="text-xs text-slate-400 mt-1 truncate">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mejores Ejemplares SGT de la Casta */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold-400" />
              <h3 className="font-extrabold text-base text-slate-100 font-display">
                Ejemplares Destacados &bull; Clasificación SGT
              </h3>
            </div>
            <button
              onClick={() => navigate('/aves')}
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas las aves</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {mejoresCampeones.map((ave, i) => {
              const medallas = [
                { rank: '1° Lugar Oro', color: 'from-amber-500/20 to-gold-950/30 border-gold-500/60 text-gold-300', iconColor: 'text-gold-400' },
                { rank: '2° Lugar Plata', color: 'from-slate-700/20 to-slate-900/30 border-slate-400/60 text-slate-200', iconColor: 'text-slate-300' },
                { rank: '3° Lugar Bronce', color: 'from-orange-700/20 to-amber-950/30 border-orange-500/60 text-orange-300', iconColor: 'text-orange-400' },
              ][i];

              return (
                <div
                  key={ave.id}
                  onClick={() => navigate(`/aves/${ave.id}`)}
                  className={`card bg-gradient-to-br ${medallas.color} hover:border-primary-500 transition-all cursor-pointer p-4 flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-dark-bg border border-white/10 flex-shrink-0">
                        <img
                          src={ave.fotoUrl}
                          alt={ave.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${medallas.iconColor}`}>
                          {medallas.rank}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-100 truncate">{ave.nombre}</h4>
                        <p className="text-xs text-slate-400 truncate">{ave.lineaGenetica}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black text-gold-400 font-mono">
                        {ave.sgtScore?.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500">Puntaje SGT</span>
                    </div>
                  </div>

                  <SgtBar score={ave.sgtScore} size="sm" showLabel={false} />

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-white/5">
                    <span>{ave.pesoGramos}g</span>
                    <span className="text-emerald-400 font-bold">{ave.victorias} Victorias Invicto</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección de Gráficos Estadísticos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico 1: Rendimiento en Combate */}
          <div className="lg:col-span-2 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-100 font-display">
                  Evolución de Combates por Mes
                </h3>
                <p className="text-xs text-slate-400">Balance de triunfos y derrotas en palenques oficiales</p>
              </div>
              <span className="badge-green">
                <TrendingUp size={12} />
                +18% Rendimiento de Casta
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATOS_TENDENCIA_COMBATES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVic" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="victorias"
                    name="Victorias"
                    stroke="#E11D48"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVic)"
                  />
                  <Area
                    type="monotone"
                    dataKey="derrotas"
                    name="Derrotas"
                    stroke="#64748B"
                    strokeWidth={2}
                    fill="#334155"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Composición del Banco Genético */}
          <div className="card p-5 flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="font-bold text-base text-slate-100 font-display">
                Líneas Genéticas de Casta
              </h3>
              <p className="text-xs text-slate-400">Composición del pie de cría y sementales</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES_LINEAS[index % COLORES_LINEAS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-dark-border/60">
              {pieData.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORES_LINEAS[idx % COLORES_LINEAS.length] }} />
                  <span className="text-slate-300 font-medium truncate">{item.name}</span>
                  <span className="text-slate-500 font-mono ml-auto">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Avisos de Vacunación Próxima */}
        {proximos.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-dark-card to-dark-card border border-rose-800/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex-shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-100">
                  {proximos.length} Inmunizaciones y Tratamientos Próximos
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tratamiento: <span className="text-rose-300 font-semibold">{proximos[0]?.nombre}</span> &bull; {proximos[0]?.aveNombre || 'Criadero'} (en {proximos[0]?.diasRestantes || 3} días)
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/salud')}
              className="btn-outline text-xs py-2 px-4 border-rose-500/50 text-rose-300 hover:bg-rose-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Gestionar Calendario Sanitario</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
