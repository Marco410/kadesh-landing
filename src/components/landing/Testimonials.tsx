"use client";

export default function Testimonials() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id='testimonios'>
      <div className="flex flex-col gap-8 items-center">
        <h2 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
          Testimonios
        </h2>
        <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-[600px] text-center mx-2.5">
          Pronto compartiremos historias de rescate y transformación. ¡Tú puedes ser parte de la próxima historia!
        </p>
        <div className="rounded-3xl">
          <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] shadow-md p-8 rounded-3xl max-w-[420px] border-none relative mx-4">
            <div className="absolute -left-6 -top-6 w-12 h-12 bg-[#f7945e] rounded-full opacity-[0.13] z-[1]" />
            <p className="text-[#f7945e] text-lg text-center relative z-[2]">
              "KADESH es un puente de esperanza para quienes no tienen voz."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
