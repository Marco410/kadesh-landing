---
estado: pendiente
fecha: 2026-11-13
origen: kadesh-landing@feat/cerrar-caso-reencuentros
feature: animals
---

# Prompt para kadesh-pet-mobile: nombre desconocido (vacío) en lugar de «Sin nombre»

## Contexto
Antes, cuando no se sabía el nombre de un animal, la web guardaba el texto «Sin nombre» en `Animal.name` y lo mostraba como si fuera su nombre («¿Sin nombre volvió a casa?»). Ahora el nombre desconocido se guarda **vacío** y, para mostrarlo, se describe al animal: «Perra café» en títulos y tarjetas, «esta perra» dentro de una frase.

Al reclamar un reporte, quien dice ser la familia puede escribir cómo se llama su mascota. Si la solicitud se aprueba y el reporte no tenía nombre, ese pasa a ser su nombre.

kadesh-back ya convierte en vacío «Sin nombre», «Desconocido», «No sé», etc., así que una versión vieja de la app sigue funcionando. Pero la app debe mostrar bien los nombres vacíos.

## Qué implementar en la app
1. **Una sola función para mostrar el nombre** (usa la misma regla en toda la app):
   - `isUnknownAnimalName(name)`: verdadero si está vacío o es un texto de relleno (lista abajo), sin distinguir acentos ni mayúsculas.
   - `animalDisplayName({ name, typeName, sex, color })`: el nombre real, o la forma del tipo según el sexo más el color en minúsculas si mide 24 caracteres o menos. Ejemplos: «Perra café», «Gato negro», «Ave», «Animal».
   - `animalSentenceName(...)`: el nombre real, o «este perro», «esta perra», «este gato», «esta gata», «esta ave», «este pez», «este reptil» o «este animal». Al inicio de una frase, primera letra en mayúscula («¿Esta perra ya volvió a casa?»).
   - `typeName` sale de `animal_type.name` o, si no hay, de `animal_breed.animal_type.name`. Valores: `dog`/`perro`, `cat`/`gato`, `bird`/`ave`, `fish`/`pez`, `reptil`; cualquier otro usa la forma «Animal».
2. **Úsala en todo lugar donde hoy salga `animal.name`:** ficha (título), tarjetas y lista del mapa, portada, alertas de zona, «Cerrar caso», «Se quedó conmigo», compartir, impulsar, editar, mis reportes, espacios de rescate y adopciones. En adopciones, el título de una solicitud sin nombre es «Animal en adopción». Nunca muestres «Sin nombre».
3. **Formulario de reporte y de edición:**
   - La casilla «No tiene nombre» pasa a llamarse **«No sé su nombre»**.
   - Marcada: el campo se deshabilita, se guarda `name: ""` y abajo se muestra «Lo mostraremos por su tipo y color (por ejemplo, «Perra café»). Si su familia aparece, podrá ponerle su nombre.».
   - Sigue marcada por defecto en encontrado, abandonado y rescatado.
   - Error si no hay nombre ni casilla: «Escribe su nombre o marca «No sé su nombre».».
   - Al editar un reporte cuyo nombre es desconocido, la casilla empieza marcada.
   - Si la app guarda borradores con `name: "Sin nombre"`, al restaurarlos trátalos como casilla marcada.
4. **Solicitud para quedarse con el reporte («Es mi mascota»):**
   - Nuevo campo opcional «¿Cómo se llama tu mascota?» (máx. 60), con la ayuda «Opcional. Ayuda a confirmar que es tu mascota.» si el reporte tiene nombre, o «Opcional. Si aceptan tu solicitud, el reporte llevará este nombre.» si no.
   - Se manda como `petName`.
   - En el panel de solicitudes de quien atiende el reporte, si viene `petName`, muestra «Dice que se llama **{petName}**» arriba del mensaje.
5. **Reportes parecidos:** usa el campo nuevo `displayName` para mostrar. `name` llega vacío si no se sabe.

## GraphQL

```graphql
# Ficha: pide también el tipo directo (los reportes sin raza no lo traen en animal_breed)
query GetAnimal($where: AnimalWhereUniqueInput!) {
  animal(where: $where) {
    id
    name
    sex
    color
    animal_type { id name }
    animal_breed { id breed animal_type { id name } }
    # …lo demás que ya pide la app
  }
}

mutation CreateAnimalClaim($data: AnimalClaimCreateInput!) {
  createAnimalClaim(data: $data) { id status }
}
# data: { animal: { connect: { id } }, message, phone, petName?, evidence? }

query GetAnimalClaims($animalId: ID!) {
  animalClaims(where: { animal: { id: { equals: $animalId } } }, orderBy: [{ createdAt: desc }]) {
    id status message phone petName claimantName rejectReason createdAt
    evidence { url }
    claimant { id }
  }
}

# findAnimalReportDuplicates(...) { id name displayName slug url … }
```

```ts
const PLACEHOLDERS = [
  '', 'sin nombre', 'sin nombre conocido', 'desconocido', 'desconocida', 'nombre desconocido',
  'no se', 'no lo se', 'no se su nombre', 'no tiene nombre', 'no tiene', 'ninguno',
  'unknown', 'unnamed', 'n/a', 'na', '?',
]; // comparar sin acentos y en minúsculas

export interface AnimalClaim {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message: string;
  phone?: string | null;
  petName?: string | null;
  claimantName?: string | null;
}
```

## Reglas y constantes
- Nunca mandes «Sin nombre» como nombre: manda `""`.
- `petName` solo cambia el nombre del reporte al aprobar, y solo si el reporte no tenía nombre. Eso lo hace el back.
- El slug no cambia al ponerle nombre.

## Referencia web
- `src/components/animals/animalName.ts`
- `src/components/animals/nuevo/AnimalNameInput.tsx`
- `src/components/animals/claim/ClaimReportForm.tsx`
- `src/components/animals/detail/AnimalClaimsPanel.tsx`
- Back: `kadesh-back/utils/pet/animalName.ts`

## Criterios de aceptación
- [ ] En ninguna pantalla sale «Sin nombre»: sale la descripción o «este animal».
- [ ] Se puede publicar y editar con «No sé su nombre» y se guarda `name: ""`.
- [ ] La solicitud manda `petName` y el panel lo muestra.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
