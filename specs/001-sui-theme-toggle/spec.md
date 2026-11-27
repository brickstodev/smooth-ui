# Spec 001 — Theme toggle

Status: implemented

## Contexto y objetivo

La librería define sus tokens de diseño en dos temas, claro y oscuro, pero no ofrece ninguna forma de elegir entre ellos. Este cambio añade un selector de tema reutilizable: un único botón que alterna entre claro y oscuro, cambia el tema de toda la página y recuerda la elección del usuario. La web de documentación oficial de la librería será su primer consumidor.

## Usuarios

- Persona que visita una aplicación que usa la librería y quiere leerla en claro o en oscuro.
- Desarrollador que integra la librería en su aplicación y necesita un selector de tema listo para usar.

## Historias de usuario

- US-1. Como visitante, quiero cambiar entre tema claro y oscuro para leer con comodidad según mi entorno.
- US-2. Como visitante, quiero que se recuerde mi elección para no tener que repetirla en cada visita.
- US-3. Como visitante que entra por primera vez, quiero ver el tema de mi sistema operativo para que la página encaje con mi entorno sin hacer nada.
- US-4. Como visitante con teclado o lector de pantalla, quiero usar el selector sin ratón y saber a qué tema cambiará el botón.
- US-5. Como desarrollador, quiero cambiar los textos del selector y consultar el tema activo para adaptar el selector a mi aplicación.

## Definiciones

- **Tema activo**: el tema (claro u oscuro) aplicado en ese momento al documento mediante el atributo `data-theme` de su elemento raíz.
- **Preferencia guardada**: el último tema elegido, con el botón o por código desde el punto compartido, guardado en el navegador.
- **Tema del sistema**: el esquema de color que el sistema operativo o el navegador indican como preferido.

## Requisitos funcionales

- FR-1: EL SISTEMA muestra un único botón que lleva el icono del tema al que se cambiará al activarlo (según FR-2) y un nombre accesible que describe esa acción.
- FR-2: MIENTRAS el tema activo sea claro, EL SISTEMA pone en el botón el icono 'moon', y MIENTRAS sea oscuro, el icono 'sun'. MIENTRAS la página generada en el servidor no conozca aún el tema real del cliente, el botón no lleva ningún icono. El botón tiene el mismo tamaño con y sin icono. El icono es el dibujo decorativo del componente de iconos (spec 002), con el tamaño md del tema (20 px por defecto) y oculto a las tecnologías de asistencia; el nombre accesible es solo el de FR-9.
- FR-3: CUANDO el usuario activa el botón con clic, Enter o Espacio, EL SISTEMA aplica el otro tema a toda la página y actualiza el icono y el nombre accesible del botón.
- FR-4: CUANDO el tema cambia, con el botón o por código, EL SISTEMA guarda ese tema como preferencia guardada.
- FR-5: CUANDO la página se carga y existe una preferencia guardada válida, EL SISTEMA aplica ese tema.
- FR-6: CUANDO la página se carga sin preferencia guardada, EL SISTEMA aplica el tema del sistema y no sigue sus cambios posteriores hasta la siguiente carga de la página (navegar dentro de la aplicación sin recargar no lo vuelve a leer).
- FR-7: EL SISTEMA aplica el tema inicial antes de que se pinte por primera vez la página, de modo que no se vea nunca el otro tema durante la carga. Para ello la librería distribuye un fragmento previo al arranque, que la aplicación consumidora incluye en su página y que solo lee la preferencia guardada (o el tema del sistema) y fija el tema activo.
- FR-8: EL SISTEMA ofrece a la aplicación consumidora un único punto compartido, independiente del selector, para leer el tema activo, enterarse de sus cambios y cambiarlo por código. Un cambio por código se aplica y se guarda igual que uno hecho con el botón, y todos los selectores lo reflejan.
- FR-9: EL SISTEMA usa por defecto como nombre accesible los textos en inglés "Switch to light theme" y "Switch to dark theme", y permite a la aplicación consumidora sustituir cada uno por separado. Un texto no indicado, vacío o solo con espacios conserva su valor por defecto, de modo que el botón nunca queda sin nombre accesible.
- FR-10: EL SISTEMA distribuye los estilos de ambos temas dentro del paquete publicado de la librería, en un formato que la aplicación consumidora puede incluir desde su configuración de estilos sin copiarlos, y la documentación de uso de la librería explica cómo incluirlos.

## Requisitos no funcionales

- NFR-1: El selector cumple WCAG 2.1 AA (contraste, foco visible, nombres accesibles) y no tiene ninguna violación de AXE en ninguno de los dos temas. Las comprobaciones automáticas cubren lo verificable en el DOM (rol de botón, nombre accesible, activación por teclado); AXE y el contraste se validan en un navegador.
- NFR-2: Lo único que se guarda en el navegador es la preferencia de tema; no hay red, telemetría ni registro.
- NFR-3: La página se puede generar en el servidor o prerenderizar sin errores aunque no exista navegador ni almacenamiento.

## Casos límite

- SI la preferencia guardada no es exactamente "light" ni "dark" (incluidas variantes con mayúsculas o espacios), ENTONCES EL SISTEMA la ignora y aplica el tema del sistema.
- SI el almacenamiento del navegador no está disponible o falla, ENTONCES EL SISTEMA sigue cambiando el tema durante la visita, sin guardarlo y sin mostrar errores.
- SI el sistema no indica ningún esquema de color preferido, ENTONCES EL SISTEMA aplica el tema claro.
- CUANDO el usuario activa el botón varias veces seguidas, EL SISTEMA alterna y guarda el tema en cada activación, de modo que la preferencia guardada es siempre el último tema elegido.
- CUANDO hay varios selectores en la misma página, EL SISTEMA los mantiene todos con el mismo tema activo.

## Fuera de alcance

- Una tercera opción "Sistema" que siga al sistema operativo de forma continua.
- Detectar cambios de tema hechos fuera del sistema: ni los de otras pestañas (cada una lo toma al recargar) ni los de otro código que modifique el atributo de tema. Al arrancar, el sistema sobrescribe cualquier tema previo del documento.
- Avisar a la aplicación consumidora mediante un evento del propio selector.
- Temas distintos de claro y oscuro, o temas definidos por la aplicación consumidora. El selector es binario a propósito: añadir temas requerirá una spec nueva que rediseñe el control.

## Criterios de finalización

- Todos los FR, NFR y casos límite tienen al menos una comprobación automática en verde, salvo la ausencia de destello en la web real, AXE, el contraste y el anuncio del lector de pantalla, que se validan a mano en un navegador. La elección del tema inicial que hace el fragmento previo al arranque sí tiene comprobación automática.
- El selector funciona solo con teclado y un lector de pantalla anuncia a qué tema cambiará (validado a mano).
- AXE no da ninguna violación en el selector, en tema claro y en oscuro, comprobado a mano en un navegador durante la validación (sin dependencias nuevas).
- El paquete construido de la librería incluye los estilos de ambos temas, y la web de documentación los usa desde la librería, no desde una copia.
- La web de documentación muestra el selector y, cargada con la red ralentizada en tres casos (preferencia "dark" guardada; sin preferencia y sistema oscuro; sin preferencia y sistema claro), el primer fotograma pintado ya muestra el tema esperado.
- Lint, tests y build de la librería y de la web de documentación en verde.

## Preguntas abiertas

- Ninguna por ahora.
