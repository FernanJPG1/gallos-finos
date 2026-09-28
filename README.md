# GALLERO PRO 🐓

SaaS multi-tenant para gestión de criaderos de gallos de combate y gallinas finas de casta.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeORM + PostgreSQL 15 |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Cache / Queues | Redis + Bull |
| Storage | Cloudflare R2 |
| Pagos | Stripe + PayPal |
| Email | SendGrid |
| WhatsApp / SMS | Twilio |
| CI/CD | GitHub Actions |

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js 20+ (para desarrollo local sin Docker)
- Git

## Inicio rápido con Docker

```bash
# 1. Clonar / entrar al proyecto
cd gallero-pro

# 2. Crear archivo de entorno
cp .env.example .env
# Edita .env con tus valores si lo necesitas

# 3. Levantar todos los servicios
docker compose up -d

# 4. La app estará disponible en:
#    Frontend:  http://localhost:5173
#    Backend:   http://localhost:3000/api/v1
#    Swagger:   http://localhost:3000/api/docs
```

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del proyecto

```
gallero-pro/
├── backend/           # NestJS API
│   └── src/
│       ├── modules/   # Auth, Aves, SGT, Peleas, Salud, Pedigree, Certificados...
│       ├── common/    # Guards, Decorators, Filters
│       └── config/    # Configuración de servicios
└── frontend/          # React SPA/PWA
    └── src/
        ├── pages/     # Páginas de la aplicación
        ├── components/# Componentes reutilizables
        ├── api/       # Cliente HTTP + endpoints
        └── store/     # Estado global (Zustand)
```

## Planes de precios

| Plan | Aves | Precio |
|------|------|--------|
| FREE | 25 | Gratis |
| PRO | 200 | $19.90/mes |
| ELITE | Ilimitadas | $49.90/mes |

## Documentación

- Acta de Stakeholders: `docs/GALLERO_PRO_Acta_Stakeholders_R1.docx`
- Levantamiento de Información (LI-001): `docs/GALLERO_PRO_LI-001_Levantamiento_Informacion.docx`
- Diseño Técnico (DT-001): `docs/GALLERO_PRO_DT-001_Diseno_Tecnico.docx`
