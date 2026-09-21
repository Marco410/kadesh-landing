import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { DONATIONS_LEAD, STRIPE_DONATE_URL } from 'kadesh/components/donations/constants';

export default function Donate() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="donar">
      <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] shadow-md rounded-3xl p-10 border-none relative overflow-visible">
        <div className="absolute -right-12 -top-12 w-[120px] h-[120px] bg-kadesh rounded-full opacity-[0.18] z-[1]" />
        <div className="flex flex-col gap-6 items-start relative z-[2]">
          <h2 className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
            ¿A qué se destina tu donación?
          </h2>
          <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-[600px]">
            {DONATIONS_LEAD}
          </p>
          <div className="flex flex-col gap-3 w-full lg:flex-row">
            <Link
              href={STRIPE_DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center px-8 py-3 bg-kadesh text-white font-bold text-lg rounded-xl hover:bg-kadesh-600 transition-colors"
            >
              Apoyar el proyecto
            </Link>
            <Link
              href={Routes.donations}
              className="inline-flex min-h-11 items-center justify-center px-8 py-3 border-2 border-kadesh text-kadesh font-bold text-lg rounded-xl hover:bg-kadesh/5 transition-colors"
            >
              Ver el recuento
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
