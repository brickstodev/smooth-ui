# Plan 001 — Theme toggle

Status: approved

Spec: `specs/001-theme-toggle/spec.md` (Status: approved, sin preguntas abiertas). Revisado tras la validación (CHANGES REQUIRED) y el cambio de FR-2: ver "Correcciones tras la validación"; pendiente de aprobación.

## Archivos y responsabilidades

Rutas relativas a `libs/smooth-ui/` salvo que se indique otra cosa.

| Archivo                                                                       | Acción    | Responsabilidad                                                                                                                                                                              | FR                                   |
| ----------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src/lib/types/sui-theme.type.ts`                                             | crear     | Tipo `SUI_THEME = 'light' \| 'dark'`, compartido por servicio y componente.                                                                                                                  | FR-8                                 |
| `src/lib/constants/sui-theme.ts`                                              | crear     | Clave de almacenamiento (`'sui-theme'`) y valores válidos. Sin lógica.                                                                                                                       | FR-4, FR-5                           |
| `src/lib/services/theme.service.ts`                                           | crear     | `SuiThemeService`: única fuente de verdad del tema en la app. Resuelve el tema inicial, lo aplica a `<html>`, lo guarda y lo expone. Único archivo TS con `localStorage` (principio 5).      | FR-3 a FR-6, FR-8                    |
| `src/lib/services/theme.service.spec.ts`                                      | crear     | Tests del servicio.                                                                                                                                                                          | FR-4 a FR-6, FR-8, casos límite      |
| `theme/theme-init.js`                                                         | crear     | Script previo al arranque (JS clásico, sin módulos): aplica el tema inicial antes del primer pintado con las mismas reglas que el servicio. Solo lee; no guarda (excepción del principio 5). | FR-7                                 |
| `src/lib/services/theme-init.spec.ts`                                         | crear     | Ejecuta el script en jsdom con la misma tabla de casos que el servicio.                                                                                                                      | FR-5, FR-6, FR-7                     |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.ts/html/scss` | crear     | `SuiThemeToggleComponent`: botón que muestra el icono destino y llama al servicio. Sin acceso al DOM global ni al almacenamiento (principio 3).                                              | FR-1 a FR-3, FR-9                    |
| `src/lib/components/sui-theme-toggle/sui-theme-toggle.component.spec.ts`      | crear     | Tests del componente.                                                                                                                                                                        | FR-1 a FR-3, FR-9, NFR-1 (parte DOM) |
| `src/index.ts`                                                                | modificar | Exportar `SuiThemeToggleComponent`, `SuiThemeService` y `SUI_THEME`.                                                                                                                         | FR-8                                 |
| `ng-package.json`                                                             | modificar | Publicar la carpeta `theme/` (`theme.scss` y `theme-init.js`) como asset del paquete.                                                                                                        | FR-7, FR-10                          |
| `theme/theme.scss`                                                            | modificar | (Corrección C3) En el bloque claro, `--sui-color-accent-ring` pasa de `--sui-accent-400` a `--sui-accent-600`. Sin renombrar variables; el bloque oscuro no cambia.                          | NFR-1                                |
| `README.md`                                                                   | modificar | Cómo incluir `theme.scss` en los estilos y `theme-init.js` como script bloqueante en el `<head>`, justo después de `<base>` (C4), y desactivar el CSS crítico inline con SSR/prerender (C1). | FR-7, FR-10                          |
| `apps/smooth-ui-demo/project.json`                                            | modificar | Añadir `libs/smooth-ui/theme/theme.scss` a `styles` y servir `theme-init.js` como asset desde `libs/smooth-ui/theme`. Sin copias. (C1) `inlineCritical: false` en `production`.              | FR-7, FR-10                          |
| `apps/smooth-ui-demo/src/index.html`                                          | modificar | `<script src="theme-init.js"></script>` en el `<head>`, justo después de `<base href="/">` (C4) y antes de cualquier estilo.                                                                 | FR-7                                 |
| `apps/smooth-ui-demo/src/app/app.component.html` y `.ts`                      | modificar | Mostrar `<sui-theme-toggle />` para validar en la web real.                                                                                                                                  | Criterios de finalización            |

## API pública

**`SuiThemeToggleComponent`** (selector `sui-theme-toggle`)

- Inputs:
  - `switchToLightLabel: InputSignal<string>`, por defecto `''`; si no llega texto, o llega vacío o solo con espacios, se usa `'Switch to light theme'` (FR-9).
  - `switchToDarkLabel: InputSignal<string>`, por defecto `''`; si no llega texto, o llega vacío o solo con espacios, se usa `'Switch to dark theme'` (FR-9).
- Outputs: ninguno (fuera de alcance).

**`SuiThemeService`** (singleton con `@Service()`, según `CLAUDE.md`; existe en Angular 22.2)

- `theme: Signal<SUI_THEME | null>` — tema activo, de solo lectura; `null` mientras no se conoce (servidor) (FR-8).
- `setTheme(theme: SUI_THEME): void` — aplica y guarda (FR-4, FR-8).
- `toggle(): void` — cambia al otro tema, aplica y guarda (FR-3).

**Tipos exportados:** `SUI_THEME`.

## Estado y derivados

- Estado único: señal privada `_theme` en `SuiThemeService`. Todos los selectores leen la misma señal, así que siempre coinciden (caso límite 5).
- Derivados en el componente (`computed()`, principio 3):
  - `_targetTheme`: el otro tema, o `null` si el tema es `null`.
  - `icon`: `'moon'` si el destino es oscuro, `'sun'` si es claro, `null` si aún no se ha renderizado en el cliente (FR-2).
  - `ariaLabel`: `switchToLightLabel` o `switchToDarkLabel` normalizados (FR-1, FR-9). Con tema `null` usa el de "dark", coherente con el caso límite 3.
- Señal local `_isRendered` en el componente, a `true` en `afterNextRender`. El icono solo aparece después, de modo que el primer render del cliente coincide con el del servidor y la hidratación no da error (FR-2, NFR-3).

## Efectos secundarios del navegador

Todos en `SuiThemeService` (principios 3 y 5), salvo el script previo al arranque:

- **Resolución inicial** (constructor, solo con `isPlatformBrowser`): lee la clave guardada; si es exactamente `'light'` o `'dark'` la usa (FR-5, caso límite 1); si no, consulta `matchMedia('(prefers-color-scheme: dark)')` una sola vez, sin suscribirse (FR-6); si no hay `matchMedia` o no indica preferencia, usa `'light'` (caso límite 3).
- **Aplicar:** escribe `data-theme` en `document.documentElement` (vía `inject(DOCUMENT)`), sobrescribiendo cualquier valor previo (fuera de alcance: cambios externos).
- **Guardar:** solo en `setTheme`/`toggle`, nunca en la resolución inicial, para que el tema del sistema no se convierta en preferencia (FR-4, FR-6). Lecturas y escrituras en `try/catch`: si el almacenamiento falla, el tema se sigue aplicando sin errores (caso límite 2).
- **Servidor:** `theme` queda en `null` y no se toca ni el DOM ni el almacenamiento (NFR-3).
- **`theme/theme-init.js`:** mismas reglas de lectura y resolución; solo fija `data-theme`. Envuelto en `try/catch` completo para no romper nunca la carga (FR-7, caso límite 2).

## Plantilla y accesibilidad

- Un `<button type="button">` nativo: foco por Tab y activación con Enter y Espacio sin código extra (FR-3, NFR-1).
- `[attr.aria-label]="ariaLabel()"`: el nombre accesible describe la acción (FR-1, FR-9).
- Icono provisional: `@if (icon(); as icon) { <span class="visually-hidden" aria-hidden="true">{{ icon }}</span> }`, oculto a tecnologías de asistencia y oculto visualmente (FR-2, hallazgo 22, corrección C2).
- Plantilla en `sui-theme-toggle.component.html`, separada de la lógica (`templateUrl`); estilos en `.scss` aparte.
- Estilos solo con tokens `--sui-*`: tamaño `--sui-size-control-md` fijo en ancho y alto (el botón no cambia de tamaño sin icono, FR-2), `--sui-radius-md`, `--sui-color-border-default`, `--sui-color-bg-surface`, `--sui-color-text-primary`, hover con `--sui-color-state-hover-overlay` y foco visible con `--sui-color-accent-ring` y `--sui-border-width-focus` en `:focus-visible` (NFR-1). Sin transiciones (decisión del hallazgo 6).
- `.visually-hidden` (C2), local al componente (encapsulado): `position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0`. Se incluyen `clip` y `clip-path` para que AXE lo considere fuera de pantalla con cualquier versión. Al salir del flujo, el tamaño fijo del botón no cambia.

## Decisiones

| Decisión                                                                                                       | Alternativa descartada                                                                                             | Motivo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script externo `theme-init.js` publicado en el paquete y cargado con `<script src>` bloqueante en el `<head>`. | Pedir a la app que pegue un script inline en su `index.html`.                                                      | Una sola fuente, sin copias; un script bloqueante en el `<head>` se ejecuta antes del primer pintado.                                                                                                                                                                                                                                                                                                                                                                                             |
| El servicio resuelve el tema inicial por su cuenta en vez de leer el `data-theme` que fijó el script.          | Leer el atributo como fuente de verdad.                                                                            | Si la app no incluye el script o trae un `data-theme` fijo, el servicio sigue cumpliendo FR-5, FR-6 y la sobrescritura. La duplicación de reglas se controla con la misma tabla de casos en ambos tests.                                                                                                                                                                                                                                                                                          |
| Icono solo tras `afterNextRender`.                                                                             | Mostrar el icono desde el primer render del cliente.                                                               | Evita un error de hidratación (el servidor no tiene icono) y cumple FR-2 sin mover el layout.                                                                                                                                                                                                                                                                                                                                                                                                     |
| Nombre `SuiThemeService` en `theme.service.ts`.                                                                | `ThemeService`.                                                                                                    | Prefijo `Sui` como el resto de la librería (evita choques en la app); el nombre de archivo es el que exige el principio 5.                                                                                                                                                                                                                                                                                                                                                                        |
| Sin `InjectionToken` para almacenamiento o `matchMedia`.                                                       | Tokens inyectables con valor por defecto.                                                                          | El principio 5 exige que `localStorage` solo aparezca en `theme.service.ts`; jsdom permite simular ambos en los tests y el servicio entero se sustituye por providers (principio 7).                                                                                                                                                                                                                                                                                                              |
| Entrada pública `src/index.ts`.                                                                                | Crear `src/public-api.ts` como dice `CLAUDE.md`.                                                                   | `ng-package.json` y el alias de `tsconfig.base.json` ya apuntan a `src/index.ts`; cambiarlo es un cambio de configuración aparte.                                                                                                                                                                                                                                                                                                                                                                 |
| Selector binario (`toggle`).                                                                                   | Lista ordenada de temas.                                                                                           | Decisión del hallazgo 21: más temas requieren una spec nueva.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| (C1) `inlineCritical: false` en `production` de la demo; hoja de estilos bloqueante.                           | Duplicar las reglas oscuras en `@media (prefers-color-scheme: dark)`, o CSS inline a mano en `index.html`.         | La media query no cubre la preferencia guardada contraria al sistema (dark guardado con sistema claro, o al revés) y duplica tokens; el CSS a mano es una copia del tema (contra FR-10 y "sin copias"). Coste: una hoja bloqueante pequeña, aceptable frente a un destello.                                                                                                                                                                                                                       |
| (C2) Icono como texto oculto visualmente con una clase local del componente.                                   | `display: none` o quitar el `<span>`.                                                                              | Lo pide FR-2 (cambiado); `display: none` también eliminaría el nodo del árbol de render y el `<span>` es el sitio donde entrará el componente de iconos.                                                                                                                                                                                                                                                                                                                                          |
| (C3) `--sui-color-accent-ring` del tema claro pasa a `--sui-accent-600` en `theme.scss`.                       | (a) Usar otro token en el `.scss` del componente (p. ej. `--sui-color-accent-solid`, que da ≥ 3:1 en ambos temas). | El anillo es un token semántico que usarán todos los componentes: corregirlo en el tema arregla la causa una vez; (a) dejaría la trampa a cada componente nuevo y usaría un token de relleno para el foco. `600` frente a `500`: más margen (≥ 4,2:1 incluso sobre `--sui-neutral-200`, donde `500` da ~3,1:1) y coincide con `accent-solid`/`accent-text` del claro. Se aparta de `docs/smoothui.html` (`accent-ring = accent-400`): requiere el visto bueno del propietario al aprobar el plan. |
| (C4) `theme-init.js` justo después de `<base href="/">`, con ruta relativa.                                    | Ruta absoluta `/theme-init.js`.                                                                                    | Relativo a `<base>` funciona en rutas anidadas y respeta un `baseHref` distinto en el despliegue; la absoluta rompe si la app se sirve en un subdirectorio. Sigue antes de cualquier hoja de estilos.                                                                                                                                                                                                                                                                                             |

## Estrategia de tests (Vitest + TestBed, `pnpm nx run smooth-ui:test`)

Tabla de casos compartida por `theme.service.spec.ts` y `theme-init.spec.ts` (guardado → sistema → resultado):

| Guardado                        | Sistema          | Resultado                      |
| ------------------------------- | ---------------- | ------------------------------ |
| `'dark'`                        | claro            | `dark`                         |
| `'light'`                       | oscuro           | `light`                        |
| ninguno                         | oscuro           | `dark`                         |
| ninguno                         | claro            | `light`                        |
| ninguno                         | sin `matchMedia` | `light`                        |
| `'Dark'`, `' light '`, `'blue'` | oscuro           | `dark` (se ignora el guardado) |
| el almacenamiento lanza error   | oscuro           | `dark`, sin errores            |

**`theme.service.spec.ts`** (FR-4 a FR-6, FR-8, casos límite 1 a 4, NFR-3)

- La tabla anterior, con `localStorage` y `window.matchMedia` simulados.
- `data-theme` previo en `<html>` se sobrescribe al arrancar.
- La resolución inicial no guarda nada.
- `setTheme` y `toggle` aplican el atributo, actualizan `theme()` y guardan; varias llamadas seguidas dejan guardado el último.
- Si `setItem` lanza error, el tema cambia igual y no se propaga la excepción.
- Un cambio posterior de `matchMedia` no cambia el tema.
- Con `PLATFORM_ID` de servidor: `theme()` es `null` y no se accede ni al DOM ni al almacenamiento.

**`theme-init.spec.ts`** (FR-7)

- Ejecuta el contenido de `theme/theme-init.js` en jsdom con la tabla anterior y comprueba `data-theme`; verifica que nunca escribe en el almacenamiento.
- Riesgo: cómo cargar el archivo como texto desde el builder de tests (`?raw` o lectura de fichero). Se decide en la tarea y, si ninguno funciona, se para y se consulta.

**`sui-theme-toggle.component.spec.ts`** (FR-1 a FR-3, FR-9, NFR-1 parte DOM, caso límite 5). Usa el servicio real con almacenamiento y `matchMedia` simulados.

- Hay un único `button` con `type="button"`, encontrado por su rol y nombre accesible.
- Tema claro → texto `moon` con `aria-hidden="true"` y nombre "Switch to dark theme"; tema oscuro → `sun` y "Switch to light theme".
- Clic → cambia el tema del servicio, el icono y el nombre (Enter y Espacio los da el `<button>` nativo; se valida en el navegador).
- Inputs personalizados se usan; vacío o solo espacios → valor por defecto.
- Dos instancias en el mismo fixture muestran siempre el mismo estado.
- Con un servicio sustituido por providers que devuelve `theme() === null`: no hay icono y el botón sigue teniendo nombre.
- (C2) El `<span>` del icono sigue existiendo con `aria-hidden="true"`, lleva la clase `visually-hidden` y el nombre accesible del botón no cambia.

**Comprobaciones de build** (C1, C3, C4; sin dependencias nuevas)

- Tras `pnpm nx run smooth-ui-demo:build`, ningún `.html` de `dist/apps/smooth-ui-demo/browser/` contiene `media="print"` ni `onload=` en la hoja de estilos, y en cada uno `<base href="/">` va antes de `<script src="theme-init.js">`, que va antes del primer `<link rel="stylesheet">`.
- Tras `pnpm nx run smooth-ui:build`, `dist/libs/smooth-ui/theme/theme.scss` contiene `--sui-color-accent-ring: var(--sui-accent-600)` en el bloque claro y `var(--sui-accent-400)` en el oscuro.

**Validación en navegador** (`/sdd-validate`, Chrome DevTools, sobre la demo servida y prerenderizada)

- FR-7: tres cargas con la red ralentizada (preferencia `dark`; sin preferencia y sistema oscuro; sin preferencia y sistema claro); el primer fotograma del trace de rendimiento ya muestra el tema esperado.
- NFR-1: Lighthouse/AXE sin violaciones en claro y en oscuro; contraste; foco visible; Tab, Enter y Espacio; un lector de pantalla anuncia "Switch to … theme" y no lee el nombre del icono.
- FR-2: tras recargar en oscuro, el botón aparece sin icono y sin moverse hasta que muestra `sun`.
- FR-10: `pnpm nx run smooth-ui:build` y comprobar que `dist/libs/smooth-ui/theme/` contiene `theme.scss` y `theme-init.js`.

## Cobertura de FR

| FR    | Dónde                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------- |
| FR-1  | Componente (plantilla, `ariaLabel`)                                                             |
| FR-2  | Componente (`icon`, `_isRendered`, tamaño fijo, `.visually-hidden` C2)                          |
| FR-3  | Componente (`<button>`, clic) + servicio (`toggle`)                                             |
| FR-4  | Servicio (`setTheme`/`toggle` guardan)                                                          |
| FR-5  | Servicio + script (preferencia válida)                                                          |
| FR-6  | Servicio + script (`matchMedia` una vez)                                                        |
| FR-7  | Script + `ng-package.json` + `index.html` (tras `<base>`, C4) + `inlineCritical: false` (C1)    |
| FR-8  | Servicio (`theme`, `setTheme`, `toggle`) + exportación en `src/index.ts`                        |
| FR-9  | Componente (inputs y normalización)                                                             |
| FR-10 | `ng-package.json` + `README.md` + `styles` de la demo                                           |
| NFR-1 | Componente (`<button>`, `aria-label`, `.visually-hidden` C2) + `theme.scss` (anillo de foco C3) |

## Correcciones tras la validación

Hallazgos de `/sdd-validate` (CHANGES REQUIRED). Lo que cambia ya está integrado arriba; aquí el porqué.

- **C1. Destello claro en la build prerenderizada (FR-7, criterio 5).** En producción, `@angular/build:application` mete en línea el CSS crítico (Beasties) solo con las reglas que coinciden con el HTML prerenderizado, que no lleva `data-theme` (lo pone `theme-init.js` en el cliente); las reglas `[data-theme='dark']` quedan fuera y la hoja completa se carga sin bloquear (`media="print"` + `onload`). Corrección: en `configurations.production` de `apps/smooth-ui-demo/project.json`, `"optimization": { "scripts": true, "styles": { "minify": true, "inlineCritical": false }, "fonts": true }` (forma verificada en `node_modules/@angular/build/src/builders/application/schema.json`). `development` ya tiene `optimization: false`. El `README.md` lo indica para consumidores con SSR/prerender.
- **C2. AXE `label-content-name-mismatch` (NFR-1, FR-2).** El texto del icono era visible y no forma parte del nombre accesible. Corrección: clase `.visually-hidden` en el `<span aria-hidden="true">`, como pide el nuevo FR-2.
- **C3. Contraste del anillo de foco en claro (NFR-1, WCAG 1.4.11 ≥ 3:1).** Contrastes calculados con la luminancia relativa WCAG y los valores de `theme.scss` (canvas claro `#f8f9fb`, surface claro `#ffffff`, canvas oscuro `#10141b`, surface oscuro `#151a22`):

  | Anillo                 | Canvas claro | Surface claro | Canvas oscuro | Surface oscuro |
  | ---------------------- | ------------ | ------------- | ------------- | -------------- |
  | `accent-400` `#8590f7` | 2,72 ✗       | 2,87 ✗        | 6,44          | 6,09           |
  | `accent-500` `#6e76ee` | 3,63         | 3,83          | 4,82          | 4,56           |
  | `accent-600` `#5a5fd8` | 4,91         | 5,17          | 3,57          | 3,38           |

  Corrección: claro → `accent-600` (4,91 / 5,17); oscuro se queda en `accent-400` (6,44 / 6,09). `docs/smoothui.html` define `accent-ring = accent-400` en ambos temas y su `--focus-ring` (sombra al 35 %) tampoco llega a 3:1, así que no sirve de referencia aquí.

- **C4. `theme-init.js` antes de `<base>` (FR-7, latente).** En `/docs/button` el navegador pide `/docs/theme-init.js`, recibe HTML y el script falla. Corrección: moverlo justo después de `<base href="/">` en `index.html` y en el ejemplo del `README.md`.

**Fuera de esta ronda** (opcionales del reviewer): `<main>` en la demo, contraste del borde del botón y `allowedHosts` del servidor SSR.
