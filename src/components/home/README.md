# Home

La portada le habla primero a **quien perdió a su mascota**. Los demás públicos (quien encontró una, quien quiere adoptar, veterinarias, donantes, negocios) tienen su acceso claro sin robarle espacio. El copy sale del documento «Copy landing Kadesh Pet: home y página /anunciate» (octubre 2026).

## Orden

Primero lo que sirve a quien perdió a su mascota; después la comunidad, los servicios y lo que sostiene a Kadesh (fase 6 del plan, noviembre 2026).

1. Hero (`HeroSection`): «Reportar mascota perdida» y los accesos «Encontré una mascota», «Vi una mascota perdida», adoptar, dar en adopción y veterinarias.
2. Reportes recientes (`RecentReportsSection`, `#animales`)
3. Reencuentros (`ReunionsSection`, `#reencuentros`): historias reales de casos cerrados con hogar. Con menos de 2 no se pinta.
4. Alertas de zona (`ZoneAlertsSection`, `#alertas`)
5. Cómo funciona (`HowItWorksSection`, `#como-funciona`)
6. Primeras 24 horas (`FirstHoursSection`, `#primeras-24-horas`)
7. Preguntas frecuentes (`FaqSection`, `#preguntas-frecuentes`): sube porque responde las dudas de quien busca.
8. Espacios de rescate (`RescueSpacesSection`, `#espacios-de-rescate`): qué es, para quién y qué hace, con la vitrina `RescueJourney` y el botón para activar. Siempre se pinta.
9. Aliados (`AlliesSection`, `#aliados`): muro de espacios de rescate aliados; sin aliados no se pinta. Detalle en `components/rescue/README.md`.
10. Veterinarias cerca (`VeterinariansSection`, `#veterinarias`)
11. Historias del blog (`StoriesSection`, `#historias`)
12. Próximos eventos (`UpcomingEventsSection`, `#eventos`)
13. Donaciones (`DonationsSection`, `#donaciones`)
14. Franja para negocios (`BusinessStrip`) → el detalle vive en `/anunciate` (`components/advertise`)
15. Cierre (`ClosingSection`), suscripción al blog y pie

Fondos: se alternan para que nunca queden dos iguales juntos (claro: blanco y `#f7f8fa`; oscuro: `night` y `night-raised`). Reportes gris, Reencuentros blanco, Alertas `kadesh-50`, Cómo funciona blanco, Primeras horas gris, FAQ blanco, Espacios gris, Aliados blanco, Veterinarias gris, Historias blanco, Eventos gris y Donaciones azul. Al mover una sección, revisa el fondo de sus vecinas.

Fuera de la portada: el roadmap vive en `/novedades#roadmap` (`components/changelog/RoadmapSection`), Kadesh Business y FOOD en el pie (columna Familia Kadesh), y «¿Qué es KADESH?» con la frase «Tecnología moderna. Corazón compasivo. Misión espiritual.» en Conócenos (`WhatIsKadesh` se sigue exportando para esa página).

## Hero

Una sola promesa: «¿Se perdió tu mascota? Repórtala gratis…». El botón principal «Reportar mascota perdida» va en rojo (color de urgencia, mismo tono que el pin «Perdido») a `/animales/nuevo?status=lost`. Debajo se avisa que hay que crear cuenta («Crear tu cuenta toma 1 minuto») para que no sea sorpresa. Cuatro accesos secundarios del mismo tamaño: encontré, quiero adoptar, dar en adopción y veterinarias.

Cifras bajo los accesos, cada una es un enlace: veterinarias y ciudades (de `petLandingStats`, redondeadas hacia abajo; se ocultan si son menores a 10) → `/veterinarias`; eventos registrados («N eventos registrados»: todos los publicados, también los que ya pasaron; desde 1, redondeada desde 100; sale de `fetchHomeEvents`) → `#eventos`. No se muestran animales registrados ni reencuentros hasta tener una cifra real de reencuentros que se vea bien.

## Mapa del hero

`HeroMap` sale en el HTML como ilustración (`StreetLayer` y pines fijos), sin bajar ningún mapa. Si quien ve **ya compartió su ubicación antes** (`useRememberedLocation`, no se pide aquí) y hay reportes **activos** en su zona (perdido, encontrado, rescatado, abandonado, en adopción), encima aparece el mapa real (`HeroLiveMap`):

- **Datos:** salen de `useRecentReports` con las mismas variables que «Reportes recientes», así que Apollo comparte la consulta y no sale ninguna petición de más.
- **Paleta:** la misma de la ilustración en claro y oscuro. Es la de todos los mapas del sitio (`kadeshMapStyle` en `components/shared/kadeshMapStyle.ts`, `HERO_MAP_PALETTE`), que `createFreeMap` usa por defecto. Si cambias un color de `StreetLayer`, cambia el de la paleta.
- **Pines:** el pin de Kadesh (`kadeshPin.ts`), el mismo de la ilustración y de todos los mapas: círculo con huella y una punta que marca el lugar; «Perdido» late. Cada uno abre su ficha. Se marca también la ubicación de quien ve. Los pines ilustrados se quitan cuando sale el mapa real.
- **Interacción:** sin arrastre ni zoom (`interactive: false`), porque la página hace scroll encima.
- **Encima del mapa:** la pastilla «N reportes activos cerca de ti». La leyenda muestra solo los estados presentes y «Tú».
- **Respaldo:** sin ubicación, sin reportes activos cerca, sin WebGL o si no baja el estilo, se queda la ilustración. Leaflet y MapLibre solo se bajan en el caso del mapa real.

## Reportes recientes

Cuadrícula tipo feed (`RecentReportsSection`) de 12 cuadros cuadrados: 3 × 4 en celular, de orilla a orilla y con 2 px entre fotos; 4 × 3 en escritorio, con esquinas redondeadas. El primero es un cuadro rojo (`ReportLink`, el rojo del botón principal del hero) con la misma estructura que los de foto: pastilla «Gratis» arriba a la izquierda y «¿Se perdió tu mascota? Repórtala aquí →» abajo y los otros 11, reportes (`RECENT_REPORTS_LIMIT` en `recentReports.ts`).

- Cada cuadro lleva:
  - la foto;
  - arriba a la izquierda, el badge de fecha (`reportDateBadge`): «Hoy», «Ayer», «Antier», «Esta semana», «Este mes», «Hace N meses» o «Hace más de un año», por días de calendario. Solo se pinta en el navegador, porque el HTML sale de caché;
  - arriba a la derecha, el estado: un punto de su color en celular y tablet, y una pastilla de su color con el texto («PERDIDO») en escritorio (`lg`);
  - abajo, sobre un degradado, el nombre y la distancia (o la ciudad). En celular también va el estado en texto.
  - Todo el cuadro enlaza a la ficha.
- `hooks/useRecentReports` pide esos 11. Con ubicación, los de la zona (radio `DEFAULT_RADIUS`); sin ubicación o sin nada cerca, los más recientes del país, nunca una sección vacía. Filtros: Perdidos, Encontrados, En adopción. La geolocalización **no** se pide sola: el botón es **Ver los de mi zona** (misma regla que el resto del sitio con `useRememberedLocation`).
- **Mini mapa** (`RecentReportsMiniMap`): debajo (en celular, de orilla a orilla y pegado a la cuadrícula), con los pines de los cuadros que se ven y el punto azul de quien ve si compartió ubicación. No se arrastra: todo el recuadro es un enlace a `/animales` con el mismo filtro («Ver todos en el mapa»). Leaflet y MapLibre solo se bajan cuando el mapa está por entrar a la pantalla (IntersectionObserver). Sin coordenadas, queda solo el enlace de texto.

Sin ubicación, `getNearbyAnimals` devuelve los más recientes. Omite `lat`/`lng` (desde 2026-11-17, `null` hace lo mismo; antes no devolvía nada).

## Reencuentros

Va justo después de los reportes: a quien está buscando le dice que esto sí funciona, con casos reales.

- **Servidor** (`ReunionsSection`, datos de `fetchReunionStories` en `server.ts`, revalida cada 10 min): `petReunionStories(take: 6)` de kadesh-back. Son casos cerrados con hogar (`reunited`, `adopted`, `other_home`) cuya persona aceptó publicar la historia (`storyConsent`), del cierre más reciente al más viejo. Todo llega en el HTML; el navegador no pide nada.
- El back recorta la historia a 280 caracteres y le quita teléfonos, correos y enlaces. Nunca manda el contacto ni quién lo reportó. Para retirar una historia: en el Admin UI, apagar `storyConsent` o vaciar `outcomeStory`.
- Con menos de 2 historias la sección no se pinta. La etiqueta de arriba dice «N ya tienen hogar» (reencuentros + adopciones de `petLandingStats`) desde 10; si no, «Reencuentros».
- Cada tarjeta enlaza a la ficha del animal. Abajo, «¿Se perdió la tuya? Repórtala gratis» (`ReportLink`).

## Alertas de zona

Va después de los reportes: quien no encontró a su mascota en la lista sigue con «te avisamos cuando aparezca una cerca». Para quien la perdió, lo que más sirve es la alerta de un animal **encontrado** en su zona; el texto bajo el botón lo dice. Reemplaza a la invitación `ZoneAlertsInvite` (solo la veía quien tenía sesión sin alertas; se borró).

- **Servidor** (`ZoneAlertsSection`): el texto, las reglas y la lista inicial llegan en el HTML. Bajo el H2 va una respuesta directa que se entiende sola (`ZONE_ALERTS_ANSWER`, GEO). Las cifras salen de `ALERT_RADIUS_OPTIONS` y `MAX_DAILY_ALERTS` (`notifications/constants`), las mismas reglas del back (`nearbyAnimalAlerts.ts`). La pregunta «¿Cómo me entero si se pierde una mascota cerca de mí?» está en la FAQ y en su JSON-LD.
- **Lista inicial** (`server.ts` → `fetchRecentZoneAlerts`, revalida cada 10 min): las 5 alertas más recientes de México. Lee `animalLogs` perdidos y encontrados por `date_status` y solo cuenta la bitácora más reciente de cada animal: el que ya volvió a casa no es alerta. Sin repetidos ni unidos (`duplicateOf: null`), y el mismo nombre y lugar se muestra una vez. Cada fila enlaza a la ficha y lleva `<time dateTime>`.
- **En el navegador** (`useZoneAlerts`): con sesión y alertas activas, las de **su** zona y radio; si no, con la ubicación ya compartida, las de `DEFAULT_RADIUS` km; si no, el botón **Ver las de mi zona** (la ubicación no se pide sola). Arriba, cuántos perdidos y encontrados hay en esa zona (`total` de `getNearbyAnimals`). Sin nada cerca, se dice y se quedan las del país.
  - `getNearbyAnimals` ordena por distancia antes de paginar: se piden 40 por estado y se ordenan por fecha aquí. Su `createdAt` viene sin zona y en UTC (`toIsoDate` lo lee así).
- **Fechas**: el HTML trae el día fijo («4 nov», hora de México) porque la portada sale de caché; al hidratar pasa a «Hace 3 h».
- **Botón** (`ZoneAlertsCta`): sin sesión abre el modal de cuenta y luego lleva a `/notificaciones/alertas`; con alertas activas dice el radio y ofrece **Cambiar zona**.
- `useAlertSettings` y las constantes se importan por archivo, no por el barril de notificaciones (el barril exporta el shell del panel).
- Las fotos son URLs firmadas que vencen en 1 h: si la caché trae una vencida, la fila muestra el ícono.

## Próximos eventos

Va después de las alertas de zona: «te avisamos de lo que pasa cerca» sigue con las campañas y jornadas.

- **Servidor** (`UpcomingEventsSection`, datos de `fetchHomeEvents` en `components/events/server.ts`, revalida cada 10 min como las alertas): **todos** los eventos publicados de México con alguna fecha en los próximos 7 días, sin filtro. La ventana es de día completo en hora de CDMX, así la llave de la caché no cambia en todo el día. Todo llega en el HTML.
- **Tira de 7 días** (`HomeEventsWeek`, reglas en `components/events/week.ts`): una ficha por día (HOY, VIE, SÁB…) con puntitos del color de cada tipo de evento; abajo, las tarjetas del día elegido (3 y «Ver N más de este día»). Arranca en el primer día con eventos. Una fecha de varios días sale en cada día que toca, contada en la zona del evento. El HTML sale con «hoy» de CDMX y al hidratar se ajusta al día del navegador.
- Semana vacía: «No hay eventos en los próximos 7 días. Estos son los siguientes» con los 3 siguientes. Sin ningún evento: invitación a publicar. Nunca se oculta.
- Botones: **Ver eventos cerca de ti** (`/eventos?cerca=1`, que abre la lista con «Cerca de mí» y pide la ubicación porque la persona lo pidió) y **Ver todos los eventos**. Arriba, **Publicar un evento**.

## Cómo funciona

El paso 4 es «Ayuda a otros» mientras no exista el estado «Reencontrado». Cuando exista, cambiarlo por «Márcalo como reencontrado».

## Espacios de rescate

Le habla a quien rescata (rescatistas, refugios, hogares temporales, colectivos, asociaciones), así que va abajo, después de Historias, sin robarle espacio a quien perdió su mascota.

- **Texto** (`RescueSpacesSection`, servidor): H2, respuesta directa (GEO), los tipos de espacio (`RESCUE_ORG_TYPE_OPTIONS`), tres puntos (equipo con roles, solicitudes, perfil verificado) y **Activar mi espacio de rescate** → `/perfil/rescate/activar`, más «Ver espacios verificados» → `/organizaciones`. Dice «gratis» porque activar no tiene cobro.
- **Vitrina** (`RescueJourney`, cliente): la ficha de ejemplo de Bruno (marcada «Ejemplo») con su recorrido: llega, vacuna con recordatorio por WhatsApp, en adopción, solicitud aprobada y a casa, donde su cartilla viaja de «Refugio Colibrí» a «Familia Ruiz». Los nombres son ficticios; las etiquetas de etapa son las reales de la ficha interna (`rescueStage`). Es `role="img"` con un `aria-label` que resume el recorrido.
- **Motion**: al llegar a la vitrina, los pasos entran uno a uno, la línea se dibuja, la etapa cambia (Recién llegado → En tratamiento → Listo para adopción → Apartado → Adoptado), aparece el recordatorio y la cartilla cruza al final. Sin JS o con «reducir movimiento» se ve el estado final.

## Color

El azul de marca vive **solo** en `src/app/globals.css` como `--color-kadesh`. Las clases `bg-kadesh`, `text-kadesh` y el alias legado `orange-*` salen de ahí. No hardcodear `#216BFA` en componentes. El rojo de urgencia es `red-600` (pasa AA con texto blanco).

## Copy

- Respuesta directa bajo cada H2 de pregunta (GEO).
- FAQ visible (no acordeón oculto) alineada con `constants.ts` y el JSON-LD.
- No inventar métricas, testimonios ni precios. El bloque de historias usa el blog real.
- Tono: directo, compasivo, español de México. Nunca nombramos Keystone, Stripe ni el stack al visitante.

## Motion

Personalidad **Premium**. Momento autorial: el recuadro-mapa se revela y los pines (huellas por estado + veterinarias) caen en secuencia. El pin «Perdido» pulsa. Las calles se desplazan lento. Los accesos del hero usan el mismo GSAP que el directorio: stagger al aparecer y pulso `scale` al tocar. `prefers-reduced-motion` deja el mapa ya poblado y apaga el pulso.

## Veterinarias en portada

No reutiliza `VeterinaryCard` del directorio (esa ficha es una fila para el mapa). En home, cada clínica es una tarjeta con recuadro-mapa (el mismo pin de marca del hero), abierto/cerrado, distancia y llamada. Las 4 fichas de la fila tienen la misma altura. Va a `/veterinarias/{slug}`, no al índice. Sin ubicación, el botón es **Ver veterinarias cerca de mí**. Debajo, la franja «¿Tienes una veterinaria?» lleva a registro.

## Accesibilidad en portada

En donaciones y en el cierre, el texto sobre azul va en blanco sólido (no `/90` ni `/80`: fallan contraste AA). Los enlaces de texto sobre fondo claro usan `text-kadesh-700`. El pie del sitio no usa `h4` para las columnas.
