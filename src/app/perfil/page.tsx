"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import ProfileData from "kadesh/components/profile/ProfileData";
import UserPostsSection from "kadesh/components/profile/UserPostsSection";
import UserAnimalsSection from "kadesh/components/profile/UserAnimalsSection";
import ProfileTabs, {
  isProfileTabKey,
  type ProfileTabKey,
} from "kadesh/components/profile/ProfileTabs";
import { Navigation } from "kadesh/components/layout";

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

  const handleTabChange = (key: ProfileTabKey) => {
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  };

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(
        `${Routes.auth.login}?redirect=${encodeURIComponent(Routes.profile)}`,
      );
    }
  }, [user, loading, router]);

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
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
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
          {selectedTab === "profile" ? <ProfileData user={user} /> : null}
          {selectedTab === "posts" ? (
            <UserPostsSection userId={user.id} />
          ) : null}
          {selectedTab === "animals" ? (
            <UserAnimalsSection userId={user.id} />
          ) : null}
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
