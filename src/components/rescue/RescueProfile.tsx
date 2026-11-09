import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  CharityIcon,
  CheckmarkBadge01Icon,
  FavouriteIcon,
  Image01Icon,
  Location01Icon,
  Mail01Icon,
  PackageIcon,
  UserGroupIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { ANIMAL_TYPE_LABELS, getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import { formatPhone, whatsappUrl } from 'kadesh/components/events/format';
import { eventSocialLinks } from 'kadesh/components/events/socialLinks';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { rescueSpeciesPhrase, rescueTypeLabel } from './constants';
import RescueAvatar from './RescueAvatar';
import { rescueLocation, rescueMonthYear, safeExternalUrl } from './rescue-seo';
import type { PublicRescueAnimal, PublicRescueOrganization } from './types';

/** Tarjetas que se ven de cada grupo antes de «Ver N más». */
const VISIBLE_PER_GROUP = 6;
const HAPPY_STATUSES = ['adopted', 'in_family'];

const SEX_LABEL: Record<string, string> = { male: 'Macho', female: 'Hembra' };

const cardClass =
  'rounded-3xl border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.06)] dark:border-white/10 dark:bg-night-raised';
const sectionTitleClass = 'text-xl font-bold text-[#121212] dark:text-white sm:text-2xl';
const primaryButtonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-5 font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';
const secondaryButtonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-kadesh px-5 font-semibold text-kadesh-700 transition-colors hover:bg-kadesh hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:text-kadesh-200';

function latestStatus(animal: PublicRescueAnimal): string {
  return animal.logs[0]?.status ?? 'register';
}

/** En adopción, rescatados (cualquier otro estado activo) y finales felices. */
function groupAnimals(animals: PublicRescueAnimal[]) {
  const inAdoption: PublicRescueAnimal[] = [];
  const rescued: PublicRescueAnimal[] = [];
  const happy: PublicRescueAnimal[] = [];
  for (const animal of animals) {
    const status = latestStatus(animal);
    if (status === 'in_adoption') inAdoption.push(animal);
    else if (HAPPY_STATUSES.includes(status)) happy.push(animal);
    else rescued.push(animal);
  }
  return { inAdoption, rescued, happy };
}

function animalTypeLabel(name: string | null | undefined): string {
  const value = name?.trim();
  if (!value) return '';
  return ANIMAL_TYPE_LABELS[value.toLowerCase()] ?? value;
}

function RescueAnimalCard({ animal }: { animal: PublicRescueAnimal }) {
  const log = animal.logs[0];
  const status = latestStatus(animal);
  const photo = animal.multimedia[0]?.image?.url ?? null;
  const details = [
    animalTypeLabel(animal.animal_type?.name),
    animal.animal_breed?.breed?.trim(),
    animal.sex ? SEX_LABEL[animal.sex] : '',
    animal.age?.trim(),
  ]
    .filter(Boolean)
    .join(' · ');
  const place = log ? rescueLocation(log) : '';

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-kadesh has-[a:focus-visible]:ring-offset-2 motion-safe:hover:-translate-y-1 dark:border-white/10 dark:bg-night-raised dark:ring-offset-night">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[#5a5a5a] dark:text-[#9aa3b2]">
            <HugeiconsIcon icon={Image01Icon} size={36} strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: getStatusColor(status) }}
        >
          {getStatusLabel(status)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#121212] dark:text-white">
          <Link href={animalDetailHref(animal)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {animal.name}
          </Link>
        </h3>
        {details ? <p className="line-clamp-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{details}</p> : null}
        {place ? (
          <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            <HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{place}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

const gridClass = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4';

function AnimalGrid({ animals }: { animals: PublicRescueAnimal[] }) {
  const visible = animals.slice(0, VISIBLE_PER_GROUP);
  const rest = animals.slice(VISIBLE_PER_GROUP);
  return (
    <>
      <ul className={gridClass}>
        {visible.map((animal) => (
          <li key={animal.id}>
            <RescueAnimalCard animal={animal} />
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="group/more mt-4">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-lg font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300 [&::-webkit-details-marker]:hidden">
            <span className="group-open/more:hidden">Ver {rest.length} más</span>
            <span className="hidden group-open/more:inline">Ver menos</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              className="rotate-90 group-open/more:-rotate-90 motion-safe:transition-transform"
              aria-hidden="true"
            />
          </summary>
          <ul className={`${gridClass} mt-4`}>
            {rest.map((animal) => (
              <li key={animal.id}>
                <RescueAnimalCard animal={animal} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

function AnimalsSection({
  id,
  title,
  hint,
  animals,
  empty,
}: {
  id: string;
  title: string;
  hint?: string;
  animals: PublicRescueAnimal[];
  empty?: string;
}) {
  if (animals.length === 0 && !empty) return null;
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <div className="mb-4">
        <h2 id={id} className={sectionTitleClass}>
          {title}
          {animals.length > 0 ? (
            <span className="ml-2 text-base font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">({animals.length})</span>
          ) : null}
        </h2>
        {hint ? <p className="mt-1 text-[#5a5a5a] dark:text-[#b0b0b0]">{hint}</p> : null}
      </div>
      {animals.length > 0 ? (
        <AnimalGrid animals={animals} />
      ) : (
        <p className="rounded-2xl border border-dashed border-[#d8dee8] bg-white px-5 py-8 text-center text-[#5a5a5a] dark:border-white/15 dark:bg-night-raised dark:text-[#b0b0b0]">
          {empty}
        </p>
      )}
    </section>
  );
}

function Badge({ tone, icon, children }: { tone: 'verified' | 'ally'; icon: IconSvgElement; children: ReactNode }) {
  return (
    <span
      className={
        tone === 'ally'
          ? 'inline-flex items-center gap-1.5 rounded-full bg-kadesh px-3 py-1 text-sm font-bold text-white'
          : 'inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-bold text-green-700 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-200'
      }
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} aria-hidden="true" />
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised">
      <dt className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{label}</dt>
      <dd className="text-2xl font-black tracking-[-0.03em] text-[#121212] tabular-nums dark:text-white sm:text-3xl">
        {value.toLocaleString('es-MX')}
      </dd>
    </div>
  );
}

/**
 * Perfil público de un espacio de rescate verificado (`/organizaciones/<slug>`). Lo pinta el
 * servidor: portada y logo, insignias, cifras, «Sobre nosotros», sus animales (en adopción,
 * rescatados y finales felices), cómo ayudar y contacto. Las tarjetas son de servidor, sin hooks.
 */
export default function RescueProfile({
  org,
  animals,
}: {
  org: PublicRescueOrganization;
  animals: PublicRescueAnimal[];
}) {
  const { inAdoption, rescued, happy } = groupAnimals(animals);
  const where = rescueLocation(org);
  const typeLabel = rescueTypeLabel(org.type);
  const cover = org.cover?.url ?? null;
  const description = org.description?.trim();
  const allySince = org.isAlly ? rescueMonthYear(org.allySince) : '';

  const phone = org.whatsapp?.replace(/\D/g, '').slice(-10) ?? '';
  const volunteerUrl = whatsappUrl(
    phone,
    `Hola, vi el perfil de ${org.name} en KADESH y me gustaría ayudar como voluntario u hogar temporal. ¿Cómo puedo apoyar?`,
  );
  const contactUrl = whatsappUrl(phone, `Hola, vi el perfil de ${org.name} en KADESH y quiero más información.`);
  const donationUrl = safeExternalUrl(org.donationUrl);
  const donationInfo = org.donationInfo?.trim();
  const needs = org.needs?.trim();
  const email = org.email?.trim();
  const socialLinks = eventSocialLinks(org)
    .map((link) => ({ ...link, url: safeExternalUrl(link.url) }))
    .filter((link): link is typeof link & { url: string } => Boolean(link.url));
  const hasHelp = Boolean(donationUrl || donationInfo || needs || volunteerUrl || inAdoption.length > 0);
  const hasContact = Boolean(contactUrl || email || socialLinks.length > 0);

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pt-[72px] pb-20 sm:px-6 lg:px-8">
        <nav aria-label="Ruta" className="mt-4 mb-4 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href={Routes.organizations.index}
                className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
              >
                Organizaciones
              </Link>
            </li>
            <li aria-hidden="true">
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </li>
            <li aria-current="page" className="min-w-0 truncate">
              {org.name}
            </li>
          </ol>
        </nav>

        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-gradient-to-br from-kadesh-400 via-kadesh to-kadesh-800 sm:aspect-[16/5]">
          {cover ? (
            <Image src={cover} alt="" fill priority sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" />
          ) : null}
        </div>

        <header className="px-1 sm:px-6">
          <div className="-mt-12 sm:-mt-14">
            <RescueAvatar
              name={org.name}
              logoUrl={org.logo?.url}
              size="xl"
              className="shadow-[0_10px_30px_rgba(15,35,80,0.18)] ring-4 ring-[#f7f8fa] dark:ring-night"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="verified" icon={CheckmarkBadge01Icon}>
              Verificado
            </Badge>
            {org.isAlly ? (
              <Badge tone="ally" icon={Award01Icon}>
                Aliado KADESH
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl">{org.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#3a3a3a] dark:text-[#d0d0d0]">
            <span className="font-semibold">{typeLabel}</span>
            {where ? (
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
                {where}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Rescata: {rescueSpeciesPhrase(org.species) || 'todo tipo de animales'}
            {org.capacity ? ` · Capacidad para ${org.capacity.toLocaleString('es-MX')} animales` : ''}
            {allySince ? ` · Aliado KADESH desde ${allySince}` : ''}
          </p>
        </header>

        {org.publishedCount > 0 ? (
          <section aria-labelledby="impacto" className="mt-6">
            <h2 id="impacto" className="sr-only">
              Su impacto en KADESH
            </h2>
            <dl className="grid grid-cols-3 gap-2 sm:gap-3">
              <Stat value={org.publishedCount} label="Animales publicados" />
              <Stat value={org.inAdoptionCount} label="En adopción" />
              <Stat value={org.adoptedCount} label="Adoptados" />
            </dl>
          </section>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-12">
            {description ? (
              <section aria-labelledby="sobre-nosotros">
                <h2 id="sobre-nosotros" className={`${sectionTitleClass} mb-3`}>
                  Sobre nosotros
                </h2>
                <p className="max-w-[65ch] whitespace-pre-line text-[17px] leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                  {description}
                </p>
              </section>
            ) : null}

            {animals.length === 0 ? (
              <section aria-labelledby="sus-animales" className="rounded-3xl border border-dashed border-[#d8dee8] bg-white px-6 py-12 text-center dark:border-white/15 dark:bg-night-raised">
                <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15 dark:text-kadesh-200">
                  <HugeiconsIcon icon={FavouriteIcon} size={28} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h2 id="sus-animales" className="text-lg font-bold text-[#121212] dark:text-white">
                  Todavía no hay animales publicados
                </h2>
                <p className="mx-auto mt-1 max-w-md text-[#5a5a5a] dark:text-[#b0b0b0]">
                  Cuando {org.name} publique a sus rescatados, aquí verás a quienes buscan familia. Vuelve pronto.
                </p>
              </section>
            ) : (
              <>
                <AnimalsSection
                  id="en-adopcion"
                  title="En adopción"
                  hint="Buscan una familia. Abre su ficha para conocerlos."
                  animals={inAdoption}
                  empty="Por ahora nadie está en adopción. Vuelve pronto o síguelos en sus redes."
                />
                <AnimalsSection id="rescatados-recientes" title="Rescatados recientes" animals={rescued} />
                <AnimalsSection
                  id="finales-felices"
                  title="Historias con final feliz"
                  hint="Ya están en casa, gracias a quienes adoptaron y apoyaron."
                  animals={happy}
                />
              </>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {hasHelp ? (
              <section aria-labelledby="como-ayudar" className={cardClass}>
                <h2 id="como-ayudar" className="flex items-center gap-2 text-lg font-bold text-[#121212] dark:text-white">
                  <HugeiconsIcon icon={CharityIcon} size={20} strokeWidth={1.5} className="text-kadesh" aria-hidden="true" />
                  Cómo ayudar
                </h2>
                <div className="mt-4 space-y-3">
                  {donationUrl ? (
                    <a href={donationUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className={primaryButtonClass}>
                      Donar
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} aria-hidden="true" />
                      <span className="sr-only">(se abre en otra pestaña)</span>
                    </a>
                  ) : null}
                  {volunteerUrl ? (
                    <a href={volunteerUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
                      <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={1.5} aria-hidden="true" />
                      Ser voluntario u hogar temporal
                      <span className="sr-only">(WhatsApp, se abre en otra pestaña)</span>
                    </a>
                  ) : null}
                  {inAdoption.length > 0 ? (
                    <a
                      href="#en-adopcion"
                      className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                    >
                      Ver a quienes buscan familia
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                {donationInfo ? (
                  <div className="mt-5 border-t border-[#ececec] pt-4 dark:border-white/10">
                    <h3 className="text-sm font-bold text-[#121212] dark:text-white">Datos para donar</h3>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                      {donationInfo}
                    </p>
                  </div>
                ) : null}
                {needs ? (
                  <div className="mt-5 border-t border-[#ececec] pt-4 dark:border-white/10">
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#121212] dark:text-white">
                      <HugeiconsIcon icon={PackageIcon} size={16} strokeWidth={1.5} aria-hidden="true" />
                      Lo que necesitan
                    </h3>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                      {needs}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasContact ? (
              <section aria-labelledby="contacto" className={cardClass}>
                <h2 id="contacto" className="text-lg font-bold text-[#121212] dark:text-white">
                  Contacto
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {contactUrl ? (
                    <li>
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.5} aria-hidden="true" />
                        WhatsApp {formatPhone(phone)}
                        <span className="sr-only">(se abre en otra pestaña)</span>
                      </a>
                    </li>
                  ) : null}
                  {email ? (
                    <li>
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex min-h-10 max-w-full items-center gap-2 font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={18} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{email}</span>
                      </a>
                    </li>
                  ) : null}
                </ul>
                {socialLinks.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Redes y sitio web">
                    {socialLinks.map((link) => (
                      <li key={link.field}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow ugc"
                          aria-label={`${link.label}: ${link.text} (se abre en otra pestaña)`}
                          className="inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full border border-[#d8dee8] bg-white px-3 text-sm font-semibold text-[#121212] transition-colors hover:border-kadesh focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:bg-night dark:text-white"
                        >
                          <HugeiconsIcon icon={link.icon} size={16} aria-hidden="true" />
                          <span className="truncate">{link.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            <p className="px-2 text-xs leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
              KADESH verifica cada espacio antes de mostrarlo, pero cada organización responde por sus rescates y donativos.
              Si algo no cuadra,{' '}
              <Link href={Routes.contact} className="font-semibold underline">
                avísanos
              </Link>
              .
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
