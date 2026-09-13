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
  dark-surface: "#121212"
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

KADESH usa un campo de marca **comprometido**: el azul `#216BFA` ocupa regiones enteras (hero, donaciones, CTAs), no acentos sueltos. La composición de la home se mantiene — lema grande a la izquierda, marca K a la derecha — con craft más quieto y tipografía más tensa.

La fuente de color es `src/app/globals.css` (`--color-kadesh`). `orange-*` es un alias legado de esa escala.

## Colors

Cambia **solo** `--color-kadesh`. La escala 50–900, `kadesh-*`, `orange-*`, scrollbar, selection y caret se derivan con `color-mix`. Superficies: blanco y `#f7f8fa`. Oscuro: `#121212`. No reintroducir naranja de marca.

## Typography

Poppins es display y UI (400–900). Inter es fallback. Títulos `font-black` con tracking negativo. Cuerpo 18px, medida ~65ch en bloques de lectura (qué es / FAQ).

## Layout

Home: hero full-bleed → definición → animales → veterinarias → historias → donaciones (campo de marca) → cómo funciona (secuencia) → roadmap en tres columnas de estado → FAQ visible → newsletter. Ritmo de sección ~96px. Más aire arriba del H2 que debajo.

## Elevation & Depth

Sombras con offset y blur suave, tintadas al azul (`rgba(15,35,80,…)`). Sin halo de 0px. El hero usa un wash radial blanco sobre `--color-kadesh`, no orbes genéricos.

## Shapes

Radios 12–16px en controles y tarjetas; CTAs primarios de listado pueden ser `full`. Iconos solo Hugeicons, trazo 1.5.

## Components

- CTA primario: relleno `bg-kadesh`, texto blanco, hover `bg-kadesh-600`.
- CTA sobre marca: blanco, texto `text-kadesh`.
- Secundario: borde 2px `border-kadesh`.
- FAQ: H3 pregunta + párrafo inmediato (nada oculto en acordeón).

## Do's and Don'ts

- Do: un solo hex de marca en `globals.css`.
- Do: responder la H2 en las primeras 40–60 palabras.
- Don't: hardcodear `#216BFA` en componentes.
- Don't: kickers, emojis de sistema, ni testimonios inventados.
- Don't: FAQPage como promesa de rich result de Google; existe para extractabilidad.
