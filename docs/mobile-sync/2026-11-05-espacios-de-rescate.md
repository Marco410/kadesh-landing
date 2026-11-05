---
estado: pendiente
fecha: 2026-11-05
origen: kadesh-landing@develop (sin commit)
feature: profile
---

# Prompt para kadesh-pet-mobile: Espacios de rescate (activar, equipo, publicar a nombre de la organización)

## Contexto
Rescatistas independientes, refugios, hogares temporales, colectivos y asociaciones pueden activar un **espacio de rescate** desde su perfil. Con él:
- administran a su **equipo** con roles;
- **publican animales a nombre de la organización**, y su equipo puede actualizarlos;
- tienen un **perfil público** con sus animales, adopciones y cómo ayudarles.

Cada espacio empieza «En revisión». KADESH lo valida por WhatsApp y un admin lo marca verificado. Solo los verificados se muestran al público. Algunos verificados se marcan como **Aliados KADESH** y salen en la portada de la web.

## Qué implementar en la app

1. **Perfil → «Espacio de rescate»** (nueva entrada, visible para todos).
   - **Sin espacio:** estado vacío «¿Rescatas animales? Activa tu espacio», con el botón «Activar espacio». El texto dice que es gratis para rescatistas, refugios, hogares temporales y colectivos.
   - **Con espacios:** lista con logo (o iniciales), nombre, pastilla de estado (Verificado / En revisión / Rechazado / Suspendido), «Aliado KADESH» si aplica, tipo, ciudad y «Tu rol: …».
   - **Si está en revisión:** el texto «Ya puedes usar tu espacio. Para que tu perfil sea público, escríbenos por WhatsApp y lo verificamos.» y el botón «Verificar por WhatsApp» (ver Reglas).
   - **Si está rechazado o suspendido:** se muestra `statusNote`, o si viene vacío: «Escríbenos por WhatsApp para revisar tu caso.».
2. **Activar espacio:** asistente de 3 pasos.
   1. Tipo (tarjetas con su descripción) y nombre (mínimo 3 letras).
   2. Municipio (obligatorio), estado, especies (chips con los tipos de animal; Perro y Gato marcados por defecto), WhatsApp (obligatorio, 10 dígitos; prellenado con el teléfono del usuario) y correo opcional.
   3. Logo opcional, «Sobre ustedes», Facebook e Instagram (link o @usuario), y la casilla obligatoria «Confirmo que rescatamos animales y que estos datos son reales…».

   Al terminar se llama `activateRescueOrganization`. Si eligió logo, se sube enseguida con `updateRescueOrganization`; si esa subida falla, el espacio ya quedó activo y se avisa «El logo no se subió; agrégalo en Perfil público». Después abre el espacio.
3. **Administrar un espacio** (pestañas):
   - **Resumen**
     - Si está en revisión: aviso con el botón «Verificar por WhatsApp». Si está rechazado o suspendido: el motivo, y aclarar que no se puede publicar a nombre del espacio.
     - KPIs: Animales publicados (`publishedCount`), En adopción (`inAdoptionCount`), Con hogar (`adoptedCount`) y Equipo (`membersCount`).
     - Acciones rápidas: «Publicar un rescate» (abre el reporte con estado `rescued` y la organización preseleccionada), «Dar en adopción» (estado `in_adoption`), «Ver animales» y, solo para admin, «Agregar al equipo».
     - Checklist «Completa tu perfil», solo para admin y coordinador:
       - logo;
       - descripción;
       - alguno de donationUrl, donationInfo o needs;
       - equipo con más de 1 persona (este punto solo lo ve el admin).
   - **Animales**
     - Lista paginada (30) de `animals` con `organization.id = espacio` y sin `duplicateOf`. Cada fila lleva foto, nombre, pastilla de estado (su último log), tipo, ciudad, fecha y «Publicó <nombre>».
     - Filtros locales sobre lo cargado:
       - Todos.
       - Buscan hogar: estado distinto de `adopted` y de `in_family`.
       - En adopción: `in_adoption`.
       - Con hogar: `adopted` o `in_family`.
     - El botón «Actualizar» lleva a editar el reporte. Solo aparece para admin, coordinador o voluntario, y no si el espacio está rechazado o suspendido.
   - **Equipo**
     - Lista de miembros: nombre, correo (solo llega a admin y coordinador, o a la propia persona) y rol. Un admin cambia el rol de los demás con un selector.
     - Quitar a alguien (solo admin) o «Salir del espacio» (en tu propia fila). Ambos piden confirmación. Al salir, la app vuelve a la lista.
     - Formulario «Agregar a alguien» (solo admin): correo de la cuenta y rol. Bajo el rol va la descripción del rol elegido.
     - Si el resultado trae `code = RESCUE_MEMBER_USER_NOT_FOUND`: mostrar el mensaje y que puede crear su cuenta gratis.
   - **Perfil público**
     - Admin y coordinador editan:
       - logo y portada (imágenes de menos de 5 MB);
       - nombre, tipo, capacidad, municipio, estado y especies;
       - «Sobre ustedes», WhatsApp, correo, Facebook, Instagram, TikTok y sitio web;
       - link para donar, «Otros datos para donar» (con la nota «Se muestra en tu perfil público tal cual») y «Lo que necesitan».
     - Los demás lo ven en solo lectura, con el aviso «Solo los administradores y coordinadores del espacio pueden cambiar el perfil.».
4. **Publicar un reporte → «Publicar como».** Si la persona tiene espacios donde puede publicar (rol admin, coordinator o volunteer; estado `pending` o `verified`), en el paso de contacto aparecen chips: «Yo» y uno por espacio.
   - Al elegir un espacio:
     - se oculta «¿Es tu mascota?»;
     - el teléfono se llama «Teléfono de contacto» y se prellena con el WhatsApp del espacio;
     - se envía `organization: { connect: { id } }` con `reportedBy: "volunteer"`.
   - Texto de ayuda:
     - Espacio verificado: «Saldrá con el nombre de X y su equipo podrá actualizarlo.».
     - Espacio en revisión: «Su equipo podrá actualizarlo. Mientras verificamos X, el público verá tu nombre.».
     - Con «Yo» elegido: «Si lo publicas a nombre de tu espacio de rescate, tu equipo podrá actualizarlo.».
   - Si se abre con un espacio preseleccionado (desde el Resumen), elegirlo al cargar la lista.
5. **Ficha del animal.** Si `animal.organization` llega con datos:
   - en lugar del bloque del autor, mostrar «Publicado por» con logo, nombre, insignia de verificado, tipo · ciudad y «Aliado KADESH» si `isAlly`;
   - botones «Ver perfil» (abre `https://pet.kadesh.com.mx/organizaciones/<slug>` en el navegador) y «Escribir por WhatsApp» (`https://wa.me/52<whatsapp>`, con el texto «Hola, vi a <nombre> en KADESH y quiero información.»);
   - abajo: «Lo publicó <autor> · Publicado <fecha>»;
   - si `organization.status` es `pending` (solo le llega a su equipo): la nota «Tu espacio está en revisión: el público ve este reporte con el nombre de quien lo publicó hasta que lo verifiquemos.»;
   - no mostrar «Reportado por la comunidad. Contacta directamente al dueño.» cuando hay organización.

   Para decidir si se muestra «Editar», usar `viewerCanEdit` además de la regla de siempre (autor o admin).
6. **Inicio del perfil → «Requiere atención».** Solo para quien es `admin` del espacio:
   - en revisión: severidad info, «<nombre> está en revisión» / «Escríbenos por WhatsApp para que tu perfil sea público.»;
   - rechazado o suspendido: severidad warning, «No pudimos verificar <nombre>» o «<nombre> está suspendido» / «Revisa el motivo en tu espacio de rescate.».

   Ambos abren el espacio.
7. **Notificaciones nuevas:** `rescue.member_added`, `rescue.verified`, `rescue.rejected` y `rescue.submitted` (esta última solo llega a admins de plataforma).
   - Ícono: mano con corazón (`CharityIcon`).
   - Tono: `rescue.verified` en verde, `rescue.rejected` en rojo.
   - La `url` lleva a `/perfil?tab=rescate&org=<id>`: abrir la pantalla del espacio.

## GraphQL

```graphql
fragment RescueOrgFields on RescueOrganization {
  id name slug type description city state species capacity
  whatsapp email websiteUrl facebookUrl instagramUrl tiktokUrl
  donationUrl donationInfo needs
  status statusNote verifiedAt isAlly allySince
  logo { url } cover { url }
  viewerRole publishedCount adoptedCount inAdoptionCount membersCount createdAt
}

# Mis espacios (filtrar SIEMPRE por mi id: un admin de plataforma vería todos)
query MyRescueOrganizations($userId: ID!) {
  rescueOrganizations(
    where: { members: { some: { user: { id: { equals: $userId } } } } }
    orderBy: [{ createdAt: asc }]
  ) { ...RescueOrgFields }
}

query RescueOrganizationDetail($id: ID!) {
  rescueOrganization(where: { id: $id }) {
    ...RescueOrgFields
    members(orderBy: [{ createdAt: asc }]) { id role userName userEmail isViewer createdAt }
  }
}

query RescueOrganizationAnimals($where: AnimalWhereInput!, $take: Int!, $skip: Int!) {
  animals(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
    id slug name createdAt
    user { id name }
    animal_type { name }
    logs(orderBy: [{ date_status: desc }], take: 1) { status date_status city }
    multimedia(orderBy: [{ order: asc }], take: 1) { image { url } }
  }
  animalsCount(where: $where)
}
# $where = { organization: { id: { equals: <orgId> } }, duplicateOf: null }

mutation ActivateRescueOrganization($input: RescueOrganizationCreateInput!) {
  activateRescueOrganization(input: $input) {
    success message
    organization { ...RescueOrgFields }
  }
}
# input RescueOrganizationCreateInput {
#   name: String!  type: String!  city: String  state: String  species: [String!]
#   description: String  whatsapp: String  email: String
#   facebookUrl: String  instagramUrl: String  tiktokUrl: String  websiteUrl: String
# }

# Perfil, logo y portada (logo/cover: { upload: <archivo> }). Solo admin y coordinador.
mutation UpdateRescueOrganization($id: ID!, $data: RescueOrganizationUpdateInput!) {
  updateRescueOrganization(where: { id: $id }, data: $data) { ...RescueOrgFields }
}

mutation AddRescueOrganizationMember($organizationId: ID!, $email: String!, $role: String!) {
  addRescueOrganizationMember(organizationId: $organizationId, email: $email, role: $role) {
    success message code
    member { id role userName userEmail isViewer createdAt }
  }
}

mutation SetRescueOrganizationMemberRole($memberId: ID!, $role: String!) {
  setRescueOrganizationMemberRole(memberId: $memberId, role: $role) {
    success message code
    member { id role userName userEmail isViewer createdAt }
  }
}

# Un admin quita a alguien, o la persona se sale (su propia fila)
mutation RemoveRescueOrganizationMember($memberId: ID!) {
  removeRescueOrganizationMember(memberId: $memberId) { success message code }
}
```

Cambios en operaciones que ya existen:

```graphql
# Ficha del animal (GetAnimal): pedir además
viewerCanEdit
organization { id name slug type city state status isAlly whatsapp logo { url } }

# Crear reporte (createAnimal): si se publica a nombre de un espacio
data: { ..., reportedBy: "volunteer", organization: { connect: { id: $organizationId } } }

# Inicio del perfil: agregar a la consulta
myRescueOrgs: rescueOrganizations(
  where: { members: { some: { user: { id: { equals: $userId } } } } }
  orderBy: [{ createdAt: asc }]
) { id name status viewerRole }
```

```ts
type RescueOrgType = 'independent' | 'shelter' | 'foster_home' | 'collective' | 'civil_association';
type RescueOrgStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
type RescueMemberRole = 'admin' | 'coordinator' | 'volunteer' | 'foster';

interface RescueOrganization {
  id: string; name: string; slug?: string | null; type: RescueOrgType;
  description?: string | null; city?: string | null; state?: string | null;
  species?: Array<'dog' | 'cat' | 'bird' | 'fish' | 'reptil' | 'mammal'> | null; capacity?: number | null;
  whatsapp?: string | null; email?: string | null; websiteUrl?: string | null;
  facebookUrl?: string | null; instagramUrl?: string | null; tiktokUrl?: string | null;
  donationUrl?: string | null; donationInfo?: string | null; needs?: string | null;
  status: RescueOrgStatus; statusNote?: string | null; verifiedAt?: string | null;
  isAlly?: boolean | null; allySince?: string | null;
  logo?: { url?: string | null } | null; cover?: { url?: string | null } | null;
  viewerRole?: RescueMemberRole | null;
  publishedCount?: number | null; adoptedCount?: number | null; inAdoptionCount?: number | null;
  membersCount?: number | null; createdAt?: string | null;
}

interface RescueMember {
  id: string; role: RescueMemberRole; userName?: string | null;
  userEmail?: string | null; isViewer: boolean; createdAt?: string | null;
}

type RescueMemberResult = { success: boolean; message: string; code?: string | null; member: RescueMember | null };
```

## Reglas y constantes
- **Tipos (etiqueta · descripción):**
  - `independent`: Rescatista independiente · Rescatas por tu cuenta o con apoyo de amigos.
  - `shelter`: Refugio o santuario · Tienes un lugar donde viven los animales.
  - `foster_home`: Hogar temporal · Recibes animales en casa mientras encuentran familia.
  - `collective`: Colectivo · Un grupo de personas que rescata en equipo.
  - `civil_association`: Asociación civil o fundación · Organización constituida legalmente.
- **Estados:** `pending` En revisión (ámbar) · `verified` Verificado (verde) · `rejected` Rechazado (rojo) · `suspended` Suspendido (rojo).
- **Roles y permisos (los valida el backend; la app solo decide qué mostrar):**
  - `admin` (Administrador): perfil, equipo y animales.
  - `coordinator` (Coordinador): perfil y animales (publica, edita y borra). No cambia el equipo.
  - `volunteer` (Voluntario): publica y actualiza animales, pero no los borra.
  - `foster` (Hogar temporal): forma parte del equipo y ve el espacio.
- **Equipo:**
  - Solo se agregan personas con cuenta existente.
  - El espacio nunca se queda sin admin: el backend rechaza quitar, degradar o salirse al último admin, y su `message` lo explica.
  - Hasta 50 personas por espacio.
- **Activación:** máximo 3 espacios por persona, y 3 activaciones al día.
- **Especies:** los mismos tipos de animal que un reporte (`ANIMAL_TYPE_OPTIONS` del backend, en este orden): `dog` Perro, `cat` Gato, `bird` Ave, `fish` Pez, `reptil` Reptil, `mammal` Mamífero. Los chips muestran esas etiquetas; en frases van en plural y minúsculas («Rescata: perros, gatos y aves»), y sin ninguna elegida, «todo tipo de animales». El backend descarta valores fuera de la lista.
- **Mensaje de «Verificar por WhatsApp»:** va al WhatsApp de KADESH (el mismo número de ayuda de la app). Texto:

  ```text
  Hola, activé el espacio de rescate «<nombre>» en KADESH y quiero verificarlo.

  ID: <id>
  Tipo: <etiqueta del tipo>
  Zona: <ciudad, estado>

  Les comparto nuestras redes y fotos de nuestros rescates para validarlo.
  ```
- **Visibilidad:**
  - El público (y la app sin sesión) solo recibe organizaciones `verified`.
  - Mientras un espacio está en revisión, `animal.organization` llega en `null` a quien no es de su equipo, y la ficha muestra al autor como siempre. No intentes saltarte esto.
- **Mutaciones:** todas responden `{ success, message }`. Muestra el `message` tal cual: ya viene en español y listo para el usuario.

## Referencia web
- Panel: `src/components/rescue/` (`RescueSection`, `RescueManagePanel`, `RescueSummaryView`, `RescueAnimalsView`, `RescueTeamView`, `RescueProfileForm`, `RescueOnboardingForm`, `constants.ts`, `queries.ts`).
- Reporte: `src/components/animals/nuevo/NewAnimalForm.tsx` («Publicar como»).
- Ficha: `src/components/rescue/RescueByline.tsx` y `src/components/animals/detail/AnimalInfoSection.tsx`.
- Inicio: `src/components/profile/home/homeModel.ts` (`buildAttention`).
- Backend: `kadesh-back/models/Pet/RescueOrganization/README.md`.

## Criterios de aceptación
- [ ] Una persona sin espacio lo activa en 3 pasos y llega a su Resumen «En revisión», con el botón de WhatsApp.
- [ ] Un admin agrega a alguien por correo, le cambia el rol y lo quita. Con un correo sin cuenta se ve el mensaje del backend.
- [ ] Un voluntario ve «Actualizar» en los animales del espacio, pero no puede editar el perfil ni el equipo.
- [ ] Publicar un reporte «como» el espacio lo deja en la lista Animales del espacio, y cualquier admin, coordinador o voluntario puede editarlo.
- [ ] La ficha de un animal de un espacio verificado muestra «Publicado por», con «Ver perfil» y WhatsApp.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
