# Novedades

Página pública del **changelog** de la plataforma de bienestar animal (`/novedades`). No es el roadmap: el roadmap dice qué opera y qué sigue; aquí van las versiones ya publicadas, con fecha y notas.

## Promesa

Quien llega debe poder responder: qué salió, cuándo, y qué cambió para reportar, adoptar o buscar una veterinaria. Sin métricas inventadas. Sin nombrar Keystone, Stripe ni el stack.

## Datos

Las entradas viven en `SystemRelease` (Keystone). Esta página pide `product` **pet** o **all**. KADESH Negocios usa `saas`. `all` aparece en ambos. El backend oculta lo no publicado (`isPublished`) salvo admin.

Cuerpo: párrafos, listas con `-` / `*` / `•` y **negritas**. Si pasa de 480 caracteres, se pliega.

## UI

Timeline de la más reciente a la anterior. La primera tarjeta lleva el sello «Más reciente». Vacío: aún no hay versiones + enlace al roadmap. Error: mensaje corto, sin detalle técnico. «Cargar más» de a 8.

FAQ visible (no acordeón), alineada con `novedades-seo.ts`. El JSON-LD de la ruta cubre WebPage, CollectionPage y breadcrumb; las preguntas viven en HTML para quien lee y para motores de respuesta.

CTA al pie: **Ver veterinarias** y **Ver animales**, no un panel B2B.

## Copy

Tono directo, español de México. Nunca decimos «release notes» al visitante; sí «novedades», «versiones», «notas de cambio». El H1 es **Novedades de KADESH**; no hay kicker encima.

## Acceso

Público. La barra y el pie del sitio van aquí (es página de lectura, no herramienta). El pie enlaza Novedades en Recursos. El roadmap de la portada apunta a esta ruta.
