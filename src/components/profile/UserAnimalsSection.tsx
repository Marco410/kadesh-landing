"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { animalDetailHref } from "kadesh/components/animals/animalSlug";
import {
  ANIMAL_TYPE_LABELS,
  getStatusColor,
  getStatusLabel,
} from "kadesh/components/animals/constants";
import { formatDate } from "kadesh/utils/format-date";
import {
  GET_MY_ANIMALS_QUERY,
  type GetMyAnimalsResponse,
  type GetMyAnimalsVariables,
} from "./queries";
import { useProfileMotion } from "./motion";

export default function UserAnimalsSection({ userId }: { userId: string }) {
  const motionPrefs = useProfileMotion();
  const { data, loading } = useQuery<
    GetMyAnimalsResponse,
    GetMyAnimalsVariables
  >(GET_MY_ANIMALS_QUERY, {
    variables: {
      where: { user: { id: { equals: userId } } },
      orderBy: [{ createdAt: "desc" }],
    },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const animals = data?.animals ?? [];

  if (loading && animals.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-2xl bg-[#e6e9ef] dark:bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <motion.div
        variants={motionPrefs.item}
        initial={motionPrefs.reduce ? false : "hidden"}
        animate="show"
        className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised"
      >
        <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
          Aún no has publicado un reporte
        </p>
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Publica un animal perdido, encontrado o en adopción. Quedará en esta lista y en el mapa.
        </p>
        <Link
          href={Routes.animals.new}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />
          Reportar
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <motion.div whileTap={motionPrefs.tap}>
          <Link
            href={Routes.animals.new}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
            Reportar
          </Link>
        </motion.div>
      </div>
      <motion.ul
        className="space-y-2"
        variants={motionPrefs.list}
        initial={motionPrefs.reduce ? false : "hidden"}
        animate="show"
      >
        {animals.map((animal) => {
          const status = animal.logs[0]?.status;
          const typeName = animal.animal_breed?.animal_type?.name || "";
          const cover = animal.multimedia[0]?.image?.url;
          return (
            <motion.li key={animal.id} variants={motionPrefs.item}>
              <motion.div whileTap={motionPrefs.tap}>
              <Link
                href={animalDetailHref(animal)}
                className="flex items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-3 transition-colors hover:border-kadesh-300 dark:border-white/10 dark:bg-night-raised dark:hover:border-kadesh/40"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#e8edf3] dark:bg-[#2a3548]">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[#9aa3b2]">
                      <HugeiconsIcon
                        icon={Image01Icon}
                        size={20}
                        strokeWidth={1.5}
                      />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-[#121212] dark:text-[#eef1f6]">
                      {animal.name || "Sin nombre"}
                    </p>
                    {status ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {getStatusLabel(status)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                    {[
                      ANIMAL_TYPE_LABELS[typeName] || typeName,
                      animal.animal_breed?.breed,
                      formatDate(animal.createdAt),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Link>
              </motion.div>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
