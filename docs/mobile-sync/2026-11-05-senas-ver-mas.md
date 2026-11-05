---
estado: pendiente
fecha: 2026-11-05
origen: kadesh-landing@develop
feature: animals
---

# Prompt para kadesh-pet-mobile: señas particulares recortadas con «Ver más» en la ficha del animal

## Contexto
En la ficha de un animal (perdido, encontrado, en adopción…), las «Señas particulares» pueden ser un párrafo muy largo (reportes copiados de Facebook de 500+ caracteres). En la web empujaban fuera de la vista el historial y el mapa, que son lo más importante del reporte. Ahora se muestran recortadas a unas pocas líneas con un botón «Ver más / Ver menos».

## Qué implementar en la app
En la pantalla de detalle del animal, el bloque «Señas particulares»:
- Muestra el texto recortado a **4 líneas** con puntos suspensivos al final.
- Debajo, un botón de texto **«Ver más»** (color de marca `kadesh` #216BFA, peso semibold, tamaño del texto del cuerpo) que expande el texto completo; ya expandido, el botón dice **«Ver menos»** y vuelve a recortarlo.
- El botón **solo aparece si el texto de verdad pasa de 4 líneas**. Una seña corta se ve completa y sin botón. La medición depende del ancho real (rotación, tamaño de fuente del sistema), no de contar caracteres.
  - Ojo en React Native: con `numberOfLines` puesto, Android solo reporta en `onTextLayout` las líneas visibles. Una forma fiable es medir con un `Text` sin límite (invisible o fuera del flujo) o medir la primera vez sin `numberOfLines`. Elige la que mejor encaje en la app.
- Accesibilidad: el botón con `accessibilityRole="button"` y `accessibilityState={{ expanded }}`, área táctil de al menos 44×44 pt (con `hitSlop` si el texto es más chico).
- Si no hay señas (`physical_description` vacío o null), el bloque no se pinta (como hoy).
- El resto de la ficha no cambia: datos (tipo, raza, sexo, edad, color, tamaño), autor, historial, mapa y veterinarias cercanas siguen igual y en el mismo orden.

Estilos con NativeWind y la paleta de la web. Funciona en modo claro y oscuro (etiqueta en gris `#5a5a5a` / `#9aa3b2` en oscuro; texto `#121212` / `#eef1f6` en oscuro).

## GraphQL
No hay cambios. El campo ya existe en el `Animal` de Keystone y la ficha ya debería pedirlo. Si la query de detalle de la app no lo incluye, agrégalo:

```graphql
query GetAnimal($where: AnimalWhereUniqueInput!) {
  animal(where: $where) {
    id
    physical_description
  }
}
```

Tipo:

```ts
interface AnimalDetail {
  id: string;
  /** Texto libre de quien reporta; puede ser largo. */
  physical_description?: string | null;
}
```

## Reglas y constantes
- Líneas visibles recortado: **4** (en la web, 4 en pantallas chicas y 3 en escritorio).
- Textos exactos: etiqueta «Señas particulares», botones «Ver más» y «Ver menos».
- El estado expandido es local a la pantalla (no se guarda); al volver a abrir la ficha empieza recortado.

## Referencia web
`src/components/animals/detail/AnimalInfoSection.tsx` (componente `PhysicalDescription`): `line-clamp` + `ResizeObserver` que compara `scrollHeight` con `clientHeight` para decidir si mostrar el botón, `aria-expanded` y `aria-controls`.

## Criterios de aceptación
- [ ] Una seña larga se ve en 4 líneas con «…» y el botón «Ver más»; al tocarlo se ve completa y el botón cambia a «Ver menos».
- [ ] Una seña corta (≤ 4 líneas) se ve completa y sin botón.
- [ ] Al girar el teléfono o cambiar el tamaño de fuente del sistema, el botón aparece o desaparece según corresponda.
- [ ] Lectores de pantalla anuncian el botón y si está expandido.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
