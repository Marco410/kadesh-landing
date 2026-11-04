---
estado: pendiente
fecha: 2026-11-03
origen: kadesh-landing@feat/panel-cuenta
feature: profile
---

# Prompt para kadesh-pet-mobile: Inicio del perfil (resumen, "Requiere atención" y KPIs)

## Contexto
En la web, `/perfil` ahora abre en un **Inicio** con un resumen de la cuenta, antes de Datos, Mascotas, Citas, etc. Junta en una pantalla lo que la persona debe atender (recordatorios que vencen, citas por confirmar de su clínica, su próxima cita…) y sus cifras principales. El menú de la web muestra además **globos** de pendientes en Mascotas, Citas, Clínicas y Notificaciones. El diseño visual del panel web (menú lateral, barra flotante) es propio de la web y **no** se porta; lo que se porta es el contenido, las reglas y el GraphQL.

## Qué implementar en la app
Una pantalla de **Inicio del perfil** (o la sección superior de la pestaña de perfil, como encaje mejor en la navegación de la app) con cuatro bloques:

1. **Saludo**: "Buenos días / Buenas tardes / Buenas noches, {nombre}." (antes de las 12:00, antes de las 19:00, después). Debajo, una frase:
   - Si tiene algo: "Tienes 3 mascotas, 2 citas próximas y 2 reportes activos." (solo las partes distintas de cero, unidas con comas y "y"; singular/plural correcto).
   - Si no tiene nada: "Aquí verás a tus mascotas, tus citas y tus reportes."
   - Termina con "N cosas necesitan atención." (rojo; "1 cosa necesita atención.") o "Todo en orden." (verde). N cuenta las filas de "Requiere atención" **excepto** la sugerencia de alertas de zona.
   - **Atajos** (4): Mis mascotas (o "Registrar mascota" si tiene 0) · "Cartilla y recordatorios"; Buscar veterinaria · "Y agendar una cita"; Alertas de zona · "Activas" / "Apagadas"; Reportar animal · "Perdido o encontrado".
2. **Requiere atención**: lista de filas tocables (ícono por severidad, título, detalle), ordenada de lo más urgente a lo menos. Muestra 5 y luego "Ver N más" / "Ver menos". Vacío: "Todo en orden · Cuando algo necesite tu atención (un recordatorio, una cita) aparece aquí." Ver reglas abajo.
3. **KPIs** (4 tarjetas tocables):
   - **Mascotas** (la principal, tarjeta oscura): `petsCount`. Pista: "N recordatorios por atender" si hay; si no, "Sin recordatorios esta semana" (o "Registra a la primera" con 0 mascotas). Lleva a Mascotas.
   - **Próximas citas** (la segunda, tintada azul): `upcomingAppointmentsCount`. Pista: "La próxima mañana a las 10:30 a.m." (ver formato) o "Sin citas por ahora". Lleva a Citas.
   - **Reportes activos**: reportes del usuario cuyo **último** estado sigue abierto. Pista: "De N publicados" o "Aún no publicas reportes". Lleva a Reportes.
   - **Sin leer**: notificaciones sin leer. Pista: "N recibidas en 7 días", con pastilla de cambio frente a los 7 días anteriores (+50 %, −20 %) y una mini gráfica de las últimas 8 ventanas de 7 días. Lleva a Notificaciones.
4. **Mi veterinaria** (solo si tiene al menos una clínica verificada): título "Mi veterinaria" (o "Mis veterinarias" con varias), los nombres debajo y "Administrar". Tres cifras: **Citas de hoy**, **Por confirmar** (ámbar si > 0) y **Pacientes**; y una gráfica de barras **Citas por semana** (8 semanas de calendario lunes–domingo; la semana en curso se distingue como "en curso"; la barra más alta resaltada en el azul de marca con su cifra).

Estados: carga (esqueleto con la forma de los bloques), error con "Reintentar" ("No pudimos cargar tu resumen. Revisa tu conexión e intenta de nuevo."), y vacío (cuenta nueva: todo en 0, saludo con la frase de "Aquí verás…").

Si la app tiene pestañas o menú con contadores, usa `ProfileNavCounts` para los globos (Mascotas, Citas, Clínicas) y `notificationsCount` sin leer para Notificaciones; refresca cada 60 s mientras la pantalla está activa, igual que la campana.

## GraphQL
Todas filtran explícito por el usuario: el backend ya limita lo que cada quien ve, pero un admin de plataforma vería todo sin el filtro.

Resumen del Inicio. Las variables `where` se arman en la app (ver "Reglas"):

```graphql
query ProfileHome(
  $userId: ID!
  $reminderWhere: PetReminderWhereInput!
  $upcomingWhere: PetPlaceAppointmentWhereInput!
  $n0: NotificationWhereInput!
  $n1: NotificationWhereInput!
  $n2: NotificationWhereInput!
  $n3: NotificationWhereInput!
  $n4: NotificationWhereInput!
  $n5: NotificationWhereInput!
  $n6: NotificationWhereInput!
  $n7: NotificationWhereInput!
) {
  me: user(where: { id: $userId }) {
    id
    petAlertsEnabled
  }
  petsCount(where: { owners: { some: { user: { id: { equals: $userId } } } } })
  reminders: petReminders(where: $reminderWhere, orderBy: [{ dueDate: asc }], take: 5) {
    id
    title
    dueDate
    pet {
      id
      name
    }
  }
  remindersCount: petRemindersCount(where: $reminderWhere)
  upcomingAppointments: petPlaceAppointments(where: $upcomingWhere, orderBy: [{ startsAt: asc }], take: 1) {
    id
    startsAt
    status
    petName
    pet_place {
      id
      name
    }
  }
  upcomingAppointmentsCount: petPlaceAppointmentsCount(where: $upcomingWhere)
  pendingClaimsCount: animalClaimsCount(
    where: { animal: { user: { id: { equals: $userId } } }, status: { equals: "pending" } }
  )
  myPetPlaces: petPlaces(where: { user: { id: { equals: $userId } } }, orderBy: [{ name: asc }]) {
    id
    name
    verified
    claimStatus
  }
  n0: notificationsCount(where: $n0)
  n1: notificationsCount(where: $n1)
  n2: notificationsCount(where: $n2)
  n3: notificationsCount(where: $n3)
  n4: notificationsCount(where: $n4)
  n5: notificationsCount(where: $n5)
  n6: notificationsCount(where: $n6)
  n7: notificationsCount(where: $n7)
}
```

Fila "Mi veterinaria" (solo si hay clínicas verificadas; `placeIds` = sus ids):

```graphql
query ProfileClinicHome(
  $placeIds: [ID!]!
  $todayWhere: PetPlaceAppointmentWhereInput!
  $pendingWhere: PetPlaceAppointmentWhereInput!
  $c0: PetPlaceAppointmentWhereInput!
  $c1: PetPlaceAppointmentWhereInput!
  $c2: PetPlaceAppointmentWhereInput!
  $c3: PetPlaceAppointmentWhereInput!
  $c4: PetPlaceAppointmentWhereInput!
  $c5: PetPlaceAppointmentWhereInput!
  $c6: PetPlaceAppointmentWhereInput!
  $c7: PetPlaceAppointmentWhereInput!
) {
  today: petPlaceAppointmentsCount(where: $todayWhere)
  pending: petPlaceAppointmentsCount(where: $pendingWhere)
  places: petPlaces(where: { id: { in: $placeIds } }) {
    id
    patientsCount
  }
  c0: petPlaceAppointmentsCount(where: $c0)
  c1: petPlaceAppointmentsCount(where: $c1)
  c2: petPlaceAppointmentsCount(where: $c2)
  c3: petPlaceAppointmentsCount(where: $c3)
  c4: petPlaceAppointmentsCount(where: $c4)
  c5: petPlaceAppointmentsCount(where: $c5)
  c6: petPlaceAppointmentsCount(where: $c6)
  c7: petPlaceAppointmentsCount(where: $c7)
}
```

Reportes del usuario (ya existe en la web como `GetMyAnimals`; los logs vienen del más reciente al más viejo):

```graphql
query GetMyAnimals($where: AnimalWhereInput!, $orderBy: [AnimalOrderByInput!]!) {
  animals(where: $where, orderBy: $orderBy) {
    id
    slug
    name
    createdAt
    logs(orderBy: [{ date_status: desc }]) {
      status
    }
  }
}
# variables: { "where": { "user": { "id": { "equals": "<userId>" } } }, "orderBy": [{ "createdAt": "desc" }] }
```

Globos del menú:

```graphql
query ProfileNavCounts($userId: ID!, $now: DateTime!, $soon: CalendarDay!) {
  reminders: petRemindersCount(
    where: {
      pet: { owners: { some: { user: { id: { equals: $userId } } } } }
      status: { in: ["pending", "sent"] }
      dueDate: { lte: $soon }
    }
  )
  upcomingAppointments: petPlaceAppointmentsCount(
    where: {
      customer: { id: { equals: $userId } }
      status: { in: ["pending", "confirmed"] }
      startsAt: { gte: $now }
    }
  )
  clinicPendingAppointments: petPlaceAppointmentsCount(
    where: {
      pet_place: { user: { id: { equals: $userId } } }
      status: { equals: "pending" }
      startsAt: { gte: $now }
    }
  )
}
```

Sin leer (ya existe):

```graphql
query NotificationUnreadCount {
  notificationsCount(where: { product: { equals: "pet" }, readAt: { equals: null } })
}
```

Tipos:

```ts
type HomeReminder = { id: string; title: string; dueDate: string /* YYYY-MM-DD */; pet: { id: string; name: string } | null };
type HomeAppointment = { id: string; startsAt: string; status: string; petName: string | null; pet_place: { id: string; name: string } | null };
type HomePetPlace = { id: string; name: string; verified: boolean | null; claimStatus: string | null };

type ProfileHomeResponse = {
  me: { id: string; petAlertsEnabled: boolean | null } | null;
  petsCount: number | null;
  reminders: HomeReminder[] | null;          // máx. 5
  remindersCount: number | null;
  upcomingAppointments: HomeAppointment[] | null; // solo la próxima (take: 1)
  upcomingAppointmentsCount: number | null;
  pendingClaimsCount: number | null;
  myPetPlaces: HomePetPlace[] | null;
} & Record<"n0" | "n1" | "n2" | "n3" | "n4" | "n5" | "n6" | "n7", number | null>;

type ProfileClinicHomeResponse = {
  today: number | null;
  pending: number | null;
  places: Array<{ id: string; patientsCount: number | null }> | null;
} & Record<"c0" | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7", number | null>;
```

## Reglas y constantes
**Variables de `ProfileHome`** (`now` = la hora actual redondeada hacia abajo a la hora; se fija al abrir la pantalla):

```ts
const reminderWhere = {
  pet: { owners: { some: { user: { id: { equals: userId } } } } },
  status: { in: ["pending", "sent"] },          // abiertos: pendiente o ya avisado
  dueDate: { lte: calendarDay(now + 7 días) },  // incluye los vencidos
};
const upcomingWhere = {
  customer: { id: { equals: userId } },
  status: { in: ["pending", "confirmed"] },
  startsAt: { gte: now.toISOString() },
};
// n0…n7: ventanas de 7 días hacia atrás desde `now` (n0 = últimos 7 días)
n[i] = { product: { equals: "pet" }, createdAt: { gte: now − 7·(i+1) días, lt: now − 7·i días } };
```

**Variables de `ProfileClinicHome`**:

```ts
const place = { pet_place: { user: { id: { equals: userId } }, verified: { equals: true } } };
todayWhere   = { ...place, status: { notIn: ["cancelled"] }, startsAt: { gte: hoy 00:00, lt: mañana 00:00 } };
pendingWhere = { ...place, status: { equals: "pending" }, startsAt: { gte: now } };
// c0…c7: semanas de calendario (lunes 00:00 local), c0 = la semana en curso
c[i] = { ...place, status: { notIn: ["cancelled"] }, startsAt: { gte: lunes − 7·i días, lt: lunes − 7·(i−1) días } };
```

**Globos (`ProfileNavCounts`)**: `$soon` = hoy + 7 días (`YYYY-MM-DD`), `$now` = hora actual redondeada. Mascotas = `reminders`; Citas = `upcomingAppointments`; Clínicas = `clinicPendingAppointments`. 0 o null no se muestra; más de 99 → "99+".

**Clínica administrable**: `verified === true || claimStatus === "verified"`. Si no, está "en revisión".

**Reporte activo**: el `status` del log más reciente es uno de `abandoned`, `found`, `lost`, `rescued`, `in_adoption`. (`adopted`, `in_family`, `register` = cerrado.) No contar "alguna vez estuvo perdido": solo el último estado.

**Pastilla de cambio**: con `n0` (últimos 7 días) y `n1` (los 7 anteriores): si ambos son 0, no hay pastilla; si `n1` es 0, la pastilla dice "nuevas esta semana" sin porcentaje; si no, `round((n0 − n1) / n1 × 100)` con signo (+50 %, −20 %), en verde si sube y rojo si baja. La mini gráfica solo aparece si alguna ventana tiene > 0; orden de la más vieja (`n7`) a la actual (`n0`).

**Requiere atención** (en este orden de severidad; dentro de la misma severidad, en el orden listado):
1. Cada recordatorio de `reminders` (máx. 5): título "{title} de {pet.name}"; detalle "Venció el 1 nov" (rojo, `dueDate` < hoy), "Vence hoy", "Vence mañana" o "Vence el {día de la semana} {d mmm}" (ámbar). Lleva a la cartilla de esa mascota.
2. Si `remindersCount` > recordatorios listados: "N recordatorios más · Vencidos o de los próximos 7 días." (ámbar) → Mascotas.
3. Si `pending` (clínica) > 0: "N citas por confirmar · En {clínica}" (o "En tus clínicas" con varias) (ámbar) → citas de esa clínica.
4. Si la próxima cita (`upcomingAppointments[0]`) es en ≤ 48 h: "Tu cita es mañana a las 10:30 a.m." con detalle "{clínica} · {petName}" (aviso) → Citas.
5. Si `pendingClaimsCount` > 0: "Alguien reclamó uno de tus reportes" (o "N reclamos en tus reportes") · "Kadesh lo está revisando; te avisamos al resolverlo." (aviso) → Reportes.
6. Cada clínica no administrable: "{nombre} está en revisión · Valídala por WhatsApp para administrarla." (aviso) → Clínicas.
7. Sin teléfono en el perfil: "Agrega tu teléfono · Así te pueden contactar si alguien encuentra a tu mascota." (aviso) → Datos.
8. `petAlertsEnabled === false`: "Activa las alertas de zona · Te avisamos cuando reporten un animal perdido cerca de ti." (**sugerencia**: no cuenta en "N cosas necesitan atención") → Alertas de zona.

**Formato de la cita**: "hoy a las 10:30 a.m.", "mañana a las 9:00 a.m." o "el jueves 6 nov a las 5:00 p.m." (`es-MX`). Fechas cortas "1 nov" (sin punto).

**Colores**: azul de marca `#216BFA` solo para la acción principal y la barra más alta de la gráfica; estatus en rojo (vencido), ámbar (pronto / por confirmar) y verde ("Todo en orden", cambio positivo). Sin naranja ni morado.

## Referencia web
`src/components/profile/home/` (`ProfileHome.tsx`, `homeModel.ts` con todas las reglas, `useProfileHome.ts`, `queries.ts`) y `src/components/profile/shell/` (`profileNav.ts`, `queries.ts`, `useProfileNavCounts.ts`).

## Criterios de aceptación
- [ ] Con una cuenta nueva: saludo con "Aquí verás…", "Todo en orden" o solo las sugerencias, y KPIs en 0 sin pastilla ni gráfica.
- [ ] Un recordatorio vencido aparece arriba en rojo; uno de mañana, en ámbar como "Vence mañana"; al tocarlo abre la cartilla de esa mascota.
- [ ] Con más de 5 filas aparece "Ver N más" y "Ver menos".
- [ ] "Reportes activos" cuenta solo los reportes cuyo último estado está abierto.
- [ ] La fila "Mi veterinaria" solo aparece con una clínica verificada; la semana en curso se distingue en la gráfica.
- [ ] La alerta de zona apagada se muestra pero no suma a "N cosas necesitan atención".
- [ ] Los globos del menú/pestañas se actualizan cada 60 s y no se muestran en 0.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
