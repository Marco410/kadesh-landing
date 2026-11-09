---
estado: pendiente
fecha: 2026-11-05
origen: kadesh-landing@feat/espacios-de-rescate (sin commit)
feature: profile
---

# Prompt para kadesh-pet-mobile: Traspasar una mascota a otra cuenta con un código

## Contexto
Una mascota puede pasar a otra cuenta con toda su cartilla: datos, fotos, vacunas y demás registros, y recordatorios. Quien la da genera un **código** («7KQ2-M9XA») y quien la recibe lo escribe en su cuenta. Sirve en dos casos:
- una familia da su mascota a otra persona;
- un espacio de rescate entrega un animal en adopción. Es la otra opción, además de «Completar adopción por correo» de la Fase 2: el espacio no necesita conocer el correo del adoptante.

## Qué implementar en la app

### 1. Dar: «Traspasar»
- **Dónde aparece**:
  - En la cartilla de una mascota, solo si el usuario es su **dueño principal** y la mascota está **activa**. Va junto a Editar.
  - En la ficha de un espacio de rescate, en el bloque «¿Ya tiene familia?», como **Entregar con código**. Solo para admin y coordinación, y va junto a «Por correo».
- **El modal «Traspasar a <nombre>»**:
  - Al abrir, consulta `PetTransferCodes`.
  - Texto de una familia: «Quien lo reciba escribe el código en "Mis mascotas → Recibir con código" (o abre el enlace). <nombre> pasará a su cuenta con su cartilla completa (fotos, vacunas y recordatorios) y dejará de estar en la tuya y en la de tu familia».
  - Texto de un espacio: «… saldrá de las fichas de <espacio> y su publicación quedará como "Adoptado"».
- **Si hay un código vigente** (`isExpired` en false):
  - Lo muestra grande en monoespaciada: «7KQ2-M9XA», con guion después del cuarto carácter.
  - Debajo: «Vence el 12 de noviembre, 6:30 p.m. Solo sirve una vez». Usa la hora de CDMX. Si el código trae mensaje, muéstralo.
  - Acciones:
    - **Copiar código**.
    - **Mandar por WhatsApp**: abre WhatsApp con el texto «Te paso a <nombre> en KADESH con su cartilla. Entra aquí y acepta: https://pet.kadesh.com.mx/perfil?tab=pets&codigo=7KQ2-M9XA (código 7KQ2-M9XA)». Usa `Share` o `Linking` con `https://wa.me/?text=…`.
    - **Copiar enlace**.
    - **Generar otro**: genera uno nuevo y el anterior se cancela solo.
    - **Cancelar código**.
- **Si no hay código vigente**:
  - Campo opcional «Mensaje para su nueva familia», de hasta 300 caracteres, con el placeholder «Le encanta el parque, come croquetas de cachorro…».
  - Debajo, el texto «El código vale 7 días y solo sirve una vez. Puedes cancelarlo antes».
  - Botón **Generar código**.
- **Errores**: las mutaciones devuelven `success: false` y un `message`; muéstralo en un toast.

### 2. Recibir: «Recibir con código»
- **Dónde está**: en Mis mascotas, el botón **Recibir con código** aparece siempre, también en la pantalla vacía.
- **Enlace profundo**: `https://pet.kadesh.com.mx/perfil?tab=pets&codigo=XXXX-XXXX` debe abrir la app en Mis mascotas con el modal abierto y el código escrito. Si el código está completo, revísalo de inmediato. Si no hay sesión, primero el login y luego el modal.
- **El modal «Recibir una mascota»**:
  - Campo «Código»: mayúsculas, sin autocorrección, en monoespaciada. Se formatea mientras se escribe («7KQ2-M9XA»), aceptando solo letras y números, hasta 8.
  - Ayuda bajo el campo: «Te lo da quien te entrega a la mascota: su familia o el espacio de rescate».
  - **Revisar código** llama a `PreviewPetTransferCode`. Si `success` es false, muestra `message` bajo el campo, en rojo.
  - **Si es válido**, muestra una tarjeta con:
    - la foto;
    - el nombre;
    - «Especie · Raza»;
    - «Te la pasa <nombre>» (o «Te lo entrega <espacio>» si `fromOrganization`);
    - el mensaje entre comillas, si trae;
    - el texto «Llegará a tu cuenta con su cartilla completa: fotos, vacunas, registros y recordatorios».
  - El botón cambia a **Recibir a <nombre>** y llama a `RedeemPetTransferCode`. Si sale bien, muestra un toast con `message`, cierra el modal, abre la cartilla de `petId` y recarga la lista.
  - Si el usuario edita el código, la tarjeta desaparece.

### 3. Notificación
`pet.transfer_redeemed` le llega a quien dio la mascota: «<nombre> ya está con su nueva familia». Usa el tono verde y el ícono de rescate. Su `url` lleva a la lista (Mis mascotas o las fichas del espacio), porque la mascota ya no es suya.

## GraphQL

```graphql
query PetTransferCodes($petId: ID!) {
  petTransfers(
    where: { pet: { id: { equals: $petId } }, status: { equals: "pending" } }
    orderBy: [{ createdAt: desc }]
    take: 1
  ) {
    id
    code       # sin guion: "7KQ2M9XA"
    status     # pending | redeemed | cancelled
    expiresAt
    isExpired  # pending pero ya pasó expiresAt
    message
  }
}

mutation CreatePetTransferCode($petId: ID!, $message: String) {
  createPetTransferCode(petId: $petId, message: $message) {
    success
    message
    transfer { id code status expiresAt isExpired message }
  }
}

mutation CancelPetTransferCode($transferId: ID!) {
  cancelPetTransferCode(transferId: $transferId) { success message }
}

# Es mutación (no query) para que cuente en el tope de intentos.
mutation PreviewPetTransferCode($code: String!) {
  previewPetTransferCode(code: $code) {
    success
    message
    petName
    species          # AnimalType.name: dog, cat, bird, fish, reptil, mammal
    breed
    photoUrl
    fromName
    fromOrganization
    transferMessage
    expiresAt
  }
}

mutation RedeemPetTransferCode($code: String!) {
  redeemPetTransferCode(code: $code) { success message petId }
}
```

Tipos TypeScript:

```ts
interface PetTransferCode {
  id: string;
  code: string; // sin guion
  status: 'pending' | 'redeemed' | 'cancelled';
  expiresAt: string;
  isExpired?: boolean | null;
  message?: string | null;
}

interface PetTransferPreview {
  success: boolean;
  message: string;
  petName?: string | null;
  species?: string | null;
  breed?: string | null;
  photoUrl?: string | null;
  fromName?: string | null;
  fromOrganization?: boolean | null;
  transferMessage?: string | null;
  expiresAt?: string | null;
}
```

## Reglas y constantes
- **El código**:
  - Tiene 8 caracteres del alfabeto `23456789ABCDEFGHJKMNPQRSTUVWXYZ`: sin 0/O ni 1/I/L.
  - Se muestra con guion después del cuarto («7KQ2-M9XA»).
  - Al mandarlo, normaliza: mayúsculas, sin guiones ni espacios. El backend acepta ambos formatos.
  - Vale **7 días** y se usa **una vez**. Generar uno nuevo cancela el anterior.
- **Quién puede dar**: el dueño principal de una mascota activa, o admin y coordinación si es ficha de un espacio. Una mascota perdida primero se cierra con «Ya regresó a casa»; el backend lo explica en `message`.
- **Qué pasa al recibir**:
  - Quien recibe queda como **único dueño principal**, y la familia anterior deja de verla.
  - Si era ficha de un espacio, sale del espacio, su reporte queda «Adoptado», en su cartilla se ve «Adoptado con <espacio>», y las solicitudes de adopción abiertas se cierran.
- **Topes del backend**:
  - 20 códigos al día.
  - 15 intentos por hora entre revisar y canjear, para que nadie adivine códigos. Al pasarse, el API responde con un error de límite: muéstralo tal cual.
- **Errores que ya vienen en `message`**: código inexistente, vencido, cancelado, ya usado, propio («Es tu propio código: compártelo…») o «ya está en tu cuenta».

## Referencia web
- `src/components/pets/TransferPetModal.tsx`
- `src/components/pets/ReceivePetModal.tsx`
- `src/components/pets/transferCode.ts`
- `src/components/pets/MyPetsSection.tsx` (parámetro `codigo`)
- `src/components/pets/PetDetail.tsx` («Traspasar»)
- `src/components/rescue/RescuePetPanel.tsx` («Entregar con código»)

## Criterios de aceptación
- [ ] El principal genera un código, lo manda por WhatsApp y otra cuenta lo recibe: la mascota aparece en la cuenta nueva con sus vacunas y recordatorios, y desaparece de la anterior y de su familia.
- [ ] Un espacio entrega una ficha con código: sale de «Fichas» y la familia ve «Adoptado con <espacio>».
- [ ] El enlace `…/perfil?tab=pets&codigo=…` abre el modal con el código escrito, también después del login.
- [ ] Los códigos vencidos, cancelados, ya usados o propios muestran su mensaje.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
