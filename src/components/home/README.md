# Home

La portada le habla primero a **quien perdió a su mascota**. Los demás públicos (quien encontró una, quien quiere adoptar, veterinarias, donantes, negocios) tienen su acceso claro sin robarle espacio. El copy sale del documento «Copy landing Kadesh Pet: home y página /anunciate» (octubre 2026).

## Orden

1. Hero (`HeroSection`)
2. Reportes recientes (`RecentReportsSection`, `#animales`)
3. Cómo funciona (`HowItWorksSection`, `#como-funciona`)
4. Primeras 24 horas (`FirstHoursSection`, `#primeras-24-horas`)
5. Historias (`StoriesSection`, `#historias`)
6. Veterinarias cerca (`VeterinariansSection`, `#veterinarias`)
7. Donaciones (`DonationsSection`, `#donaciones`)
8. Franja para negocios (`BusinessStrip`) → el detalle vive en `/anunciate` (`components/advertise`)
9. Preguntas frecuentes (`FaqSection`, `#preguntas-frecuentes`)
10. Cierre (`ClosingSection`), suscripción al blog y pie

Fuera de la portada: el roadmap vive en `/novedades#roadmap` (`components/changelog/RoadmapSection`), Kadesh Business y FOOD en el pie (columna Familia Kadesh), y «¿Qué es KADESH?» con la frase «Tecnología moderna. Corazón compasivo. Misión espiritual.» en Conócenos (`WhatIsKadesh` se sigue exportando para esa página).

## Hero

Una sola promesa: «¿Se perdió tu mascota? Repórtala gratis…». El botón principal «Reportar mascota perdida» va en rojo (color de urgencia, mismo tono que el pin «Perdido») a `/animales/nuevo?status=lost`. Debajo se avisa que hay que crear cuenta («Crear tu cuenta toma 1 minuto») para que no sea sorpresa. Cuatro accesos secundarios del mismo tamaño: encontré, quiero adoptar, dar en adopción y veterinarias.

Prueba social: solo veterinarias y ciudades (de `petLandingStats`, redondeadas hacia abajo; se ocultan si son menores a 10). No se muestran animales registrados ni reencuentros hasta tener una cifra real de reencuentros que se vea bien.

## Reportes recientes

`hooks/useRecentReports` pide solo 6 reportes. Con ubicación, los de la zona (radio `DEFAULT_RADIUS`); si no hay ubicación o no hay nada cerca, los 6 más recientes del país, nunca una sección vacía. Filtros: Perdidos, Encontrados, En adopción. La geolocalización **no** se pide sola: el botón es **Ver los de mi zona** (misma regla que el resto del sitio con `useRememberedLocation`).

Ojo con `getNearbyAnimals`: mandar `lat: null` filtra todo. Sin ubicación hay que **omitir** lat/lng para recibir los más recientes.

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
