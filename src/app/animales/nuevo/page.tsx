"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation, Footer } from 'kadesh/components/layout';
import { useUser } from 'kadesh/utils/UserContext';
import { motion } from 'framer-motion';
import { Routes } from 'kadesh/core/routes';
import NewAnimalForm from 'kadesh/components/animals/nuevo/NewAnimalForm';
import NewAnimalFormSkeleton from 'kadesh/components/animals/nuevo/NewAnimalFormSkeleton';

function NewAnimalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const requestedStatus = searchParams.get('status');

  // Redirect if not authenticated; keep status so the form opens on the chosen job.
  useEffect(() => {
    if (!userLoading && !user) {
      const next = requestedStatus
        ? `${Routes.animals.new}?status=${encodeURIComponent(requestedStatus)}`
        : Routes.animals.new;
      router.push(
        `${Routes.auth.login}?redirect=${encodeURIComponent(next)}&tab=register`
      );
    }
  }, [user, userLoading, router, requestedStatus]);

  if (userLoading || !user) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <NewAnimalFormSkeleton />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="w-full py-6 bg-gradient-to-br from-kadesh to-kadesh-600 dark:from-kadesh-600 dark:to-kadesh-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Reportar Animal
            </h1>
            <p className="text-lg text-kadesh-50">
              Ayúdanos a encontrarles un hogar
            </p>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center px-2.5 py-1.5 text-sm bg-kadesh-100 text-kadesh-800 font-semibold rounded shadow hover:bg-kadesh-200 transition-colors"
              >
                ← Volver atrás
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <NewAnimalForm initialStatus={requestedStatus} />

      <Footer />
    </main>
  );
}

export default function NewAnimalPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
          <Navigation />
          <NewAnimalFormSkeleton />
          <Footer />
        </main>
      }
    >
      <NewAnimalPageContent />
    </Suspense>
  );
}
