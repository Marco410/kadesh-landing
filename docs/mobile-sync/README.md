# Prompts de sincronización web → móvil

Cada archivo de esta carpeta es un prompt **autocontenido** para implementar en `kadesh-pet-mobile` (Expo + Expo Router + NativeWind + Apollo) un cambio que se hizo en la web.

## Cómo usarlo

1. Elige un prompt con estado `pendiente` en la tabla de abajo.
2. Abre una sesión de Claude Code en `kadesh-pet-mobile` y pega el contenido del archivo (desde `# Prompt para kadesh-pet-mobile` hasta el final).
3. Al terminar, cambia `estado: implementado` en el frontmatter del archivo y en esta tabla. Si se decide no portarlo, usa `descartado` y anota el motivo.

Los prompts se crean con [`_TEMPLATE.md`](_TEMPLATE.md) y se nombran `YYYY-MM-DD-<slug>.md`. Impleméntalos en orden de fecha: uno puede depender de otro anterior.

## Índice

| Fecha | Prompt | Feature | Estado |
|---|---|---|---|
| 2026-10-23 | [Cartilla digital de la mascota](2026-10-23-cartilla-mascotas.md) | profile | pendiente |
