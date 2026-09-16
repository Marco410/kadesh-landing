# Perfil

Cuenta de quien ya tiene sesión: datos, publicaciones del blog y los reportes de animales que publicó.

## Promesa

Editar lo que sí se puede cambiar (nombre, teléfono, foto) y ver la actividad propia. No es un CRM ni una landing.

## UI

- Sin footer del sitio. H1 **Perfil**, `pt-[72px]`, `night` / `night-raised`, chips de pestaña (contorno vs relleno de marca).
- Tres pestañas: **Datos**, **Publicaciones**, **Reportes**. `?tab=` (`profile` | `posts` | `animals`). Flechas del teclado recorren las pestañas.
- Vacío con siguiente paso: Reportes invita a publicar; Publicaciones manda al blog.
- No hay pestañas de “próximamente” (veterinarias, donaciones, refugios, mascotas) ni **Ventas**.
- Correo y usuario no se editan aquí: se manda a **contacto**. Edad no se muestra: sale de la fecha de nacimiento.
- Al guardar: nombre y apellido paterno obligatorios. Teléfono obligatorio, 10 dígitos (espacios y guiones se quitan); Keystone no acepta `null` en ese campo. Fecha de nacimiento opcional, no posterior a hoy.

## Ventas

El CRM de ventas (`/perfil/ventas`) redirige a `/perfil`. Quien llegue con `?tab=ventas` cae en Datos.

## Acceso

Exige sesión. Si no hay usuario, va a login y vuelve a `/perfil`.
