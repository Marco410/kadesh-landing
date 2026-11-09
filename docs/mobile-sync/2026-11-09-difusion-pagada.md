---
estado: pendiente
fecha: 2026-11-09
origen: kadesh-landing@feat/difusion-pagada
feature: animals
---

# Prompt para kadesh-pet-mobile: difusión pagada del reporte en Facebook e Instagram

## Contexto
Cada reporte ya se publica gratis en la página de Facebook de Kadesh Pet. Ahora, quien reportó una mascota perdida (o un animal encontrado) puede pedir que KADESH **promocione esa publicación** con un presupuesto que elige. Todo se coordina por WhatsApp: la app no guarda la solicitud, ni comprobantes, ni datos bancarios. El texto existe para que no parezca negocio (todo va a Meta, no es donación, hay comprobantes y devolución) ni estafa: a quien pierde una mascota le escriben estafadores pidiendo dinero.

## Qué implementar en la app
En la pantalla de detalle del animal:

1. **Aviso**, debajo del encabezado y junto a los demás avisos de la ficha.
   - **Cuándo aparece:**
     - Quien ve la ficha puede editar el reporte: es su autor (`animal.user.id === usuario.id`) o es admin.
     - El estado actual (status del log más reciente) es `lost` o `found`.
     - El reporte no está unido a otro (`duplicateOf` es null).
   - **Texto:** «Tu reporte ya está en nuestra página de Facebook, gratis. Si quieres que lo vea más gente de la zona, puedes pagar un anuncio: KADESH no cobra nada y te mandamos los comprobantes.»
   - **Botón (borde de marca):** «Impulsar en Facebook».
   - **Icono:** megáfono (`Megaphone01Icon`).
2. **Hoja modal** «Impulsar en Facebook e Instagram» (bottom sheet):
   - **Intro:** «Tu reporte ya está publicado gratis en nuestra página de Facebook. Si quieres que lo vean más personas cerca de donde {se perdió | lo encontraron}, puedes pagar un anuncio. Tú eliges cuánto.» Usa «lo encontraron» si el estado es `found`.
   - **«¿Cuánto quieres para el anuncio?»:** chips «$150», «$300» (preseleccionado), «$500» y «Otro monto». «Otro monto» muestra un campo numérico con prefijo `$`; solo acepta dígitos (máx. 5). Debajo va la ayuda «Entre $100.00 y $5,000.00.», que se pone roja si el monto no es válido.
   - **«¿Cuántos días?»:** chips «3 días», «5 días» (preseleccionado), «7 días».
   - **Resumen:** «Presupuesto del anuncio», el monto en grande con formato `$300.00` (MXN, es-MX) y debajo «{días} días · va completo a Meta». Sin renglones extra: lo elegido es lo que se transfiere.
   - **«Sin lucro y con comprobantes»**, lista con palomitas. `{sujeto}` es el nombre del animal o «este animal» si no tiene.
     - «KADESH no cobra nada por esto: el 100 % de lo que transfieras se le paga a Meta para mostrar el anuncio.»
     - «No es una donación: este dinero no financia a KADESH, solo el anuncio de {sujeto}.»
     - «Te mandamos por WhatsApp los comprobantes de Meta de lo gastado y cómo va la campaña: cuántas personas lo vieron y cuántas abrieron el reporte.»
     - Si `lost`: «Si {sujeto} aparece antes de que termine, pausamos el anuncio y te devolvemos lo que no se haya gastado.» Si `found`: «Si su familia aparece antes de que termine, pausamos el anuncio y te devolvemos lo que no se haya gastado.»
     - «Un anuncio ayuda a que más gente lo vea, pero no garantiza encontrarlo.»
   - **Aviso antiestafa** (caja ámbar con escudo): «**Cuida tu dinero:** solo atendemos esto en el WhatsApp oficial de KADESH (+52 443 938 2330). Nunca te escribiremos primero para cobrarte ni te pediremos datos de tarjeta.»
   - **Casilla:** «Entiendo que el pago es solo para el anuncio y que KADESH no se queda con ninguna parte.»
   - **Botones:** «Ahora no» (cierra) y «Solicitar por WhatsApp» (icono de WhatsApp). Este último solo se activa con la casilla marcada y un monto válido; abre WhatsApp con `Linking.openURL`.
3. **Después de abrir WhatsApp**, la hoja cambia a:
   - Caja: «Envía el mensaje que se abrió en WhatsApp». Debajo: «Tu folio es **{folio}**. Úsalo como concepto cuando transfieras.»
   - «Siguientes pasos», lista numerada:
     1. «Te respondemos por WhatsApp con los datos para transferir.»
     2. «Mándanos ahí tu comprobante de la transferencia.»
     3. «Publicamos el anuncio y te enviamos los comprobantes de Meta y cómo va.»
     4. «Si aparece, avísanos y te devolvemos lo que no se haya gastado.» Si `found`: «Si su familia aparece, avísanos…».
   - Pie: «Solo te atendemos en el WhatsApp oficial de KADESH (+52 443 938 2330).»
   - Botones: «Abrir WhatsApp otra vez» y «Listo».
4. **Cada vez que se abre la hoja** empieza de cero, con un folio nuevo.

## GraphQL
Ninguno. No se guarda nada; los datos salen de la ficha que la app ya carga (`id`, `slug`, `name`, `user.id`, `duplicateOf`, `logs[0].status`, `logs[0].placeLabel`, `city`, `state`).

```ts
type PromotableStatus = 'lost' | 'found';
```

## Reglas y constantes
- `PROMOTION_PRESETS = [150, 300, 500]`, por defecto 300. Libre: entero entre `PROMOTION_MIN = 100` y `PROMOTION_MAX = 5000`.
- `PROMOTION_DURATIONS = [3, 5, 7]`, por defecto 5.
- **Folio:** `KP-` + los últimos 6 caracteres alfanuméricos del slug (o del id si no hay slug) en mayúsculas + `-` + 4 caracteres al azar del alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin 0/O ni 1/I). Ejemplo: `KP-J5B6RC-7F3K`.
- **WhatsApp oficial:** `524439382330`. URL: `https://wa.me/524439382330?text=<mensaje codificado>`.
- **Mensaje** (una línea por renglón; omite «Zona» si no hay lugar):
  ```
  Hola, quiero impulsar el reporte de {sujeto} en Facebook e Instagram.
  Folio: {folio}
  Reporte: https://pet.kadesh.com.mx/animales/{slug o id}
  Zona: {placeLabel o "ciudad, estado" del último log}
  Duración: {días} días
  Presupuesto del anuncio: {monto con formato $1,234.00}
  ```
- **No cambiar el sentido de los textos:** nada de urgencias («encuéntralo más rápido»), ni cifras de alcance inventadas, ni mencionar otros números de contacto.

## Referencia web
`src/components/animals/promotion/` (`constants.ts`, `promotionRequest.ts`, `PromoteReportBanner.tsx`, `PromotionSheet.tsx`, `README.md`) y su montaje en `src/app/animales/[slug]/page.tsx`. Términos §6.

## Criterios de aceptación
- [ ] El aviso solo aparece a quien puede editar, en `lost` o `found`, y nunca en reportes unidos a otro.
- [ ] «Solicitar por WhatsApp» está desactivado sin la casilla, con «Otro monto» vacío, con menos de $100 o con más de $5,000.
- [ ] El resumen muestra el monto elegido tal cual (sin renglones extra) y los días.
- [ ] WhatsApp se abre con el número oficial y el mensaje completo, con folio, enlace, zona, días y presupuesto.
- [ ] Tras abrir WhatsApp se ven el folio y los siguientes pasos; al reabrir la hoja hay folio nuevo.
- [ ] Los textos cambian para `found` («lo encontraron», «su familia»).
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
