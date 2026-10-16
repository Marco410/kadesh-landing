# Registro de cambios — kadesh-landing

Todo cambio en este repo se anota aquí, el más reciente arriba. La línea `Móvil:` enlaza al prompt de `docs/mobile-sync/` o explica por qué no aplica a la app. La regla completa está en `CLAUDE.md`, en la sección "Registro de cambios y sincronización con móvil".

Formato:

```md
## YYYY-MM-DD · <tipo>: <título corto>
- Rama: <rama>
- Qué cambió y por qué: …
- Archivos: src/…, src/…
- GraphQL: queries/mutaciones nuevas o modificadas (o "ninguna")
- Móvil: [prompt](../mobile-sync/YYYY-MM-DD-<slug>.md) | no aplica (motivo)
```

---

## 2026-10-16 · fix: agregar registro a un animal fallaba por el teléfono
- Rama: develop
- Qué cambió y por qué: el modal "Registro de …" mandaba `contactNumber` en `createAnimalLog`, pero `AnimalLogCreateInput` no tiene ese campo (el teléfono vive en `Animal`), así que guardar fallaba con "Field contactNumber is not defined". Se quita el campo Teléfono del modal y de la mutación.
- Archivos: src/components/animals/detail/AddLogModal.tsx, src/components/animals/detail/hooks/useCreateLog.ts, src/components/animals/queries.ts
- GraphQL: `CreateAnimalLogVariables` ya no incluye `contactNumber` (la operación no cambia)
- Móvil: no aplica (la app guarda el teléfono en `Animal` y su codegen tipado no permite mandarlo en `AnimalLog`)

## 2026-10-15 · docs: dirección inversa de la sincronización (móvil → web)
- Rama: develop
- Qué cambió y por qué: ya existe `kadesh-pet-mobile` (Expo + Clean Architecture). Se añade a `CLAUDE.md` cómo revisar e implementar los prompts de `../kadesh-pet-mobile/docs/web-sync/`, y se actualiza la plantilla de `mobile-sync` para que no prescriba la estructura antigua de la app (`kadesh/components/<feature>/queries.ts`).
- Archivos: CLAUDE.md, docs/mobile-sync/_TEMPLATE.md, docs/changes/CHANGELOG.md
- GraphQL: ninguna
- Móvil: no aplica (documentación del proceso)

## 2026-10-15 · docs: regla de registro de cambios y sincronización con móvil
- Rama: develop
- Qué cambió y por qué: se añade la regla de registrar cada cambio y generar prompts para la futura app `kadesh-pet-mobile` (Expo), para que la app no se quede atrás de la web.
- Archivos: CLAUDE.md, docs/changes/CHANGELOG.md, docs/mobile-sync/README.md, docs/mobile-sync/_TEMPLATE.md
- GraphQL: ninguna
- Móvil: no aplica (es documentación del proceso, no una funcionalidad)
