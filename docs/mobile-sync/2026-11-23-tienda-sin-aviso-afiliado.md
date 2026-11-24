---
estado: pendiente
fecha: 2026-11-23
origen: kadesh-landing@feat/vet-detail-redesign
feature: shared
---

# Prompt para kadesh-pet-mobile: quitar el aviso de enlace de afiliado de la tienda

## Contexto
La web ya no muestra el aviso «Enlace de afiliado: si compras, Kadesh recibe una comisión de Mercado Libre sin costo extra para ti.» ni la nota del listado «Los productos marcados «En Mercado Libre» llevan un enlace de afiliado…». Es una decisión de producto: no se le explica a quien compra.

## Qué implementar en la app
- En el detalle del producto (`src/modules/shop/product/presentation/ProductBuyBox.tsx`), quitar el texto `AFFILIATE_DISCLOSURE` debajo de «Ver en Mercado Libre». No poner nada en su lugar.
- En el catálogo (`src/modules/shop/catalog/presentation/CatalogScreen.tsx`), quitar la nota `AFFILIATE_LIST_NOTE` del pie de la lista.
- Borrar las constantes `AFFILIATE_DISCLOSURE` (`src/modules/shop/product/domain/product.ts`) y `AFFILIATE_LIST_NOTE` (`src/modules/shop/catalog/domain/catalog.ts`) si ya no se usan.
- Se queda igual: la etiqueta «En Mercado Libre», el precio aproximado con su fecha y el botón que abre Mercado Libre.

## GraphQL
Ninguno.

## Criterios de aceptación
- [ ] El detalle de un producto de Mercado Libre ya no muestra el aviso de comisión.
- [ ] El catálogo ya no muestra la nota del pie.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
