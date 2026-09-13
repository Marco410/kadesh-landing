'use client';

import Link from 'next/link';
import { BlogSection } from '../blog';
import { Routes } from 'kadesh/core/routes';

export default function StoriesSection() {
  return (
    <section id="historias" className="w-full bg-[#f7f8fa] py-24 dark:bg-night-raised">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Historias que inspiran
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            El blog de KADESH publica rescates, adopciones y notas de la comunidad.
            Cada pieza es contenido real del sitio, no testimonios inventados.
          </p>
        </div>

        <div className="mb-10">
          <BlogSection postsPerPage={4} showPagination={false} />
        </div>

        <div className="text-center">
          <Link
            href={Routes.blog.index}
            className="inline-flex rounded-xl bg-kadesh px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-kadesh-600"
          >
            Leer más historias →
          </Link>
        </div>
      </div>
    </section>
  );
}
