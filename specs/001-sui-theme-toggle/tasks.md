# Tareas 001 — Theme toggle

Plan: `specs/001-sui-theme-toggle/plan.md` (Status: approved). Rutas relativas a `libs/smooth-ui/` salvo que se indique otra cosa. En cada tarea, primero los tests (rojo) y después el código.

- [x] **T1. Tipo, constantes y resolución inicial del servicio.** FR-5, FR-6, NFR-3
- Hecho cuando: existen `SUI_THEME`, la clave `'sui-theme'` y `SuiThemeService` con `theme()`; `theme.service.spec.ts` cubre la tabla de casos compartida, la sobrescritura del `data-theme` previo, que la resolución no guarda nada, que un cambio posterior de `matchMedia` no cambia el tema y que en servidor `theme()` es `null` sin tocar DOM ni almacenamiento; `pnpm nx run smooth-ui:test` en verde.

- [x] **T2. Cambiar y guardar el tema desde el servicio.** FR-4, FR-8, casos límite 2 y 4
- Hecho cuando: `setTheme()` y `toggle()` aplican `data-theme`, actualizan `theme()` y guardan; los tests comprueban que varias llamadas seguidas dejan guardado el último tema y que si `setItem` lanza error el tema cambia igual sin propagar la excepción; tests en verde.

- [x] **T3. Script previo al arranque `theme/theme-init.js`.** FR-5, FR-6, FR-7, caso límite 2
- Hecho cuando: `src/lib/services/theme-init.spec.ts` ejecuta el script en jsdom con la misma tabla de casos que T1, comprueba `data-theme` y que nunca escribe en el almacenamiento; tests en verde. Si el archivo no se puede cargar como texto en el builder de tests, se para y se consulta.

- [x] **T4. Componente: botón, nombre accesible e icono.** FR-1, FR-2, FR-9, NFR-1 (parte DOM)
- Hecho cuando: `SuiThemeToggleComponent` renderiza un único `<button type="button">` encontrado por rol y nombre; en claro muestra `moon` con `aria-hidden="true"` y "Switch to dark theme", en oscuro `sun` y "Switch to light theme"; los inputs personalizados se usan y los vacíos o con solo espacios caen al valor por defecto; tests en verde.

- [x] **T5. Componente: alternar, varias instancias y render sin tema.** FR-2, FR-3, FR-8, caso límite 5
- Hecho cuando: los tests comprueban que el clic cambia el tema del servicio, el icono y el nombre; que dos instancias muestran siempre el mismo estado; y que con un servicio sustituido por providers con `theme() === null` no hay icono y el botón conserva su nombre; el icono solo aparece tras `afterNextRender`; tests en verde.

- [x] **T6. Estilos del componente.** FR-2, NFR-1
- Hecho cuando: `sui-theme-toggle.component.scss` usa solo tokens `--sui-*` (sin hex), tamaño fijo `--sui-size-control-md`, hover y `:focus-visible` según el plan, sin transiciones; `pnpm nx run smooth-ui:lint` en verde.

- [x] **T7. Exportar la API y publicar `theme/` en el paquete.** FR-7, FR-8, FR-10
- Hecho cuando: `src/index.ts` exporta `SuiThemeToggleComponent`, `SuiThemeService` y `SUI_THEME`; `ng-package.json` publica `theme/` como asset; tras `pnpm nx run smooth-ui:build`, `dist/libs/smooth-ui/theme/` contiene `theme.scss` y `theme-init.js`, y `pnpm nx run smooth-ui:typecheck` está en verde.

- [x] **T8. Documentación de uso en el `README.md` de la librería.** FR-7, FR-10
- Hecho cuando: el `README.md` explica cómo incluir `theme.scss` en `styles`, cómo cargar `theme-init.js` como script bloqueante en el `<head>`, en inglés y sin explicar el uso de cada componente (eso lo documenta la app demo); `pnpm nx format:check` en verde.

- [x] **T9. Integrar el selector en la web de documentación.** FR-7, FR-10, criterios de finalización
- Hecho cuando: `apps/smooth-ui-demo/project.json` añade `libs/smooth-ui/theme/theme.scss` a `styles` y sirve `theme-init.js` desde `libs/smooth-ui/theme` sin copias; `index.html` carga `<script src="theme-init.js"></script>` en el `<head>`; la app muestra `<sui-theme-toggle />`; `pnpm nx run-many -t lint test build typecheck` y `pnpm nx format:check` en verde, con la ruta prerenderizada sin errores.

La validación en navegador (destello en tres casos, AXE, contraste, teclado y lector de pantalla) queda para `/sdd-validate`.

## Correcciones tras la validación

Ver plan, sección "Correcciones tras la validación" (C1–C4).

- [x] **T10. Componente y tema: icono oculto visualmente y anillo de foco con contraste.** FR-2, NFR-1 (C2, C3)
- Hecho cuando: un test nuevo de `sui-theme-toggle.component.spec.ts` (rojo antes del cambio) comprueba que el `<span>` del icono existe con `aria-hidden="true"` y la clase `visually-hidden`, y que el nombre accesible sigue siendo "Switch to dark theme"; `.visually-hidden` está en el `.scss` del componente según el plan, sin hex; en `theme/theme.scss` el bloque claro tiene `--sui-color-accent-ring: var(--sui-accent-600);` y el oscuro sigue con `var(--sui-accent-400)`, sin renombrar variables (contrastes del plan: 4,91 y 5,17 en claro, 6,44 y 6,09 en oscuro, todos ≥ 3:1); `pnpm nx run smooth-ui:test`, `smooth-ui:lint` y `smooth-ui:build` en verde y `dist/libs/smooth-ui/theme/theme.scss` contiene el nuevo valor.

- [x] **T11. Demo y README: hoja de estilos bloqueante y script tras `<base>`.** FR-7, FR-10 (C1, C4)
- Hecho cuando: `configurations.production` de `apps/smooth-ui-demo/project.json` tiene `"optimization": { "scripts": true, "styles": { "minify": true, "inlineCritical": false }, "fonts": true }`; en `apps/smooth-ui-demo/src/index.html` `<script src="theme-init.js"></script>` va justo después de `<base href="/" />`; el `README.md` muestra ese orden y explica en inglés que con SSR/prerender hay que poner `inlineCritical: false`; tras `pnpm nx run smooth-ui-demo:build`, ningún `.html` de `dist/apps/smooth-ui-demo/browser/` contiene `media="print"` ni `onload=` y en cada uno `<base href="/">` precede a `<script src="theme-init.js">`, que precede al primer `<link rel="stylesheet">`; `pnpm nx run-many -t lint test build typecheck` y `pnpm nx format:check` en verde.

Después, nueva `/sdd-validate`: destello en los tres casos con la build prerenderizada, AXE en claro y oscuro, contraste del foco y carga en una ruta anidada.
