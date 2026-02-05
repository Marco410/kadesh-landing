"use client";

import { useParams, useRouter } from 'next/navigation';
import { Navigation, Footer } from 'kadesh/components/layout';
import {
  useAnimalDetail,
  AnimalImageGrid,
  AnimalInfoSection,
  LogTimeline,
  AnimalCommentsSection,
} from 'kadesh/components/animals/detail';
import { ErrorState } from 'kadesh/components/shared';
import { useUser } from 'kadesh/utils/UserContext';

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const animalId = params?.id as string;

  const { animal, logs, loading, error, refetch } = useAnimalDetail(animalId || '');

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-[600px] bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg" />
            <div className="h-32 bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg" />
            <div className="h-96 bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorState
            title="Error al cargar el animal"
            message={error.message || 'No se pudo cargar la información del animal'}
            onRetry={() => window.location.reload()}
          />
        </div>
        <Footer />
      </main>
    );
  }

  if (!animal) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-4">Animal no encontrado</h1>
            <p className="text-[#616161] dark:text-[#b0b0b0] mb-6">
              El animal que buscas no existe o ha sido eliminado.
            </p>
            <button
              onClick={() => router.push('/animales')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Volver a animales
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Navigation />
      <div className="h-25 bg-gradient-to-b from-orange-500 via-orange-400/70 to-orange-50/30 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
            <AnimalImageGrid images={animal.multimedia} animalName={animal.name} logs={logs} />
          </div>

          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-[#e0e0e0] dark:border-[#3a3a3a] p-6">
            <AnimalInfoSection animal={animal} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-[#e0e0e0] dark:border-[#3a3a3a] p-6">
          <LogTimeline
            logs={logs ?? []}
            animal={animal}
            animalName={animal?.name}
            onLogCreated={async () => { await refetch(); }}
          />
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-[#e0e0e0] dark:border-[#3a3a3a] p-6">
          <AnimalCommentsSection animal={animal} />
        </div>
      </div>
      <Footer />
    </main>
  );
}



