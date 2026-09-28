## Release: `develop` → `main`

Este PR se genera automáticamente cuando hay commits en `develop` que aún no están en `main`.

### Antes de mergear
- [ ] El CI de este PR está en verde
- [ ] Probaste lo crítico en el entorno de `develop` / preview
- [ ] El mensaje de merge describe el cambio en lenguaje de producto (alimenta SystemRelease Pet)

### Flujo
1. Features → PR a **`develop`**
2. CI pasa en `develop`
3. Este PR promueve a **`main`** (producción)
4. Al mergear `main`, corre el aviso de novedades a kadesh-back
