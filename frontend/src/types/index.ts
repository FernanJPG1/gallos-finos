// ============================================================
// GALLERO PRO - Tipos TypeScript globales
// ============================================================

export type TipoAve = 'GALLO' | 'GALLINA';
export type EstadoAve = 'ACTIVO' | 'RETIRADO' | 'MUERTO' | 'VENDIDO' | 'DESCARTE';
export type ResultadoPelea = 'VICTORIA' | 'DERROTA' | 'EMPATE' | 'MUERTE';
export type TipoSalud = 'VACUNA' | 'MEDICAMENTO' | 'REVISION' | 'TRATAMIENTO' | 'DESPARASITACION';
export type RolUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'ASISTENTE' | 'VETERINARIO';
export type PlanTenant = 'FREE' | 'PRO' | 'ELITE';

export interface Ave {
  id: string;
  nombre: string;
  tipo: TipoAve;
  fechaNacimiento?: string;
  origen: string;
  lineaGenetica?: string;
  colorPlumaje?: string;
  tipoCresta?: string;
  colorPatas?: string;
  pesoGramos?: number;
  tallaCm?: number;
  longitudEspuelaMm?: number;
  padreId?: string;
  madreId?: string;
  padreNombre?: string;
  madreNombre?: string;
  estado: EstadoAve;
  fotoUrl?: string;
  qrCode?: string;
  sgtScore?: number;
  coi?: number;
  notas?: string;
  victorias?: number;
  derrotas?: number;
  empates?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pelea {
  id: string;
  galloId: string;
  galloNombre?: string;
  eventoNombre?: string;
  fecha: string;
  lugar?: string;
  pesoGramos?: number;
  rivalNombre?: string;
  rivalCriadero?: string;
  resultado: ResultadoPelea;
  duracionMinutos?: number;
  lesiones?: string;
  notas?: string;
  createdAt: string;
}

export interface SaludRegistro {
  id: string;
  aveId?: string;
  aveNombre?: string;
  tipo: TipoSalud;
  nombre: string;
  fecha: string;
  fechaProxima?: string;
  dosis?: string;
  veterinario?: string;
  observaciones?: string;
  completado: boolean;
  diasRestantes?: number;
  diasVencido?: number;
}

export interface SgtResult {
  aveId: string;
  sgt: number;
  d1Linaje: number;
  d2Rendimiento: number;
  d3Fisico: number;
  d4Temperamento: number;
  d5Salud: number;
  breakdown?: {
    d1Detalle: Record<string, number>;
    d2Detalle: Record<string, number>;
    d3Detalle: Record<string, number>;
    d4Detalle: Record<string, number>;
    d5Detalle: Record<string, number>;
  };
}

export interface NodoArbol {
  id: string;
  nombre: string;
  tipo: TipoAve;
  lineaGenetica?: string;
  sgtScore?: number;
  padre?: NodoArbol;
  madre?: NodoArbol;
}

export interface Certificado {
  id: string;
  aveId: string;
  aveNombre?: string;
  codigo: string;
  tipo: string;
  emitidoAt: string;
  pdfUrl?: string;
  urlVerificacion?: string;
  vigente: boolean;
}

export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  plan: PlanTenant;
  maxAves: number;
  logoUrl?: string;
  pais?: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  role: RolUsuario;
}

export interface AuthState {
  user: Usuario | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Filtros de listado
export interface FiltrosAves {
  tipo?: TipoAve;
  estado?: EstadoAve;
  search?: string;
}

export interface FiltrosPeleas {
  galloId?: string;
  resultado?: ResultadoPelea;
  fechaDesde?: string;
}
