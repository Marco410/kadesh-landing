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
  },

  blog: {
    index: '/blog',
    post: (url: string): string => `/blog/${url}`,
  },
  
  // Landing
  landing: '/landing',
  
  // Legal
  terms: '/terminos',
  privacy: '/privacidad',
  contact: '/contacto',
  
  // Profile
  profile: '/perfil',
  
  // Animals
  animals: {
    index: '/animales',
    new: '/animales/nuevo',
    detail: (id: string): string => `/animales/${id}`,
  },
  
  // About
  conocenos: '/conocenos',
  
} as const;
