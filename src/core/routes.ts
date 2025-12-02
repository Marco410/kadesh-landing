/**
 * Centralized routes for the application
 * All route paths should be defined here for consistency and easy maintenance
 */

export const Routes = {
  // Home
  home: '/',
  
  // Blog
  blog: {
    index: '/blog',
    post: (url: string) => `/blog/${url}`,
  },
  
  // Landing
  landing: '/landing',
  
  // Legal
  terms: '/terminos',
  privacy: '/privacidad',
  contact: '/contacto',
  
  // Services
  donations: '/donaciones',
  veterinarians: {
    index: '/veterinarias',
    register: '/veterinarias/registro',
  },
  
  // Other
  news: '/noticias',
  stories: '/historias',
} as const;
