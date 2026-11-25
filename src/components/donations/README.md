# Donaciones

Página pública de **transparencia** (`/donaciones`) y recuento de a qué se destina una aportación. El donante debe entender el destino **antes** de pagar. Donar es opcional y no desbloquea la plataforma.

## Promesa

Las donaciones cubren los **gastos de este proyecto**: personas, servidores, dominios y herramientas; también difusión y apoyo puntual a casos urgentes. No son un padrón de un animal ni un pago a un albergue ajeno, salvo que un caso puntual lo diga así.

## Qué ve el visitante

1. Respuesta directa bajo el H1.
2. Desglose en cuatro destinos (sin porcentajes ni pesos).
3. Patrocinio en especie (marcas y tiendas) y fundadores, ambos vía Contacto.
4. FAQ visible (no acordeón).
5. CTA de donación al inicio y al cierre.

Vacío de cifras: a propósito. Cuando haya un periodo cerrado con números verificables, van en esta misma página. **Nunca inventar montos, porcentajes ni “X animales salvados”.**

## Copy y tono

Directo, español de México, misión. Alinear con la sección `#donaciones` de la portada, el FAQ de inicio, Conócenos y Términos §5.

**Nunca decimos:** Stripe, Keystone, comisiones de pasarela, que KADESH es un albergue, ni que cada peso va a un animal concreto.

## «Dame una patita»

Donación única con nuestra marca, inspirada en los botones de «invítame un café», sin salir de la página.

- **Unidad:** la patita, que vale $25 MXN. Se eligen 1, 3 o 5 patitas, u otra cantidad hasta 400. **No son huellitas** (los puntos de `components/paws`): donar no da huellitas, no sube de nivel y no desbloquea nada. En código, los identificadores de esta carpeta nunca llevan `paw`. En los textos de donaciones nunca se dice «huellitas», «nivel», «racha» ni «Quién apoya más».
- **Flujo:**
  1. Cualquier botón llama a `useDonation().open({ source, sourceRef })` (`checkout/DonationProvider`, montado en `ClientProviders`).
  2. Se abre `checkout/DonationSheet`, que pide patitas, nombre, correo (solo sin sesión), mensaje y cómo aparecer en el muro: con su nombre, «Anónimo» o «No aparecer» (`hideFromWall`: no sale en el muro ni en el top, cuenta en el total y el mensaje solo lo lee el equipo). Sin sesión también pide Turnstile.
  3. La mutación `startDonation` devuelve el `clientSecret`.
  4. `checkout/DonationPayStep` cobra con Stripe Elements en azul Kadesh.
  5. Se muestra el agradecimiento.
  - La donación cuenta cuando el back confirma el pago con Stripe: lo hace el webhook o `settleDonation`, que el formulario llama al terminar de pagar (y `DonationReturnNotice` al volver de 3-D Secure). Lo que llegue primero la cuenta una sola vez.
  - Si el banco redirige (3-D Secure), vuelve a `/donaciones/muro?patita=gracias` (`DonationReturnNotice`).
- **Carga:** el formulario y Stripe.js se descargan la primera vez que alguien abre el formulario (`next/dynamic` + `getStripe` en `utils/stripe.ts`). En la página no hay nada de Stripe.
- **Muro de patitas** (`/donaciones/muro`, `wall/DonationsWallPage.tsx`; 404 con la bandera apagada):
  - Podio de los 3 primeros y lista hasta el 10 (`wall/DonorTop`, «Este mes» / «De siempre»), mensajes en columnas, «¿En qué se usan las patitas?» (`DONATION_DESTINATIONS`), cómo funciona, preguntas frecuentes y llamado final.
  - Todo llega del servidor en una sola consulta cada 10 min (`server.ts`, `fetchDonationsBoard`). «Ver más» pide de 20 en 20 en el navegador.
  - **Umbrales:** la página, la vista previa y el sitemap salen desde 5 donaciones con mensaje visible (`WALL_MIN_MESSAGES`, `isWallReady` con `donationSummary.wallMessages`); antes, `/donaciones/muro` redirige a `/donaciones`. El podio sale desde 3 personas con nombre (`PODIUM_MIN_NAMED`); con menos, lista simple, y si no hay 3 nombres de siempre el top no se muestra. Los enlaces sin datos (pie, `DonationSection`, gracias, correos) van a `/donaciones`.
  - `/donaciones` y la portada solo muestran una vista previa (últimos 3 mensajes y resumen, `fetchDonationsHome`) con enlace al muro.
  - El podio usa patitas con listón oro, plata y bronce, sin foto, nivel ni racha, y no enlaza a `/ranking`: no se confunde con las huellitas.
- **Moderación:** en el Admin UI de kadesh-back («Donaciones (patitas)»), con `messageHidden`.
- **Bandera:** `NEXT_PUBLIC_DONATIONS_ENABLED=true` junto con `DONATIONS_ENABLED=true` en el back. Apagada, todos los botones abren el Payment Link viejo (`STRIPE_DONATE_URL`) y no se pide nada al back.

### Dónde se ve (y reglas para no ser invasivos)

Nunca abre sola, nunca tapa contenido y hay a lo más un llamado por página además del header.

| Lugar | Componente |
|---|---|
| Header (escritorio y menú móvil) | `DonateTrigger` en `layout/Navigation.tsx` (entre `lg` y `xl` solo la patita) |
| Ficha de animal, al final | `DonationStrip`, que se puede cerrar por 30 días (`localStorage`) |
| «Cerrar caso» con hogar, cuando Kadesh ayudó | Paso de gracias en `animals/detail/CloseCaseModal.tsx` |
| Veterinaria y evento (barra lateral) | `DonationCard` |
| Índice del blog (barra lateral) | `DonationCard` vía `BlogSidebar showDonation` |
| Post del blog, al final | `DonationNote` («¿Te sirvió este artículo?») |
| Portada y `/donaciones` | `DonateTrigger` y el muro |
| `/conocenos` (antes del formulario) y `/contacto` (al final) | `DonationSection`, sección a todo lo ancho sin consulta (`source` `about` / `contact`) |
| Pie | Botón «Dame una patita» debajo de las redes (`source: footer`) |

No va en el reporte recién publicado (la persona está angustiada), en los espacios de rescate (la donación es para Kadesh, no para ellos), en la tienda ni en el inicio del panel, porque ahí está la tarjeta de huellitas.

Copy: «Dame una patita». No se nombra Stripe; el formulario dice «Pago seguro con tarjeta».

## Acceso

Pública. El pie enlaza Donaciones aquí (no al ancla de la portada). El ancla `#donaciones` sigue en inicio como campo de marca con el mismo destino y un enlace a esta ruta.

## Por qué no es una ruta `/transparencia`

El pie ya prometía `/donaciones`. Transparencia y donar viven juntas: primero el recuento, luego el pago. Una ruta extra diluye el CTA.

## Patrocinios

Se buscan **en especie** con marcas y tiendas de mascotas, además de quienes acompañan como fundadores. No hay catálogo de beneficios ni landing `/fundadores`. El contacto es `/contacto` con asunto Patrocinio o Fundador.
