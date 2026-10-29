# Animales

Listado, detalle y reporte de animales perdidos o en adopción. `/animales` es una **herramienta** (lista + mapa), no una landing: el mapa ocupa el resto de la pantalla y la lista es un panel.

## Promesa

Ayudar a encontrar o adoptar. El mapa y las tarjetas muestran el mismo conjunto; al tocar un pin se selecciona la ficha, y al tocar una ficha se centra el mapa.

## UI

- Sin franja azul de héroe. El H1 vive en el panel (`Animales`). Sin pie del sitio: el split lista + mapa ocupa `100dvh` menos la barra.
- Radio en chips (`10–50 km`) con `aria-pressed`, también en `?radius=`.
- Filtros siempre visibles, sin cajón: **Todos / Perdido / Encontrado / En adopción** (punto del color del pin). Tipo: **Perro y Gato** al frente, con trazo; Ave, Pez, Reptil y Mamífero van en **Más**. Contorno vs relleno de marca para el seleccionado.
- Motion: chips de filtro siguen en GSAP (`useChipPulse`, Más/Menos). El directorio y las fichas usan Framer (`shared/motion`, misma curva que perfil): lista en cascada, radio con píldora que se desliza, vacío/carga se revelan, toque 0.97. El alta mantiene el desliz del paso en GSAP; Atrás/Continuar y la nota responden al toque. `prefers-reduced-motion` lo apaga.
- Si no hay resultados, el vacío nombra la búsqueda (`No hay reptiles rescatados en 10 km`) y ofrece ampliar radio o quitar filtros.
- Ficha de lista: foto, estatus de color semántico, distancia, Ver ficha. Oscuro: `night` / `night-raised`.
- **Reportar** está en el encabezado del panel (y sobre el mapa en móvil). Si no hay sesión, abre el modal de cuenta (`AuthGateModal`).
- La ubicación **no** se solicita sola la primera vez. El listado arranca sin coords (todos los reportes) y el panel ofrece **Usar mi ubicación** / **Reintentar**. Si ya la aprobaron, al recargar se reutiliza y el mapa muestra el pin. Centrar el mapa también guarda esa aprobación.

## Alta (`/animales/nuevo`)

Es una **herramienta de tres pasos**, no un formulario largo ni una landing. Quien llega (sobre todo con un animal perdido, desde el celular) tiene que terminar en minutos. Un solo formulario sin scroll no cabe: el mapa y las fotos se pelean el viewport. Un wizard de 7 pasos se siente a trámite.

Movimiento (GSAP, `HOME_EASE`; nada si el sistema pide menos movimiento):
- **Al entrar** (cuando el esqueleto cambia por el formulario), todo aparece en cascada en menos de un segundo, en este orden: título, círculos de los pasos, bloques del paso, chips y botones de abajo.
- **Al cambiar de paso**, el panel se desliza hacia el lado del avance y sus bloques entran en cascada.
- Cada animación limpia sus estilos al terminar (`clearProps`) para no chocar con el pulso de los chips ni con la del stepper.

1. **Foto y tipo** — fotos primero (es lo que reconoce a alguien): se arrastran o se eligen varias a la vez, hasta 3. Se reordenan arrastrando: la primera es la **portada** (`order: 1`) y es la que se ve en el listado y en la ficha. Tipo en chips, nombre. «No tiene nombre» va marcado si el estatus es encontrado / abandonado / rescatado.
2. **Cómo reconocerlo** — tamaño y edad en chips, color, sexo, raza y **señas particulares** (obligatorias). **No sé** busca mestizo/sin raza; si no existe, pide la más cercana. Tipo, nombre y raza (con **No sé**) se reutilizan en el modal de reservar cita; el copy y el control deben coincidir.
3. **Dónde** — estatus (prellenado con `?status=`): Perdido, Encontrado, En adopción, Abandonado y Rescatado siempre visibles, sin Más. **Hoy / Ayer / Otra fecha**. Otra fecha es solo el día; la hora es opcional y, si no va, se guarda a las 12:00. No hay fechas futuras. El mapa abre en la ubicación ya concedida o, si no hay, en Morelia. La búsqueda prioriza esa zona. Si ahí no hay coincidencias, se repite en todo México. Alcaldías y municipios (Iztapalapa, Coyoacán, Huixquilucan) cuentan como ciudad. **¿Es tu mascota?** Si la respuesta es no, el teléfono queda vacío y se pide el del dueño; hay un segundo teléfono opcional. El enlace de la publicación solo aparece si marcan que el registro viene de redes sociales. En este paso se revisa si ya hay un reporte parecido (ver «Reportes parecidos»).

### Reportes parecidos (2026-10-28)

En cuanto hay ubicación en el paso **Dónde**, el formulario consulta `findAnimalReportDuplicates`.
- **Cuándo consulta:** se espera 600 ms después del último cambio (`useSimilarReports`). Se vuelve a consultar si cambian el pin, el estatus, el nombre, el tipo, las señas, el teléfono o el enlace.
- **Qué manda:** tipo, nombre, estatus, sexo, color, raza, señas, lat/lng, teléfono, enlace y el día.
- **Qué revisa el backend:** a 5 km o menos, perdidos de los últimos 90 días y el resto de 30. Califica nombre (sin acentos ni mayúsculas, con errores de dedo), cercanía, sexo, color, raza, señas y fecha. **No compara la ciudad**, porque el mapa da colonias distintas para puntos a 500 m.
- **Dos tipos de resultado:**
  - `duplicate`: el mismo animal ya reportado, con el mismo estatus.
  - `match`: el otro lado de la historia (perdido ↔ encontrado, rescatado o abandonado).
- **Niveles:** `likely` («Muy parecido», 70+) y `possible` (45+).
- **En el formulario:**
  - Si hay resultados, aparece un aviso que no frena (`SimilarReportsNotice`) con **Revisar**.
  - Al dar **Publicar**, la revisión (`SimilarReportsSheet`) se abre sola si hay uno `likely`, la misma publicación o el mismo teléfono, y la persona aún no la vio.
- **Acciones por tarjeta:**
  - **Es el mismo: dejar comentario**: comentario `duplicate_report`; le avisa a quien lo reportó.
  - **Es mi mascota: pedir el reporte**: solicitud `AnimalClaim`; solo aparece si dijo que es su mascota, reporta perdido, y el otro lo subió la comunidad o es un encontrado.
  - En coincidencias: **Es el mío: avisar** / **Es este: avisar a su familia** (comentario `possible_match`). No impide publicar el propio reporte.
  - Al comentar o pedir el reporte se borra el borrador y se abre la ficha de ese reporte.
- **Reportes propios:** salen como «Ya lo reportaste tú» (`isMine`), sin acciones.
- **Publicar de todos modos:** manda `duplicateCheck` con los parecidos descartados, como pista para que un admin los una.

Lat/lng, estado y país no se muestran. La ciudad del mapa es el municipio, no la colonia. Si quien reporta editó la dirección, el título y el slug usan ese texto; la colonia del mapa queda solo como dato interno y no pisa la dirección ya escrita. Sin ciudad, el pin igual se publica: el servidor la completa.

Si quien reporta no es el dueño, la ficha dice «Reportado por la comunidad. Contacta directamente al dueño.» y, si hay enlace, «Ver publicación original».

Barra de **tres círculos** (1 · 2 · 3). El paso listo muestra un check y la línea se llena con GSAP. El pie queda fijo: Atrás / Continuar, y en el último paso **Publicar reporte**. El H1 cambia con el trabajo (`Reportar perdido`, `Dar en adopción`…). Sin franja azul, sin footer del sitio. Al publicar, va a la ficha. El slug usa el lugar que escribió quien reporta; si no editó la dirección, usa la ciudad (el municipio), nunca la colonia que resolvió el mapa.

El borrador se guarda en el navegador (paso, campos y fotos) por usuario. Recargar o volver más tarde retoma donde iba. Se borra al publicar.

El mapa del picker no enseña coordenadas ni nombra el proveedor. CTA de posición: **Estoy aquí**.

## Ficha (`/animales/[slug]`)

La URL canónica es el slug. Los enlaces viejos `/animales/{id}` siguen abriendo la ficha y redirigen al slug cuando existe. Si el animal aún no tiene slug, se usa el id.

Misma familia que la ficha de veterinaria: `pt-[72px]`, `night` / `night-raised`, sin franja azul y sin footer del sitio.

El trabajo es reconocer y actuar **sin recorrer la página**. En escritorio la ficha es un workspace de viewport: foto a la izquierda (llena la altura), datos compactos arriba a la derecha, historial y mapa abajo a la derecha. Encabezado: volver, nombre, chip de estatus, **Cómo llegar** y **Llamar**. La foto es el héroe de reconocimiento, sin halo de 5px; las miniaturas van encima de la foto. No se muestran coordenadas ni notas placeholder (`Sin información adicional`). Cómo llegar en el mapa sigue el pin seleccionado; el del encabezado va al último registro. Comentarios quedan debajo; no empujan el mapa fuera de pantalla.

El dueño del reporte (`animal.user`) puede venir `null` para visitantes sin sesión: Keystone filtra el User. La ficha **no debe crashear** — muestra «Usuario de KADESH» y oculta Editar / acciones de dueño. No asumas `user` en el render.

**Comentarios:** la sección tiene el ancla `#comentarios`, que es a donde llevan las notificaciones. Los comentarios `duplicate_report` llevan la insignia «También lo reportó» y los `possible_match`, «Posible coincidencia».

**Pedir el reporte («Es mi mascota»):**
- `ClaimReportButton` aparece a quien no puede editar, si el reporte lo subió la comunidad o es un encontrado, rescatado o abandonado.
- Sin sesión abre `AuthGateModal` y vuelve con `?reclamar=1`, que abre la solicitud sola.
- Con una solicitud pendiente propia muestra su estado y **Cancelar solicitud**.
- **Quien atiende el reporte** ve `AnimalClaimsPanel` con las pendientes: nombre, mensaje, teléfono (**Llamar**) y la foto. Si la notificación trae `?reclamo=<id>`, esa solicitud se resalta.
- **Aprobar** pasa el reporte a su nombre, con su teléfono como principal, y ya no lo puede editar quien lo subió. **Rechazar** le avisa.

**Reportes unidos:** si un admin pone `duplicateOf` (Admin UI de Keystone), la ficha del repetido redirige con 308 a la principal (`layout.tsx`), y `useAnimalDetail` hace lo mismo del lado del cliente. Deja de salir en el listado y en el inicio (`getNearbyAnimals`).

## Mapa

No usamos la API de Google Maps. El mapa es **Leaflet + MapLibre GL** con el estilo Liberty de **OpenFreeMap** (`src/components/shared/free-map.ts`), empaquetado en la app (no se carga desde unpkg). El modo oscuro es un filtro CSS (`.kadesh-free-map--night`), no un segundo estilo. Pins de usuario y controles usan `--color-kadesh`.

El picker de ubicación (reporte y bitácora) busca y hace geocodificación inversa con **Nominatim** (OpenStreetMap), limitado a México. No hay Places ni API key de mapas.

## Copy

Tono directo, español de México. No nombramos Leaflet, MapLibre, Nominatim ni Google al visitante. Los colores de estatus en el pin no son la marca: «Rescatado» sigue en naranja semántico para no confundirlo con el azul KADESH.

## Acceso

`/animales` es público. `?status=` (p. ej. `in_adoption`) prefiltra el listado; el hero de portada usa eso para «Quiero adoptar».

Reportar (`/animales/nuevo`) exige sesión, pero nunca se manda a la persona a `/auth/login`.
- Todo enlace a un reporte nuevo usa `ReportLink`: en el hero, Cómo funciona, Reportes recientes, Primeras horas y el cierre del home. El listado hace lo mismo con su botón.
- Sin sesión, al tocarlo se abre el modal de cuenta (`AuthGateModal`) sin salir de la página. Explica por qué pedimos cuenta y qué gana la persona según el tipo de reporte (`reportAuthCopy`, por `?status=`). Deja crear la cuenta o entrar ahí mismo y luego lleva al formulario con el mismo `?status=`.
- Si alguien llega directo a `/animales/nuevo` sin sesión, ve el formulario de fondo con el mismo modal encima. Cerrarlo regresa a la página anterior.
- El formulario acepta también abandonado y rescatado.

## Quién edita un animal (2026-10-14)

Editar la ficha, las fotos y las etapas lo puede hacer **el dueño o un admin de plataforma** (`canEditAnimal`). Esa regla aplica en tres lugares: la página `/animales/[slug]/editar`, el botón "Editar" de la ficha y el agregar o borrar etapas en `LogTimeline`. El admin llega desde Operaciones de Kadesh (Kadesh Pet → Animales → Editar en Kadesh Pet) y necesita tener sesión aquí con su cuenta de admin. kadesh-back aplica la misma regla en `Animal.access.ts`; este front solo decide qué mostrar.
