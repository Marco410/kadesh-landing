# Layout

Barra fija y pie. La barra es global; el pie solo en páginas de persuasión (home, blog, conócenos, novedades…), no en herramientas (`/animales`, `/veterinarias`, `/perfil`). En Recursos el pie enlaza Blog, Novedades y Conócenos.

## Nav

**Inicio** es un enlace a `/`. Un clic lleva a la portada; si ya estás ahí, sube al tope. No es un menú de anclas: Veterinarias y Animales del nav son las herramientas (`/veterinarias`, `/animales`), no las secciones de la home.

El logo también va a `/`.

Con sesión, **Mi perfil** aparece junto a Contacto (escritorio y menú móvil) además del menú del avatar. Sin sesión no se muestra: `/perfil` pide login.

## Tamaño de fuente

A la izquierda del toggle de tema hay un botón **Aa**. Abre un panel fijo (portal, medidas en **px**) con el slider. No va inline en el nav: si el slider estuviera en `rem`, al arrastrarlo el menú se reacomoda y el control se mueve bajo el cursor.

Escala el texto de la app vía `html { font-size }` y `--kadesh-font-scale` (85%–130%, default 100%). Se guarda en `localStorage` (`kadesh-font-scale`). Un script en el `<head>` lo aplica antes del primer paint para no parpadear.

No promete “accesibilidad certificada”: es un control de comodidad.

## Ayuda (WhatsApp)

Botón fijo en toda la plataforma (esquina). No es de una clínica: es para dudas de KADESH, errores, cuenta, reportar un animal o dar de alta una clínica. Elige un mensaje y se abre WhatsApp. El de reclamo de ficha (`Escribir por WhatsApp` en revisión) sigue siendo de esa clínica.
