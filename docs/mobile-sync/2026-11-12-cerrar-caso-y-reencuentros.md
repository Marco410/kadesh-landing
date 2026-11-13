---
estado: pendiente
fecha: 2026-11-12
origen: kadesh-landing@develop
feature: animals
---

# Prompt para kadesh-pet-mobile: «Cerrar caso» con «¿volvió a casa?» y «¿Kadesh ayudó?»

## Contexto
Antes, un caso se cerraba agregando un registro «En familia» o «Adoptado», sin preguntar nada. La web ahora tiene un botón **«Cerrar caso»** en la ficha del animal. Pregunta cómo terminó el caso, si Kadesh ayudó y por dónde, y deja contar la historia (opcional, con permiso para publicarla). Con estas respuestas se arma el contador de reencuentros y adopciones de la portada. Además existe un estatus nuevo, «Caso cerrado» (`closed`), para los casos que terminan sin hogar.

## Qué implementar en la app
1. **Aviso en la ficha del animal.** Solo lo ve quien puede editar el reporte: su autor, el equipo del espacio de rescate (`viewerCanEdit`) o un admin de plataforma. Aparece mientras el último registro esté en un estatus abierto (`lost`, `found`, `rescued`, `abandoned`, `in_adoption`) y el reporte no esté unido a otro (`duplicateOf` vacío).
   - Texto: si el estatus es `lost`, «¿{nombre} ya volvió a casa?»; en los demás, «¿{nombre} ya encontró hogar?». Debajo: «Cierra el caso para que deje de salir como activo en el mapa.»
   - Botón: «Cerrar caso».
2. **Hoja «Cerrar el caso de {nombre}»**, con preguntas que se encadenan:
   - **Cómo terminó** (obligatoria, chips de una sola opción). El título es «¿{nombre} volvió a casa?» si es `lost`, o «¿Qué pasó con {nombre}?» en los demás. Opciones:
     - `reunited` «Volvió con su familia»
     - `adopted` «Fue adoptado». No aparece si el estatus es `lost`.
     - `other_home` «Encontró otro hogar»
     - `deceased` «Falleció»
     - `closed_unresolved` «Ya no se busca»
   - Solo si eligió `reunited`, `adopted` u `other_home`:
     - «¿Kadesh ayudó a que pasara?»: `yes` «Sí», `no` «No», `unsure` «No sé».
     - Si respondió `yes`, «¿Por dónde?»: `map` «El mapa o la ficha», `zone_alert` «Una alerta de zona», `whatsapp` «Un aviso por WhatsApp», `poster` «Un cartel o QR», `facebook` «La página de Facebook», `match` «Un aviso de coincidencia», `sighting` «Alguien avisó que lo vio», `other` «Otro».
     - «Cuéntanos cómo fue (opcional)»: texto de máximo 1000 caracteres. Si escribió algo, aparece la casilla «Kadesh puede publicar mi historia con la foto de {nombre}.», desmarcada por defecto.
   - Botones: «Cancelar» y «Cerrar caso». Este último está deshabilitado hasta elegir cómo terminó; mientras guarda dice «Guardando…».
   - Si se elige un desenlace sin hogar, no se mandan las respuestas sobre Kadesh, el canal ni la historia (van en `null`).
3. **Al guardar:**
   - Con `success: true`: toast de éxito con `message`, se cierra la hoja y se vuelve a pedir la ficha. El estatus cambia y el aviso desaparece.
   - Con `success: false`: se muestra `message` dentro de la hoja.
   - Con un error de red: un mensaje amigable, nunca el error crudo.
4. **«Agregar registro» ya no ofrece** «En familia», «Adoptado» ni «Caso cerrado». Debajo de los chips de estado va el texto: «¿Ya volvió a casa o fue adoptado? Usa «Cerrar caso» en la ficha.»
5. **Estatus nuevo `closed`:** etiqueta «Caso cerrado», color `#64748b`. Agrégalo donde la app pinte etiquetas y colores de estatus.
6. **Enlace profundo** `/animales/{slug}?accion=cerrar`: abre la hoja de cierre al entrar, igual que hoy `?accion=registro` abre «Agregar registro». Si quien entra no puede cerrar el caso, o el caso ya no está abierto, se ignora. Los recordatorios de seguimiento van a usar este enlace.

## GraphQL

```graphql
mutation CloseAnimalReport($input: CloseAnimalReportInput!) {
  closeAnimalReport(input: $input) {
    success
    message
    status
  }
}
```

Lo que acepta y devuelve el back:

```graphql
input CloseAnimalReportInput {
  animalId: ID!
  outcome: String!          # reunited | adopted | other_home | deceased | closed_unresolved
  helpedByKadesh: String    # yes | no | unsure (null si no respondió)
  outcomeChannel: String    # map | zone_alert | whatsapp | poster | facebook | match | sighting | other
  story: String             # máx. 1000
  storyConsent: Boolean
  notes: String             # opcional; si no viene, el back pone una nota por desenlace
}

type CloseAnimalReportResult {
  success: Boolean!
  message: String!
  animalSlug: String
  status: String            # estatus de la bitácora final: in_family | adopted | closed
}
```

```ts
export type AnimalOutcome = 'reunited' | 'adopted' | 'other_home' | 'deceased' | 'closed_unresolved';
export type HelpedByKadesh = 'yes' | 'no' | 'unsure';
export type OutcomeChannel =
  | 'map' | 'zone_alert' | 'whatsapp' | 'poster' | 'facebook' | 'match' | 'sighting' | 'other';

export interface CloseAnimalReportInput {
  animalId: string;
  outcome: AnimalOutcome;
  helpedByKadesh?: HelpedByKadesh | null;
  outcomeChannel?: OutcomeChannel | null;
  story?: string | null;
  storyConsent?: boolean | null;
}
```

Además, `petLandingStats` ahora trae `reunions` y `adoptions` (enteros), por si la app muestra el contador.

## Reglas y constantes
- El back revisa los permisos. Pueden cerrar el caso:
  - el autor del reporte;
  - el equipo del espacio de rescate;
  - un admin.
  Los reportes que subió la automatización solo los cierra un admin.
- `outcomeChannel` solo se guarda si `helpedByKadesh` es `yes`, y `storyConsent` solo si hay `story`. El back lo aplica igual, pero la app no debe mandarlos fuera de esos casos.
- El back deja la bitácora final con la ubicación de la última, así que la app no pide ubicación ni fecha al cerrar.
- Si después alguien agrega un registro de caso abierto (por ejemplo, se volvió a perder), el back reabre el caso solo.
- Si una versión vieja de la app agrega un registro «En familia» o «Adoptado», el caso cuenta como cerrado igual, pero sin las respuestas. Por eso conviene pasar todos los cierres por esta mutación.

## Referencia web
`src/components/animals/detail/CloseCaseBanner.tsx`, `src/components/animals/detail/CloseCaseModal.tsx`, `src/components/animals/constants.ts` (`OPEN_CASE_STATUSES`, `FINAL_LOG_STATUSES`, `ANIMAL_OUTCOME_OPTIONS`, `HELPED_BY_KADESH_OPTIONS`, `OUTCOME_CHANNEL_OPTIONS`), `src/components/animals/queries.ts` (`CLOSE_ANIMAL_REPORT_MUTATION`). Back: `kadesh-back/graphql/customs/mutations/pet/closeAnimalReport.ts`, `kadesh-back/models/Pet/Animal/Animal.outcome.ts`.

## Criterios de aceptación
- [ ] El aviso solo sale para quien puede editar el reporte y con el caso abierto.
- [ ] Las preguntas sobre Kadesh y la historia solo salen con un desenlace con hogar, y «¿Por dónde?» solo con «Sí».
- [ ] Al cerrar, la ficha muestra el estatus nuevo y el aviso desaparece.
- [ ] «Agregar registro» ya no ofrece estatus finales.
- [ ] `closed` se ve como «Caso cerrado» en gris pizarra.
- [ ] `?accion=cerrar` abre la hoja.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
