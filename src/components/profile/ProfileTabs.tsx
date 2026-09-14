"use client";

export const PROFILE_TABS = [
  { key: "profile", label: "Datos" },
  { key: "posts", label: "Publicaciones" },
  { key: "animals", label: "Reportes" },
] as const;

export type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];

export function isProfileTabKey(value: string | null): value is ProfileTabKey {
  return PROFILE_TABS.some((tab) => tab.key === value);
}

export default function ProfileTabs({
  value,
  onChange,
}: {
  value: ProfileTabKey;
  onChange: (key: ProfileTabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del perfil"
      className="flex flex-wrap gap-2"
    >
      {PROFILE_TABS.map((tab) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
              selected
                ? "bg-kadesh text-white shadow-[0_8px_18px_rgba(15,35,80,0.18)]"
                : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
