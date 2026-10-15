---
estado: pendiente
fecha: YYYY-MM-DD
origen: kadesh-landing@<rama> (<commit, si existe>)
feature: animals | veterinaries | blog | profile | auth | notifications | shared
---

# Prompt para kadesh-mobile: <título>

## Contexto
Qué cambió en la web y por qué (1–3 frases). Qué ve o puede hacer ahora el usuario.

## Qué implementar en la app
Pasos concretos usando la estructura de `kadesh-mobile`:
- Pantallas en `app/…` (Expo Router) y componentes en `kadesh/components/<feature>/…`.
- Equivalencias nativas cuando la web usa APIs del navegador: SecureStore (en vez de localStorage), `expo-location`, `expo-image-picker` + `expo-image-manipulator`, MapLibre RN, `Share`/`Linking`, `sonner-native`.
- Estilos con NativeWind y la paleta orange/green/brown. Íconos solo de `@hugeicons/react-native`. Validación con Zod.

## GraphQL
Queries/mutaciones completas para copiar en `kadesh/components/<feature>/queries.ts`:

```graphql
# pega aquí la operación completa
```

Tipos TypeScript nuevos o modificados:

```ts
// pega aquí los tipos
```

## Reglas y constantes
Valores, permisos (roles), estados, textos o validaciones que la app debe respetar igual que la web.

## Referencia web
Archivos de `kadesh-landing` con la implementación original (solo como referencia; el prompt no debe depender de poder leerlos).

## Criterios de aceptación
- [ ] …
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
