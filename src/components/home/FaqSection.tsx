import { HOME_FAQS } from 'kadesh/components/home/constants';

export default function FaqSection() {
  return (
    <section
      id="preguntas-frecuentes"
      className="w-full bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
          Preguntas frecuentes
        </h2>

        <div className="space-y-12">
          {HOME_FAQS.map((item) => (
            <article key={item.question}>
              <h3 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white">
                {item.question}
              </h3>
              <p className="text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-lg">
                {item.answer}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-12 text-sm text-[#6a6a6a] dark:text-[#9a9a9a]">
          Actualizado en septiembre de 2026. KADESH, México.
        </p>
      </div>
    </section>
  );
}
