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
