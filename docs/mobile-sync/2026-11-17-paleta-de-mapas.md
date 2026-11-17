---
estado: pendiente
fecha: 2026-11-17
origen: kadesh-landing@feat/portada-orden
feature: shared
---

# Prompt para kadesh-pet-mobile: paleta de mapas de Kadesh (claro y oscuro)

## Contexto
En la web todos los mapas (animales, ficha, veterinarias, eventos, zona de alertas, portada) usan ahora una sola paleta, la del mapa ilustrado de la portada. Antes se veían en Liberty de OpenFreeMap y, en oscuro, oscurecidos con filtros: grises y apagados. La app debe verse igual.

## Qué implementar en la app
1. Usa como base el estilo Liberty de OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`, sin API key) si la app usa MapLibre. Si usa otro motor (Google Maps, Apple Maps), aplica la misma paleta con el sistema de estilos de ese motor.
2. Al cargarlo, cambia los colores capa por capa según la tabla y oculta lo que la ilustración no tiene. Arma un estilo para claro y otro para oscuro, una vez por sesión, y cambia el del mapa cuando cambie el tema del sistema o de la app, sin recrear el mapa ni perder los marcadores.
3. Mientras baja el estilo, pinta solo el fondo (`ground`) del tema, para que no parpadee.
4. **Un solo pin en todos los mapas**, en un solo trazo:
   - **Forma:** círculo de radio 18 del color del estado, con una punta abajo que marca el lugar exacto. Borde blanco de 2.5 px alrededor de todo y sombra suave.
   - **SVG:** de 40 × 48, con el ancla en la punta (20, 46). El trazo es `M20 2a18 18 0 0 1 8.5 33.9L20 46l-8.5-10.1A18 18 0 0 1 20 2z`.
   - **Adentro:** huella blanca para animales, «T» blanca para veterinarias (color de la marca) y un punto blanco para el lugar elegido y los eventos.
   - **«Perdido»:** un aro del mismo color late en la punta.

## Paleta

| Elemento | Claro | Oscuro |
|---|---|---|
| Fondo (`background`, `ground`) | `#eef3f8` | `#1a2433` |
| Usos de suelo (residencial, etc.) | `#e8eef5` | `#1c2737` |
| Parques, pasto, bosque, canchas, cementerios | `#d5e4d8` | `#1e3a2a` |
| Agua y ríos | `#dbe6f4` | `#1c2d48` |
| Edificios | `#e2e9f1` | `#202c3d` |
| Calles principales | `#ffffff` | `#2a3548` |
| Calles menores, servicio, peatonales | `#fbfcfe` | `#253042` |
| Bordes de calle (casing) | `#e1e8f0` | `#1a2433` |
| Límites | `#c3cedb` (70 %) | `#33415a` (70 %) |
| Texto de etiquetas | `#6b7a8f` | `#8a98ad` |
| Halo de etiquetas (1.2) | `#eef3f8` | `#1a2433` |

## Reglas por capa (sobre Liberty)
- **Se ocultan** (`visibility: none`): capas `raster` (relieve), `fill-extrusion` (edificios 3D), `source-layer` `poi`, `aeroway`, `aerodrome_label`, y toda capa cuyo id contenga `shield`, `one_way`, `rail` o sea `road_area_pattern`.
- **`fill`:** quita `fill-pattern` y `fill-outline-color`; `fill-opacity` 1.
  - Agua (`source-layer` `water`) → agua.
  - Ids `park` o con `grass`, `wood`, `wetland`, `pitch` o `cemetery` → parque.
  - `source-layer` `building` → edificios.
  - El resto → usos de suelo.
- **`line`:** quita `line-pattern` y `line-dasharray`.
  - `waterway` → agua; `park` → parque; `boundary` → límites al 70 %.
  - Ids con `casing` → bordes.
  - Ids con `minor`, `service`, `street` o `path` → calles menores.
  - El resto → calles principales.
  - Túneles (`tunnel_*`) al 50 % y peatonales al 60 %.
- **`symbol`:** quita `icon-image` y deja solo el texto con el color y el halo de la tabla.

## Referencia web
- `src/components/shared/kadeshMapStyle.ts` (paleta y `recolor`)
- `src/components/shared/kadeshPin.ts` (el pin)
- `src/components/shared/free-map.ts` (`createFreeMap`, `applyFreeMapThemeClass`, `createPawPinIcon`)
- `src/components/home/HeroMap.tsx` (la ilustración de la que sale la paleta)

## Criterios de aceptación
- [ ] Todos los mapas de la app usan la paleta, en claro y en oscuro.
- [ ] Al cambiar el tema, el mapa cambia de colores sin recrearse ni perder marcadores.
- [ ] Sin puntos de interés, escudos ni flechas de un sentido.
- [ ] No parpadea en blanco al abrir un mapa en oscuro.
- [ ] El mismo pin (círculo con punta) en todos los mapas, con la punta en el lugar exacto.
- [ ] Funciona en iOS y Android.
