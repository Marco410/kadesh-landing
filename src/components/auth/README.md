# Auth

Login y registro en `/auth/login`. No es un CRM.

## Promesa

Entrar o crear cuenta en español claro. Si algo falla, decimos qué hacer (otro correo, iniciar sesión, internet). Nunca Prisma, GraphQL ni Keystone.

## Flujo de registro

Tras crear la cuenta, **siempre** se inicia sesión con las mismas credenciales y se redirige (`?redirect=`, historial o home). No se manda al tab de login a menos que el auto-login falle; en ese caso: *Cuenta creada. Inicia sesión con tu correo y contraseña.*

## Continuar con Google

**Oculto temporalmente** en la UI (login y registro). El hook `useGoogleLogin` sigue en el código para reactivarlo. No cargar el botón de Google mientras esté oculto.

## Copy de error

`authErrors.ts` traduce lo que tira el backend. Registro: correo ya usado → **Ese correo ya tiene una cuenta. Inicia sesión o usa otro.** El username se genera en el back; si choca, pedimos reintentar, no mostramos unique constraint.

Login (y Google, cuando vuelva) usan el mismo mapper.

## Pendiente

Anotado el 2026-10-23, con la cartilla de mascotas. Hoy no hay ninguna forma de recuperar o cambiar una contraseña, ni en la web ni en el backend (`auth/auth.ts` no tiene `passwordResetLink`).

- **Olvidé mi contraseña**: botón en el login que manda por correo un enlace para poner una contraseña nueva (enlace firmado, con vencimiento y de un solo uso).
  - Es urgente para las cuentas que creó otra persona. Los pacientes que da de alta una veterinaria (`createPetPlacePatient`) no tienen contraseña, y con Google oculto no tienen cómo entrar.
- **Cambiar contraseña** en Perfil → Datos: contraseña actual + nueva (mínimo 8, igual que el registro).
  - Prioridad para quien registró un dueño principal desde la cartilla (`registerPetFamilyMember`): su contraseña la eligió ese familiar, que la sigue conociendo.
- Cuando existan, el correo de `sendPetFamilyAccountEmail` (kadesh-back) debe invitar a cambiarla, y la app móvil necesita lo mismo (prompt en `docs/mobile-sync/`).
