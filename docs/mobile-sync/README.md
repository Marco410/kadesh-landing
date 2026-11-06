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
| 2026-10-28 | [Pedir cuenta al reportar sin salir de la pantalla](2026-10-28-cuenta-al-reportar.md) | auth | pendiente |
| 2026-10-28 | [Reportes parecidos, comentar en vez de duplicar y pedir el reporte](2026-10-28-reportes-duplicados-y-reclamos.md) | animals | pendiente |
| 2026-11-03 | [Inicio del perfil: resumen, "Requiere atención" y KPIs](2026-11-03-inicio-perfil.md) | profile | pendiente |
| 2026-11-03 | [Chip «No verificada» en la ficha de veterinaria](2026-11-03-chip-no-verificada.md) | veterinaries | pendiente |
| 2026-11-03 | [Avisos por WhatsApp (opt-in y por tipo)](2026-11-03-avisos-whatsapp.md) | notifications | pendiente |
| 2026-11-04 | [Publicar reporte se ve ocupado y no se publica dos veces](2026-11-04-publicar-reporte-ocupado.md) | animals | pendiente |
| 2026-11-04 | [App y pantalla en cada petición, reporte de errores, actividad y límites contra abuso](2026-11-04-errores-contexto-y-abuso.md) | shared | pendiente |
| 2026-11-04 | [Eventos: ver, «Me interesa / Asistiré» y avisos](2026-11-04-eventos-ver-y-asistir.md) | events | pendiente |
| 2026-11-04 | [Eventos: publicar, «Mis eventos», editar y cancelar](2026-11-04-eventos-publicar.md) | events | pendiente |
| 2026-11-05 | [Espacios de rescate: activar, equipo y publicar a nombre de la organización](2026-11-05-espacios-de-rescate.md) | profile | pendiente |
| 2026-11-05 | [Señas particulares recortadas con «Ver más» en la ficha del animal](2026-11-05-senas-ver-mas.md) | animals | pendiente |
| 2026-11-05 | [Fichas de rescate, «Se quedó conmigo» y adopción con cartilla](2026-11-05-fichas-de-rescate-y-adopcion.md) | profile | pendiente |
