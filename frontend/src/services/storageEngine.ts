import QRCode from 'qrcode';
import type { Ave, Pelea, SaludRegistro, NodoArbol, Tenant, Usuario, FiltrosAves, ResultadoPelea } from '../types';
import { INITIAL_AVES, INITIAL_PELEAS, INITIAL_SALUD, INITIAL_TENANT, INITIAL_USER } from './mockData';

const STORAGE_KEYS = {
  AVES: 'gallero_pro_aves_v2',
  PELEAS: 'gallero_pro_peleas_v2',
  SALUD: 'gallero_pro_salud_v2',
  TENANT: 'gallero_pro_tenant_v2',
  USER: 'gallero_pro_user_v2',
  OFFLINE_MODE: 'gallero_pro_offline_mode',
};

class StorageEngine {
  private aves: Ave[] = [];
  private peleas: Pelea[] = [];
  private salud: SaludRegistro[] = [];
  private tenant: Tenant = INITIAL_TENANT;
  private user: Usuario = INITIAL_USER;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedAves = localStorage.getItem(STORAGE_KEYS.AVES);
      const storedPeleas = localStorage.getItem(STORAGE_KEYS.PELEAS);
      const storedSalud = localStorage.getItem(STORAGE_KEYS.SALUD);
      const storedTenant = localStorage.getItem(STORAGE_KEYS.TENANT);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      this.aves = storedAves ? JSON.parse(storedAves) : INITIAL_AVES;
      this.peleas = storedPeleas ? JSON.parse(storedPeleas) : INITIAL_PELEAS;
      this.salud = storedSalud ? JSON.parse(storedSalud) : INITIAL_SALUD;
      this.tenant = storedTenant ? JSON.parse(storedTenant) : INITIAL_TENANT;
      this.user = storedUser ? JSON.parse(storedUser) : INITIAL_USER;

      if (!storedAves) this.persistAves();
      if (!storedPeleas) this.persistPeleas();
      if (!storedSalud) this.persistSalud();
      if (!storedTenant) this.persistTenant();
      if (!storedUser) this.persistUser();
    } catch {
      this.aves = [...INITIAL_AVES];
      this.peleas = [...INITIAL_PELEAS];
      this.salud = [...INITIAL_SALUD];
      this.tenant = { ...INITIAL_TENANT };
      this.user = { ...INITIAL_USER };
    }
  }

  private persistAves() {
    localStorage.setItem(STORAGE_KEYS.AVES, JSON.stringify(this.aves));
  }

  private persistPeleas() {
    localStorage.setItem(STORAGE_KEYS.PELEAS, JSON.stringify(this.peleas));
  }

  private persistSalud() {
    localStorage.setItem(STORAGE_KEYS.SALUD, JSON.stringify(this.salud));
  }

  private persistTenant() {
    localStorage.setItem(STORAGE_KEYS.TENANT, JSON.stringify(this.tenant));
  }

  private persistUser() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
  }

  public resetToDefault() {
    this.aves = [...INITIAL_AVES];
    this.peleas = [...INITIAL_PELEAS];
    this.salud = [...INITIAL_SALUD];
    this.tenant = { ...INITIAL_TENANT };
    this.user = { ...INITIAL_USER };
    this.persistAves();
    this.persistPeleas();
    this.persistSalud();
    this.persistTenant();
    this.persistUser();
  }

  // --- AUTH & TENANT ---
  public getTenant(): Tenant {
    return this.tenant;
  }

  public getUser(): Usuario {
    return this.user;
  }

  // --- AVES ---
  public getAves(filters?: FiltrosAves): Ave[] {
    let result = [...this.aves];
    if (filters?.tipo && filters.tipo !== ('TODOS' as any)) {
      result = result.filter((a) => a.tipo === filters.tipo);
    }
    if (filters?.estado && filters.estado !== ('TODOS' as any)) {
      result = result.filter((a) => a.estado === filters.estado);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.nombre.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.lineaGenetica && a.lineaGenetica.toLowerCase().includes(q)) ||
          (a.colorPlumaje && a.colorPlumaje.toLowerCase().includes(q)),
      );
    }
    return result;
  }

  public getAve(id: string): Ave | undefined {
    return this.aves.find((a) => a.id === id);
  }

  public createAve(data: Partial<Ave>): Ave {
    const padId = data.id || String(this.aves.length + 1).padStart(3, '0');
    const existing = this.aves.find((a) => a.id === padId);
    if (existing) {
      throw new Error(`Ya existe un ave con el ID ${padId}`);
    }

    const padre = data.padreId ? this.getAve(data.padreId) : undefined;
    const madre = data.madreId ? this.getAve(data.madreId) : undefined;

    const baseSgt = data.sgtScore || Number((8.8 + Math.random() * 1.0).toFixed(2));
    const calculatedCoi = this.calculateCoiForParents(data.padreId, data.madreId);

    const newAve: Ave = {
      id: padId,
      nombre: data.nombre || `Ave #${padId}`,
      tipo: data.tipo || 'GALLO',
      fechaNacimiento: data.fechaNacimiento || new Date().toISOString().split('T')[0],
      origen: data.origen || 'PROPIO',
      lineaGenetica: data.lineaGenetica || (padre?.lineaGenetica ? `${padre.lineaGenetica} Línea` : 'Casta de Cría'),
      colorPlumaje: data.colorPlumaje || 'Colorado Giro',
      tipoCresta: data.tipoCresta || 'Pava',
      colorPatas: data.colorPatas || 'Amarillas',
      pesoGramos: data.pesoGramos || 2150,
      tallaCm: data.tallaCm || 55.0,
      longitudEspuelaMm: data.longitudEspuelaMm || 50.0,
      padreId: data.padreId,
      madreId: data.madreId,
      padreNombre: padre?.nombre,
      madreNombre: madre?.nombre,
      estado: data.estado || 'ACTIVO',
      fotoUrl: data.fotoUrl || (data.tipo === 'GALLO'
        ? 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?auto=format&fit=crop&w=600&q=80'),
      qrCode: `GP-${this.tenant.slug}-${padId}`,
      sgtScore: baseSgt,
      coi: calculatedCoi,
      notas: data.notas || '',
      victorias: 0,
      derrotas: 0,
      empates: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.aves.unshift(newAve);
    this.persistAves();
    return newAve;
  }

  public updateAve(id: string, updates: Partial<Ave>): Ave {
    const idx = this.aves.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Ave no encontrada');

    this.aves[idx] = {
      ...this.aves[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persistAves();
    return this.aves[idx];
  }

  // --- PELEAS ---
  public getPeleas(galloId?: string): Pelea[] {
    if (galloId) {
      return this.peleas.filter((p) => p.galloId === galloId);
    }
    return this.peleas;
  }

  public createPelea(data: Partial<Pelea>): Pelea {
    const gallo = this.getAve(data.galloId || '');
    if (!gallo) throw new Error('Gallo no seleccionado');

    const newPelea: Pelea = {
      id: `pel-${Date.now().toString(36)}`,
      galloId: gallo.id,
      galloNombre: gallo.nombre,
      eventoNombre: data.eventoNombre || 'Derby de Palenque Oficial',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      lugar: data.lugar || 'Palenque Central',
      pesoGramos: data.pesoGramos || gallo.pesoGramos || 2150,
      rivalNombre: data.rivalNombre || 'Rival de Palenque',
      rivalCriadero: data.rivalCriadero || 'Criadero Rival',
      resultado: data.resultado as ResultadoPelea,
      duracionMinutos: data.duracionMinutos || 5,
      lesiones: data.lesiones || 'Sin lesiones',
      notas: data.notas || '',
      createdAt: new Date().toISOString(),
    };

    this.peleas.unshift(newPelea);
    this.persistPeleas();

    // Actualizar estadísticas del gallo
    const victorias = (gallo.victorias || 0) + (newPelea.resultado === 'VICTORIA' ? 1 : 0);
    const derrotas = (gallo.derrotas || 0) + (newPelea.resultado === 'DERROTA' || newPelea.resultado === 'MUERTE' ? 1 : 0);
    const empates = (gallo.empates || 0) + (newPelea.resultado === 'EMPATE' ? 1 : 0);
    const estado = newPelea.resultado === 'MUERTE' ? 'MUERTO' : gallo.estado;

    this.updateAve(gallo.id, { victorias, derrotas, empates, estado });

    return newPelea;
  }

  // --- SALUD ---
  public getSalud(): SaludRegistro[] {
    return this.salud;
  }

  public getSaludProximos(dias: number = 7): SaludRegistro[] {
    return this.salud.filter((s) => !s.completado);
  }

  public marcarSaludCompletado(id: string): SaludRegistro {
    const item = this.salud.find((s) => s.id === id);
    if (!item) throw new Error('Registro sanitario no encontrado');
    item.completado = true;
    item.diasRestantes = 0;
    this.persistSalud();
    return item;
  }

  public addSaludRegistro(data: Partial<SaludRegistro>): SaludRegistro {
    const newReg: SaludRegistro = {
      id: `sal-${Date.now().toString(36)}`,
      aveId: data.aveId,
      aveNombre: data.aveNombre || 'Criadero General',
      tipo: data.tipo || 'VACUNA',
      nombre: data.nombre || 'Tratamiento Sanitario',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      fechaProxima: data.fechaProxima,
      dosis: data.dosis,
      veterinario: data.veterinario || 'Dr. Roberto Méndez (MVZ)',
      observaciones: data.observaciones,
      completado: false,
      diasRestantes: 7,
    };
    this.salud.unshift(newReg);
    this.persistSalud();
    return newReg;
  }

  // --- PEDIGREE & COI ---
  public getArbolGenealogico(id: string, depth: number = 3): NodoArbol | null {
    const ave = this.getAve(id);
    if (!ave) return null;

    const buildNode = (currId?: string, currentDepth: number = 0): NodoArbol | undefined => {
      if (!currId || currentDepth > depth) return undefined;
      const a = this.getAve(currId);
      if (!a) return undefined;

      return {
        id: a.id,
        nombre: a.nombre,
        tipo: a.tipo,
        lineaGenetica: a.lineaGenetica,
        sgtScore: a.sgtScore,
        padre: buildNode(a.padreId, currentDepth + 1),
        madre: buildNode(a.madreId, currentDepth + 1),
      };
    };

    return buildNode(id, 0) || null;
  }

  public calcularCOI(id: string): { coi: number; ancestrosComunes: number; nivel: string } {
    const ave = this.getAve(id);
    if (!ave) return { coi: 0, ancestrosComunes: 0, nivel: 'Bajo' };

    const coi = ave.coi != null ? ave.coi : 3.15;
    let nivel = 'Línea Abierta (Óptimo)';
    if (coi >= 12.5) nivel = 'Consanguinidad Estrecha (Alerta)';
    else if (coi >= 6.25) nivel = 'Fijación de Casta Moderada';

    return {
      coi,
      ancestrosComunes: coi > 0 ? (coi > 8 ? 4 : 2) : 0,
      nivel,
    };
  }

  private calculateCoiForParents(padreId?: string, madreId?: string): number {
    if (!padreId || !madreId) return 0;
    if (padreId === madreId) return 25.0; // Imposible en aves pero matemáticamente hermano completo
    const padre = this.getAve(padreId);
    const madre = this.getAve(madreId);
    if (!padre || !madre) return 0;

    // Si comparten padre o madre (medio hermanos)
    if (padre.padreId && (padre.padreId === madre.padreId || padre.padreId === madre.madreId)) {
      return 12.5;
    }
    if (padre.madreId && (padre.madreId === madre.padreId || padre.madreId === madre.madreId)) {
      return 12.5;
    }
    return Number((1.5 + Math.random() * 3.5).toFixed(2));
  }

  // --- SIMULADOR DE CRUCES GENÉTICOS ---
  public simularCruce(padreId: string, madreId: string) {
    const padre = this.getAve(padreId);
    const madre = this.getAve(madreId);
    if (!padre || !madre) throw new Error('Padre o madre no encontrados');

    const padreSgt = padre.sgtScore || 9.0;
    const madreSgt = madre.sgtScore || 9.0;
    const projectedSgt = Number(((padreSgt * 0.55 + madreSgt * 0.45) + (Math.random() * 0.3 - 0.1)).toFixed(2));
    const projectedCoi = this.calculateCoiForParents(padreId, madreId);

    const lineagePadre = (padre.lineaGenetica || 'Sweater').split('/')[0].trim();
    const lineageMadre = (madre.lineaGenetica || 'Kelso').split('/')[0].trim();
    const hybridName = lineagePadre === lineageMadre ? `${lineagePadre} F2 Puro` : `${lineagePadre} x ${lineageMadre}`;

    let healthEvaluation = 'Vigor híbrido excelente. Gran resistencia a enfermedades y conformación ósea óptima.';
    if (projectedCoi > 12.5) {
      healthEvaluation = 'Consanguinidad muy alta. Riesgo de disminución en fertilidad y tamaño de espuela.';
    } else if (projectedCoi > 6.0) {
      healthEvaluation = 'Consanguinidad controlada. Ideal para fijar virtudes de casta y estilo de combate.';
    }

    return {
      padre,
      madre,
      projectedSgt: Math.min(10.0, projectedSgt),
      projectedCoi,
      projectedLineage: hybridName,
      healthEvaluation,
      traits: [
        { label: 'Velocidad de Tiro', value: 'Alta (9.5/10)' },
        { label: 'Estructura de Espuela', value: 'Curvada hacia adentro (52mm media)' },
        { label: 'Fondo y Resistencia', value: 'Sobresaliente (>8 min)' },
        { label: 'Fijación de Plumaje', value: 'Dominante Colorado / Giro' },
      ],
    };
  }

  // --- SGT & MATCHMAKING ---
  public recalcularTodosSgt(): Ave[] {
    this.aves = this.aves.map((a) => {
      const v = a.victorias || 0;
      const d = a.derrotas || 0;
      const total = v + d;
      const winRateRatio = total > 0 ? v / total : 0.75;
      const performanceScore = winRateRatio * 10;
      const lineageScore = a.padreId && a.madreId ? 9.8 : 9.0;
      const physicalScore = a.pesoGramos && a.pesoGramos >= 2000 && a.pesoGramos <= 2250 ? 9.7 : 8.8;
      const temperScore = 9.4;
      const healthScore = 9.5;

      const newScore = Number(
        (
          lineageScore * 0.3 +
          performanceScore * 0.25 +
          physicalScore * 0.25 +
          temperScore * 0.1 +
          healthScore * 0.1
        ).toFixed(2),
      );

      return {
        ...a,
        sgtScore: Math.min(10.0, Math.max(7.0, newScore)),
      };
    });

    this.persistAves();
    return this.aves;
  }

  public getRecomendacionesCombate(pesoEventoGramos: number, fechaEvento: string) {
    const tolerancia = 60; // +/- 60g de tolerancia
    const minPeso = pesoEventoGramos - tolerancia;
    const maxPeso = pesoEventoGramos + tolerancia;

    const gallos = this.aves.filter((a) => a.tipo === 'GALLO' && a.estado === 'ACTIVO');

    return gallos
      .filter((g) => {
        const peso = g.pesoGramos || 2150;
        return peso >= minPeso && peso <= maxPeso;
      })
      .map((g) => {
        // Encontrar última pelea
        const peleasAve = this.peleas.filter((p) => p.galloId === g.id);
        const diasDescanso = peleasAve.length > 0 ? 35 : 60;
        const semanasDescanso = Math.round(diasDescanso / 7);

        return {
          id: g.id,
          nombre: g.nombre,
          peso_gramos: g.pesoGramos,
          linea_genetica: g.lineaGenetica,
          sgt_score: String(g.sgtScore || 9.0),
          listo_para_pelea: diasDescanso >= 21,
          semanas_descanso: semanasDescanso,
          victorias: g.victorias,
          derrotas: g.derrotas,
        };
      })
      .sort((a, b) => parseFloat(b.sgt_score) - parseFloat(a.sgt_score));
  }

  // --- CERTIFICADOS ---
  public async generarCertificado(aveId: string) {
    const ave = this.getAve(aveId);
    if (!ave) throw new Error('Ave no encontrada');

    const codigo = `GP-CERT-${this.tenant.slug.toUpperCase()}-${ave.id}-${Date.now().toString(36).toUpperCase()}`;
    const urlVerificacion = `https://galleropro.com/verificar/${codigo}`;
    const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
      width: 250,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });

    return {
      id: `cert-${Date.now().toString(36)}`,
      aveId: ave.id,
      aveNombre: ave.nombre,
      codigo,
      qrDataUrl,
      urlVerificacion,
      emitidoAt: new Date().toISOString(),
      vigente: true,
      tenantNombre: this.tenant.nombre,
      criador: this.user.nombre,
    };
  }
}

export const storageEngine = new StorageEngine();
