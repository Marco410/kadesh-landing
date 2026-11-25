---
estado: pendiente
fecha: 2026-11-25
origen: kadesh-landing@feat/donations-patita
feature: shared
---

# Prompt para kadesh-pet-mobile: «Dame una patita» (donaciones con muro y top de donantes)

## Contexto
La web cambió el enlace externo de donaciones por «Dame una patita», un formulario propio. Se donan patitas de $25 MXN (1, 3, 5 u otra cantidad), con nombre y un mensaje opcional, y el pago con tarjeta se hace sin salir de la página. Quien dona aparece en un **muro de patitas** con su mensaje y en un **top de donantes** por patitas. Es una donación única y opcional, y no desbloquea nada.

**Importante: patitas ≠ huellitas.** Las huellitas son los puntos por ayudar (`pawLeaderboard`, `myPaws`, ranking «Quién apoya más»). Las patitas son solo la unidad de donación. No mezcles nombres, textos, íconos ni pantallas: donar no da huellitas, y el top de donantes no es el ranking de huellitas. En el código de la app, los identificadores de esta feature no llevan `paw`; usa `donation…`.

## Qué implementar en la app
1. **Botón «Dame una patita».** Que no estorbe: una fila en Ajustes / Mi cuenta y, si la app tiene pantalla de «Acerca de», también ahí. Nunca un popup automático ni un botón flotante.
   - **El pago NO va dentro de la app.** Cobrar una donación con tarjeta dentro de la app puede chocar con la guía 3.1.1 de App Store (Kadesh no es donataria autorizada) y con la política de pagos de Google Play.
   - El botón abre en el navegador del sistema (`Linking.openURL` o `expo-web-browser`) `https://pet.kadesh.com.mx/donaciones`. Ahí la persona usa el mismo formulario de la web, donde elige si sale con su nombre, como «Alguien anónimo» o si no aparece en el muro.
2. **Muro de patitas** (pantalla nativa, solo lectura):
   - Lista de donaciones recientes en tarjetas: ícono de patita, «**Marco C.** dio **3 patitas**», mensaje (si hay) y fecha corta («25 nov», hora de Ciudad de México).
   - Pide 20 y «Ver más» pide los siguientes 20 (`skip`) solo al tocarlo. Sin polling; se refresca al abrir la pantalla o al jalar.
   - Vacío: «Aún no hay patitas en el muro. La tuya puede ser la primera.» y el botón del punto 1.
3. **Top de donantes** (en la misma pantalla o en una pestaña):
   - Pestañas «Este mes» y «De siempre», con hasta 10 filas: lugar, nombre y «N patitas».
   - Los 3 primeros en un podio (2.º, 1.º, 3.º) con un ícono de patita y un listón oro, plata o bronce con el número; del 4 al 10 en lista. Sin foto, nivel, racha ni avatar de nivel, para que no se parezca al ranking de huellitas.
   - Título: «Quienes nos dieron una patita».
   - Si «Este mes» está vacío, abre en «De siempre».
4. **Resumen** (opcional, arriba del muro): «N personas ya dieron una patita». Solo si `supporters > 1`; si es 0, no lo muestres. Nunca muestres montos en pesos ni inventes cifras.
5. Íconos de `@hugeicons/react-native` (no hay patita en el set gratuito). Usa el SVG de la web con `react-native-svg`: patita de contorno (sin relleno), `stroke` del color del texto, `strokeWidth` 1.9, `strokeLinecap`/`strokeLinejoin` `round`, `viewBox="0 0 24 24"`:
   ```xml
   <circle cx="4.3" cy="10.6" r="2"/><circle cx="8.7" cy="5.3" r="2"/><circle cx="15.3" cy="5.3" r="2"/><circle cx="19.7" cy="10.6" r="2"/>
   <path d="M12 11.6c1.4 0 2.3.9 3.3 2.3l2.6 3.8c1.4 2 .2 4.3-2.1 4.3-1.4 0-2.5-.6-3.8-.6s-2.4.6-3.8.6c-2.3 0-3.5-2.3-2.1-4.3l2.6-3.8c1-1.4 1.9-2.3 3.3-2.3Z"/>
   ``` Usa el ícono de huellitas solo para huellitas. Color `kadesh` (#216BFA).

## GraphQL
Las tres consultas son públicas (sin sesión) y el back las guarda 10 min en caché. Pídelas en **una sola petición** al abrir la pantalla:

```graphql
query DonationsBoard($wallTake: Int, $rankingTake: Int) {
  wall: donationWall(take: $wallTake) {
    items {
      id
      displayName
      unitCount
      message
      paidAt
    }
    hasMore
  }
  rankingMonth: donorRanking(period: "month", take: $rankingTake) {
    rank
    displayName
    units
    donations
  }
  rankingAllTime: donorRanking(period: "all_time", take: $rankingTake) {
    rank
    displayName
    units
    donations
  }
  summary: donationSummary {
    supporters
    units
    wallMessages
  }
}
# variables: { "wallTake": 20, "rankingTake": 10 }
```

«Ver más» del muro:

```graphql
query DonationWall($take: Int, $skip: Int) {
  donationWall(take: $take, skip: $skip) {
    items {
      id
      displayName
      unitCount
      message
      paidAt
    }
    hasMore
  }
}
# variables: { "take": 20, "skip": <cuántas ya tienes> }
```

Para referencia (la app **no** la usa, porque el pago va en la web): la web inicia la donación con `startDonation(input: StartDonationInput!): StartDonationResult!` y confirma el `clientSecret` con Stripe Elements.

Tipos:

```ts
export type DonationWallEntry = {
  id: string;
  /** «Marco C.» o «Alguien anónimo». */
  displayName: string;
  /** Patitas de esta donación (1 = $25 MXN). */
  unitCount: number;
  /** null si no dejó mensaje o un admin lo ocultó. */
  message: string | null;
  /** ISO 8601. */
  paidAt: string;
};

export type DonationWallPage = { items: DonationWallEntry[]; hasMore: boolean };

export type DonorRankingEntry = {
  rank: number;
  displayName: string;
  /** Patitas en el periodo. */
  units: number;
  donations: number;
};

export type DonationSummary = {
  supporters: number;
  units: number;
  /** Donaciones pagadas con mensaje visible en el muro. */
  wallMessages: number;
};
```

## Reglas y constantes
- 1 patita = $25 MXN. «1 patita» / «N patitas» (singular con 1).
- `take`: el back topa el muro en 20 y el top en 10. `period`: `"month"` (mes en curso, hora de Ciudad de México) o `"all_time"`.
- Nunca se publica el correo, el apellido completo ni el monto en pesos. El back ya devuelve el nombre recortado; no lo reconstruyas.
- Los anónimos salen como «Alguien anónimo» y no se juntan entre ellos en el top.
- Solo cuentan donaciones pagadas. Un reembolso las saca del muro y del top.
- **Umbrales (igual que la web):** muestra el muro solo si `summary.wallMessages >= 5`; antes, en su lugar, solo el botón «Dame una patita» y una línea de para qué sirve, sin muro, sin top y sin «Aún no hay patitas». El podio sale solo si hay al menos 3 filas cuyo `displayName` no sea «Alguien anónimo» en ese periodo; con menos, lista simple. Si en «De siempre» no hay 3 con nombre, no muestres el top.
- Quien eligió «No aparecer» no sale en el muro ni en el top (el back ya lo filtra), pero sí cuenta en `donationSummary`. La app no tiene que hacer nada extra.
- Copy:
  - Usa «Dame una patita», «Muro de patitas» y «Quienes nos dieron una patita».
  - Nunca uses «huellitas», «nivel», «racha» ni «Quién apoya más» en esta feature.
  - No menciones Stripe ni comisiones.
- Mientras el back no tenga `DONATIONS_ENABLED=true`, las consultas responden vacío (o no existen si el back no se ha desplegado). En ese caso, muestra solo el botón que abre `/donaciones`.
- Orden de despliegue: primero el back. Pide estas consultas en un documento aparte del arranque, para no tumbar el inicio en versiones con un back viejo.

## Referencia web
- `src/components/donations/` en kadesh-landing: `checkout/DonationSheet.tsx` (formulario), `wall/DonationWall.tsx`, `wall/DonorTop.tsx`, `server.ts` (la consulta `DonationsBoard`) y `README.md`.
- kadesh-back: `models/Pet/Donation/README.md`, `graphql/customs/queries/donations/index.ts`.

## Criterios de aceptación
- [ ] «Dame una patita» abre `https://pet.kadesh.com.mx/donaciones` en el navegador del sistema; no hay pago dentro de la app.
- [ ] El muro carga con una sola petición, pagina de 20 en 20 solo con «Ver más» y se refresca al jalar.
- [ ] El top cambia entre «Este mes» y «De siempre» sin volver a pedir datos.
- [ ] En ningún texto, ícono ni pantalla de esta feature aparecen las huellitas.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
