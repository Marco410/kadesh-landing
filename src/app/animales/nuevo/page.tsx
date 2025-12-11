"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, Footer } from 'kadesh/components/layout';
import { useUser } from 'kadesh/utils/UserContext';
import { motion } from 'framer-motion';
import { Routes } from 'kadesh/core/routes';
import NewAnimalForm from 'kadesh/components/animals/nuevo/NewAnimalForm';
import NewAnimalFormSkeleton from 'kadesh/components/animals/nuevo/NewAnimalFormSkeleton';

export default function NewAnimalPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push(Routes.auth.login);
    }
  }, [user, userLoading, router]);

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
      <section className="w-full py-6 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
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
            <p className="text-lg text-orange-50">
              Ayúdanos a encontrarles un hogar
            </p>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center px-2.5 py-1.5 text-sm bg-orange-100 text-orange-800 font-semibold rounded shadow hover:bg-orange-200 transition-colors"
              >
                ← Volver atrás
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <NewAnimalForm />

      <Footer />
    </main>
  );
}
