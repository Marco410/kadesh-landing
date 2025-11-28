"use client";

import { motion } from 'framer-motion';

export default function Donate() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="donar">
      <div className="bg-orange-50 shadow-md rounded-3xl p-10 border-none relative overflow-visible">
        {/* Círculo de acento */}
        <div className="absolute -right-12 -top-12 w-[120px] h-[120px] bg-orange-500 rounded-full opacity-[0.18] z-[1]" />
        <div className="flex flex-col gap-6 items-start relative z-[2]">
          <h2 className="text-3xl font-bold text-gray-900">
            Donaciones
          </h2>
          <p className="text-lg text-brown-700 max-w-[600px]">
            Tu aporte ayuda a rescatar, alimentar y dar hogar a más animales. ¡Gracias por ser parte de KADESH!
          </p>
          <a
            href="https://donate.stripe.com/6oU7sL6467dtdrY9FZgUM00"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-orange-500 text-white font-bold text-lg rounded-3xl hover:bg-orange-600 transition-colors mb-2"
          >
            Donar
          </a>
        </div>
      </div>
    </div>
  );
}
