# Spec 002 — Icon

Status: implemented

## Contexto y objetivo

La librería no sabe dibujar iconos. El selector de tema (spec 001) los representa de forma provisional, con su nombre como texto oculto, y los componentes que vienen después (botón, selector desplegable, avisos...) los necesitan. Este cambio añade un componente de icono reutilizable con un set de 79 iconos: los 44 de la referencia de diseño, los mismos que usa Figma, y 35 más que el propietario añadió después con el mismo estilo. Además, sustituye el texto oculto del selector de tema por el icono real, lo que modifica la spec 001.

## Usuarios

- Desarrollador que integra la librería y quiere poner iconos coherentes con el diseño en su aplicación.
- Desarrollador de la propia librería que compone otros componentes con iconos.
- Persona que visita una aplicación que usa la librería, también con lector de pantalla o en modo de alto contraste.

## Historias de usuario

- US-1. Como desarrollador, quiero mostrar cualquier icono del set indicando solo su nombre para no copiar dibujos a mano.
- US-2. Como desarrollador, quiero que el icono tome el tamaño y el color del texto que lo rodea, o uno de los tamaños del tema, para no tener que darle tamaño ni color a mano.
- US-3. Como visitante con lector de pantalla, quiero que los iconos decorativos no me interrumpan y que los que tienen significado se anuncien con un nombre.
- US-4. Como visitante, quiero ver los iconos ya dibujados en el primer pintado de una página generada en el servidor, sin que la página se mueva al aparecer.
- US-5. Como visitante, quiero ver en el selector de tema el dibujo del sol o de la luna para reconocer la acción de un vistazo.

## Definiciones

- **Set de iconos**: 79 iconos, en este orden: check, x, chevron-down, chevron-up, chevron-right, chevron-left, arrow-right, arrow-left, arrow-up, arrow-down, plus, minus, plus-circle, minus-circle, search, info, alert-triangle, alert-circle, check-circle, x-circle, star, heart, thumbs-up, thumbs-down, user, settings, bell, calendar, mail, message-circle, phone, lock, shield, key, eye, eye-off, trash, edit, save, download, upload, undo, redo, refresh, loader, more-horizontal, more-vertical, filter, external-link, link, share, copy, sun, moon, menu, list, home, image, camera, play, pause, file, folder, bookmark, tag, credit-card, shopping-cart, gift, map-pin, globe, grid, circle, square, maximize, minimize, clock, help, log-out, log-in. 44 vienen de la referencia de diseño; los 35 restantes (arrow-up, arrow-down, plus-circle, minus-circle, alert-circle, thumbs-up, thumbs-down, message-circle, phone, shield, key, save, undo, redo, loader, link, share, list, camera, play, pause, folder, bookmark, tag, credit-card, shopping-cart, gift, map-pin, globe, circle, square, maximize, minimize, log-out, log-in) los añadió el propietario y no están en la referencia.
- **Icono decorativo**: icono oculto a las tecnologías de asistencia, porque su significado ya lo da el texto o el nombre accesible del contenedor.
- **Etiqueta**: texto opcional que da al icono un nombre accesible propio. Una etiqueta está **vacía** si no se indica, no tiene texto o solo tiene espacios en blanco.

## Requisitos funcionales

- FR-1: EL SISTEMA dibuja el icono del set cuyo nombre indica la aplicación consumidora con su forma (la de la referencia de diseño en los 44 que vienen de ella, la que fijó el propietario en los demás) y el estilo común: caja de 24x24, trazo de 1,75 unidades de esa caja que escala con el icono, extremos y uniones redondeados, sin relleno.
- FR-2: EL SISTEMA ofrece los nombres del set como un conjunto cerrado, de modo que un nombre fuera del set se detecta al compilar la aplicación consumidora, y también como una lista que esta puede recorrer.
- FR-3: CUANDO cambian el nombre, el tamaño o la etiqueta, EL SISTEMA actualiza el dibujo, el tamaño y el papel accesible del icono sin recargar la página.
- FR-4: MIENTRAS no se indique un tamaño, EL SISTEMA dibuja el icono cuadrado con el tamaño de letra de su contenedor (1em); CUANDO se indica xs, sm, md o lg, usa el tamaño de icono del tema correspondiente (14, 16, 20 o 24 px por defecto) y sigue sus cambios si el tema lo redefine.
- FR-5: EL SISTEMA dibuja el icono en una caja cuadrada del tamaño de FR-4, con el dibujo centrado en ella, que mantiene ese tamaño exacto en ambos ejes aunque su contenedor reparta el espacio entre varios elementos; no se alinea por sí mismo con el texto ni con otros elementos que lo acompañen.
- FR-6: EL SISTEMA dibuja el trazo con el color del texto de su contenedor en cada momento, en tema claro y en oscuro.
- FR-7: MIENTRAS la etiqueta esté vacía, EL SISTEMA trata el icono como decorativo: queda oculto a las tecnologías de asistencia y no recibe el foco.
- FR-8: MIENTRAS la etiqueta tenga texto, EL SISTEMA expone el icono como una imagen cuyo nombre accesible es esa etiqueta sin espacios en blanco al principio ni al final, sin que reciba el foco.
- FR-9: EL SISTEMA incluye el dibujo y su presentación completos (trazo, sin relleno, extremos redondeados) en la página generada en el servidor o prerenderizada, sin depender de nada que se añada en el cliente: nunca se ve relleno ni sin estilo, y su aparición no desplaza el resto de la página. No se aplica al icono del selector de tema, que sigue la regla de FR-2 de la spec 001 (sin icono hasta conocer el tema del cliente).
- FR-10: MIENTRAS el selector de tema deba mostrar un icono según FR-2 de la spec 001, EL SISTEMA dibuja en el botón el icono decorativo 'moon' o 'sun' con el tamaño md del tema (20 px por defecto), en lugar del texto oculto. Sustituye la última frase de esa FR-2; el resto se mantiene.

## Requisitos no funcionales

- NFR-1: El icono y el selector de tema cumplen WCAG 2.1 AA y no tienen ninguna violación de AXE en tema claro ni oscuro. El contraste no textual (3:1) de un icono con etiqueta depende del color que elige la aplicación consumidora y es responsabilidad suya.
- NFR-2: La página se genera en el servidor o se prerenderiza sin errores aunque no exista navegador.
- NFR-3: Sin dependencias de runtime nuevas, sin red y sin cargar recursos externos para dibujar los iconos.
- NFR-4: Cada icono pintado añade a la página solo su propio dibujo, no el set completo.

## Casos límite

- SI el nombre no está en el set, falta o está vacío (también si antes era válido), ENTONCES EL SISTEMA no dibuja nada (desaparece el dibujo anterior), conserva el hueco de su tamaño, lo trata como decorativo aunque tenga etiqueta y no lanza ningún error.
- SI el tamaño indicado no es xs, sm, md ni lg, ENTONCES EL SISTEMA se comporta como si no se hubiera indicado (1em).
- MIENTRAS el sistema operativo esté en modo de colores forzados o alto contraste, EL SISTEMA mantiene el trazo visible.
- MIENTRAS el contenedor cambie de color (hover, deshabilitado, cambio de tema), EL SISTEMA dibuja el icono con el color nuevo.
- CUANDO hay muchos iconos iguales en la misma página, EL SISTEMA los dibuja todos de forma independiente y correcta.

## Fuera de alcance

- Iconos rellenos, de varios colores, con grosor de trazo configurable o animados, y un tooltip con el nombre del icono.
- Iconos propios de la aplicación consumidora: el set es cerrado y ampliarlo exige editar la librería. Lo decide el propietario aunque roce el principio 7 de la constitución.
- Reflejar flechas y chevrons en páginas de derecha a izquierda.
- Integrar iconos en el botón, el selector desplegable u otros componentes: cada uno lo hará en su spec.
- Alinear el icono con el texto u otros elementos que lo acompañan: lo hace cada aplicación consumidora con sus propios estilos.

## Criterios de finalización

- Se cumplen todos los FR, NFR y casos límite.
- La web de documentación muestra los 79 iconos con su nombre, los cuatro tamaños, el tamaño 1em y un ejemplo con etiqueta, en tema claro y oscuro.
- El selector de tema muestra el sol o la luna en tamaño md y su tamaño no cambia al aparecer el icono.
- El HTML prerenderizado de la web de documentación ya contiene el dibujo y la presentación de sus iconos.
- La spec 001 queda actualizada mediante un cambio: su FR-2 refleja FR-10 y su "Fuera de alcance" ya no incluye el dibujo de los iconos; su `Status` sigue en `implemented`.
- Lint, tests y build de la librería y de la web de documentación en verde.

## Preguntas abiertas

- Ninguna por ahora.

## Registro de cambios

- 2026-11-27: el set pasa de 44 a 79 iconos por decisión del propietario (35 nuevos fuera de la referencia de diseño) y su orden deja de ser el de la referencia. Afecta a la definición del set, FR-1 y el criterio de finalización 2.
