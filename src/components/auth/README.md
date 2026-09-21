# Auth

Login, registro y Google en `/auth/login`. No es un CRM.

## Promesa

Entrar o crear cuenta en español claro. Si algo falla, decimos qué hacer (otro correo, iniciar sesión, internet). Nunca Prisma, GraphQL ni Keystone.

## Copy de error

`authErrors.ts` traduce lo que tira el backend. Registro: correo ya usado → **Ese correo ya tiene una cuenta. Inicia sesión o usa otro.** El username se genera en el back; si choca, pedimos reintentar, no mostramos unique constraint.

Login y Google usan el mismo mapper.
