/**
 * Resumen visible de una ficha que se pinta en el navegador (animales, veterinarias). Lo pinta el
 * servidor, así llega en el HTML: los buscadores y las IA que no ejecutan JavaScript leen al menos
 * esto. Es contenido real que también ve la persona (no se oculta).
 */
export default function PageSummary({ id, title, text }: { id: string; title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="bg-[#f7f8fa] dark:bg-night">
      <section aria-labelledby={id} className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-6">
          <h2 id={id} className="text-base font-bold text-[#121212] dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{text}</p>
        </div>
      </section>
    </div>
  );
}
