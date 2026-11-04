---
estado: pendiente
fecha: 2026-11-03
origen: kadesh-landing@feat/panel-cuenta (sin commit)
feature: veterinaries
---

# Prompt para kadesh-pet-mobile: chip «No verificada» en la ficha de veterinaria

## Contexto
En la ficha de una veterinaria, si está verificada se ve un check junto al nombre. Si no lo está, no se veía nada, y quien es dueño no tenía forma de saber que podía reclamarla sin bajar hasta el final. Ahora la web muestra un chip **No verificada** en la fila de calificación y abierto/cerrado. Al tocarlo, la ficha hace scroll hasta la sección **¿Es tu clínica?** (el reclamo), que la app ya tiene.

## Qué implementar en la app
En la pantalla de detalle de veterinaria:

1. **Cuándo se ve:** solo si la clínica **no** está verificada (regla abajo). Si está verificada, se queda como hoy (check junto al nombre) y no hay chip.
2. **Dónde:** en la fila de metadatos bajo el nombre y el tipo de negocio, después de la calificación y del chip Abierto/Cerrado. Si la fila no cabe, salta de línea (wrap), no se recorta.
3. **Aspecto:** pastilla redondeada (`rounded-full`), texto `xs` en negrita, ícono de alerta de 12 px a la izquierda (`AlertCircleIcon` de `@hugeicons/react-native`). Tono ámbar suave, no de error:
   - Claro: borde `amber-500` al 50 %, fondo `amber-50`, texto `amber-800`.
   - Oscuro: borde `amber-400` al 40 %, fondo `amber-400` al 10 %, texto `amber-300`.
4. **Al tocarlo:** scroll animado hasta la sección de reclamo (la que muestra «¿Es tu clínica?», «Ficha en revisión» o «Solicitud enviada» según el estado). Deja un pequeño margen arriba para que el título de la sección no quede pegado al header. Con «Reducir movimiento» activo en el sistema, el salto es sin animación.
5. **Área táctil:** el chip es pequeño (~20 px de alto); amplía el área de toque a ≥ 44 px con `hitSlop` sin cambiar su tamaño visual.
6. **Accesibilidad:** `accessibilityRole="button"`, etiqueta «No verificada», `accessibilityHint` «Ir a ¿Es tu clínica?».

Solo va en la ficha de detalle. En el listado/directorio no se pone, porque la mayoría de las clínicas no están verificadas y sería ruido.

## GraphQL
No hay operaciones nuevas. La consulta de detalle de la veterinaria ya debe traer estos dos campos del `PetPlace` (en la app ya están en la consulta de detalle; confirma que siguen ahí):

```graphql
query PetPlace($where: PetPlaceWhereUniqueInput!) {
  petPlace(where: $where) {
    id
    name
    verified
    claimStatus
    # … resto de campos que la ficha ya usa
  }
}
```

Tipos:

```ts
type PetPlaceClaimStatus = "unclaimed" | "pending" | "verified" | "rejected";

interface PetPlaceVerificationFields {
  verified: boolean | null;
  claimStatus: PetPlaceClaimStatus | string | null;
}
```

## Reglas y constantes
- **Está verificada** si `verified === true` **o** `claimStatus === "verified"`. Es la misma regla que ya usa la sección de reclamo para decidir qué mostrar; úsala también para el check del nombre, para que chip, check y sección nunca se contradigan.
- Si no está verificada, la sección de reclamo siempre se muestra (en alguno de sus estados), así que el chip siempre tiene a dónde llevar.
- Copy exacto: «No verificada» (femenino, como «Verificada»: la clínica/ficha).
- Textos de la sección de destino (ya existen en la app; no cambian):
  - Título «¿Es tu clínica?»
  - «Reclámala para completar horarios, contacto y servicios. Validamos que seas tú por WhatsApp.»
  - Beneficios: «Horarios reales y si atienden urgencias», «Teléfono, WhatsApp y correo de la clínica», «Redes (Instagram, Facebook y más)», «Dirección y cómo llegar», «Sitio web, cita previa y estacionamiento».

## Referencia web
- `src/components/veterinaries/UnverifiedChip.tsx`: el chip y el scroll suave.
- `src/app/veterinarias/[slug]/page.tsx`: dónde va en el encabezado y la regla `isVerified`.
- `src/components/veterinaries/ClaimPetPlaceSection.tsx`: la sección de destino (`id="reclamar"`).

## Criterios de aceptación
- [ ] Una clínica con `verified: false` y `claimStatus: "unclaimed"` muestra «No verificada» y, al tocarlo, la pantalla baja hasta «¿Es tu clínica?».
- [ ] Con `claimStatus: "pending"` el chip sigue visible y lleva a «Ficha en revisión» o «Solicitud enviada».
- [ ] Con `verified: true` o `claimStatus: "verified"` no hay chip y sí el check junto al nombre.
- [ ] Con «Reducir movimiento» el salto no se anima.
- [ ] Lector de pantalla anuncia «No verificada, botón».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
