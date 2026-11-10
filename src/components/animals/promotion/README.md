# Difusión pagada de reportes

Quien puede editar un reporte `lost` o `found` ve en la ficha un aviso opcional: «Impulsar en Facebook». Elige presupuesto y días, lee la promesa y abre el WhatsApp oficial de KADESH con la solicitud armada. **La app no guarda nada**: ni solicitud, ni comprobantes, ni datos bancarios. Todo el seguimiento es por WhatsApp.

## Piezas
- `constants.ts`: montos (sugeridos $150/$300/$500; libre entre $100 y $5,000), días (3/5/7), estados que aplican y los textos de la promesa y de los siguientes pasos.
- `promotionRequest.ts`: validación del monto, folio (`KP-<6 del reporte>-<4 al azar>`) y el mensaje de WhatsApp.
- `PromoteReportBanner.tsx`: el aviso en la ficha. Se oculta solo si quien la ve no puede editar (`canEditAnimal`), si el estado no aplica o si el reporte está unido a otro.
- `PromotionSheet.tsx`: el formulario (`Sheet`) y, al enviar, los siguientes pasos con el folio.
- Enlace directo: `/animales/{slug}?accion=impulsar` abre la hoja al entrar (el correo «Tu reporte ya está publicado» de kadesh-back lo usa). La ficha pide sesión si no hay y lo ignora si quien entra no puede editar o el estado no aplica.

## Reglas del texto (no quitarlas)
1. **Primero lo gratis:** el reporte ya se publicó gratis en la página de Facebook; pagar es opcional y no condiciona nada.
2. **Sin lucro, con números:** el monto elegido es lo que se transfiere y lo que va a Meta, sin renglones extra. Se mandan comprobantes de Meta.
3. **No es donación** (Términos §5 y §6).
4. **Sin presión ni cifras inventadas:** nada de urgencias ni de «llegarás a X personas».
5. **Antiestafa:** solo el WhatsApp oficial, KADESH nunca escribe primero para cobrar, nunca datos de tarjeta. A quien pierde una mascota le escriben muchos estafadores.
6. **Devolución:** lo no gastado se devuelve si aparece, si sobra o si Meta rechaza el anuncio.

## Proceso manual (WhatsApp + Meta Business Suite)
1. Llega el mensaje con folio, enlace, zona, días y presupuesto. Revisa que el reporte tenga publicación en la página (kadesh-back guarda `Animal.facebookPostId`) y que el anuncio se pueda hacer.
2. Manda la CLABE, el beneficiario y el concepto (= folio).
3. Con el comprobante, promociona esa publicación en Business Suite: radio alrededor de la zona, los días y el presupuesto elegidos.
4. Manda capturas de avance (alcance, clics) y el recibo de Meta durante la campaña y al final.
5. Si aparece la mascota o sobra saldo: pausa, pide la CLABE para devolver, transfiere lo no gastado y manda el comprobante.
