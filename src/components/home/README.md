# Home

La portada de KADESH es una página de **persuasión**: el visitante debe entender qué es la plataforma, ver animales y veterinarias reales, y actuar (reportar, buscar, donar).

## Promesa

«Conectando vidas, rescatando almas.» KADESH es el santuario digital para reportes de animales, directorio veterinario, historias y donaciones en México.

## Color

El azul de marca vive **solo** en `src/app/globals.css` como `--color-kadesh`. Las clases `bg-kadesh`, `text-kadesh` y el alias legado `orange-*` salen de ahí. No hardcodear `#216BFA` en componentes.

## Copy

- Respuesta directa bajo cada H2 de pregunta (GEO).
- FAQ visible (no acordeón oculto) alineada con `constants.ts` y el JSON-LD.
- No inventar métricas, testimonios ni precios. El bloque de historias usa el blog real.
- Tono: directo, compasivo, español de México. Nunca nombramos Keystone, Stripe ni el stack al visitante.

## Motion

Personalidad **Premium**. Un momento autorial en el hero (wipe del titular + marca). El resto explica llegada al scroll, con `prefers-reduced-motion`. GSAP + ScrollTrigger; el contenido permanece visible si JS falla.

## Secciones y anclas

Inicio, qué es, animales, veterinarias, historias, donaciones, cómo funciona, roadmap, preguntas frecuentes (`#preguntas-frecuentes`). El dropdown de Inicio debe coincidir con estas anclas.
