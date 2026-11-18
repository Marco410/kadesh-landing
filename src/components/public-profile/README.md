# Perfil público

La cara pública de una persona en Kadesh Pet. Los datos los arma kadesh-back (`graphql/customs/queries/publicProfile.ts`, ver `models/Pet/README.md` → «Perfil público»).

## Dónde

- **`/u/<username>`** (`app/u/[username]/page.tsx`, del servidor, 5 min): foto con la insignia de su nivel (`LevelAvatar`), nombre con inicial («Marco C.»), nivel, «En Kadesh desde…», biografía, contacto si lo eligió (WhatsApp, teléfono, correo), cifras (huellitas, lugar en el ranking, racha, reportes) y la barra hacia el siguiente nivel. Debajo: sus reportes (12 y «Ver más» con `publicUserReports`), eventos que organizó, espacios de rescate y clínicas. No existe o está apagado: 404. `noindex`: se comparte, pero no se indexa.
- **Ficha del animal** (`AnimalAuthorByline`): autor visible para cualquiera, con su nivel y enlace al perfil. Consulta aparte (`animalAuthor`); si falla o la persona apagó su perfil, «Usuario de KADESH». Los reportes de un espacio de rescate siguen con `RescueByline`.
- **Ranking y portada**: cada persona enlaza a su perfil (si lo tiene abierto).
- **Mi cuenta → Datos del perfil** (`PublicProfileSettings`): biografía (280), «Mostrar mi perfil público» (encendido por defecto) y «Mostrar mi teléfono» / «Mostrar mi correo» (apagados por defecto). Consulta propia; se guarda con el botón.

## Qué no hacer

- No armar el nombre público en el front: llega listo del back (`displayName`).
- No pedir el autor por tarjeta en listas: si una lista lo necesita, el back tiene `getPublicUserCards` para traerlos en lote dentro de la consulta de la lista.
- No mostrar teléfono o correo que la persona no eligió: solo lo que mande `publicUserProfile`.
