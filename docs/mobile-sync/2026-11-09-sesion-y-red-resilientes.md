---
estado: pendiente
fecha: 2026-11-09
origen: kadesh-landing@develop
feature: shared
---

# Prompt para kadesh-pet-mobile: la sesión y las consultas aguantan cortes de red

## Contexto
En la web, un corte de red al abrir una pantalla tenía tres efectos:
- **Sacaba a gente con sesión válida:** la consulta de sesión (`authenticatedItem`) fallaba, la app lo tomaba como "sin sesión" y mandaba al login.
- **Se reportaba como error:** cada corte quedaba en Operaciones como «Error de conexión», aunque solo fuera la red del celular o una pantalla que se cerró a media carga.
- **Pedía la sesión sin token:** también se consultaba sin token, cuando sin token el back siempre responde `null`.

Ahora la sesión distingue "no hay sesión" de "no se pudo preguntar", las consultas se reintentan solas y los cortes ya no se reportan. En celular estos cortes son todavía más comunes (señal, cambio de app), así que la app debe portarse igual.

## Qué implementar en la app
1. **No pedir la sesión sin token.** Si no hay token en SecureStore, no se manda `authenticatedItem` ni las consultas que dependen del usuario (campana de no leídas, contadores del perfil): el usuario es invitado y ya. El back solo reconoce la sesión por `Authorization: Bearer <token>`.
2. **Separar "sin sesión" de "no se pudo verificar".** Al verificar la sesión hay tres resultados:
   - **El back respondió con usuario:** hay sesión.
   - **El back respondió `null`:** sin sesión, se borra el token y se va al login como hoy.
   - **No hubo respuesta (sin red, timeout, 502/503/504, después de los reintentos):** la sesión queda **pendiente**. No se borra el token ni se saca a nadie: se conserva el usuario que ya había o se ve como invitado, y las pantallas que piden sesión muestran su estado de carga en vez de mandar al login.
3. **Reintentar la sesión pendiente en silencio**, sin volver a mostrar la carga:
   - al recuperar la red (NetInfo `isConnected` vuelve a `true`);
   - al volver la app al frente (`AppState` → `active`);
   - y a los 15 s, 30 s y luego cada 60 s mientras siga pendiente, con la app al frente y en línea.
4. **Reintentar consultas, nunca mutaciones.** Las consultas se reintentan ante errores de red: hasta 3 reintentos (4 intentos en total) con espera exponencial y jitter (base 500 ms, máximo 5 s). Es lo mismo que `RetryLink` de Apollo con `delay: { initial: 500, max: 5000, jitter: true }` y `attempts: { max: 4 }`.
   - **Se reintenta:** cuando la petición no llegó ("Network request failed", sin código HTTP) o cuando el back o el proxy respondieron 502, 503 o 504.
   - **No se reintenta:**
     - cancelaciones (`AbortError`);
     - 4xx, 500 y 429;
     - errores de GraphQL;
     - si el dispositivo está sin red;
     - mutaciones de cualquier tipo (repetirlas podría duplicar lo que hacen).
5. **Recuperar sola la pantalla.** Al recuperar la red o volver al frente, se vuelven a pedir solo las consultas activas que quedaron en error de red. Con Apollo: recorrer `client.getObservableQueries('active')` y hacer `refetch()` de las que tengan `getCurrentResult().error?.networkError`.
6. **Cancelar al salir.** Si una pantalla se desmonta o se navega a otra a media carga, sus consultas se cancelan (Apollo lo hace al desuscribirse) y esa cancelación no es un error: no se muestra ni se reporta.
7. **No ocultar datos que ya se tienen.** Si una consulta tenía datos en caché y el refetch falla, se sigue mostrando lo que había. El estado de error ("No se pudo cargar. Revisa tu conexión…" + botón «Reintentar») solo aparece cuando no hay nada que mostrar.
8. **Reporte de errores:** aplica si la app ya manda `app.client_error` a `trackEvents`; si no, cuando se implemente el prompt «App y pantalla en cada petición, reporte de errores…» del 2026-11-04. Un error de red solo se reporta cuando se cumple todo esto:
   - fallaron todos los reintentos;
   - el dispositivo está en línea (NetInfo);
   - la app está al frente (`AppState` = `active`);
   - no fue una cancelación.

   Si un reintento salió bien, no se reporta nada.

## GraphQL
No hay operaciones nuevas. La sesión se sigue verificando con la consulta de siempre:

```graphql
query AuthenticatedItem {
  authenticatedItem {
    ... on User {
      id
      name
      lastName
      email
      # …los mismos campos que ya pide la app
    }
  }
}
```

Tipo del resultado de la verificación (sugerido):

```ts
type SessionCheck =
  | { status: "ok"; user: User | null } // el back respondió (null = token inválido)
  | { status: "unreachable" };          // sin red / back caído, ya con reintentos: no decide nada
```

## Reglas y constantes
- Reintentos de consultas: 4 intentos en total, `initial` 500 ms, `max` 5000 ms, jitter. Códigos reintentables: 502, 503, 504, o sin respuesta.
- Reintentos de la sesión pendiente: 15 s, 30 s, 60 s (y cada 60 s), además de al recuperar la red o volver al frente.
- Un token inválido (`authenticatedItem: null` con token) sí cierra la sesión; un corte de red nunca.

## Referencia web
- `src/utils/UserContext.tsx`: sesión pendiente y reintentos.
- `src/utils/getAuthUser.ts`: `ok` / `unreachable`.
- `src/providers/queryRetryLink.ts`: reintentos.
- `src/providers/ApolloProviderWrapper.tsx`: recuperar consultas en error.
- `src/utils/network.ts`: clasificación de errores.
- `src/utils/activity/requestErrorLink.ts`: cuándo se reporta.

## Criterios de aceptación
- [ ] Sin sesión no sale `authenticatedItem` ni las consultas de campana o contadores.
- [ ] Con sesión y en modo avión al abrir la app: no manda al login; al volver la red, la sesión se confirma sola.
- [ ] Con token inválido y red normal: sí manda al login.
- [ ] Una consulta que falla una o dos veces y luego responde muestra los datos y no se reporta.
- [ ] Salir de una pantalla a media carga no muestra error ni reporta nada.
- [ ] La ficha de un animal abierta sin red muestra «No se pudo cargar» + «Reintentar» y se recupera sola al volver la red.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
