---
estado: pendiente
fecha: 2026-11-04
origen: kadesh-landing@feat/panel-cuenta
feature: animals
---

# Prompt para kadesh-pet-mobile: Publicar reporte se ve ocupado y no se publica dos veces

## Contexto
En la web, al tocar **Publicar reporte** en el alta de un animal (perdido, encontrado, en adopción…), el botón no daba señales de estar trabajando. Al terminar volvía a habilitarse mientras se abría la ficha, así que se podía publicar el mismo reporte dos veces. Ahora el envío tiene un candado y el botón dice en qué va.

## Qué implementar en la app
En la pantalla de alta de reporte, al tocar **Publicar reporte**:
- **Candado contra doble envío**: si ya se está publicando, otro toque (o un segundo envío del formulario) no hace nada. Usar una referencia síncrona (`useRef`), no solo el estado: el estado tarda un render y un doble toque rápido alcanza a mandar dos veces.
- **Etapas en el botón**, con un indicador de actividad (`ActivityIndicator`) junto al texto:
  1. "Revisando…": validación y búsqueda de reportes parecidos.
  2. "Publicando…": `createAnimal` y `createAnimalLog`.
  3. "Subiendo la foto…", o "Subiendo N fotos…" si son varias: `createAnimalMultimedias`.
  4. "Abriendo tu reporte…": ya se publicó y se navega a la ficha.
- Mientras publica:
  - El botón queda deshabilitado, pero **sin atenuarse**, para que se vea ocupado y no apagado.
  - "Atrás" y los pasos no responden, y los campos no se pueden editar.
  - Una barra de progreso fina bajo el encabezado.
  - El texto de la etapa se anuncia a lectores de pantalla (`accessibilityLiveRegion="polite"` o `AccessibilityInfo.announceForAccessibility`).
- **Si sale bien**, el botón **no** se vuelve a habilitar: se queda en "Abriendo tu reporte…" hasta que la pantalla de la ficha reemplaza a la del alta.
- **Si falla**, se libera (candado y etapa) y se muestra el error como hoy.
- Con "reducir movimiento" del sistema, el indicador puede quedarse quieto.

## GraphQL
Ninguna nueva. Son las mismas operaciones del alta: `FindAnimalReportDuplicates`, `CreateAnimal`, `CreateAnimalLog` y `CreateAnimalMultimedias`.

## Reglas y constantes
- El orden de las etapas es fijo: revisar → crear → fotos (solo si hay) → abrir.
- La etapa "Revisando…" se queda mientras dura la revisión de parecidos. Si esa revisión abre la hoja de reportes parecidos, el envío se libera (la persona decide ahí).
- Pendiente conocido, también en la web: si el animal se crea pero fallan las fotos, reintentar crearía un segundo reporte. No hace falta resolverlo en este cambio.

## Referencia web
`src/components/animals/nuevo/NewAnimalForm.tsx` (`handleSubmit`, `PublishStage`, `submittingRef`).

## Criterios de aceptación
- [ ] Dos toques rápidos en Publicar crean un solo reporte.
- [ ] El botón muestra cada etapa con el indicador y no se ve atenuado.
- [ ] Tras publicar, el botón no regresa a "Publicar reporte" antes de abrir la ficha.
- [ ] Si falla, el botón se libera y el error se muestra.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
