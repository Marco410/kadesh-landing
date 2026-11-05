# Home

La portada le habla primero a **quien perdió a su mascota**. Los demás públicos (quien encontró una, quien quiere adoptar, veterinarias, donantes, negocios) tienen su acceso claro sin robarle espacio. El copy sale del documento «Copy landing Kadesh Pet: home y página /anunciate» (octubre 2026).

## Orden

1. Hero (`HeroSection`)
2. Reportes recientes (`RecentReportsSection`, `#animales`)
3. Alertas de zona (`ZoneAlertsSection`, `#alertas`)
4. Próximos eventos (`UpcomingEventsSection`, `#eventos`)
5. Cómo funciona (`HowItWorksSection`, `#como-funciona`)
6. Primeras 24 horas (`FirstHoursSection`, `#primeras-24-horas`)
7. Historias (`StoriesSection`, `#historias`)
8. Veterinarias cerca (`VeterinariansSection`, `#veterinarias`)
9. Donaciones (`DonationsSection`, `#donaciones`)
10. Franja para negocios (`BusinessStrip`) → el detalle vive en `/anunciate` (`components/advertise`)
11. Preguntas frecuentes (`FaqSection`, `#preguntas-frecuentes`)
12. Cierre (`ClosingSection`), suscripción al blog y pie

Fuera de la portada: el roadmap vive en `/novedades#roadmap` (`components/changelog/RoadmapSection`), Kadesh Business y FOOD en el pie (columna Familia Kadesh), y «¿Qué es KADESH?» con la frase «Tecnología moderna. Corazón compasivo. Misión espiritual.» en Conócenos (`WhatIsKadesh` se sigue exportando para esa página).

## Hero

Una sola promesa: «¿Se perdió tu mascota? Repórtala gratis…». El botón principal «Reportar mascota perdida» va en rojo (color de urgencia, mismo tono que el pin «Perdido») a `/animales/nuevo?status=lost`. Debajo se avisa que hay que crear cuenta («Crear tu cuenta toma 1 minuto») para que no sea sorpresa. Cuatro accesos secundarios del mismo tamaño: encontré, quiero adoptar, dar en adopción y veterinarias.

Cifras bajo los accesos, cada una es un enlace: veterinarias y ciudades (de `petLandingStats`, redondeadas hacia abajo; se ocultan si son menores a 10) → `/veterinarias`; eventos registrados («N eventos registrados»: todos los publicados, también los que ya pasaron; desde 1, redondeada desde 100; sale de `fetchHomeEvents`) → `#eventos`. No se muestran animales registrados ni reencuentros hasta tener una cifra real de reencuentros que se vea bien.

## Reportes recientes

`hooks/useRecentReports` pide solo 6 reportes. Con ubicación, los de la zona (radio `DEFAULT_RADIUS`); si no hay ubicación o no hay nada cerca, los 6 más recientes del país, nunca una sección vacía. Filtros: Perdidos, Encontrados, En adopción. La geolocalización **no** se pide sola: el botón es **Ver los de mi zona** (misma regla que el resto del sitio con `useRememberedLocation`).

Ojo con `getNearbyAnimals`: mandar `lat: null` filtra todo. Sin ubicación hay que **omitir** lat/lng para recibir los más recientes.

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
