---
estado: pendiente
fecha: 2026-11-13
origen: kadesh-landing@feat/avistamientos
feature: animals
---

# Prompt para kadesh-pet-mobile: «Lo vi» (avistamientos sin cuenta)

## Contexto
Quien ve a un animal perdido casi nunca tiene cuenta, y pedirle registrarse para decir «lo vi en tal esquina» hace que no avise. Ahora, en la ficha de un animal **perdido** (`lost`) o **abandonado** (`abandoned`), cualquiera puede avisar dónde y cuándo lo vio, sin cuenta. El aviso se publica al momento en la ficha («Lo han visto») y le llega a quien atiende el reporte por campana, push y WhatsApp (tipo `animal.sighted`).

## Qué implementar en la app
1. **Banner en la ficha** (arriba, junto a «¿Es tu mascota?»):
   - Solo si el estado actual (último registro) es `lost` o `abandoned`, el reporte no está unido a otro (`duplicateOf` vacío) y quien ve **no** atiende el reporte. Atiende el reporte su autor (`animal.user.id` es el de la sesión) o su equipo (`viewerCanEdit` y **no** es admin de plataforma). Un admin sí ve el banner: `viewerCanEdit` es `true` para los admins en cualquier reporte y no por eso lo atienden. Quien atiende el reporte usa «Agregar registro».
   - Texto: «**¿Viste a {sentenceName}?** Dinos dónde y cuándo. No necesitas cuenta.» y botón «Lo vi». `sentenceName` es `animalSentenceName` (ver el prompt [nombre desconocido](2026-11-13-nombre-desconocido.md)): «Luna» o «esta perra».
   - Funciona sin sesión: no abre el inicio de sesión.
2. **Hoja «¿Dónde viste a {sentenceName}?»** con el texto «No necesitas cuenta. Le llega al momento a quien lo busca.»
   - **¿Dónde?** Mapa con pin (obligatorio), centrado en el último lugar del reporte, con «Usar mi ubicación actual». Manda `lat`, `lng` y, si el mapa los resolvió, `placeLabel` (dirección), `city` y `state`. Error: «Pon el pin donde lo viste, o usa «Usar mi ubicación actual».»
   - **¿Cuándo?** Chips «Ahora» (por defecto), «Hoy», «Ayer», «Otro día».
     - Con «Hoy», «Ayer» u «Otro día» aparece «Hora aproximada, si la sabes»; con «Otro día», también el día (de hoy a hace 30 días).
     - Cómo se guarda: «Ahora» = ahora. «Hoy» sin hora = ahora. «Ayer» u otro día sin hora = 12:00.
     - Nunca en el futuro («La hora no puede ser posterior a ahora.») ni de hace más de 30 días («Solo se pueden avisar avistamientos de los últimos 30 días.»).
   - **¿Cómo estaba? (opcional)**: texto de máximo 500 caracteres. Ejemplo: «Ej. Iba hacia el parque, se veía asustado y traía collar rojo.»
   - **Tus datos (opcional)**: «Nombre» (máx. 60) y «Teléfono o WhatsApp» (10 dígitos). Con sesión, se prellenan con el primer nombre y el teléfono de la cuenta. Ayuda: «Solo los ve quien busca a {sentenceName}, por si quiere preguntarte algo.» Error de teléfono: «Escribe los 10 dígitos, o déjalo vacío.»
   - Botones: «Cancelar» y «Enviar aviso» («Enviando…» mientras se envía). Mientras envía, la hoja no se cierra.
   - Si `success` es falso, muestra `message` arriba del formulario (el back ya lo manda en español).
   - **Al terminar**: la hoja pasa a «¡Gracias por avisar!» con el texto «Ya le avisamos a quien busca a {sentenceName}. Tu aviso se ve en la ficha, en «Lo han visto».» y «Si lo vuelves a ver, avisa otra vez: cada lugar ayuda a saber hacia dónde va.». Botón «Listo». Vuelve a pedir la ficha para que aparezca.
3. **Sección «Lo han visto»** (antes de los comentarios). Solo se muestra si hay avistamientos. Va con el número de avistamientos y una tarjeta por cada uno, del más reciente al más viejo:
   - La hora en el color de la marca: «Hace 5 min», «Hace 2 h» (menos de 6 h), «Hoy, 7:40 p.m.», «Ayer, 9:00 a.m.» o «3 nov., 6:15 p.m.».
   - El lugar (`placeLabel`, o «ciudad, estado», o «Ubicación en el mapa»), que abre el mapa en ese punto.
   - La nota, si la hay.
   - **Solo quien atiende el reporte** ve además:
     - El texto «Si un avistamiento te sirve, agrégalo al historial con «Agregar registro» para mover el pin del caso.»
     - En cada tarjeta, el nombre y teléfono de quien avisó, con botones de WhatsApp (`https://wa.me/52{10 dígitos}`) y llamar, o «Sin contacto».
     - El botón «Ocultar» / «Mostrar» (`setAnimalSightingHidden`). Los ocultos le salen con opacidad y la etiqueta «Oculto»; al público ya no le llegan.
4. **Avisos**:
   - Nuevo tipo `animal.sighted`: «Alguien vio a {sentenceName}». El cuerpo dice dónde y cuándo, más la nota, y la URL de la ficha termina en `#avistamientos`. Al tocarlo, abre la ficha en la sección «Lo han visto».
   - Si la app tiene la pantalla de «Avisos por WhatsApp», agrega la categoría «Avistamientos de tus reportes» («Alguien vio al animal que buscas y nos dijo dónde.»), con los tipos `['animal.sighted']`. Va en el grupo de reportes propios: se enciende con «Avísame por WhatsApp» al publicar, junto a `animal.follow_up`, `animal.possible_match`, `animal.commented` y `animal.claim_requested`.
5. **Acceso desde el inicio**: si la app tiene accesos rápidos en el inicio, agrega «Vi una mascota perdida» (ícono de binoculares). Lleva al directorio o mapa de animales filtrado en `lost` y muestra arriba una pista que se puede cerrar: «**¿Cuál viste?** Ábrelo y toca «Lo vi» para decirle a su familia dónde y cuándo. No necesitas cuenta.». No hay «Lo vi» sin animal: el aviso siempre se manda desde la ficha.
6. **Captcha**: la web usa Cloudflare Turnstile solo si está configurado. En la app no hace falta widget mientras el back no tenga `TURNSTILE_SECRET_KEY`. Si se activa, habrá que agregar Turnstile a la app (por ejemplo, en un WebView) o una excepción en el back para la app. No lo implementes ahora; solo manda `turnstileToken: null`.

## GraphQL

```graphql
# Ficha: agrega este campo a la consulta que ya usa la app (va en la misma petición).
query GetAnimal($where: AnimalWhereUniqueInput!) {
  animal(where: $where) {
    id
    viewerCanEdit
    # …lo demás que ya pide la app
    sightings(take: 20) {
      id
      seenAt        # ISO
      lat
      lng
      placeLabel
      city
      state
      notes
      createdAt
      hidden        # solo true para quien atiende el reporte
      contactName   # null para el público
      contactPhone  # null para el público (10 dígitos)
    }
  }
}

mutation ReportAnimalSighting($input: ReportAnimalSightingInput!) {
  reportAnimalSighting(input: $input) { success message sightingId }
}
# input: {
#   animalId: ID!, lat: String!, lng: String!,
#   placeLabel?, city?, state?, seenAt? (ISO; por defecto ahora),
#   notes?, contactName?, contactPhone?, turnstileToken?, website?
# }
# `website` es un campo trampa para bots: la app nunca lo manda.

mutation SetAnimalSightingHidden($id: ID!, $hidden: Boolean!) {
  setAnimalSightingHidden(id: $id, hidden: $hidden) { success message sightingId }
}
```

```ts
export interface AnimalSighting {
  id: string;
  seenAt?: string | null;
  lat: string;
  lng: string;
  placeLabel?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  hidden: boolean;
  contactName?: string | null;
  contactPhone?: string | null;
}

export const SIGHTING_STATUSES = ['lost', 'abandoned'];
export const SIGHTINGS_ANCHOR = 'avistamientos';
```

## Reglas y constantes
- `sightings` es una consulta por animal: pídelo **solo en la ficha**, nunca en listas ni en el mapa.
- No conviertas un avistamiento en registro del caso automáticamente. Eso lo decide quien atiende el reporte, con «Agregar registro».
- El back rechaza con mensaje:
  - estados que no son `lost`/`abandoned` («Este caso ya no está buscando al animal…»);
  - la misma IP con el mismo animal en menos de 10 minutos;
  - más de 10 avisos por hora o 30 por día desde la misma IP.
- El teléfono se normaliza a 10 dígitos en el back. Uno inválido se rechaza con «Revisa tu teléfono: debe tener 10 dígitos.».
- Mientras el back nuevo no esté publicado, el campo `sightings` no existe: lanza esta feature en la app después del back.

## Referencia web
- `src/components/animals/sightings/` (`SightingBanner.tsx`, `ReportSightingSheet.tsx`, `SightingsSection.tsx`, `time.ts`)
- `src/app/animales/[slug]/page.tsx`
- `src/components/notifications/constants.ts` (categoría `sightings`)
- Back: `kadesh-back/graphql/customs/mutations/pet/animalSightings.ts`, `models/Pet/Animal/AnimalSighting/`

## Criterios de aceptación
- [ ] Sin sesión se puede mandar un «Lo vi» en un reporte perdido o abandonado.
- [ ] El banner no sale a quien atiende el reporte ni en otros estados; a un admin sí le sale.
- [ ] La hora nunca queda en el futuro ni a más de 30 días.
- [ ] El público no ve el contacto ni los ocultos; quien atiende el reporte sí, y puede ocultar y mostrar.
- [ ] El aviso `animal.sighted` abre la ficha en «Lo han visto».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
