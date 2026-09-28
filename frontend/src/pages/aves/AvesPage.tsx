import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  GitBranch,
  Award,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { AveCard } from '../../components/aves/AveCard';
import { EstadoBadge } from '../../components/ui/Badge';
import { avesApi } from '../../api/endpoints/aves';

const FILTROS_TIPO = [
  { id: 'TODOS', label: 'Todas las Aves' },
  { id: 'GALLO', label: '♂ Gallos de Casta' },
  { id: 'GALLINA', label: '♀ Gallinas Matrices' },
];

const FILTROS_ESTADO = [
  { id: 'TODOS', label: 'Todos los Estados' },
  { id: 'ACTIVO', label: 'Activos en Cuido' },
  { id: 'RETIRADO', label: 'Sementales Retirados' },
];

const AvesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<string>('TODOS');
  const [estado, setEstado] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { data: aves = [], isLoading } = useQuery({
    queryKey: ['aves', tipo, estado, search],
    queryFn: () =>
      avesApi.getAll({
        tipo: tipo !== 'TODOS' ? (tipo as any) : undefined,
        estado: estado !== 'TODOS' ? (estado as any) : undefined,
        search: search || undefined,
      }),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title="Inventario de Aves &amp; Linajes"
        rightAction={
          <button
            onClick={() => navigate('/aves/nueva')}
            className="btn-primary text-xs py-2 px-3 shadow-glow-red flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva Ave</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        {/* Controles: Buscador, Filtros y Vista */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa, nombre, línea genética o plumaje..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 bg-dark-card/90"
            />
          </div>

          {/* Selector de Vista: Tarjetas / Tabla */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-primary-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista en Tarjetas de Cuadrícula"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-primary-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista en Tabla de Datos Zootécnicos"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros de Selección */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {FILTROS_TIPO.map((f) => (
            <button
              key={f.id}
              onClick={() => setTipo(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                tipo === f.id
                  ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-glow-red'
                  : 'bg-dark-surface/80 border-dark-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="h-4 w-px bg-dark-border mx-1" />

          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.id}
              onClick={() => setEstado(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                estado === f.id
                  ? 'bg-slate-800 border-slate-500 text-slate-200 shadow-sm'
                  : 'bg-dark-surface/80 border-dark-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-400 font-mono">
            {isLoading ? 'Consultando...' : `${aves.length} ejemplar${aves.length !== 1 ? 'es' : ''}`}
          </span>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-dark-surface/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : aves.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-dark-surface flex items-center justify-center text-4xl">
              🐓
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">No se encontraron ejemplares</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No hay aves que coincidan con los filtros aplicados. Puedes registrar una nueva ave o limpiar la búsqueda.
              </p>
            </div>
            <Button onClick={() => navigate('/aves/nueva')} className="mt-2">
              <Plus size={16} />
              <span>Registrar Nueva Ave</span>
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* VISTA EN TARJETAS */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {aves.map((ave) => (
              <AveCard key={ave.id} ave={ave} />
            ))}
          </div>
        ) : (
          /* VISTA EN TABLA ZOOTÉCNICA */
          <div className="card overflow-x-auto p-0 border border-dark-border/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-surface/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-dark-border font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ejemplar</th>
                  <th className="py-3.5 px-3">Tipo &amp; Placa</th>
                  <th className="py-3.5 px-3">Línea de Casta</th>
                  <th className="py-3.5 px-3">Peso &amp; Espuela</th>
                  <th className="py-3.5 px-3 text-center">Puntaje SGT</th>
                  <th className="py-3.5 px-3 text-center">Combates (Vic / Der)</th>
                  <th className="py-3.5 px-3">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60">
                {aves.map((ave) => (
                  <tr
                    key={ave.id}
                    onClick={() => navigate(`/aves/${ave.id}`)}
                    className="hover:bg-dark-surface/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark-bg border border-white/5 flex-shrink-0">
                          <img
                            src={ave.fotoUrl}
                            alt={ave.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-100 hover:text-primary-400">
                            {ave.nombre}
                          </p>
                          <p className="text-[11px] text-slate-400">{ave.colorPlumaje || 'Sin plumaje'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-400">#{ave.id}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ave.tipo === 'GALLO' ? 'bg-sky-950 text-sky-300' : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {ave.tipo === 'GALLO' ? '♂ Gallo' : '♀ Gallina'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-300">
                      {ave.lineaGenetica || '—'}
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {ave.pesoGramos ? `${ave.pesoGramos}g` : '—'} &bull; {ave.longitudEspuelaMm ? `${ave.longitudEspuelaMm}mm` : '—'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-sm text-gold-400 font-mono">
                        {ave.sgtScore?.toFixed(2) ?? '—'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {ave.tipo === 'GALLO' ? (
                        <span className="font-medium">
                          <span className="text-emerald-400 font-bold">{ave.victorias || 0} Vic</span>
                          {' / '}
                          <span className="text-rose-400 font-bold">{ave.derrotas || 0} Der</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Matriz</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <EstadoBadge estado={ave.estado} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/aves/${ave.id}/pedigree`);
                          }}
                          className="p-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover text-slate-300 hover:text-white cursor-pointer"
                          title="Ver Árbol Genealógico"
                        >
                          <GitBranch size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/aves/${ave.id}/cert`);
                          }}
                          className="p-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover text-gold-400 hover:text-gold-300 cursor-pointer"
                          title="Ver Certificado de Casta"
                        >
                          <Award size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvesPage;
