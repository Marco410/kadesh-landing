import type { LevelAvatarLevel } from 'kadesh/components/paws/LevelAvatar';

export type PublicLevel = NonNullable<LevelAvatarLevel> & { from: number; nextAt: number | null };

/** Autor de un reporte (`animalAuthor`): nombre con inicial, foto, nivel y enlace al perfil. */
export type PublicUserCard = {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  level: PublicLevel | null;
};

export type PublicUserReport = {
  id: string;
  slug: string | null;
  displayName: string;
  status: string | null;
  outcome: string | null;
  city: string | null;
  coverUrl: string | null;
  createdAt: string | null;
};

export type PublicUserEvent = {
  id: string;
  slug: string | null;
  title: string;
  city: string | null;
  state: string | null;
  firstStartsAt: string | null;
  lastEndsAt: string | null;
};

export type PublicUserRescueOrg = {
  id: string;
  slug: string | null;
  name: string;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  role: string | null;
};

export type PublicUserClinic = {
  id: string;
  slug: string | null;
  name: string;
  municipality: string | null;
  state: string | null;
};

export type PublicUserProfile = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  memberSince: string | null;
  level: PublicLevel | null;
  lifetimeEarned: number;
  streakWeeks: number;
  rank: number | null;
  reportsCount: number;
  eventsCount: number;
  reports: PublicUserReport[];
  events: PublicUserEvent[];
  rescueOrgs: PublicUserRescueOrg[];
  clinics: PublicUserClinic[];
};
