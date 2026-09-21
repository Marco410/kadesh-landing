# Perfil

Cuenta de quien ya tiene sesión: datos, publicaciones del blog, los reportes de animales que publicó, las citas que reservó y las clínicas que reclamó.

## Promesa

Editar lo que sí se puede cambiar (nombre, teléfono, foto) y ver la actividad propia. No es un CRM ni una landing.

## UI

- Sin footer del sitio. H1 **Perfil**, `pt-[72px]`, `night` / `night-raised`, chips de pestaña (contorno vs relleno de marca). Al tocar, la pestaña activa **desliza** el fondo kadesh (`layoutId`). El contenido entra y sale (`AnimatePresence`, 280ms, ease suave). Listas (reportes, clínicas, comentarios, pacientes) aparecen en cascada. **Administrar**, formularios de cita/paciente y el botón Guardar se revelan con altura. Clic: `scale` 0.97 (días del calendario 0.92). Si el sistema pide menos movimiento, no hay animación.
- Cinco pestañas: **Datos**, **Publicaciones**, **Reportes**, **Citas**, **Clínicas**. `?tab=` (`profile` | `posts` | `animals` | `appointments` | `clinics`). Flechas del teclado recorren las pestañas.
- Vacío con siguiente paso: Reportes invita a publicar; Publicaciones manda al blog; Citas manda al directorio para reservar; Clínicas manda al directorio para reclamar una ficha.
- No hay pestañas de “próximamente” (donaciones, refugios, mascotas) ni **Ventas**.
- Correo y usuario no se editan aquí: se manda a **contacto**. Edad no se muestra: sale de la fecha de nacimiento.
- Al guardar: nombre y apellido paterno obligatorios. Teléfono obligatorio, 10 dígitos (espacios y guiones se quitan); Keystone no acepta `null` en ese campo. Fecha de nacimiento opcional, no posterior a hoy.

## Citas

Son las que el usuario reservó como cliente, no las de la clínica que administra. El copy de estados vive alineado con la ficha (`Pendiente` no es confirmada). Cancelar pide confirmación y un motivo opcional; solo aparece si la cita está pendiente o confirmada. El flujo de reserva y las reglas de types están documentados en `src/components/veterinaries/README.md`.

## Clínicas

Solo aparecen las que el usuario reclamó. **En revisión**: no se editan; se reenvía WhatsApp. **Verificada**: **Administrar** abre Datos, Horarios, Servicios y Citas.

- **Datos**: nombre, descripción, **tipo de negocio** (casillas, varios; nunca vacío), teléfono, WhatsApp, correo, sitio, redes, dirección, urgencias, estacionamiento y cita. Las redes se reemplazan en `SocialMedia`. Cambiar el nombre no cambia la URL pública.
- La subnavegación Datos / Horarios / Servicios / Citas es **un recuadro**: las pestañas son la barra de arriba y el contenido es el mismo panel (fondo continuo, “Estás viendo …”). No son chips sueltos ni se parecen al tipo de negocio ni a las pestañas del perfil.
- **Horarios**: un renglón por día (casilla + abre/cierra). Los días apagados no salen en la ficha pública.
- **Servicios**: buscador + chips de lo marcado. El catálogo (`PetPlaceService` aprobado) no se recorre entero. Si no está, **Pedir este servicio** lo manda a revisión; el admin recibe correo y solo al aprobarlo aparece en el catálogo (y se liga a esa clínica). Los pendientes se listan como “En revisión”.
- **Citas**: calendario de _esta_ clínica. Hoy va en ámbar (distinto al día seleccionado, que es kadesh). **Ir a hoy** vuelve al día actual. En un día de hoy o futuro, **Agregar cita** elige paciente, hora y duración tocando chips (no un select nativo); mascota y notas van plegadas. La cita nace confirmada. Abajo, **Pacientes**: dar de alta crea un `User` (o liga uno existente por correo) y lo relaciona a ese PetPlace. Confirmar/cancelar las que llegan del público sigue igual; el cliente recibe correo.

El copy de reclamo vive también en la ficha pública; beneficios y tono deben coincidir.

## Ventas

El CRM de ventas (`/perfil/ventas`) redirige a `/perfil`. Quien llegue con `?tab=ventas` cae en Datos.

## Acceso

Exige sesión. Si no hay usuario, va a login y vuelve a la misma pestaña (`/perfil` o `/perfil?tab=appointments`, etc.).
