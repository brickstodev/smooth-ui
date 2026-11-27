# Tareas 002 — Icon

Spec: `specs/002-sui-icon/spec.md` (approved). Plan: `specs/002-sui-icon/plan.md` (approved).

Reglas para cada tarea:

- Primero los tests (en rojo), después el código, `pnpm nx run smooth-ui:test` en verde; se marca la tarea y se para.
- Plantillas siempre en `.html` aparte (`templateUrl`).
- Campos con tipo explícito, privados con `_` y orden de miembros de la skill `format-code`.
- Nunca ejecutar `pnpm install`, ni en la raíz ni en `libs/smooth-ui`.

Rutas relativas a `libs/smooth-ui/` salvo que se indique otra cosa.

- [x] **T1. Tipos, interfaces y listas de nombres y tamaños.** FR-2, FR-4, caso límite 2
- Hecho cuando: existen `src/lib/types/sui-icon.type.ts` (`SUI_ICON_NAME` con los 44 nombres, `SUI_ICON_SIZE` y `SUI_ICON_SHAPE`) y `src/lib/interfaces/sui-icon-shape.ts` (`SuiIconPath`, `SuiIconCircle`, `SuiIconRect`). `src/lib/constants/sui-icons.ts` exporta `SUI_ICON_NAMES` (44 nombres únicos, en el orden de `docs/smoothui.html`) y `SUI_ICON_SIZES` (`xs`, `sm`, `md`, `lg`). `src/lib/constants/sui-icons.spec.ts` lo comprueba e incluye un `// @ts-expect-error` al asignar `'not-an-icon'` a `SUI_ICON_NAME`. `smooth-ui:test` y `smooth-ui:typecheck` en verde.

- [x] **T2. Dibujo de los 44 iconos.** FR-1, FR-2, NFR-4
- Hecho cuando: `SUI_ICONS` en `src/lib/constants/sui-icons.ts` tiene las formas de los 44 iconos, copiadas de los paths de `docs/smoothui.html`, con `satisfies Readonly<Record<SUI_ICON_NAME, readonly SUI_ICON_SHAPE[]>>`. Los tests comprueban:
  - que las claves de `SUI_ICONS` son exactamente `SUI_ICON_NAMES`;
  - que cada icono tiene al menos una forma;
  - las muestras del plan: `search` es un círculo `11,11,7` más el path `m20 20-3.5-3.5`, y `calendar` tiene un `rect` con `rx` 2.5.

  `smooth-ui:test` y `smooth-ui:typecheck` en verde.

- [x] **T3. Componente: SVG inline, cambio de nombre y nombre desconocido.** FR-1, FR-3, FR-9, NFR-2, NFR-4, casos límite 1 y 5
- Hecho cuando: `SuiIconComponent` (`sui-icon`, archivos `.ts`, `.html`, `.scss` y `.spec.ts`) tiene el input `name` (por defecto `null`) y `shapes` derivado con `Object.hasOwn`. La plantilla es la del plan, con atributos de presentación en el `<svg>`. Los tests comprueban:
  - con `search`, los atributos del `<svg>` y que sus hijos (un `circle` y un `path`) tienen `namespaceURI` SVG;
  - que el dibujo está tras un solo `changeDetectorRef.detectChanges()`;
  - que `check` → `x` sustituye las formas;
  - que `null`, `''`, `'not-an-icon'`, `'constructor'` y el paso de `check` a `'not-an-icon'` no dejan ningún `<svg>` ni lanzan errores;
  - que tres `check` y un `x` en un host de test dan exactamente cuatro `<svg>`, cada uno solo con sus formas.

  Tests en verde.

- [x] **T4. Componente: accesibilidad (decorativo o imagen con nombre, sin foco).** FR-3, FR-7, FR-8, caso límite 1
- Hecho cuando: el input `label` (por defecto `''`) y `accessibleName` (protegido) se enlazan en `host: {}` como dice el plan. Los tests comprueban:
  - que `''`, `'   '` y `'\t\n'` dan `aria-hidden="true"` sin `role` ni `aria-label`;
  - que `'  Search  '` da `role="img"` y `aria-label="Search"`, sin `aria-hidden`;
  - que con un nombre desconocido y `label='Search'` el icono es decorativo;
  - que al cambiar la etiqueta se pasa de decorativo a imagen y al revés;
  - que no hay `tabindex` y que el `<svg>` lleva `aria-hidden="true"` y `focusable="false"`.

  Tests en verde.

- [x] **T5. Componente: tamaño, caja y color.** FR-4, FR-5, FR-6, casos límite 2, 3 y 4
- Hecho cuando: el input `size` (por defecto `null`) alimenta `classes`. Los tests comprueban que no hay clase sin tamaño, que hay `sui-icon--<size>` para cada uno de los cuatro, y que no hay clase con `'xl'` ni con `''`. El `.scss` contiene `:host` (`display: inline-flex`, `flex: none`, `justify-content: center`, `align-items: center`, `inline-size` y `block-size` de 1em, sin `vertical-align` ni `line-height`), una regla `:host(.sui-icon--*)` por tamaño con `--sui-size-icon-*` y `svg` en bloque al 100 %. No hay hex, ni regla de color, ni transiciones. `smooth-ui:test` y `smooth-ui:lint` en verde.

- [x] **T6. Exportar la API pública.** FR-2
- Hecho cuando: `src/index.ts` exporta `SuiIconComponent`, `SUI_ICON_NAMES` y los tipos `SUI_ICON_NAME` y `SUI_ICON_SIZE`. `src/index.spec.ts` (en rojo antes del cambio) espera como claves en runtime exactamente `SUI_ICON_NAMES`, `SuiIconComponent`, `SuiThemeService` y `SuiThemeToggleComponent`, y usa los dos tipos nuevos. `smooth-ui:test`, `smooth-ui:typecheck` y `smooth-ui:build` en verde.

- [x] **T7. Selector de tema con el icono real.** FR-10
- Hecho cuando:
  - En `sui-theme-toggle.component.spec.ts`, los helpers leen el icono con `By.directive(SuiIconComponent)` y `name()`.
  - El test de T10 de la 001 se sustituye por `renders a decorative md icon and keeps the button name`, que comprueba: un `sui-icon` con `aria-hidden="true"`, clase `sui-icon--md`, un `<svg>` y `moon`; ningún `.visually-hidden`; y el `aria-label` "Switch to dark theme".
  - La plantilla usa `<sui-icon [name]="icon" size="md" />` dentro del `@if`, y `icon` es `Signal<SUI_ICON_NAME | null>`.
  - El `.scss` ya no tiene `.visually-hidden`.
  - Los demás tests de la 001 siguen en verde, igual que `smooth-ui:test` y `smooth-ui:lint`.

- [x] **T8. Página de iconos en la demo (`/docs/icons`).** Criterios de finalización 2 y 4
- Hecho cuando:
  - `apps/smooth-ui-demo/src/app/pages/icons/icons-page.component.ts`, `.html` y `.scss` (`app-icons-page`) muestran, con tokens `--sui-*` y sin hex:
    - los 44 iconos con su nombre visible, recorriendo `SUI_ICON_NAMES` con `@for (…; track name)`;
    - una fila con 1em, `xs`, `sm`, `md` y `lg`;
    - un ejemplo con etiqueta.
  - `app.routes.ts` tiene `docs/icons` con `loadComponent` y `''` → `redirectTo: 'docs/icons'` (`pathMatch: 'full'`).
  - `icons-page.component.spec.ts` comprueba los 44 `sui-icon` con nombre, los cinco tamaños y un `role="img"` con nombre accesible.
  - `pnpm nx run smooth-ui-demo:test` y `smooth-ui-demo:lint` en verde.

- [x] **T9. Verificación completa.** FR-9, NFR-2, NFR-3, criterios de finalización 4 y 6
- Hecho cuando:
  - `pnpm nx format:check` y `pnpm nx run-many -t lint test build typecheck` están en verde.
  - El HTML prerenderizado de `docs/icons` en `dist/apps/smooth-ui-demo/browser/` contiene al menos 44 `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"` con sus formas.
  - `git diff --stat` no incluye ningún `package.json` ni `pnpm-lock.yaml`.
  - `MEMORY.md` está actualizado.

- [x] **T10. Test de la caja fija en un contenedor flex estrecho.** FR-5
- Hecho cuando:
  - `sui-icon.component.spec.ts` tiene el test `keeps its box from shrinking inside a narrow flex container`: un componente host de test con un contenedor `display: flex` de 40 px que contiene un `sui-icon size="sm"` y un texto largo. jsdom no hace layout, así que el test no mide la caja: comprueba que `getComputedStyle(host)` da `flex-shrink: 0` y `flex-grow: 0`.
  - El test está en rojo si se quita `flex: none` del `:host` y en verde con el `.scss` actual. Si jsdom no aplica los estilos del componente (el test pasa también sin `flex: none`), el test no se añade, FR-5 queda solo con la validación en navegador y se anota en `MEMORY.md` como trampa.
  - La demo no cambia: "With a label" ya se alinea con `.icon-label`.
  - `pnpm nx format:check` y `pnpm nx run-many -t lint test build typecheck` en verde.

La validación en navegador queda para `/sdd-validate`: forma de los 44 iconos frente a `docs/smoothui.html`, tamaños reales, caja de FR-5 con su tamaño exacto en ambos ejes y el dibujo centrado, también dentro de un contenedor flex estrecho (375 px), color en claro, oscuro y hover, colores forzados, ausencia de relleno negro y de salto de layout con la red ralentizada, AXE en claro y oscuro, y el selector de tema con el icono de 20 px sin cambio de tamaño.
