# Veterinarias

Directorio de clínicas cerca del usuario. Es una **herramienta** (lista + mapa), no una landing: el mapa ocupa el resto de la pantalla y la lista es un panel.

## Promesa

Encontrar una veterinaria cercana con distancia, horario y contacto. El mapa y las fichas comparten selección: pin ↔ ficha. Tocar la ficha centra el mapa; **Ver ficha** abre `/veterinarias/[id]`.

## UI

- Sin franja azul de héroe. El H1 vive en el panel. Sin pie del sitio: el split lista + mapa ocupa `100dvh` menos la barra.
- Radio en chips (`5–30 km`) con `aria-pressed`. Vive también en `?radius=` para compartir la búsqueda. Si el radio actual no tiene resultados, el vacío propone el siguiente (`Buscar en 10 km`, etc.).
- Ficha de lista: pin de marca (el mismo del mapa), abierto/cerrado, distancia, llamar, ver ficha. No es el recuadro-mapa de la portada: aquí la densidad importa.
- Oscuro: `night` / `night-raised`, no OLED.

## Mapa

Mismo stack gratuito que animales: **Leaflet + MapLibre GL + OpenFreeMap Liberty** (`src/components/shared/free-map.ts`), empaquetado en la app. Sin API de Google Maps. Pins y acentos usan `--color-kadesh`.

El mapa pinta `allPlaces` del query; la lista pagina de a 10.

## Ficha (`/veterinarias/[id]`)

En escritorio es un lienzo de una pantalla (`100dvh`, sin footer): identidad, un solo **Cómo llegar** (abre la ruta en Maps) y llamar arriba; mapa + contacto a la izquierda; horarios agrupados, servicios y reseñas a la derecha. El backend guarda el día en español (`Lunes`, `Miércoles`…); se agrupan por horario (p. ej. «Lunes a sábado»). Las reseñas hacen scroll interno y muestran «Más reseñas» mientras haya contenido debajo. El mapa no abre el popup al cargar. En móvil la columna se apila y sí puede hacer scroll de página.

## Copy

Nunca decimos «Google Maps», «Leaflet» ni el nombre del tile server. Si el usuario niega la ubicación, pedimos activarla en el navegador — sin emojis.

## Acceso

Público. El radio filtra el listado GraphQL.
