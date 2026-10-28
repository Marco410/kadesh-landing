# Auth

Login y registro en `/auth/login`. No es un CRM.

## Promesa

Entrar o crear cuenta en español claro. Si algo falla, decimos qué hacer (otro correo, iniciar sesión, internet). Nunca Prisma, GraphQL ni Keystone.

## Flujo de registro

Tras crear la cuenta, **siempre** se inicia sesión con las mismas credenciales y se redirige (`?redirect=`, historial o home). No se manda al tab de login a menos que el auto-login falle; en ese caso: *Cuenta creada. Inicia sesión con tu correo y contraseña.*

## Modal de cuenta (`AuthGateModal`)

Para acciones que piden sesión sin sacar a la persona de donde está (hoy: publicar un reporte, ver `src/components/animals/README.md`).
- Explica en una frase por qué pedimos cuenta y muestra 3 beneficios concretos. Los textos los pone quien lo usa.
- Tiene dos pestañas, **Crear cuenta** (por defecto) y **Ya tengo cuenta**. El correo escrito pasa de una a otra.
- Usa los mismos `useRegister` / `useLogin` que `/auth/login`. Al terminar va a `redirectTo`.
- El registro pide nombre, apellido, correo y una sola contraseña con mostrar/ocultar (la confirmación se llena sola). Si la cuenta se crea pero no se pudo iniciar sesión, cambia a **Ya tengo cuenta** con el aviso.
- Se monta en `<body>` con un portal. Los enlaces que lo abren viven en secciones con `transform` (GSAP), y sin portal el `position: fixed` quedaba encerrado en la sección.

## Continuar con Google

Activo desde 2026-10-28 (estuvo oculto desde el 2026-09-24, commit `a51b8c4`). `GoogleAuthSection` lo pinta con su separador, carga y error.
- En `/auth/login` va debajo del botón principal, en las dos pestañas.
- En el modal de cuenta va **primero**, con "o con tu correo" debajo.
- Sirve para entrar y para crear cuenta: el backend busca por correo y, si no existe, la crea como de Pet (`product: "pet"`).

Configuración que pide:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` igual al `GOOGLE_CLIENT_ID` del backend: el back rechaza tokens de otro cliente (`aud`). Es el mismo cliente OAuth de Kadesh Negocios.
- En Google Cloud Console, ese cliente debe tener en **Orígenes autorizados de JavaScript** `https://pet.kadesh.com.mx` y `http://localhost:3000`. Si falta, el botón se dibuja pero la consola dice `[GSI_LOGGER]: The given origin is not allowed for the given client ID` y no deja entrar.

`google.accounts.id.initialize` es global (solo vale la última llamada). `useGoogleLogin` inicializa una sola vez con un despachador y el botón que se monta al último es el que responde. No volver a inicializar por instancia: en el home hay un modal por cada «Reportar», cada uno con su `redirectTo`.

## Copy de error

`authErrors.ts` traduce lo que tira el backend. Registro: correo ya usado → **Ese correo ya tiene una cuenta. Inicia sesión o usa otro.** El username se genera en el back; si choca, pedimos reintentar, no mostramos unique constraint.

Login y Google usan el mismo mapper.

## Pendiente

Anotado el 2026-10-23, con la cartilla de mascotas. Hoy no hay ninguna forma de recuperar o cambiar una contraseña, ni en la web ni en el backend (`auth/auth.ts` no tiene `passwordResetLink`).

- **Olvidé mi contraseña**: botón en el login que manda por correo un enlace para poner una contraseña nueva (enlace firmado, con vencimiento y de un solo uso).
  - Es urgente para las cuentas que creó otra persona. Los pacientes que da de alta una veterinaria (`createPetPlacePatient`) no tienen contraseña; solo pueden entrar con Google si su correo es de Google.
- **Cambiar contraseña** en Perfil → Datos: contraseña actual + nueva (mínimo 8, igual que el registro).
  - Prioridad para quien registró un dueño principal desde la cartilla (`registerPetFamilyMember`): su contraseña la eligió ese familiar, que la sigue conociendo.
- Cuando existan, el correo de `sendPetFamilyAccountEmail` (kadesh-back) debe invitar a cambiarla, y la app móvil necesita lo mismo (prompt en `docs/mobile-sync/`).
