/**
 * Centralized routes for the application
 * All route paths should be defined here for consistency and easy maintenance
 */

export const Routes = {
  
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  // Home
  home: '/',
  
  // Navigation sections (anchors on home page)
  navigation: {
    lostAnimals: '#animales',
    zoneAlerts: '#alertas',
    events: '#eventos',
    howItWorks: '#como-funciona',
    firstHours: '#primeras-24-horas',
    stories: '#historias',
    veterinarians: '#veterinarias',
    donations: '#donaciones',
    faq: '#preguntas-frecuentes',
  },

  blog: {
    index: '/blog',
    post: (url: string): string => `/blog/${url}`,
    postImage: (url: string): string => `/blog/${url}/og`,
    unsubscribe: '/blog/desuscribirse',
  },

  novedades: '/novedades',
  roadmap: '/novedades#roadmap',
  advertise: '/anunciate',
  donations: '/donaciones',
  
  // Landing
  landing: '/landing',
  
  // Legal
  terms: '/terminos',
  privacy: '/privacidad',
  contact: '/contacto',
  
  // Profile (panel con sesión). Sin `tab` abre Inicio; cada vista es `?tab=<clave>`.
  profile: '/perfil',
  profileTab: (tab: string): string => `/perfil?tab=${tab}`,
  profileClinic: (clinicId: string, vista?: string): string =>
    `/perfil?tab=clinics&clinic=${encodeURIComponent(clinicId)}${vista ? `&vista=${vista}` : ''}`,
  profilePet: (petId: string): string => `/perfil?tab=pets&pet=${encodeURIComponent(petId)}`,
  /** Espacio de rescate en el panel: sin `orgId` abre la lista; con él, la vista (`resumen` por defecto). */
  profileRescue: (orgId?: string, vista?: string): string =>
    orgId
      ? `/perfil?tab=rescate&org=${encodeURIComponent(orgId)}${vista ? `&vista=${vista}` : ''}`
      : '/perfil?tab=rescate',
  /** Ficha interna (cartilla) de un animal en el panel de su espacio de rescate. */
  profileRescuePet: (orgId: string, petId: string): string =>
    `/perfil?tab=rescate&org=${encodeURIComponent(orgId)}&vista=fichas&pet=${encodeURIComponent(petId)}`,
  /** Activar un espacio de rescate (asistente dentro del panel). */
  rescueActivate: '/perfil/rescate/activar',
  profileLead: (id: string): string => `/perfil/ventas/lead/${id}`,
  profileSyncLeads: '/perfil/ventas/obtener-clientes',
  profileAddSalesperson: '/perfil/ventas/agregar-vendedor',
  profilePlans: '/perfil/ventas/planes',
  profilePlanSubscribe: (planId: string): string => `/perfil/ventas/planes/suscripcion/${planId}`,
  profilePlanSubscriptionSuccess: "/perfil/ventas/planes/suscripcion/success",

  // Animals
  animals: {
    index: '/animales',
    new: '/animales/nuevo',
    /** Reportar a nombre de un espacio de rescate (el formulario preselecciona la organización). */
    newForRescue: (orgId: string, status = 'rescued'): string =>
      `/animales/nuevo?status=${encodeURIComponent(status)}&org=${encodeURIComponent(orgId)}`,
    detail: (slug: string): string => `/animales/${slug}`,
    edit: (slug: string): string => `/animales/${slug}/editar`,
    image: (slug: string): string => `/animales/${slug}/og`,
  },

  // Veterinaries (pet places)
  veterinaries: {
    index: '/veterinarias',
    register: '/veterinarias/registro',
    detail: (slug: string): string => `/veterinarias/${slug}`,
    book: (slug: string): string => `/veterinarias/${slug}?reservar=1`,
    image: (slug: string): string => `/veterinarias/${slug}/og`,
  },
  
  // Events (campañas, jornadas, ferias de adopción)
  events: {
    index: '/eventos',
    new: '/eventos/nuevo',
    detail: (slug: string): string => `/eventos/${slug}`,
    edit: (slug: string): string => `/eventos/${slug}/editar`,
    image: (slug: string): string => `/eventos/${slug}/og`,
    calendar: (slug: string): string => `/eventos/${slug}/calendario`,
    /** Página de un estado o municipio: `/eventos/en/michoacan` o `/eventos/en/michoacan/morelia`. */
    place: (stateSlug: string, cityKey?: string | null): string =>
      cityKey ? `/eventos/en/${stateSlug}/${cityKey}` : `/eventos/en/${stateSlug}`,
    /** «Mis eventos» en el panel. */
    mine: '/perfil?tab=events',
  },

  // Espacios de rescate (rescatistas, refugios, hogares temporales, colectivos). Solo los verificados.
  organizations: {
    index: '/organizaciones',
    detail: (slug: string): string => `/organizaciones/${slug}`,
    image: (slug: string): string => `/organizaciones/${slug}/og`,
  },
  /** Aliados KADESH: espacios de rescate que destacamos en la portada. */
  allies: '/aliados',

  // Notifications (campana y alertas de zona)
  notifications: {
    index: '/notificaciones',
    alerts: '/notificaciones/alertas',
    /** Ajustes de avisos: WhatsApp (general y por tipo) y acceso a las alertas de zona. */
    settings: '/notificaciones/ajustes',
  },

  // About
  conocenos: '/conocenos',
  
} as const;
