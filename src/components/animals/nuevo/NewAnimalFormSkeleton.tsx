export default function NewAnimalFormSkeleton() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="w-full py-6 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-10 bg-orange-400/30 rounded-lg w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-6 bg-orange-400/30 rounded-lg w-80 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Form Skeleton */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          {/* Name Input Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
          </div>

          {/* Animal Type Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-36 animate-pulse"></div>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-28 h-24 bg-gray-200 dark:bg-[#3a3a3a] rounded-xl border-2 border-gray-200 dark:border-[#3a3a3a] animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Breed Autocomplete Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
          </div>

          {/* Sex Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-20 animate-pulse"></div>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-28 h-24 bg-gray-200 dark:bg-[#3a3a3a] rounded-xl border-2 border-gray-200 dark:border-[#3a3a3a] animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Status Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-24 animate-pulse"></div>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-28 h-24 bg-gray-200 dark:bg-[#3a3a3a] rounded-xl border-2 border-gray-200 dark:border-[#3a3a3a] animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Location Picker Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-32 animate-pulse"></div>
            <div className="h-[400px] bg-gray-200 dark:bg-[#3a3a3a] rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Checkbox Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-[#3a3a3a] rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-64 animate-pulse"></div>
          </div>

          {/* Notes Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-24 animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
          </div>

          {/* Images Upload Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-40 animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] animate-pulse"></div>
          </div>

          {/* Submit Buttons Skeleton */}
          <div className="flex gap-4 pt-4">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-200 dark:bg-[#3a3a3a] rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    </>
  );
}
