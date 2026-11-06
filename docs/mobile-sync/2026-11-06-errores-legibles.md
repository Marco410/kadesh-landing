---
estado: pendiente
fecha: 2026-11-06
origen: kadesh-landing@feat/espacios-de-rescate
feature: shared
---

# Prompt para kadesh-pet-mobile: mensajes de error legibles (nunca el texto crudo de GraphQL)

## Contexto
La web mostraba a veces el error tal como lo manda Keystone, en inglés y con nombres internos, por ejemplo «RescueOrganization.name: value must not be empty». Ahora todos los formularios de mascotas, cartilla, adopción y espacios de rescate pasan el error por un solo traductor. La persona ve el motivo en español que escribe el backend («El nombre debe tener al menos 3 letras.»), un mensaje genérico en español o «No hay conexión…». Nunca ve el texto técnico.

Además se corrigió un bug del backend que producía ese error: al verificar un espacio de rescate (solo se mandaba `status`), el backend validaba el nombre como si viniera vacío. Esa parte ya está en el servidor y la app no tiene que hacer nada.

## Qué implementar en la app
Una función compartida que convierta cualquier error de Apollo (de GraphQL o de red) en un texto para la persona. Úsala en **todos** los toasts y mensajes de error de mutaciones, en lugar de `error.message`.

Cómo llegan los errores de validación de Keystone (en `graphQLErrors[0].message`):

```
You provided invalid data for this operation.
  - RescueOrganization.name: value must not be empty
  - RescueOrganization: El nombre debe tener al menos 3 letras.
```

Reglas, en orden:
1. Si el error es de red (`Failed to fetch`, `Network error`, `Load failed`, o `networkError` sin `graphQLErrors`), muestra: «No hay conexión. Revisa tu internet e intenta de nuevo.»
2. Toma las líneas que empiezan con `- ` (viñetas). A cada una quítale la etiqueta hasta el primer `: ` (`Lista.campo: ` o `Lista: `). Ojo: solo la primera, porque hay mensajes como «WhatsApp: El número debe tener 10 dígitos.».
3. Si no hay viñetas, usa la primera línea del mensaje (los errores de las mutaciones personalizadas ya vienen en español, por ejemplo «Este código ya se usó.»).
4. Devuelve el primer candidato que **parezca español** y **no** sea técnico:
   - Parece español si coincide con `/[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|no|un|una|es|en|por|para|con|se|tu|su|sus|ya|al|lo|le|y|hay|debe|puedes)\b/i`.
   - Es técnico o inglés si coincide con `/prisma|graphql|keystone|apollo|variable "\$|cannot query field|field "|argument "|unexpected|internal server|is not a function|cannot read prop|undefined|null value|\b(the|is|are|was|were|not|an|of|to|for|with|from|this|that|must|value|cannot|invalid|should|unable|failed|found|expected|accepted|option|allowed|provided|required|please|error occurred)\b/i`.
   - Ignora también las líneas de encabezado «You provided invalid data for this operation.» y «An error occurred while resolving input fields.».
5. Si no hubo candidato, traduce los de Keystone conocidos:
   - `is not an accepted option` → «Una de las opciones elegidas ya no existe. Revisa tu selección y vuelve a guardar.»
   - `must not be empty` / `is required` → «Falta un dato obligatorio.»
   - `unique constraint` → «Ya existe un registro con ese dato. Usa otro.»
   - `access denied` / `you cannot update` → «No tienes permiso para hacer esto. Si crees que es un error, vuelve a iniciar sesión.»
   - `too many requests` → «Demasiados intentos seguidos. Espera un momento y vuelve a intentarlo.»
6. Si nada sirve, usa el texto de respaldo de cada pantalla (por ejemplo «No se pudo guardar. Intenta de nuevo.»).

## GraphQL
Ninguno nuevo. Aplica a cualquier operación.

```ts
// Firma sugerida
function userErrorMessage(error: unknown, fallback?: string): string; // fallback: 'No se pudo guardar. Intenta de nuevo.'
```

## Reglas y constantes
- Los textos de respaldo van en español, en tono cercano y con una acción («Intenta de nuevo», «Revisa tu internet»).
- Nunca mostrar `error.message` directo en un toast, alerta o texto de error.

## Referencia web
`src/utils/errorText.ts` (`friendlyErrorText`); `petErrorMessage`, `adoptionErrorMessage` y los demás helpers de la web lo usan.

## Criterios de aceptación
- [ ] Con el error de ejemplo de arriba, la app muestra «El nombre debe tener al menos 3 letras.».
- [ ] Con un error que solo trae «…: value must not be empty», muestra «Falta un dato obligatorio.».
- [ ] Con «RescueOrganization.species: 'other' is not an accepted option», muestra «Una de las opciones elegidas ya no existe…».
- [ ] Con un mensaje en inglés cualquiera («Something went wrong»), muestra el texto de respaldo.
- [ ] Sin internet, muestra el mensaje de conexión.
- [ ] Ningún toast ni alerta de la app usa `error.message` directo.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
