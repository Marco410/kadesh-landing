import { PUBLIC_USER_PROFILE_QUERY } from './queries';
import type { PublicUserProfile } from './types';

/** 5 min: lo mismo que el ranking; las fotos son URLs firmadas de 1 h. */
export const PUBLIC_PROFILE_REVALIDATE_SECONDS = 300;

type Response = {
  data?: { publicUserProfile: PublicUserProfile | null };
  errors?: Array<{ message?: string }>;
};

/**
 * Perfil público de `/u/<username>` (solo servidor). `null` si no existe, si la persona lo apagó o
 * si el API falla: la página responde 404.
 */
export async function fetchPublicProfile(username: string): Promise<PublicUserProfile | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !username) return null;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PUBLIC_USER_PROFILE_QUERY, variables: { username } }),
      next: { revalidate: PUBLIC_PROFILE_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as Response;
    if (payload.errors?.length) {
      console.error('PublicUserProfile GraphQL errors:', payload.errors);
      return null;
    }
    return payload.data?.publicUserProfile ?? null;
  } catch (error) {
    console.error('PublicUserProfile fetch failed:', error);
    return null;
  }
}
