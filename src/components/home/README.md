# Home

La portada de KADESH es una página de **persuasión**: el visitante debe entender qué es la plataforma, ver animales y veterinarias reales, y actuar (reportar, buscar, donar).

## Primer vistazo

El hero presenta **dos trabajos**, no un par de botones equivalentes:

1. **Veterinarias cerca** — un CTA blanco a `/veterinarias`.
2. **Dar de alta o buscar un animal** — cuatro acciones: perdí, encontré, dar en adopción (van a `/animales/nuevo?status=…`) y adoptar (va a `/animales?status=in_adoption`). Los puntos de color coinciden con los pines del mapa.

El lema se queda. El párrafo nombra esas dos funciones. Si no hay sesión, el alta redirige a registro conservando el `status`.

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

Personalidad **Premium**. Momento autorial: el recuadro-mapa se revela y los pines (huellas por estado + veterinarias) caen en secuencia. El pin «Perdido» pulsa. Las calles se desplazan lento. `prefers-reduced-motion` deja el mapa ya poblado.

## Secciones y anclas

Inicio, qué es, animales, veterinarias, historias, donaciones, cómo funciona, roadmap, preguntas frecuentes (`#preguntas-frecuentes`). El dropdown de Inicio debe coincidir con estas anclas.

## Veterinarias en portada

No reutiliza `VeterinaryCard` del directorio (esa ficha es una fila para el mapa). En home, cada clínica es una tarjeta con recuadro-mapa (el mismo pin de marca del hero), abierto/cerrado, distancia y llamada. Va a `/veterinarias/[id]`, no al índice. No se exporta del barrel: solo la usa esta sección.
