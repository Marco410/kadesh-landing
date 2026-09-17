# Perfil

Cuenta de quien ya tiene sesión: datos, publicaciones del blog, los reportes de animales que publicó y las clínicas que reclamó.

## Promesa

Editar lo que sí se puede cambiar (nombre, teléfono, foto) y ver la actividad propia. No es un CRM ni una landing.

## UI

- Sin footer del sitio. H1 **Perfil**, `pt-[72px]`, `night` / `night-raised`, chips de pestaña (contorno vs relleno de marca).
- Cuatro pestañas: **Datos**, **Publicaciones**, **Reportes**, **Clínicas**. `?tab=` (`profile` | `posts` | `animals` | `clinics`). Flechas del teclado recorren las pestañas.
- Vacío con siguiente paso: Reportes invita a publicar; Publicaciones manda al blog; Clínicas manda al directorio para reclamar una ficha.
- No hay pestañas de “próximamente” (donaciones, refugios, mascotas) ni **Ventas**.
- Correo y usuario no se editan aquí: se manda a **contacto**. Edad no se muestra: sale de la fecha de nacimiento.
- Al guardar: nombre y apellido paterno obligatorios. Teléfono obligatorio, 10 dígitos (espacios y guiones se quitan); Keystone no acepta `null` en ese campo. Fecha de nacimiento opcional, no posterior a hoy.

## Clínicas

Solo aparecen las que el usuario reclamó. **En revisión**: no se editan; se reenvía WhatsApp. **Verificada**: formulario de nombre, descripción, teléfono, WhatsApp, correo, sitio, redes, dirección, urgencias, estacionamiento y cita. Las redes no se guardan como texto suelto: se reemplazan en `SocialMedia` (Facebook, Instagram, X, LinkedIn, TikTok). Cambiar el nombre no cambia la URL pública. El copy de reclamo vive también en la ficha pública; beneficios y tono deben coincidir.

## Ventas

El CRM de ventas (`/perfil/ventas`) redirige a `/perfil`. Quien llegue con `?tab=ventas` cae en Datos.

## Acceso

Exige sesión. Si no hay usuario, va a login y vuelve a `/perfil`.
