# Espacios de rescate (`kadesh/components/rescue`)

Rescatistas independientes, refugios, hogares temporales, colectivos y asociaciones. Una persona activa su **espacio de rescate** desde el panel. Ahí arma su equipo y publica animales a nombre de la organización. Cuando KADESH lo verifica, el espacio tiene un perfil público. Algunos verificados se destacan como **Aliados KADESH**.

El backend es la list `RescueOrganization` de kadesh-back (ver `models/Pet/RescueOrganization/README.md`).

## Ciclo

1. **Activar** (`/perfil/rescate/activar`, `RescueOnboardingForm`): un asistente de 3 pasos que llama a `activateRescueOrganization`. El espacio queda **En revisión** con la persona como admin. Si eligió logo, se sube enseguida con `updateRescueOrganization`.
2. **Verificar**: la persona escribe por WhatsApp (`rescueVerificationWhatsAppUrl`) y un admin cambia `status` en el admin de Keystone. Avisa a sus admins con `rescue.verified` o `rescue.rejected`.
3. **Aliado**: un admin marca `isAlly` (y si quiere, `allyOrder`). Sale en la portada y en `/aliados`.

## Panel (`/perfil?tab=rescate`)

- **`RescueSection`**: la lista de espacios de la persona (estado, rol y botón de WhatsApp si está en revisión). Con `&org=<id>` abre `RescueManagePanel`, con `&vista=`:
  - **Resumen** (`RescueSummaryView`): aviso de revisión o de rechazo, KPIs (publicados, en adopción, con hogar, equipo), acciones rápidas y «Completa tu perfil».
  - **Animales** (`RescueAnimalsView`): animales con `organization` = el espacio, paginados de 30. Los filtros (todos, buscan hogar, en adopción, con hogar) van sobre lo cargado, porque el estado sale del último log.
  - **Equipo** (`RescueTeamView`): agregar por correo de una cuenta existente, cambiar el rol y quitar (solo admin), o salirse.
  - **Perfil público** (`RescueProfileForm`): logo, portada, datos, redes y «Cómo ayudarles». Solo lo editan admin y coordinador.
- **Inicio**: «Requiere atención» avisa al admin si su espacio sigue en revisión o lo rechazaron (`homeModel.ts`).

## Roles (los aplica el backend; aquí solo se decide qué mostrar)

| Rol | Perfil | Equipo | Animales |
|---|---|---|---|
| `admin` | Edita | Agrega, cambia roles, quita | Publica, edita, borra |
| `coordinator` | Edita | — | Publica, edita, borra |
| `volunteer` | Ve | — | Publica y edita |
| `foster` | Ve | — | — |

Helpers: `canEditRescueProfile`, `canManageRescueTeam`, `canPublishForRescue`.

## Integración con reportes

- **«Publicar como»** (`NewAnimalForm`): aparece si la persona tiene espacios donde puede publicar (`usePublishableRescueOrgs`). Envía `organization: { connect }` y `reportedBy: "volunteer"`. `?org=<id>` lo preselecciona (`Routes.animals.newForRescue`).
- **Ficha** (`AnimalInfoSection` → `RescueByline`): «Publicado por» con logo, verificado, aliado, «Ver perfil» y WhatsApp.
- **Permisos**: `canEditAnimal` usa `viewerCanEdit`, que calcula el backend. Así el equipo edita sin que el front conozca a los miembros.

## Páginas públicas

Solo existen los espacios **verificados**: el API no devuelve a quien no tiene sesión los que siguen en revisión, y entonces el perfil es 404. Todo lo pinta el servidor y se revalida cada 30 min (`revalidate = 1800`): el logo y la portada son URLs firmadas de 1 h.

- **`/organizaciones`** (`RescueDirectory`): directorio con logo, nombre, tipo, ciudad, insignia de aliado y cifras. Las tarjetas llegan en el HTML; `RescueDirectoryFilters` (cliente) solo filtra por tipo y por texto (sin acentos). CTA «¿Rescatas? Activa tu espacio» → `Routes.rescueActivate`.
- **`/organizaciones/<slug>`** (`RescueProfile`): portada y logo, «Verificado» y, si `isAlly`, «Aliado KADESH»; tipo y ciudad; cifras (`publishedCount`, `inAdoptionCount`, `adoptedCount`, se ocultan si no ha publicado); «Sobre nosotros» con sus saltos de línea; animales en «En adopción» (última bitácora `in_adoption`, siempre visible con vacío amable), «Rescatados recientes» (otros estados) e «Historias con final feliz» (`adopted`/`in_family`), 6 por grupo y el resto en «Ver N más» (`<details>`, sin JS). «Cómo ayudar»: donar (`donationUrl`), datos para donar, lo que necesitan y «Ser voluntario u hogar temporal» (WhatsApp con mensaje que menciona KADESH). Contacto y redes. Solo se enlazan URLs `http(s)`.
- **`/aliados`**: muro completo y lista por tipo con ciudad y adopciones. Sin aliados, vacío amable. CTA para unirse: no promete ser aliado (lo decide el equipo).
- **Portada** (`components/home/AlliesSection`): muro con hasta 28 aliados (`HOME_ALLIES_MAX`) y burbuja «+N» a `/aliados`. Sin aliados no se pinta. Entrada con GSAP (`AlliesWallReveal`), apagada con «reducir movimiento».

### Muro de aliados (`AlliesWall`)

Componente de servidor. Cada logo es un enlace al perfil con `aria-label` «Nombre. Ciudad, Estado. N adopciones». La etiqueta es CSS puro (`group-hover` / `group-focus-visible`) y Esc la esconde (`AlliesWallFrame`, WCAG 1.4.13). `RescueAvatar` pone las iniciales en un color estable por nombre (opaco también en oscuro) y debajo de la imagen: si la URL firmada caducó, se ven las iniciales.

### SEO (`rescue-seo.ts`)

- Canónicas absolutas en `SITE_URL`. Título «Nombre · Tipo en Ciudad» recortado a 52 caracteres (el layout agrega « | KADESH»).
- **Sin teléfonos ni correos** en descripción ni JSON-LD: `stripContactInfo` quita la frase entera que los tenga.
- JSON-LD del perfil: `NGO` + `ProfilePage` + migas, con `sameAs` (sitio y redes). `image` es la tarjeta `/organizaciones/<slug>/og` (1200×630) y `logo` es `…/og?formato=logo` (512×512): URLs estables, no las firmadas del API.
- Listados: `CollectionPage` + `ItemList` + migas. El sitemap incluye `/organizaciones`, `/aliados` y cada perfil verificado.

## Decisiones

- **Lo público solo con verificación.** El backend solo deja leer organizaciones `verified` a quien no es de su equipo. Por eso `animal.organization` llega en `null` al público mientras siga en revisión. No hay que filtrar nada en el front, ni pedir la organización con sudo.
- **Equipo solo con cuentas existentes.** No se crean cuentas a nombre de otros (a diferencia de la familia de la cartilla).
- **Imágenes del API**: son URLs firmadas que caducan en 1 h. Las páginas públicas revalidan cada 30 min (`server.ts`).
- **Estados de animales:** el panel usa los mismos de siempre (`getStatusLabel`/`getStatusColor`).

## Pendiente (siguientes fases)

- Ficha interna con cartilla (`Pet.organization`, etapas, hogar temporal asignado).
- «Se quedó conmigo» (reporte → mascota).
- Transferir la cartilla al adoptante.
- Solicitudes de adopción.
