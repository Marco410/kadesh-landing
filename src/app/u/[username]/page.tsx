import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar03Icon,
  CharityIcon,
  Fire03Icon,
  Mail01Icon,
  Megaphone01Icon,
  RankingIcon,
  SmartPhone01Icon,
  Stethoscope02Icon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons';
import { Footer, Navigation } from 'kadesh/components/layout';
import { LevelAvatar, PAW_LEVELS, PawLevelsList, levelColors, levelTone, pawLevelIcon } from 'kadesh/components/paws';
import ProfileReports from 'kadesh/components/public-profile/ProfileReports';
import { fetchPublicProfile } from 'kadesh/components/public-profile/server';
import type { PublicUserProfile } from 'kadesh/components/public-profile/types';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { cn } from 'kadesh/utils/cn';

/** Igual que `PUBLIC_PROFILE_REVALIDATE_SECONDS`; las fotos son URLs firmadas de 1 h. */
export const revalidate = 300;

type Params = { params: Promise<{ username: string }> };

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administración',
  coordinator: 'Coordinación',
  volunteer: 'Voluntariado',
  foster: 'Hogar temporal',
};

const n = (value: number) => value.toLocaleString('es-MX');

function monthYear(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' });
}

function eventDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' });
}

function whatsappHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `https://wa.me/52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `https://wa.me/${digits}`;
  return null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(decodeURIComponent(username));
  if (!profile) return { title: 'Perfil no disponible', robots: { index: false, follow: false } };
  const title = `${profile.displayName} en KADESH Pet`;
  const description =
    profile.bio ??
    `${profile.displayName} ayuda a encontrar mascotas perdidas en KADESH Pet${profile.level ? ` · Nivel ${profile.level.level} ${profile.level.label}` : ''}.`;
  return {
    title,
    description,
    // Perfiles de personas: se pueden compartir, pero no los indexamos.
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}${Routes.publicProfile(profile.username)}` },
    openGraph: { title, description, url: `${SITE_URL}${Routes.publicProfile(profile.username)}` },
  };
}

/**
 * `/u/<username>`: perfil público de una persona de Kadesh Pet. Nivel y huellitas, biografía,
 * contacto (solo lo que eligió mostrar), sus reportes, eventos, espacios de rescate y clínicas.
 * Si no existe o la persona lo apagó, 404. Todo llega del servidor (5 min).
 */
export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const profile = await fetchPublicProfile(decodeURIComponent(username));
  if (!profile) notFound();

  const since = monthYear(profile.memberSince);
  const hasActivity =
    profile.reports.length > 0 || profile.events.length > 0 || profile.rescueOrgs.length > 0 || profile.clinics.length > 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />

      <header className="border-b border-[#ececec] bg-white px-4 pb-8 pt-[calc(72px+2rem)] dark:border-white/10 dark:bg-night-raised sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <LevelAvatar name={profile.displayName} avatarUrl={profile.avatarUrl} level={profile.level} size="xl" />
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-[-0.035em] text-[#121212] dark:text-white sm:text-4xl">
                {profile.displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {profile.level ? (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold', levelTone(profile.level.key))}>
                    <HugeiconsIcon icon={pawLevelIcon(profile.level.key)} size={14} strokeWidth={2} aria-hidden="true" />
                    Nivel {profile.level.level} · {profile.level.label}
                  </span>
                ) : null}
                {since ? <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">En Kadesh desde {since}</span> : null}
              </div>
              {profile.bio ? (
                <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
                  {profile.bio}
                </p>
              ) : null}
              <ContactLinks profile={profile} />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[460px]">
            <Stat icon={pawLevelIcon(profile.level?.key ?? 'puppy')} label="Huellitas" value={n(profile.lifetimeEarned)} />
            <Stat icon={RankingIcon} label="Lugar" value={profile.rank ? `#${profile.rank}` : '—'} href={Routes.ranking} />
            <Stat icon={Fire03Icon} label="Racha" value={profile.streakWeeks ? `${profile.streakWeeks} sem.` : '—'} />
            <Stat icon={Megaphone01Icon} label="Reportes" value={n(profile.reportsCount)} />
          </dl>
        </div>
        {profile.level ? <LevelProgress profile={profile} /> : null}
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0 space-y-10">
          {profile.reports.length > 0 ? (
            <section aria-labelledby="reportes">
              <SectionTitle id="reportes" icon={Megaphone01Icon} title="Reportes" count={profile.reportsCount} />
              <ProfileReports username={profile.username} initial={profile.reports} total={profile.reportsCount} />
            </section>
          ) : null}

          {profile.events.length > 0 ? (
            <section aria-labelledby="eventos">
              <SectionTitle id="eventos" icon={Calendar03Icon} title="Eventos que organizó" count={profile.eventsCount} />
              <ul className="divide-y divide-[#ececec] overflow-hidden rounded-3xl border border-[#ececec] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-night-raised">
                {profile.events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={Routes.events.detail(event.slug ?? event.id)}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#f7f8fa] dark:hover:bg-white/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#121212] dark:text-white">{event.title}</span>
                        <span className="block text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">
                          {[event.city, event.state].filter(Boolean).join(', ')}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{eventDate(event.firstStartsAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!hasActivity ? (
            <div className="rounded-3xl border border-dashed border-[#d9dde3] px-6 py-16 text-center dark:border-white/15">
              <p className="font-semibold text-[#121212] dark:text-white">Todavía no hay nada publicado</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
                Aquí aparecerán sus reportes, eventos, espacios de rescate y clínicas.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          {profile.rescueOrgs.length > 0 ? (
            <SideCard icon={CharityIcon} title="Espacios de rescate">
              {profile.rescueOrgs.map((org) => (
                <SideLink
                  key={org.id}
                  href={Routes.organizations.detail(org.slug ?? org.id)}
                  imageUrl={org.logoUrl}
                  title={org.name}
                  detail={[org.role ? ROLE_LABEL[org.role] ?? null : null, org.city].filter(Boolean).join(' · ')}
                />
              ))}
            </SideCard>
          ) : null}
          {profile.clinics.length > 0 ? (
            <SideCard icon={Stethoscope02Icon} title="Clínicas">
              {profile.clinics.map((clinic) => (
                <SideLink
                  key={clinic.id}
                  href={Routes.veterinaries.detail(clinic.slug ?? clinic.id)}
                  title={clinic.name}
                  detail={[clinic.municipality, clinic.state].filter(Boolean).join(', ')}
                />
              ))}
            </SideCard>
          ) : null}
          {profile.level ? (
            <section className="rounded-3xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
              <h2 className="mb-3 font-bold text-[#121212] dark:text-white">Niveles</h2>
              <PawLevelsList currentLevel={profile.level.level} currentLabel="Su nivel" />
            </section>
          ) : null}
          <section className="rounded-3xl bg-[#121a2b] p-5 text-white dark:bg-kadesh-500/15">
            <p className="font-bold">Huellitas</p>
            <p className="mt-1 text-sm text-white/80">
              Se ganan publicando reportes, avisando «Lo vi», cerrando casos y adoptando. Mira quién apoya más.
            </p>
            <Link href={Routes.ranking} className="mt-3 inline-flex text-sm font-semibold text-kadesh-300 hover:underline">
              Ver el ranking →
            </Link>
          </section>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

function ContactLinks({ profile }: { profile: PublicUserProfile }) {
  if (!profile.phone && !profile.email) return null;
  const wa = profile.phone ? whatsappHref(profile.phone) : null;
  const linkClass =
    'inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9dde3] bg-white px-4 text-sm font-semibold text-[#121212] hover:bg-[#f7f8fa] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10';
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <HugeiconsIcon icon={WhatsappIcon} size={16} aria-hidden="true" />
          WhatsApp
        </a>
      ) : null}
      {profile.phone ? (
        <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className={linkClass}>
          <HugeiconsIcon icon={SmartPhone01Icon} size={16} aria-hidden="true" />
          {profile.phone}
        </a>
      ) : null}
      {profile.email ? (
        <a href={`mailto:${profile.email}`} className={linkClass}>
          <HugeiconsIcon icon={Mail01Icon} size={16} aria-hidden="true" />
          {profile.email}
        </a>
      ) : null}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  href,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <dt className="flex items-center gap-1.5 text-[12px] text-[#5a5a5a] dark:text-[#9aa3b2]">
        <HugeiconsIcon icon={icon} size={13} strokeWidth={1.8} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-black tabular-nums tracking-[-0.03em] text-[#121212] dark:text-white">{value}</dd>
    </>
  );
  const box = 'block rounded-2xl bg-[#f7f8fa] px-4 py-3 dark:bg-white/5';
  return href ? (
    <Link href={href} className={cn(box, 'hover:bg-[#eef1f5] dark:hover:bg-white/10')}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

function LevelProgress({ profile }: { profile: PublicUserProfile }) {
  const level = profile.level!;
  const next = PAW_LEVELS.find((step) => step.level === level.level + 1);
  const span = level.nextAt !== null ? level.nextAt - level.from : 0;
  const progress =
    level.nextAt === null ? 100 : span > 0 ? Math.min(100, Math.max(0, ((profile.lifetimeEarned - level.from) / span) * 100)) : 0;
  return (
    <div className="mx-auto mt-8 max-w-7xl">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
          {next ? (
            <>
              Rumbo a <span className={levelColors(next.key).text}>{next.label}</span>
            </>
          ) : (
            'Nivel más alto alcanzado'
          )}
        </span>
        {level.nextAt !== null ? (
          <span className="tabular-nums text-[#5a5a5a] dark:text-[#9aa3b2]">
            {n(profile.lifetimeEarned)} / {n(level.nextAt)}
          </span>
        ) : null}
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eef1f5] dark:bg-white/10"
        role="progressbar"
        aria-label={next ? `Progreso hacia el nivel ${next.label}` : 'Nivel más alto alcanzado'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className={cn('h-full rounded-full', levelColors(level.key).bar)} style={{ width: `${Math.max(progress, 2)}%` }} />
      </div>
    </div>
  );
}

function SectionTitle({
  id,
  icon,
  title,
  count,
}: {
  id: string;
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  title: string;
  count: number;
}) {
  return (
    <h2 id={id} className="mb-4 flex items-center gap-2 text-xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
      <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} aria-hidden="true" />
      {title}
      <span className="text-base font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">{n(count)}</span>
    </h2>
  );
}

function SideCard({
  icon,
  title,
  children,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-[#121212] dark:text-white">
        <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} aria-hidden="true" />
        {title}
      </h2>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function SideLink({
  href,
  title,
  detail,
  imageUrl,
}: {
  href: string;
  title: string;
  detail?: string;
  imageUrl?: string | null;
}) {
  return (
    <li>
      <Link href={href} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-[#f7f8fa] dark:hover:bg-white/5">
        {imageUrl ? (
          <Image src={imageUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-kadesh-50 text-sm font-bold text-kadesh-700 dark:bg-kadesh-500/15 dark:text-kadesh-300">
            {title.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#121212] dark:text-white">{title}</span>
          {detail ? <span className="block truncate text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">{detail}</span> : null}
        </span>
      </Link>
    </li>
  );
}
