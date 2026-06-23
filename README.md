# Dashboard Suite

Portafolio de dashboards administrativos open source. Catalogo y documentacion de proyectos full-stack independientes, construidos con tecnologias modernas y listos para produccion.

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

El sitio web principal (este proyecto) esta construido con [Astro](https://astro.build) y funciona como una vitrina que presenta, documenta y enlaza a cada uno de los proyectos de dashboard que viven en `templates/`.

## Tabla de Contenidos

- [Dashboard Suite](#dashboard-suite)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Features](#features)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Comandos](#comandos)
  - [Sistema de Diseno](#sistema-de-diseno)
  - [Dashboards](#dashboards)
  - [Stack Tecnologico](#stack-tecnologico)
  - [Contribuir](#contribuir)
  - [Licencia](#licencia)

## Features

- **Catalogo de 12 dashboards** con filtros por categoria (Analytics, CRM, ERP, Finanzas, SaaS, etc.)
- **Pagina de detalle** para cada dashboard con stack, features y enlaces
- **Diseno Dark Navy** con sistema de variables CSS propio (sin Tailwind)
- **Animaciones scroll-reveal** con IntersectionObserver
- **Totalmente estatico** — generado con Astro SSG, sin dependencias runtime de JS
- **Open source por diseno** — cada proyecto es publico y modificable

## Estructura del Proyecto

```text
/
├── public/                          # Assets estaticos (favicons)
├── src/
│   ├── assets/                      # SVGs decorativos e iconos
│   ├── components/                  # Componentes compartidos
│   │   ├── Footer.astro
│   │   └── Navigation.astro
│   ├── data/
│   │   └── dashboards.js            # Fuente de datos unica (12 dashboards)
│   ├── layouts/
│   │   └── Layout.astro             # Layout base con tipografia y scroll-reveal
│   ├── pages/
│   │   ├── index.astro              # Landing page principal
│   │   └── dashboard/
│   │       └── [slug].astro         # Pagina dinamica por dashboard (SSG)
│   ├── sections/                    # Secciones de la landing page
│   │   ├── Hero.astro
│   │   ├── Stats.astro
│   │   ├── Dashboards.astro
│   │   ├── Stack.astro
│   │   ├── OpenSource.astro
│   │   └── Contacto.astro
│   └── styles/
│       └── global.css               # Sistema de diseno (variables CSS, componentes)
├── templates/                       # Proyectos de dashboard independientes
│   ├── 01-stock-system/             # React + Fastify — Sistema de inventario
│   ├── 02-famacy/                   # React 19 + Fastify 5 — Farmacia
│   ├── 03-crm/                      # React 19 + Fastify 5 — CRM
│   └── 04-pos-system/               # React + Fastify — Punto de venta
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Arquitectura

Este proyecto sigue un **patron de monorepo laxo**:

- El **sitio web principal** (Astro) es el hub que cataloga y describe los dashboards
- Cada **dashboard** vive en `templates/` como un proyecto completamente independiente con su propio `package.json`, backend y frontend
- Los dashboards se despliegan por separado — el portafolio solo los referencia y enlaza

## Comandos

Todos los comandos se ejecutan desde la raiz del proyecto:

| Comando | Accion |
|---------|--------|
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de produccion a `dist/` |
| `pnpm preview` | Vista previa del build local |
| `pnpm astro add` | Agrega una integracion de Astro |
| `pnpm astro check` | Type checking del proyecto |

## Sistema de Diseno

El diseno sigue una estetica **Dark Navy** con un sistema de variables CSS propio:

- **Paleta**: fondos oscuros (`#07111F`), acentos azules (`#2563EB`), texto en grises claros
- **Tipografia**: Space Grotesk (headings), Inter (body), JetBrains Mono (codigo)
- **Componentes**: botones, cards, tags, formularios, scrollbar personalizada
- **Responsive**: diseno adaptativo con media queries
- **Animaciones**: scroll reveal mediante IntersectionObserver (sin librerias externas)

## Dashboards

Los dashboards disponibles actualmente en `templates/`:

| Proyecto | Frontend | Backend | Stack |
|----------|----------|---------|-------|
| **Stock System** | React + Vite + TS | Fastify + Prisma | Sistema de inventario |
| **Farmacia** | React 19 + Vite + Zustand + Recharts | Fastify 5 + Prisma + JWT + Redis | Gestion farmaceutica |
| **IntegrityCRM** | React 19 + Vite + Zustand + Recharts | Fastify 5 + Prisma + JWT + Redis | CRM completo |
| **POS System** | React + Vite + shadcn/ui | Fastify + Prisma | Punto de venta |

Cada dashboard incluye su propia documentacion en `templates/<proyecto>/openspec/`.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Static Site Generator** | Astro 6 |
| **Lenguaje** | TypeScript (strict) |
| **Estilos** | CSS vanilla con variables CSS |
| **Tipografia** | Space Grotesk, Inter, JetBrains Mono |
| **Package Manager** | pnpm |

**Stack de los dashboards**: React 19, Fastify 5, Prisma, PostgreSQL, Redis, Zustand, Recharts, shadcn/ui, JWT, Zod.

## Contribuir

Este es un proyecto personal en etapa activa de desarrollo. Si te interesa contribuir:

1. Hace un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Hace commit de tus cambios (`git commit -m 'feat: agrego nueva feature'`)
4. Hace push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## Licencia

**Open Source** — todos los proyectos en este repositorio son 100% open source. Construido para que cualquiera pueda estudiar, modificar y escalar el codigo.