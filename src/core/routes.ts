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
    whatIsKadesh: '#que-es-kadesh',
    lostAnimals: '#animales',
    veterinarians: '#veterinarias',
    stories: '#historias',
    donations: '#donaciones',
    howItWorks: '#como-funciona',
    roadmap: '#roadmap',
    faq: '#preguntas-frecuentes',
  },

  blog: {
    index: '/blog',
    post: (url: string): string => `/blog/${url}`,
  },

  novedades: '/novedades',
  
  // Landing
  landing: '/landing',
  
  // Legal
  terms: '/terminos',
  privacy: '/privacidad',
  contact: '/contacto',
  
  // Profile
  profile: '/perfil',
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
    detail: (slug: string): string => `/animales/${slug}`,
  },

  // Veterinaries (pet places)
  veterinaries: {
    index: '/veterinarias',
    detail: (slug: string): string => `/veterinarias/${slug}`,
    book: (slug: string): string => `/veterinarias/${slug}?reservar=1`,
  },
  
  // About
  conocenos: '/conocenos',
  
} as const;
