---
estado: pendiente
fecha: 2026-10-28
origen: kadesh-landing@feat/report-auth-modal (sin commit)
feature: auth
---

# Prompt para kadesh-pet-mobile: pedir cuenta al reportar sin salir de la pantalla

## Contexto

En la web, quien no tenía sesión y tocaba "Reportar mascota perdida" (o "Encontré una mascota", "Dar en adopción"…) terminaba en la pantalla de login, perdía el contexto y muchas veces no volvía. Ahora aparece un modal amable que explica por qué hace falta una cuenta y deja crearla o entrar ahí mismo. Al terminar, la persona llega directo al formulario del reporte con el tipo que había elegido.

## Qué implementar en la app

- Todo punto de entrada a "reportar" que exija sesión (botones del inicio, del directorio de animales, accesos rápidos) debe abrir, si no hay sesión, una hoja modal en lugar de mandar a la pantalla de login.
- **Contenido de la hoja, de arriba abajo:**
  1. Título según el tipo de reporte, con un punto del color de ese estado (el mismo color que ya usan los pines).
  2. Una frase con el porqué: "Pedimos una cuenta para que cada reporte tenga a alguien responsable detrás. Te toma un minuto y luego pasas directo al formulario."
  3. Un recuadro azul claro con 3 beneficios, cada uno con ícono de palomita. Textos abajo.
  4. Si la app tiene "Continuar con Google", va aquí, **antes** de los formularios, seguido del separador "o con tu correo". Crea la cuenta o entra en un toque. Mismo flujo que el login de la app, con `product: "pet"`.
  5. Un control segmentado **Crear cuenta** (por defecto) / **Ya tengo cuenta**. Al cambiar de pestaña, el correo escrito se conserva.
  6. **Crear cuenta:** nombre, apellido, correo y contraseña. Es un solo campo de contraseña con mostrar/ocultar y la ayuda "Mínimo 8 caracteres". Botón **Crear cuenta y continuar**.
  7. **Ya tengo cuenta:** correo y contraseña. Botón **Entrar y continuar**.
  8. Botón de cerrar (×).
- **Al crear la cuenta:** registra e inicia sesión con las mismas credenciales, igual que el registro que ya tiene la app, guarda el token y lleva al formulario del reporte con el tipo elegido. Si se creó pero el inicio de sesión falla, cambia a **Ya tengo cuenta** con el aviso verde "Cuenta creada. Inicia sesión con tu correo y contraseña."
- **Al entrar:** inicia sesión y lleva al formulario con el tipo elegido.
- Los errores se muestran en un recuadro rojo dentro de la hoja, con los mismos mensajes amigables que ya usa la app para registro y login. Nunca textos técnicos.
- Si se llega al formulario de reporte por un enlace profundo sin sesión, se muestra la misma hoja sobre él. Cerrarla regresa a la pantalla anterior.

## GraphQL

No hay operaciones nuevas. Se usan las mismas de registro y login que ya tiene la app:

```graphql
mutation CreateUser($data: UserCreateInput!) {
  createUser(data: $data) { name lastName email phone }
}
# data: { name, lastName, email, password, product: "pet" }

mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
  authenticateUserWithPassword(email: $email, password: $password) {
    ... on UserAuthenticationWithPasswordSuccess {
      sessionToken
      item { id lastName name phone email profileImage { url } roles { name } secondLastName username verified }
    }
    ... on UserAuthenticationWithPasswordFailure { message }
  }
}
```

```ts
type ReportStatus = 'lost' | 'found' | 'in_adoption' | 'rescued';

interface AuthGateCopy {
  title: string;
  description: string;
  reasons: [string, string, string];
  accentColor?: string; // color del estado
}
```

## Reglas y constantes

Textos por tipo de reporte (la frase del porqué es la misma para todos):

- **`lost`**: "Reporta a tu mascota perdida"
  - Avisamos a quienes tienen alertas activadas en la zona donde se perdió.
  - Quien la vea podrá contactarte con el teléfono que pongas en el reporte.
  - Solo tú puedes actualizar el reporte y avisar cuando regrese a casa.
- **`found`**: "Reporta la mascota que encontraste"
  - Avisamos a quienes tienen alertas activadas en esa zona, por si es de alguien cercano.
  - Su familia podrá encontrarla en el mapa y contactarte.
  - Solo tú puedes actualizar el reporte cuando vuelva con su familia.
- **`in_adoption`**: "Da en adopción"
  - Tu publicación aparece en el directorio de mascotas en adopción.
  - Quien quiera adoptar te contacta con el teléfono que pongas.
  - Solo tú puedes actualizarla y marcarla cuando encuentre hogar.
- **`rescued`**: "Reporta un rescate"
  - Tu reporte aparece en el mapa para que su familia o un adoptante la encuentre.
  - Te contactan con el teléfono que pongas en el reporte.
  - Solo tú puedes actualizar el reporte cuando cambie su situación.
- **Sin tipo**: "Publica un reporte"
  - Tu reporte aparece en el mapa y en el directorio de Kadesh Pet.
  - Te contactan con el teléfono que pongas en el reporte.
  - Solo tú puedes actualizarlo cuando cambie su situación.

La contraseña lleva mínimo 8 caracteres. Al registrar se manda `product: "pet"`.

## Referencia web

`kadesh-landing/src/components/auth/AuthGateModal.tsx`, `src/components/animals/ReportLink.tsx`, `src/components/animals/reportAuthCopy.ts`, `src/app/animales/nuevo/page.tsx`.

## Criterios de aceptación

- [ ] Sin sesión, tocar cualquier botón de reportar abre la hoja; no se va a la pantalla de login.
- [ ] Crear cuenta desde la hoja lleva directo al formulario con el tipo elegido ya marcado.
- [ ] Entrar con una cuenta existente hace lo mismo.
- [ ] Con sesión, el botón va directo al formulario, sin hoja.
- [ ] Funciona en iOS y Android, en modo claro y oscuro, y con el teclado abierto no tapa el botón.
- [ ] Maneja carga y error (correo ya registrado, contraseña incorrecta, sin conexión).
