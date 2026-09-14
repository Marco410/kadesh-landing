export default function NewAnimalFormSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-[#e6e9ef] dark:bg-white/10" />
          <div className="grid grid-cols-3 justify-items-center gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 animate-pulse rounded-full bg-[#e6e9ef] dark:bg-white/10" />
                <div className="h-3 w-16 animate-pulse rounded bg-[#e6e9ef] dark:bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-5 sm:px-6">
        <div className="h-36 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
        <div className="h-9 w-64 animate-pulse rounded-full bg-[#e6e9ef] dark:bg-white/10" />
        <div className="h-12 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10" />
      </div>
    </div>
  );
}
