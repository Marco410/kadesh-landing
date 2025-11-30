"use client";

import { motion } from 'framer-motion';

export default function Donate() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="donar">
      <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] shadow-md rounded-3xl p-10 border-none relative overflow-visible">
        {/* Círculo de acento */}
        <div className="absolute -right-12 -top-12 w-[120px] h-[120px] bg-[#f7945e] rounded-full opacity-[0.18] z-[1]" />
        <div className="flex flex-col gap-6 items-start relative z-[2]">
          <h2 className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
            Donaciones
          </h2>
          <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-[600px]">
            Tu aporte ayuda a rescatar, alimentar y dar hogar a más animales. ¡Gracias por ser parte de KADESH!
          </p>
          <a
            href="https://donate.stripe.com/6oU7sL6467dtdrY9FZgUM00"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[#f7945e] text-white font-bold text-lg rounded-3xl hover:bg-[#e3824f] transition-colors mb-2"
          >
            Donar
          </a>
        </div>
      </div>
    </div>
  );
}
