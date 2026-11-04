---
name: KADESH
description: Santuario digital de bienestar animal en México
colors:
  kadesh: "#216BFA"
  kadesh-600: "color-mix(in srgb, #216BFA 86%, black)"
  surface: "#ffffff"
  surface-muted: "#f7f8fa"
  ink: "#121212"
  ink-body: "#3a3a3a"
  ink-muted: "#5a5a5a"
  inverse: "#ffffff"
  night: "#161b24"
  night-raised: "#1c2433"
  dark-ink: "#eef1f6"
typography:
  display:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  section: "96px"
  cluster: "24px"
components:
  button-primary:
    backgroundColor: "{colors.kadesh}"
    textColor: "{colors.inverse}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.kadesh-600}"
  button-on-brand:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.kadesh}"
    rounded: "{rounded.lg}"
    padding: "16px 28px"
---

## Overview

KADESH usa un campo de marca **comprometido**: el azul `#216BFA` ocupa el hero en claro. En oscuro el campo es `night` con wash de marca. A la izquierda, dos trabajos: veterinarias cerca (CTA blanco) y dar de alta o buscar un animal (perdí, encontré, dar en adopción, adoptar). A la derecha, un **recuadro-mapa**: huellas con los colores de estado del directorio (`getStatusColor`) y pines de veterinaria en azul de marca. No es collage de pet shop ni la K recortando una foto.

La fuente de color es `src/app/globals.css` (`--color-kadesh`). `orange-*` es un alias legado de esa escala.

## Colors

Cambia **solo** `--color-kadesh`. Superficies claras: blanco y `#f7f8fa`. Oscuro: `--color-night` / `--color-night-raised` (tinta azulada, no OLED). No reintroducir naranja de marca.

## Typography

Poppins es display y UI (400–900). Inter es fallback. Títulos `font-black` con tracking negativo. Cuerpo 18px, medida ~65ch en bloques de lectura (qué es / FAQ).

Panel con sesión (`/perfil`, `/notificaciones`): **Inter variable** (`font-dash`), con cifras tabulares. A más tamaño, menos tracking (títulos `-0.04em`, KPIs `-0.045em`). El sitio público conserva Poppins.

## Layout

Home: hero full-bleed → definición → animales → veterinarias → historias → donaciones (campo de marca) → cómo funciona (secuencia) → roadmap en tres columnas de estado → FAQ visible → newsletter. Ritmo de sección ~96px. Más aire arriba del H2 que debajo. `/donaciones` es página de lectura: recuento de destinos, luego CTA; sin cifras inventadas.

## Elevation & Depth

Sombras con offset y blur suave, tintadas al azul (`rgba(15,35,80,…)`). Sin halo de 0px. El recuadro del mapa es una superficie elevada blanca / `night-raised`. Donaciones en oscuro usa `kadesh-800`, no carbón.

## Shapes

Radios 12–16px en controles y tarjetas; CTAs primarios de listado pueden ser `full`. Iconos solo Hugeicons, trazo 1.5.

## Components

- CTA primario: relleno `bg-kadesh`, texto blanco, hover `bg-kadesh-600`.
- CTA sobre marca: blanco, texto `text-kadesh`.
- Secundario: borde 2px `border-kadesh`.
- FAQ: H3 pregunta + párrafo inmediato (nada oculto en acordeón).
- Home, veterinarias: tarjeta con recuadro-mapa (pin de marca), no avatar de letra.
- Directorio `/veterinarias`: herramienta lista + mapa, sin franja de héroe; ficha de fila con el mismo pin.
- Directorio `/animales`: misma herramienta (H1 en el panel, chips de radio). Filtros: Perdido / Encontrado / En adopción (color del pin) + tipo; el vacío nombra la búsqueda.
- Ficha `/veterinarias/[id]`: una pantalla en escritorio (mapa + contacto + horarios + reseñas); reseñas con scroll interno.
- Ficha `/animales/[id]`: herramienta (foto para reconocer, hechos, historial + mapa, comentarios). Sin héroe azul ni footer. Llamar y Cómo llegar en el encabezado. Lat/lng no se muestran.
- Alta `/animales/nuevo`: herramienta de 3 pasos (foto+tipo, cómo es, dónde), círculos 1–2–3 con check al completar, pie fijo Continuar/Publicar. El borrador sobrevive a un recarga. Sin héroe azul.

## Panel con sesión (Mi cuenta, 2026-11)

`/perfil` (todas sus vistas) y `/notificaciones` viven en un panel propio, sin la barra ni el pie del sitio. Es el mismo lenguaje que los paneles de kadesh-business, con los colores de Kadesh Pet. Código: `src/components/app-shell/` (ver su README) y `src/components/profile/shell/`.

- **Estructura**:
  - Menú lateral agrupado (Mi cuenta / Mis animales / Mis publicaciones / Mis veterinarias / Kadesh): títulos en versalitas, opción activa en píldora blanca que se desliza y globos rojos de pendientes. Se colapsa a iconos en escritorio; en móvil es un cajón.
  - Barra superior flotante de vidrio: migas, "Reportar animal", campana, tamaño de texto, tema y menú de cuenta.
  - Encabezado de vista: eyebrow, título `clamp(2rem, 1.4rem + 2.4vw, 2.85rem)` / `-0.04em` y descripción.
- **Superficies**:
  - Fondo cálido `#f6f5f3` / `#0b0b0b` con brillos azules (6–10 %) en las esquinas.
  - Tarjetas `#fff` / `#171717` de 24 px, borde casi invisible y sombra suave.
  - Los neutros del panel son cálidos, no los azulados del sitio (`night`).
- **Tokens**: `--dash-*` en `:root` / `.dark`, usados como `bg-dash-*`, `text-dash-*`, `border-dash-line`, sin repetir `dark:`.
- **KPIs**:
  - Uno oscuro (casi negro con radiales azules) para la cifra principal de la vista; uno tintado (kadesh-50 → 100; en oscuro, azul al 14 % → 6 %) para la segunda; el resto blancos.
  - Pastilla ↗/↘ y sparkline solo con historial real. Cuentan hacia arriba al aparecer.
- **Acento**:
  - El azul sólido o en degradado (kadesh-400 → 500 → 700, con el 500 al 12 % para que el texto blanco pase AA) va solo en la acción principal y en la barra pico de las gráficas.
  - Los chips de filtro activos van en tinta (negro en claro, blanco en oscuro).
  - Sin naranja; el morado es de Kadesh AI.
- **Contraste**:
  - `dash-muted` pasa AA sobre canvas y tarjetas; sobre el KPI tintado el texto va en `dash-soft`.
  - `dash-faint` no pasa AA: solo es decorativo.
- **Movimiento**:
  - Una curva `[0.16, 0.84, 0.44, 1]`; entradas fade-up de 0.55 s escalonadas 50 ms (tope 8); indicadores con resorte; lift en lo tocable.
  - Todo se apaga con "reducir movimiento".

## Do's and Don'ts

- Do: un solo hex de marca en `globals.css`.
- Do: responder la H2 en las primeras 40–60 palabras.
- Don't: hardcodear `#216BFA` en componentes.
- Don't: en el panel con sesión, hex sueltos ni parejas `dark:` junto a un token `dash-*` (la pareja gana por especificidad).
- Don't: kickers, emojis de sistema, ni testimonios inventados.
- Don't: FAQPage como promesa de rich result de Google; existe para extractabilidad.
