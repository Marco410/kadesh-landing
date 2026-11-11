# Eventos

Campañas de esterilización, jornadas de vacunación, ferias de adopción, colectas, voluntariado y talleres que publica la comunidad. El backend vive en kadesh-back (`models/Pet/PetEvent/README.md`, con todas las reglas) y la revisión en kadesh-business (Operaciones → Kadesh Pet → Eventos).

## Rutas

| Ruta | Qué es | Render |
| --- | --- | --- |
| `/eventos` | Próximos eventos con filtros `?estado=&ciudad=&tipo=&cuando=`; `?cerca=1` abre con «Cerca de mí» y pide la ubicación | Servidor (1.ª página) + `EventsIndexClient` |
| `/eventos/en/<estado>` y `/eventos/en/<estado>/<municipio>` | Eventos de un estado o municipio, con su título, texto con datos, JSON-LD y migas. Sin eventos próximos: `noindex`. `/eventos?estado=` manda (308) aquí | Servidor (`EventsListingPage`) |
| `/eventos/<slug>` | Ficha (JSON-LD `Event` por fecha) | Servidor; si no es pública, `EventPrivatePreview` con la sesión |
| `/eventos/<slug>/og` | Tarjeta para compartir (como la de animales: portada de fondo, tipo, título, fecha, costo y lugar; sin foto, el color del tipo) | Route handler |
| `/eventos/<slug>/calendario` | `.ics` con las próximas fechas | Route handler |
| `/eventos/nuevo`, `/eventos/<slug>/editar` | Formulario | Cliente, con `AuthGateModal` |
| `/perfil?tab=events` | «Mis eventos» (`MyEventsSection`) | Panel |

La portada usa `fetchHomeEvents` (semana completa de México) y la tira de días de `week.ts` en `components/home/HomeEventsWeek`.

## Reglas que conviene no romper

- **Fechas**: se guardan en UTC y se muestran en la zona del evento (`timeZone`, la de su estado), nunca la del navegador. `format.ts` (`formatSessionRange`, `zonedInputToIso`, `isoToZonedInput`) es la única puerta.
- **Estados**: `mexicoStates.ts` es copia de kadesh-back (`utils/geo/mexicoStates.ts`); el filtro usa el slug y el backend guarda la clave INEGI.
- **Constantes**: `constants.ts` repite las del backend (`models/Pet/PetEvent/constants.ts`). El backend vuelve a validar todo lo de `form/eventFormModel.ts`.
- **Revisión**: un no-admin nunca publica directo. Editar uno publicado (o subir una foto) lo regresa a revisión; el formulario lo avisa.
- **Redes** (`socialLinks.ts`): link o `@usuario`, se guarda el link; mismas reglas que `normalizeSocialUrl` del backend. En la ficha van con `rel="nofollow ugc"` (las pone quien publica).
- **Fotos**: URLs firmadas que vencen en 1 h. La portada y la ficha revalidan antes (10 min y 1 min); la tarjeta para compartir se sirve por `/og` como en el blog y veterinarias.
- **SEO / GEO**: la ficha lleva una frase resumen que se entiende sola (`eventSummary`: qué, dónde, fecha con año, costo, quién organiza, cupo) y un JSON-LD `Event` por fecha con `organizer.url`. `/eventos` lleva `CollectionPage`, `ItemList`, `FAQPage` (preguntas visibles en `EVENTS_FAQ`) y migas.
- **Títulos**: `eventPageTitle` arma «<título> en <ciudad> · Gratis · 10 nov» (lo que se busca) sin pasar de ~60 caracteres con « | KADESH»; el `<h1>` es el título de quien organiza.
- **URLs de listados**: `eventsListingHref` (estado y municipio en la ruta, `tipo` / `cuando` / `cerca` en la query) y `resolveEventsPlace` en `searchParams.ts`.
- **IndexNow**: la clave pública vive en `src/core/indexnow.ts` (la sirve `src/app/indexnow-key.txt/route.ts`) y debe coincidir con `INDEXNOW_KEY` de kadesh-back (`utils/seo/indexNow.ts`).
- **Lado servidor**: `server.ts` y `events-seo.ts` se importan por archivo desde `app/eventos`; el barril (`index.ts`) solo exporta lo del cliente.
- **Vistas**: la ficha llama a `recordPetEventView` al abrirse (`hooks/useEventViews`, desde `EventActions`) y muestra el total que devuelve («1,234 vistas»). `viewsCount` no va en `EVENT_DETAIL_FIELDS` a propósito: así la ficha del servidor no depende de ese campo. Si la mutación falla, no se muestra el número. «Mis eventos» sí lo pide (`MY_EVENTS_QUERY`). Las reglas de qué cuenta están en el README del backend.
- **Fotos en pantalla completa**: la portada es 16:9 con `object-cover` y recorta los carteles verticales. Al tocarla se abre `FullscreenCarousel` (el de la ficha de animal, importado por archivo y no por el barril) con `object-contain`.
