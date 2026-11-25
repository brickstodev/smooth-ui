# CLAUDE.md — Smooth UI

Librería de componentes Angular 22 con una app de demo. Publicada como `@bickstodev/smooth-ui`.

## Stack y estructura

- Angular 22.1, Nx 23.2, pnpm 12.3.4, TypeScript 6.0, Vitest 4, ng-packagr
- `libs/smooth-ui/` — librería publicable (entrada: `src/public-api.ts`)
- `apps/smooth-ui-demo/` — app que muestra todos los componentes
- Tema: custom properties de CSS en `libs/smooth-ui/theme/theme.scss`, que se alternan con `[data-theme]` en `<html>`

## Comandos

```sh
pnpm install --frozen-lockfile

# Orden de la CI (verificación completa)
pnpm nx format:check
pnpm nx run-many -t lint test build typecheck

# Targets individuales
pnpm nx run smooth-ui:build         # compila la librería -> dist/smooth-ui
pnpm nx run smooth-ui:test          # tests unitarios (vitest)
pnpm nx run smooth-ui-demo:serve    # servidor de desarrollo

# Un solo test
pnpm nx run smooth-ui:test -- --testFile=sui-button.component.spec.ts

# Sincroniza las project references de TypeScript (tras añadir dependencias entre proyectos)
pnpm nx sync
pnpm nx sync:check   # verifica en la CI que están al día

# Release (antes compila mediante preVersionCommand)
pnpm nx release --dry-run

# Registro local (Verdaccio) para probar publicaciones
pnpm nx run @org/source:local-registry
```

## Convenciones

- **Prefijo de selector**: `sui` en la librería, `app` en la demo (lo exige ESLint)
- **Plantillas siempre en `.html` aparte** (`templateUrl`), aunque sean cortas: la lógica en `.ts` y la vista en `.html`; nunca `template` inline
- **Inputs basados en signals** (`input()`, `output()`, `computed()`), no `@Input`/`@Output`
- **Estilos**: SCSS; Prettier con `singleQuote: true`, `printWidth: 150`
- **Angular estricto**: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`
- **tsconfig de la librería**: `moduleResolution: "bundler"`, `module: "preserve"`, `experimentalDecorators: true`

## Reglas del dominio / trampas conocidas

- El alias `@bickstodev/smooth-ui` resuelve al **código fuente** (`src/public-api.ts`), no a `dist/`
- El tema usa `[data-theme="light"]` / `[data-theme="dark"]`, no una clase CSS
- `packages/` está vacío — no crees librerías nuevas ahí
- El build de producción usa `tsconfig.lib.prod.json` con `compilationMode: "partial"` (no `tsconfig.lib.json`)
- `nx release` ejecuta `pnpm dlx nx run-many -t build` como `preVersionCommand`

## Reglas

- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.
- Antes de crear o modificar un componente de la librería, consulta `docs/smoothui.html`: es la referencia de diseño y comportamiento de cada componente.

## Agentes SDD

Cada fase del flujo SDD se delega en su agente de `.claude/agents/`; el agente principal solo pasa el contexto y habla con el usuario:

- Spec, plan y tareas (`/sdd-spec`, `/sdd-plan`, `/sdd-tasks`, `/sdd-change`): `planner`. También pone el `Status` en `approved` y registra en `MEMORY.md` lo que devuelva `reviewer`.
- Clarificación (`/sdd-clarify`) y validación (`/sdd-validate`): `reviewer`, sin modificar nada.
- Implementación (`/sdd-implement`), una tarea cada vez, correcciones y verificación completa: `implementer`.
- Flujo completo de principio a fin: `coordinator`.
- Los agentes no ven la conversación: en cada llamada se les pasa la fase, la petición y las decisiones del usuario, las rutas a leer y el resultado de la fase anterior.

## Cómo trabajar

- Planifica antes de tocar código si el cambio afecta a varios componentes o al tema
- Al terminar: explica qué cambió, por qué y qué verificación se ejecutó

## Límites

- ✅ Siempre: ejecuta `lint`, `test`, `build` y `format:check` antes de dar el trabajo por terminado; actualiza `MEMORY.md` al acabar cada tarea
- ⚠ Pregunta antes de: dependencias nuevas, archivos nuevos, cambios en el formato de datos o en la API pública
- 🚫 Nunca: tocar `packages/`, renombrar las variables CSS del tema, romper el prefijo `sui`, romper el path alias

## Verificación

```sh
pnpm nx format:check && pnpm nx run-many -t lint test build typecheck
```

Si solo cambió un componente: `pnpm nx run smooth-ui:test -- --testFile=<name>.spec.ts`

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su motivo) y trampas que evitar.
- Mantenlo breve (máx. ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo pasa a ser una regla permanente, propón moverlo a `CLAUDE.md` en lugar de dejarlo en la memoria.
- Nunca guardes datos sensibles (claves, tokens, datos personales).

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## Pautas generales para trabajar con Nx

- Para navegar o explorar el workspace, invoca primero la skill `nx-workspace`: tiene patrones para consultar proyectos, targets y dependencias
- Al ejecutar tareas (por ejemplo build, lint, test, e2e, etc.), prefiere siempre ejecutarlas a través de `nx` (es decir, `nx run`, `nx run-many`, `nx affected`) en lugar de usar directamente la herramienta subyacente
- Antepón a los comandos de nx el gestor de paquetes del workspace (p. ej., `pnpm nx build`, `npm exec nx test`): así se evita usar una CLI instalada globalmente
- Tienes acceso al servidor MCP de Nx y a sus herramientas; úsalas para ayudar al usuario
- Para las buenas prácticas de los plugins de Nx, consulta `node_modules/@nx/<plugin>/PLUGIN.md`. No todos los plugins tienen este archivo; si no existe, continúa sin él.
- NUNCA adivines flags de la CLI: consulta siempre nx_docs o `--help` cuando tengas dudas

## Scaffolding y generadores

- Para tareas de scaffolding (crear apps, libs, estructura del proyecto, configuración inicial), invoca SIEMPRE PRIMERO la skill `nx-generate`, antes de explorar o llamar a herramientas MCP

## Cuándo usar nx_docs

- ÚSALO para: opciones de configuración avanzadas, flags desconocidos, guías de migración, configuración de plugins, casos límite
- NO LO USES para: sintaxis básica de generadores (`nx g @nx/react:app`), comandos estándar, cosas que ya sabes
- La skill `nx-generate` gestiona internamente el descubrimiento de generadores: no llames a nx_docs solo para consultar la sintaxis de un generador

<!-- nx configuration end-->
