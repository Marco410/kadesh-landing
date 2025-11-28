"use client";

const keyPoints = [
  {
    icon: '🐶',
    title: '¿Perdiste a tu mascota?',
  },
  {
    icon: '🐕‍🦺',
    title: '¿Quieres adoptar o ayudar?',
  },
  {
    icon: '🏥',
    title: '¿Tienes una veterinaria o refugio?',
  },
];

export default function KeyPoints() {
  return (
    <div className="w-full py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 p-8">
          {keyPoints.map((point, idx) => (
            <div
              key={idx}
              className="text-center transition-transform duration-200 bg-white rounded-2xl p-8 shadow-md cursor-default hover:-translate-y-1.5 hover:scale-[1.03]"
            >
              <div className="flex justify-center mb-3">
                <div className="text-5xl bg-orange-50 rounded-full w-18 h-18 flex items-center justify-center mx-auto min-w-[72px] min-h-[72px]">
                  {point.icon}
                </div>
              </div>
              <h3 className="font-bold text-xl text-orange-500 mb-1">
                {point.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
