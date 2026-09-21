"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import ProfileData from "kadesh/components/profile/ProfileData";
import UserPostsSection from "kadesh/components/profile/UserPostsSection";
import UserAnimalsSection from "kadesh/components/profile/UserAnimalsSection";
import UserVeterinariesSection from "kadesh/components/profile/UserVeterinariesSection";
import { UserAppointmentsSection } from "kadesh/components/veterinaries";
import ProfileTabs, {
  isProfileTabKey,
  type ProfileTabKey,
} from "kadesh/components/profile/ProfileTabs";
import { Navigation } from "kadesh/components/layout";
import { useProfileMotion } from "kadesh/components/profile/motion";

function getValidTab(tabFromUrl: string | null): ProfileTabKey {
  if (tabFromUrl && isProfileTabKey(tabFromUrl)) return tabFromUrl;
  return "profile";
}

function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#f7f8fa] pt-[72px] dark:bg-night">
      <Navigation />
      {children}
    </main>
  );
}

function ProfilePageContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedTab = getValidTab(searchParams.get("tab"));
  const motionPrefs = useProfileMotion();

  const handleTabChange = (key: ProfileTabKey) => {
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  };

  useEffect(() => {
    if (!loading && !user?.id) {
      const next = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      router.push(
        `${Routes.auth.login}?redirect=${encodeURIComponent(next)}`,
      );
    }
  }, [user, loading, router, pathname, searchParams]);

  if (loading || !user?.id) {
    return (
      <ProfileShell>
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10" />
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <div className={`mx-auto w-full px-4 py-6 sm:px-6 ${
        selectedTab === "clinics" ? "max-w-5xl" : "max-w-3xl"
      }`}>
        <header className="mb-5">
          <h1 className="text-2xl font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
            Perfil
          </h1>
          {user.username ? (
            <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              @{user.username}
            </p>
          ) : null}
        </header>

        <ProfileTabs value={selectedTab} onChange={handleTabChange} />

        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              role="tabpanel"
              id={`perfil-panel-${selectedTab}`}
              aria-labelledby={`perfil-tab-${selectedTab}`}
              variants={motionPrefs.panel}
              initial={motionPrefs.reduce ? false : "hidden"}
              animate="show"
              exit="exit"
            >
              {selectedTab === "profile" ? <ProfileData user={user} /> : null}
              {selectedTab === "posts" ? (
                <UserPostsSection userId={user.id} />
              ) : null}
              {selectedTab === "animals" ? (
                <UserAnimalsSection userId={user.id} />
              ) : null}
              {selectedTab === "appointments" ? (
                <UserAppointmentsSection />
              ) : null}
              {selectedTab === "clinics" ? (
                <UserVeterinariesSection userId={user.id} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProfileShell>
  );
}

function ProfilePageFallback() {
  return (
    <main className="min-h-dvh bg-[#f7f8fa] pt-[72px] dark:bg-night">
      <Navigation />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10" />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageContent />
    </Suspense>
  );
}
