# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dueños de mascotas, rescatistas, adoptantes y veterinarias en México que necesitan localizar un animal perdido, publicar un reporte, encontrar atención veterinaria cercana o apoyar un rescate. [inferido del copy público y las rutas `/animales`, `/veterinarias`, donaciones.]

## Product Purpose

KADESH es una plataforma digital de bienestar animal: conecta a quien busca adoptar, rescatar o reunirse con una mascota perdida, con rescatistas, veterinarias y refugios de su zona. El éxito es una conexión útil (reporte visto, veterinaria encontrada, donación o adopción), no tráfico vacío.

## Positioning

Santuario digital para el bienestar animal en México: reportes, directorio veterinario, historias y donaciones en un solo lugar, con tono de misión (compasión + tecnología) y no de marketplace genérico de mascotas.

## Operating Context

App Next.js contra un backend KeystoneJS (GraphQL). Sesión en `localStorage`. Mapas de Google para animales y veterinarias. Pagos de donación vía Stripe. Comunidad en Instagram y Facebook.

## Capabilities and Constraints

Confirmado en producto: reportes de animales, directorio de veterinarias con radio de 5 km, blog, donaciones Stripe, registro de veterinarias, newsletter, login (correo y Google), planes de ventas. Roadmap público mezcla hecho y pendiente (app móvil, tienda, recompensas). No fabricar métricas de rescates, precios de planes ni testimonios.

## Brand Commitments

- Nombre: KADESH / Kadesh Pet. Lema: «Conectando vidas, rescatando almas.»
- Color de marca: `#216BFA`, definido solo en `src/app/globals.css` como `--color-kadesh`.
- Identidad: logo K, fotografía de animales, tipografía Poppins. No salir de esa forma.
- Voz: directa, compasiva, en español de México. No filtrar implementación (Keystone, prompts, proveedores) al visitante.
- [Inferido / aprobado por el usuario 2026-09-13:] rediseño de craft sobre la composición actual, no un mundo visual nuevo.

## Evidence on Hand

Copy y secciones de `src/app/page.tsx` y `src/components/home/`. Fundador declarado en JSON-LD: Marco Castañeda, ingeniero. Redes: Facebook e Instagram `@kadesh.pet`. Donación: enlace Stripe existente. No hay casos de éxito verificados en repo: no inventar historias; el blog real alimenta «Historias».

## Product Principles

1. La conexión local (animal o veterinaria cerca) es el mecanismo, no el eslogan.
2. El color y el lema son la marca; el craft se eleva sin cambiar el sujeto.
3. Copy y schema solo afirman lo que el producto hace hoy.
4. Una fuente de color (`--color-kadesh`); el resto de la UI la consume.
5. Accesible: contraste de marca, motion reducible, contenido visible sin JS.
