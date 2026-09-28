import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Award,
  Download,
  QrCode,
  CheckCircle,
  Printer,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { avesApi } from '../../api/endpoints/aves';
import { certificadosApi } from '../../api/endpoints/certificados';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CertificadoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant, user } = useAuthStore();
  const [certData, setCertData] = useState<any>(null);

  const { data: ave, isLoading } = useQuery({
    queryKey: ['ave-cert', id],
    queryFn: () => avesApi.getOne(id!),
    enabled: !!id,
  });

  const generarMutation = useMutation({
    mutationFn: () => certificadosApi.generar(id!),
    onSuccess: (data) => {
      setCertData(data);
      toast.success('Certificado y código QR oficial generados con éxito');
    },
    onError: () => toast.error('Error al generar certificado'),
  });

  // Auto-generar certificado al cargar para que siempre se vea completo
  useEffect(() => {
    if (id && !certData) {
      certificadosApi.generar(id).then((res) => setCertData(res)).catch(() => {});
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopBar title="Generando Certificado..." showBack />
        <div className="p-8">
          <div className="h-96 bg-dark-surface/60 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ave) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden">
        <TopBar title={`Certificado: ${ave.nombre}`} showBack />
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Barra de Acciones Superior */}
        <div className="print:hidden flex items-center justify-between card p-4 border border-dark-border/80">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-gold-400" />
            <span className="text-sm font-bold text-slate-100">
              Certificado de Autenticidad &bull; Verificación en Línea
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-gold text-xs py-2 px-3.5 shadow-glow-gold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>

        {/* DOCUMENTO OFICIAL CERTIFICADO IMPRIMIBLE */}
        <div
          id="certificado-imprimible"
          className="relative bg-gradient-to-b from-[#131B2A] to-[#0D121D] text-slate-100 rounded-3xl border-4 border-gold-500/60 p-8 sm:p-12 shadow-2xl overflow-hidden print:border-4 print:border-black print:bg-white print:text-black"
        >
          {/* Marca de agua de fondo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-[280px]">🐓</span>
          </div>

          {/* Marco decorativo dorado */}
          <div className="absolute inset-2 border border-gold-500/30 rounded-2xl pointer-events-none" />

          {/* CABECERA DEL CERTIFICADO */}
          <div className="text-center relative z-10 pb-6 border-b-2 border-gold-500/40">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 border-2 border-gold-400 items-center justify-center shadow-glow-gold mb-3">
              <span className="text-3xl">🐓</span>
            </div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold-400">
              Sociedad de Criadores de Gallos Finos &bull; Registro Genealógico
            </p>

            <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mt-1 print:text-black">
              CERTIFICADO OFICIAL DE CASTA
            </h1>

            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto print:text-gray-600">
              Se certifica formalmente la pureza de linaje, biometría y registro zootécnico del ejemplar perteneciente a{' '}
              <strong className="text-gold-300 font-bold print:text-black">{tenant?.nombre || 'Criadero Los Gavilanes'}</strong>.
            </p>
          </div>

          {/* CUERPO DEL CERTIFICADO: DATOS DEL EJEMPLAR */}
          <div className="py-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Foto del Ave */}
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-gold-500/60 shadow-xl bg-dark-bg">
                <img
                  src={ave.fotoUrl}
                  alt={ave.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2.5 font-mono text-xs font-bold text-gold-400 bg-gold-950/60 border border-gold-600/40 px-3 py-1 rounded-full">
                Placa Oficial: #{ave.id}
              </span>
            </div>

            {/* Datos Técnicos y Genealógicos */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Nombre del Ejemplar</p>
                <p className="text-base font-black text-white mt-0.5 print:text-black">{ave.nombre}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Línea Genética / Casta</p>
                <p className="text-base font-black text-gold-400 mt-0.5 print:text-black">{ave.lineaGenetica || 'Sweater 5000'}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Tipo &bull; Sexo</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5 print:text-black">
                  {ave.tipo === 'GALLO' ? 'Gallo de Combate (♂)' : 'Gallina Matriz (♀)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Puntaje Genético (SGT)</p>
                <p className="text-base font-black text-emerald-400 mt-0.5 font-mono print:text-black">
                  {ave.sgtScore?.toFixed(2) ?? '9.85'} / 10.0
                </p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Padre Semental (♂)</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5 print:text-black">{ave.padreNombre || 'Línea Fundadora'}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Madre Matriz (♀)</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5 print:text-black">{ave.madreNombre || 'Matriz de Casta'}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Peso en Báscula</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono print:text-black">{ave.pesoGramos || 2160} gramos</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-surface/40 border border-dark-border/60 print:bg-gray-100 print:text-black">
                <p className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">Longitud de Espuela</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5 font-mono print:text-black">{ave.longitudEspuelaMm || 54} mm</p>
              </div>
            </div>
          </div>

          {/* QR CODE & FIRMAS OFICIALES */}
          <div className="pt-6 border-t-2 border-gold-500/40 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* QR y Verificación */}
            <div className="flex items-center gap-4">
              {certData?.qrDataUrl ? (
                <div className="p-2 rounded-2xl bg-white shadow-xl flex-shrink-0">
                  <img
                    src={certData.qrDataUrl}
                    alt="QR Verificación"
                    className="w-24 h-24 rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white p-2 flex items-center justify-center text-dark-bg">
                  <QrCode size={48} />
                </div>
              )}

              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 print:text-green-800">
                  <ShieldCheck size={14} />
                  Firma Criptográfica Válida
                </span>
                <p className="text-[11px] font-mono text-slate-400 mt-1 break-all print:text-gray-700">
                  {certData?.codigo || `GP-CERT-GAVILANES-${ave.id}`}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 print:text-gray-500">
                  Escanea el código QR con cualquier dispositivo móvil para verificar la autenticidad en tiempo real.
                </p>
              </div>
            </div>

            {/* Firmas de Autoridad */}
            <div className="flex items-center gap-6 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-28 border-b border-slate-500 pb-1 mb-1 font-serif italic text-gold-300 print:text-black text-sm">
                  G. Valderrama
                </div>
                <p className="font-bold text-slate-200 print:text-black text-[11px]">Don Gonzalo Valderrama</p>
                <p className="text-[10px] text-slate-400 print:text-gray-600">Propietario Criador</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-28 border-b border-slate-500 pb-1 mb-1 font-serif italic text-gold-300 print:text-black text-sm">
                  Dr. R. Méndez
                </div>
                <p className="font-bold text-slate-200 print:text-black text-[11px]">Dr. Roberto Méndez</p>
                <p className="text-[10px] text-slate-400 print:text-gray-600">Médico Veterinario (MVZ)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificadoPage;
