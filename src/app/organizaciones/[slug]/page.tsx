import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from 'kadesh/components/blog/JsonLd';
import RescueProfile from 'kadesh/components/rescue/RescueProfile';
import {
  buildMissingRescueOrgMetadata,
  buildRescueOrgJsonLd,
  buildRescueOrgMetadata,
} from 'kadesh/components/rescue/rescue-seo';
import { fetchPublicRescueAnimals, fetchPublicRescueOrg } from 'kadesh/components/rescue/server';

/** Las imágenes del API son URLs firmadas de 1 h: la página no se guarda más de 30 min. */
export const revalidate = 1800;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchPublicRescueOrg(slug);
  return org ? buildRescueOrgMetadata(org) : buildMissingRescueOrgMetadata();
}

/**
 * Perfil público de un espacio de rescate. Solo existen los verificados: el API no devuelve los que
 * siguen en revisión a quien no tiene sesión, y entonces la página es 404.
 */
export default async function RescueOrganizationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [org, animals] = await Promise.all([fetchPublicRescueOrg(slug), fetchPublicRescueAnimals(slug)]);
  if (!org) notFound();

  return (
    <>
      <JsonLd data={buildRescueOrgJsonLd(org)} />
      <RescueProfile org={org} animals={animals} />
    </>
  );
}
