# Plan 002 — Icon

Status: implemented

Spec: `specs/002-sui-icon/spec.md` (Status: approved, sin preguntas abiertas). Incluye el cambio del selector de tema que la spec 001 (FR-2, ya actualizada) delega en esta (C2 de su plan, superada).

## Archivos y responsabilidades

Rutas relativas a `libs/smooth-ui/` salvo que se indique otra cosa.

| Archivo                                                                     | Acción    | Responsabilidad                                                                                                                                                                                                                                                                                                                    | Cubre                                           |
| --------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/lib/types/sui-icon.type.ts`                                            | crear     | Uniones `SUI_ICON_NAME` (los 44 nombres, escritos a mano como `SUI_THEME`), `SUI_ICON_SIZE = 'xs' \| 'sm' \| 'md' \| 'lg'` y `SUI_ICON_SHAPE` (unión de las tres formas).                                                                                                                                                          | FR-2, FR-4                                      |
| `src/lib/interfaces/sui-icon-shape.ts`                                      | crear     | Interfaces de las formas del dibujo: `SuiIconPath { kind: 'path'; d }`, `SuiIconCircle { kind: 'circle'; cx; cy; r }`, `SuiIconRect { kind: 'rect'; x; y; width; height; rx }`. Son las únicas que usa el set.                                                                                                                     | FR-1                                            |
| `src/lib/constants/sui-icons.ts`                                            | crear     | `SUI_ICON_NAMES` (lista recorrible, en el orden de `docs/smoothui.html`), `SUI_ICON_SIZES` y `SUI_ICONS`: registro nombre → formas, copiado de los paths de `docs/smoothui.html`, con `satisfies Readonly<Record<SUI_ICON_NAME, readonly SUI_ICON_SHAPE[]>>` para que falte o sobre un nombre dé error de compilación. Sin lógica. | FR-1, FR-2                                      |
| `src/lib/constants/sui-icons.spec.ts`                                       | crear     | Tests de los datos del set.                                                                                                                                                                                                                                                                                                        | FR-1, FR-2                                      |
| `src/lib/components/sui-icon/sui-icon.component.ts/html/scss`               | crear     | `SuiIconComponent`: dibuja un icono del set como SVG inline, decide si es decorativo o imagen con nombre y aplica el tamaño. Sin servicio ni efectos del navegador.                                                                                                                                                                | FR-1, FR-3 a FR-9, NFR-2 a NFR-4, casos límite  |
| `src/lib/components/sui-icon/sui-icon.component.spec.ts`                    | crear     | Tests del componente.                                                                                                                                                                                                                                                                                                              | FR-1, FR-3 a FR-9, NFR-4, casos límite 1, 2 y 5 |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.ts`         | modificar | Importa `SuiIconComponent`; `icon` pasa a `Signal<SUI_ICON_NAME \| null>`. El resto (`_isRendered`, `ariaLabel`) no cambia.                                                                                                                                                                                                        | FR-10                                           |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.html`       | modificar | Sustituye el `<span class="visually-hidden">` por `<sui-icon [name]="icon" size="md" />` dentro del mismo `@if`.                                                                                                                                                                                                                   | FR-10                                           |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.scss`       | modificar | Quita la regla `.visually-hidden` y su comentario. El tamaño fijo del botón no cambia.                                                                                                                                                                                                                                             | FR-10                                           |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.spec.ts`    | modificar | Sustituye el test de T10 de la 001 (clase `visually-hidden`) y adapta los helpers que leían el texto del `<span>`.                                                                                                                                                                                                                 | FR-10                                           |
| `src/index.ts`                                                              | modificar | Exporta `SuiIconComponent`, `SUI_ICON_NAMES` y los tipos `SUI_ICON_NAME` y `SUI_ICON_SIZE`.                                                                                                                                                                                                                                        | FR-2                                            |
| `src/index.spec.ts`                                                         | modificar | La lista de exportaciones en runtime incluye `SuiIconComponent` y `SUI_ICON_NAMES`; los tipos nuevos compilan.                                                                                                                                                                                                                     | FR-2                                            |
| `apps/smooth-ui-demo/src/app/pages/icons/icons-page.component.ts/html/scss` | crear     | `IconsPageComponent` (`app-icons-page`): rejilla con los 44 iconos y su nombre, fila con 1em y los cuatro tamaños, y un ejemplo con etiqueta.                                                                                                                                                                                      | Criterio de finalización 2                      |
| `apps/smooth-ui-demo/src/app/pages/icons/icons-page.component.spec.ts`      | crear     | Renderiza 44 iconos con su nombre, los cinco tamaños y el ejemplo con etiqueta.                                                                                                                                                                                                                                                    | Criterio de finalización 2                      |
| `apps/smooth-ui-demo/src/app/app.routes.ts`                                 | modificar | Ruta `docs/icons` con `loadComponent` y `''` → `redirectTo: 'docs/icons'` (`pathMatch: 'full'`), según el patrón `/docs/<componente>`. El prerender `**` ya la cubre.                                                                                                                                                              | Criterios 2 y 4                                 |

Sin `SuiIconService`, sin sprite y sin tocar `theme/theme.scss` (los tokens `--sui-size-icon-*` ya existen) ni ningún `package.json` (NFR-3).

## API pública

**`SuiIconComponent`** (selector `sui-icon`)

- Inputs:
  - `name: InputSignal<SUI_ICON_NAME | null>`, por defecto `null`. Opcional y no `input.required`: con un nombre ausente, el caso límite 1 pide que no se lance ningún error, y `input.required` lanza NG0950 (FR-2, caso límite 1).
  - `size: InputSignal<SUI_ICON_SIZE | null>`, por defecto `null`, que equivale a 1em (FR-4, caso límite 2).
  - `label: InputSignal<string>`, por defecto `''` (FR-7, FR-8).
- Outputs: ninguno.

**Exportaciones nuevas:** `SuiIconComponent`, `SUI_ICON_NAMES: readonly SUI_ICON_NAME[]` (la lista recorrible de FR-2) y los tipos `SUI_ICON_NAME` y `SUI_ICON_SIZE`. `SUI_ICONS`, `SUI_ICON_SIZES`, `SUI_ICON_SHAPE` y las interfaces de forma quedan internas: el set es cerrado y el dibujo no forma parte del contrato.

## Estado y derivados

El componente no tiene estado propio: todo son `computed()` de los inputs (principio 3).

- `shapes: Signal<readonly SUI_ICON_SHAPE[] | null>` (protegido): `SUI_ICONS[name]` si `Object.hasOwn(SUI_ICONS, name)`; si no, `null`. `hasOwn` evita que nombres como `'constructor'` o `'toString'`, llegados desde código sin tipos, encuentren algo en el prototipo (FR-1, FR-3, caso límite 1).
- `accessibleName: Signal<string>` (protegido, lo leen los bindings del host): `''` si `shapes()` es `null` (nombre desconocido: decorativo aunque tenga etiqueta); si no, `label().trim()` cuando `label()` es una cadena, y `''` en otro caso. `trim()` quita todos los espacios en blanco (espacios, tabuladores, saltos de línea), como la definición de etiqueta vacía (FR-7, FR-8, caso límite 1).
- `classes: Signal<string>` (protegido): `'sui-icon--<size>'` si `size()` está en `SUI_ICON_SIZES`; si no, `''`, que equivale a 1em (FR-4, caso límite 2).
- Un cambio de cualquier input recalcula los tres y Angular actualiza la vista sin recargar (FR-3).

En el selector de tema, `icon` sigue derivándose igual que en la 001 (`null` hasta `afterNextRender` o con el tema desconocido); solo cambia su tipo (FR-10).

## Efectos secundarios del navegador

Ninguno. El SVG se genera en la plantilla a partir de datos constantes, así que el servidor lo escribe completo en el HTML y el cliente lo hidrata sin cambios (FR-9, NFR-2). No hay `document`, `afterNextRender`, sprite en `<body>` ni red (NFR-3).

## Plantilla y accesibilidad

`sui-icon.component.html`:

```html
@if (shapes(); as shapes) {
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  @for (shape of shapes; track $index) { @switch (shape.kind) { @case ('path') {
  <path [attr.d]="shape.d" />
  } @case ('circle') {
  <circle [attr.cx]="shape.cx" [attr.cy]="shape.cy" [attr.r]="shape.r" />
  } @case ('rect') {
  <rect [attr.x]="shape.x" [attr.y]="shape.y" [attr.width]="shape.width" [attr.height]="shape.height" [attr.rx]="shape.rx" />
  } } }
</svg>
}
```

- **Forma (FR-1):** caja `viewBox="0 0 24 24"` y `stroke-width="1.75"` en unidades de esa caja, sin `vector-effect`, así que el trazo escala con el icono.
- **Presentación en el HTML inicial (FR-9):** `fill`, `stroke`, `stroke-width`, `stroke-linecap` y `stroke-linejoin` van como atributos de presentación del `<svg>`, no solo en el `.scss`. Aunque el CSS llegue tarde o no se inline, nunca se ve relleno negro ni trazo cuadrado.
- **Nombre desconocido (caso límite 1):** sin `<svg>`; el host conserva su tamaño por CSS.
- **`track $index`:** la lista de formas es estática y sin clave, la excepción que admite `CLAUDE.md`.
- **Accesibilidad en el host**, con `host: {}`:
  - `'[attr.role]': 'accessibleName() ? "img" : null'`
  - `'[attr.aria-label]': 'accessibleName() || null'`
  - `'[attr.aria-hidden]': 'accessibleName() ? null : "true"'`
  - `'[class]': 'classes()'`
  - Decorativo: `aria-hidden="true"` y sin rol (FR-7). Con nombre: `role="img"` y `aria-label` recortado (FR-8).
  - El `<svg>` interior siempre lleva `aria-hidden="true"` y `focusable="false"`, y nadie tiene `tabindex`, así que nunca recibe el foco (FR-7, FR-8). `sui-icon.component.scss` (solo tokens `--sui-*`, sin hex):

- `:host { display: inline-flex; flex: none; justify-content: center; align-items: center; inline-size: 1em; block-size: 1em; }` (FR-4, FR-5). `flex: none` impide que un contenedor flex lo encoja o lo estire en su eje principal, y `inline-size`/`block-size` explícitos impiden que lo estire en el eje cruzado; el `<svg>` queda centrado en la caja. `inline-flex` mantiene el icono en la línea del texto corrido sin partirla, pero no lo alinea con él. No lleva `vertical-align` ni `line-height`: la alineación con el texto la hace el consumidor.
- `:host(.sui-icon--xs|sm|md|lg) { inline-size/block-size: var(--sui-size-icon-<size>); }`: una regla por tamaño. Un tamaño nuevo añade una regla y no edita ninguna rama (FR-4, principio 7). Si el tema redefine el token, el icono lo sigue.
- `svg { display: block; inline-size: 100%; block-size: 100%; }`.
- **Color:** sin regla propia. `stroke="currentColor"` sigue el `color` del contenedor en cada estado y tema (FR-6, caso límite 4). En colores forzados el navegador fuerza `color`, y `currentColor` lo hereda: `CanvasText` en texto y `ButtonText` en botones (caso límite 3).
- Sin transiciones ni animaciones (fuera de alcance).

Selector de tema (FR-10): `@if (icon(); as icon) { <sui-icon [name]="icon" size="md" /> }`. El icono es decorativo porque no recibe etiqueta, así que el nombre accesible sigue siendo solo el `aria-label` del botón. El botón ya centra el contenido con `inline-flex` y mantiene `--sui-size-control-md` fijo, así que no cambia de tamaño al aparecer el icono.

## Decisiones

| Decisión                                                                                                    | Alternativa descartada                                                                                                | Motivo                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SVG inline por instancia en la plantilla.                                                                   | Sprite `<symbol>` inyectado en `<body>` por un `SuiIconService` con `<use href="#…">`, como apuntaba la idea inicial. | El sprite solo existe tras arrancar en el cliente, así que el HTML del servidor tendría `<use>` vacíos (incumple FR-9) y añadiría el set completo a la página (incumple NFR-4). Además metería un efecto de DOM global en un servicio sin necesidad. |
| Datos como formas tipadas (`path`, `circle`, `rect`) y `@switch` en la plantilla.                           | Cadenas de SVG con `[innerHTML]`.                                                                                     | El sanitizador de Angular elimina `<svg>`, `<path>` y similares de `innerHTML`; para evitarlo habría que usar `bypassSecurityTrustHtml`. Con formas tipadas no hay que saltarse la sanitización, todo es tipado y funciona igual en SSR.             |
| Mantener círculos y rectángulos como formas propias.                                                        | Convertir los 44 iconos a un único `d` de path, sin `@switch`.                                                        | La conversión a mano de arcos y `rx` es propensa a errores y se alejaría de la referencia. El `@switch` cubre un conjunto cerrado de tres formas: el set es cerrado por decisión del propietario, así que no crece.                                  |
| `SUI_ICON_NAME` escrito a mano y `SUI_ICON_NAMES: readonly SUI_ICON_NAME[]`, como `SUI_THEME`/`SUI_THEMES`. | Derivar el tipo de un array `as const`.                                                                               | Sigue el patrón del repo y la regla de uniones `SUI_*` en `*.type.ts`. El `satisfies Record<…>` y el test de igualdad de claves impiden que el tipo, la lista y el dibujo diverjan.                                                                  |
| Atributos ARIA en el host y `<svg>` siempre oculto.                                                         | Rol y etiqueta en el `<svg>`.                                                                                         | Un solo nodo expone el significado. El consumidor y los tests lo encuentran por rol en el propio `sui-icon`, y el `<svg>` nunca duplica el nombre.                                                                                                   |
| Tamaño con clase del host desde un `computed()`.                                                            | Custom property inline (`[style.--sui-icon-size]`).                                                                   | Es la convención de `CLAUDE.md` (lista de clases en un `computed()`) y no inventa variables CSS nuevas.                                                                                                                                              |
| Atributos de presentación en el `<svg>` además del CSS.                                                     | Solo CSS.                                                                                                             | FR-9 exige que nunca se vea relleno. MEMORY recoge que el CSS crítico se puede quedar fuera del HTML prerenderizado.                                                                                                                                 |
| Color solo con `currentColor`, sin regla `forced-colors`.                                                   | `@media (forced-colors: active) { stroke: CanvasText }`.                                                              | `CanvasText` fijo sería incorrecto dentro de botones y enlaces (`ButtonText`, `LinkText`), mientras que `currentColor` ya recibe el color forzado. Si la validación en navegador lo desmiente, se añade la regla.                                    |

## Estrategia de tests (Vitest + TestBed zoneless, `pnpm nx run smooth-ui:test`)

Inputs con `fixture.componentRef.setInput()` y `await fixture.whenStable()` tras cada cambio; consultas por rol, atributos y DOM, sin acceder a privados.

**`constants/sui-icons.spec.ts`** (FR-1, FR-2)

- `SUI_ICON_NAMES` tiene 44 nombres únicos e igual conjunto que `Object.keys(SUI_ICONS)`; cada icono tiene al menos una forma.
- Comprobación de muestra con la referencia: `search` = círculo `11,11,7` + path `m20 20-3.5-3.5`; `calendar` incluye un `rect` con `rx` 2.5.
- `// @ts-expect-error` al asignar `'not-an-icon'` a `SUI_ICON_NAME`: lo comprueba `pnpm nx run smooth-ui:typecheck`, que incluye `tsconfig.spec.json` (FR-2).

**`sui-icon.component.spec.ts`** (FR-1, FR-3 a FR-9, NFR-4, casos límite 1, 2 y 5)

- **FR-1 y FR-9:** con `name='search'`, hay un `<svg>` con `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"` y `stroke-linecap`/`stroke-linejoin` `round`. Sus hijos son exactamente un `circle` y un `path` con los atributos de los datos y con `namespaceURI` SVG.
- **FR-9:** el dibujo ya está tras un solo `changeDetectorRef.detectChanges()`, sin esperar a `afterNextRender` (trampa de MEMORY).
- **FR-3:** cambiar `name` de `check` a `x` sustituye las formas. Cambiar `size` y `label` actualiza la clase y el rol sin recrear el fixture.
- **FR-4 y caso límite 2:** sin `size`, el host no tiene clase de tamaño. Con `xs`, `sm`, `md` y `lg`, tiene `sui-icon--<size>`. Con `'xl'` o `''` (forzados con `as`), no tiene clase.
- **FR-5:** en un contenedor flex estrecho, `getComputedStyle` del host da `flex-shrink: 0` y `flex-grow: 0`. jsdom no hace layout, así que el tamaño real se valida en navegador; si jsdom no aplica los estilos del componente, este test no se añade.
- **FR-7:** con `label` `''`, `'   '` o `'\t\n'`, el host tiene `aria-hidden="true"`, sin `role` ni `aria-label`.
- **FR-8:** con `label` `'  Search  '`, el host tiene `role="img"` y `aria-label="Search"`, sin `aria-hidden`.
- **FR-7, FR-8 (foco):** ni el host ni el `<svg>` tienen `tabindex`, y el `<svg>` tiene `focusable="false"` y `aria-hidden="true"`.
- **Caso límite 1:** con `name` `null`, `''`, `'not-an-icon'` o `'constructor'`, y también al pasar de `check` a `'not-an-icon'`, no hay `<svg>`, el host es decorativo aunque `label='Search'` y no se lanza ningún error.
- **NFR-4 y caso límite 5:** un componente host de test con tres `<sui-icon name="check" />` y uno `name="x"`. Cada `sui-icon` contiene exactamente las formas de su icono, y en el documento solo hay cuatro `<svg>`.

**`sui-theme-toggle.component.spec.ts`** (FR-10; sustituye el test de T10 de la 001)

- Los helpers leen el icono con `fixture.debugElement.query(By.directive(SuiIconComponent))` y su input `name()`, no con el texto del `<span>`.
- El test `keeps the icon visually hidden…` pasa a `renders a decorative md icon and keeps the button name`. Comprueba que hay un `sui-icon` con `aria-hidden="true"`, clase `sui-icon--md`, un `<svg>` dentro y nombre `moon`; que no queda ningún `.visually-hidden`; y que el `aria-label` del botón es "Switch to dark theme".
- Los demás tests de la 001 (sun/moon según tema, clic, dos instancias, sin icono antes de `afterNextRender` y con `theme() === null`) se mantienen con el helper nuevo.

**`index.spec.ts`** (FR-2): las claves en runtime son `SUI_ICON_NAMES`, `SuiIconComponent`, `SuiThemeService` y `SuiThemeToggleComponent`, y los tipos `SUI_ICON_NAME` y `SUI_ICON_SIZE` compilan.

**`icons-page.component.spec.ts`** (demo): renderiza 44 `sui-icon`, cada uno con su nombre visible, los cinco tamaños (sin tamaño, `xs`, `sm`, `md`, `lg`) y uno con `role="img"` y nombre accesible.

**Comprobaciones de build** (FR-9, NFR-2, NFR-3, criterio 4)

- `pnpm nx run smooth-ui-demo:build` termina sin errores.
- El HTML prerenderizado de `docs/icons` en `dist/apps/smooth-ui-demo/browser/` contiene 44 o más `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"` con sus formas.
- `git diff` no toca ningún `package.json`.

**Validación en navegador** (`/sdd-validate`, Chrome DevTools sobre la demo prerenderizada y servida)

- **FR-1:** forma de los 44 iconos comparada a simple vista con `docs/smoothui.html`.
- **FR-4:** tamaños reales de 14, 16, 20 y 24 px y 1em.
- **FR-5:** la caja mide exactamente su tamaño en ambos ejes, con el dibujo centrado, también dentro de un contenedor flex estrecho (p. ej. a 375 px). La alineación con el texto no es del componente: la demo alinea "With a label" con sus propios estilos (`.icon-label`, `display: flex; align-items: center`).
- **FR-6 y caso límite 4:** el color sigue al contenedor en claro, oscuro y hover.
- **FR-9:** con la red ralentizada, ningún fotograma muestra relleno negro ni salto de layout (CLS 0 en el bloque de iconos).
- **Caso límite 3:** emulación de `forced-colors: active`; el trazo sigue visible.
- **NFR-1:** AXE sin violaciones en la página de iconos y en el selector, en claro y en oscuro.
- **FR-10:** el selector muestra sol o luna de 20 px; tras recargar no cambia de tamaño al aparecer el icono, y el lector de pantalla no anuncia el icono.

## Cobertura

| Requisito          | Dónde                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| FR-1               | `SUI_ICONS` + plantilla (`viewBox`, `stroke-width` sin `vector-effect`)                         |
| FR-2               | `SUI_ICON_NAME`, `SUI_ICON_NAMES`, `satisfies Record`, exportación en `src/index.ts`            |
| FR-3               | `computed()` de `shapes`, `classes` y `accessibleName`                                          |
| FR-4               | `classes` + `:host` 1em y `:host(.sui-icon--*)` con `--sui-size-icon-*`                         |
| FR-5               | `:host` `flex` centrado + `flex: none` + tamaño fijo en ambos ejes (validado en navegador)      |
| FR-6               | `stroke="currentColor"`                                                                         |
| FR-7               | Host `aria-hidden`, `<svg>` `aria-hidden` y `focusable="false"`, sin `tabindex`                 |
| FR-8               | Host `role="img"` + `aria-label` recortado                                                      |
| FR-9               | SVG inline + atributos de presentación; sin efectos de navegador                                |
| FR-10              | Selector de tema: plantilla con `<sui-icon size="md">`, sin `.visually-hidden`, test sustituido |
| NFR-1              | Plantilla y host (ARIA) + validación AXE en navegador                                           |
| NFR-2              | Sin acceso a `document` ni a `window`; build prerenderizado                                     |
| NFR-3              | Sin dependencias, red ni recursos externos                                                      |
| NFR-4              | Solo las formas del icono en su `<svg>`                                                         |
| Caso límite 1      | `shapes` con `Object.hasOwn` + `accessibleName` vacío                                           |
| Caso límite 2      | `classes` con `SUI_ICON_SIZES`                                                                  |
| Casos límite 3 y 4 | `currentColor` (validado en navegador)                                                          |
| Caso límite 5      | Un `<svg>` por instancia                                                                        |
| Criterios 2 y 4    | Página `/docs/icons` de la demo + ruta prerenderizada                                           |
| Criterio 5         | Spec 001 ya actualizada (cambio aprobado)                                                       |

## Decisiones del usuario al aprobar

- Constantes en `constants/sui-icons.ts` (plural), con su test `sui-icons.spec.ts`.
- Ruta de la demo `/docs/icons`, con `''` redirigiendo a ella.
- FR-5 (cambio aprobado): el icono es una caja fija con el dibujo centrado y la alineación con el texto la hace cada consumidor; la demo alinea "With a label" con `.icon-label`. Alternativa descartada: alinearlo el propio componente con `vertical-align` en un host `inline-block`, porque `vertical-align` no tiene efecto dentro de un contenedor flex y el centrado dependería del texto de cada consumidor (validado en navegador: caja de 16×16 a 375 px y 0 px de desvío con la solución elegida).
