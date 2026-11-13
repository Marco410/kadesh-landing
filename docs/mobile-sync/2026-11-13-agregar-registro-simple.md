---
estado: pendiente
fecha: 2026-11-13
origen: kadesh-landing@feat/cerrar-caso-reencuentros
feature: animals
---

# Prompt para kadesh-pet-mobile: «Agregar registro» más simple

## Contexto
El formulario para agregar un registro a un reporte pedía todo desde cero: estado (empezaba en «Perdido» aunque el caso fuera otro), una fecha con selector de calendario y la casilla «Fue hoy», pin en el mapa, dirección, ciudad, estado y país obligatorios, y una nota. Casi siempre la persona solo quiere contar una novedad. Ahora el orden es: qué hay de nuevo → cuándo → dónde → estado, y todo lo demás viene ya resuelto.

## Qué implementar en la app
Hoja «Novedades de {nombre}» (para el nombre usa `animalDisplayName`; ver el prompt [nombre desconocido](2026-11-13-nombre-desconocido.md)):

1. **«¿Qué hay de nuevo?»**: texto obligatorio, con el foco al abrir.
   - Ejemplo según el estado:
     - `lost`: «Ej. Una vecina lo vio cerca del mercado a las 7 pm.»
     - `found`: «Ej. Sigue conmigo; ya lo revisó un veterinario.»
     - `rescued`: «Ej. Ya está en hogar temporal y comiendo bien.»
     - `abandoned`: «Ej. Sigue en la misma esquina; alguien le dejó agua.»
     - `in_adoption`: «Ej. Ya está vacunado y esterilizado.»
   - Error: «Cuenta qué hay de nuevo, aunque sea en una línea.»
2. **«¿Cuándo?»**: chips «Hoy» (por defecto), «Ayer» y «Otra fecha».
   - Con «Otra fecha» aparecen el día (sin fechas futuras) y «Hora, si la sabes».
   - Cómo se guarda: Hoy = ahora. Ayer = ayer a las 12:00. Otro día sin hora = 12:00, o la hora actual si el día es hoy. Nunca en el futuro.
3. **«¿Dónde?»**: si el último registro tiene coordenadas, chips «Mismo lugar» (por defecto) y «Otro lugar».
   - «Mismo lugar» muestra el texto del lugar anterior (`placeLabel`, o «ciudad, estado») y manda lat/lng/address/city/state/country del último registro.
   - «Otro lugar» abre el mapa. Solo exige el pin: ciudad, estado y país los completa el back con las coordenadas.
   - Si no hay registro anterior con coordenadas, va directo al mapa.
   - Con estado `lost` y «Otro lugar», casilla «Aquí lo vieron por última vez» (`last_seen`).
4. **Estado**: muestra «Sigue como [Perdido] · Cambiar». Arranca en el estado del último registro.
   - «Cambiar» abre los chips de los estados abiertos (`lost`, `found`, `rescued`, `abandoned`, `in_adoption`). Ya no aparece «Registrado». Cada chip lleva un punto con el color del estado (blanco cuando está elegido).
   - Debajo: «¿Ya volvió a casa o fue adoptado? Usa «Cerrar caso» en la ficha.»
5. **Botones**: «Cancelar» y «Guardar registro» («Guardando…» mientras guarda). Mientras guarda, la hoja no se cierra.
   - Al terminar: se cierra la hoja, se vuelve a pedir la ficha y se selecciona el registro nuevo.

## GraphQL
Misma mutación que ya usa la app:

```graphql
mutation CreateAnimalLog($data: AnimalLogCreateInput!) {
  createAnimalLog(data: $data) { id }
}
# data: { animal: { connect: { id } }, status, notes, lat, lng, address, city, state, country, last_seen, date_status }
```

## Reglas y constantes
- `city`, `state` y `country` pueden ir vacíos si hay `lat`/`lng`: el back los completa.
- Los estados finales (`in_family`, `adopted`, `closed`) no se ofrecen aquí.

## Referencia web
- `src/components/animals/detail/AddLogModal.tsx`
- `src/components/animals/detail/LogTimeline.tsx` (le pasa el último registro)

## Criterios de aceptación
- [ ] Una novedad «de hoy, en el mismo lugar» se guarda escribiendo solo la nota.
- [ ] La fecha nunca queda en el futuro.
- [ ] «Otro lugar» solo exige el pin.
- [ ] El estado arranca en el actual.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga y error.
