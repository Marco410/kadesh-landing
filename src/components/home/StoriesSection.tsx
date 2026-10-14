'use client';

import Link from 'next/link';
import { BlogSection } from '../blog';
import { Routes } from 'kadesh/core/routes';

export default function StoriesSection() {
  return (
    <section id="historias" className="w-full scroll-mt-20 bg-white py-24 dark:bg-night">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Cada reporte es una historia que puede terminar bien
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            Rescates, adopciones y reencuentros reales de la comunidad. Sin
            testimonios inventados.
          </p>
        </div>

        <div className="mb-10">
          <BlogSection
            postsPerPage={3}
            showPagination={false}
            gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        </div>

        <div className="text-center">
          <Link
            href={Routes.blog.index}
            className="inline-flex min-h-11 items-center font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
          >
            Ver todas las historias →
          </Link>
        </div>
      </div>
    </section>
  );
}
