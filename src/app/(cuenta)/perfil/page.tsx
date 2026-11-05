"use client";

import { useSearchParams } from "next/navigation";
import { AppPageHeader, useIsClient } from "kadesh/components/app-shell";
import ProfileData from "kadesh/components/profile/ProfileData";
import UserPostsSection from "kadesh/components/profile/UserPostsSection";
import UserAnimalsSection from "kadesh/components/profile/UserAnimalsSection";
import UserVeterinariesSection from "kadesh/components/profile/UserVeterinariesSection";
import ProfileHome from "kadesh/components/profile/home/ProfileHome";
import {
  PROFILE_VIEWS,
  isProfileTabKey,
  profileGroupTitle,
  type ProfileTabKey,
} from "kadesh/components/profile/shell/profileNav";
import { UserAppointmentsSection } from "kadesh/components/veterinaries";
import { MyPetsSection } from "kadesh/components/pets";
import { MyEventsSection } from "kadesh/components/events";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";

/** Ancho de cada vista: los formularios conservan su medida; Inicio y Clínicas usan más. */
const VIEW_WIDTH: Record<ProfileTabKey, string> = {
  inicio: "",
  profile: "max-w-3xl",
  pets: "max-w-5xl",
  posts: "max-w-4xl",
  animals: "max-w-4xl",
  events: "max-w-4xl",
  appointments: "max-w-4xl",
  clinics: "max-w-6xl",
};

function longDate(date: Date): string {
  const text = date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * `/perfil`: una vista por `?tab=` dentro del panel (el shell vive en `app/(cuenta)/layout.tsx` y
 * ya exige sesión). Sin `tab`, o con uno desconocido, abre Inicio. La vista se remonta al cambiar
 * (`key`), así su entrada se repite y el shell mueve el foco a su `h1`.
 */
export default function ProfilePage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const view: ProfileTabKey = isProfileTabKey(tab) ? tab : "inicio";
  const mounted = useIsClient();

  if (!user?.id) return null;
  const config = PROFILE_VIEWS[view];
  const eyebrow = view === "inicio" ? (mounted ? longDate(new Date()) : " ") : profileGroupTitle(view);

  return (
    <div key={view} className={cn("w-full", VIEW_WIDTH[view])}>
      {/* Clínicas pinta su propio encabezado: en el detalle, el título es la clínica. */}
      {view !== "clinics" ? (
        <AppPageHeader eyebrow={eyebrow} title={config.label} description={config.description} />
      ) : null}

      {view === "inicio" ? <ProfileHome user={user} /> : null}
      {view === "profile" ? <ProfileData user={user} /> : null}
      {view === "pets" ? <MyPetsSection userId={user.id} /> : null}
      {view === "posts" ? <UserPostsSection userId={user.id} /> : null}
      {view === "animals" ? <UserAnimalsSection userId={user.id} /> : null}
      {view === "events" ? <MyEventsSection userId={user.id} /> : null}
      {view === "appointments" ? <UserAppointmentsSection /> : null}
      {view === "clinics" ? <UserVeterinariesSection userId={user.id} /> : null}
    </div>
  );
}
