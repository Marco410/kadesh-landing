"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ConfirmModal from '../shared/ConfirmModal';

const MOCK_VETS = [
  {
    id: 1,
    name: "Veterinaria San Patricio",
    location: "Ciudad de México",
    rating: 4.8,
    specialties: ["Emergencias", "Cirugía"]
  },
  {
    id: 2,
    name: "Clínica Animal Care",
    location: "Guadalajara",
    rating: 4.9,
    specialties: ["Dermatología", "Cardiología"]
  },
  {
    id: 3,
    name: "Vet Express 24/7",
    location: "Monterrey",
    rating: 4.7,
    specialties: ["Urgencias", "Medicina general"]
  },
  {
    id: 4,
    name: "Centro Veterinario Luna",
    location: "Puebla",
    rating: 4.9,
    specialties: ["Oncología", "Neurología"]
  },
];

export default function VeterinariansSection() {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    setShowModal(true);
  };

  return (
    <section id="veterinarias" className="w-full py-20 bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Veterinarias aliadas
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Profesionales comprometidos con el bienestar animal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {MOCK_VETS.map((vet, index) => (
            <motion.button
              key={vet.id}
              onClick={handleCardClick}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-800 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 w-full"
              aria-label={`Ver detalles de ${vet.name}`}
            >
              <div className="mb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {vet.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {vet.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  📍 {vet.location}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {vet.rating}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {vet.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/veterinarias/registro"
              className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Registra tu veterinaria
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/veterinarias"
              className="inline-block px-8 py-4 bg-white dark:bg-[#1e1e1e] border-2 border-orange-500 text-orange-500 dark:text-orange-400 font-bold text-lg rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300"
            >
              Ver directorio completo →
            </Link>
          </motion.div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        title="¡Próximamente! 🐾"
        message="Estamos trabajando muy duro para traerte esta sección muy pronto. Mientras tanto, puedes explorar otras partes de KADESH o contactarnos si necesitas ayuda."
        confirmText="Entendido"
        cancelText=""
        confirmButtonColor="orange"
      />
    </section>
  );
}

