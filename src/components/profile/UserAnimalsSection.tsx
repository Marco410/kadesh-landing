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
import { animalDisplayName, animalNameSource } from "kadesh/components/animals/animalName";

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
            className="h-20 dash-shimmer rounded-3xl"
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
        className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash"
      >
        <p className="font-semibold text-dash-ink">
          Aún no has publicado un reporte
        </p>
        <p className="text-sm text-dash-muted">
          Publica un animal perdido, encontrado o en adopción. Quedará en esta lista y en el mapa.
        </p>
        <Link
          href={Routes.animals.new}
          className="inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
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
            className="inline-flex min-h-11 items-center gap-1.5 px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
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
                className="flex items-center gap-3 rounded-[20px] border border-dash-line bg-dash-surface p-3 shadow-dash transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash-lift"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-dash-faint">
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
                    <p className="truncate font-semibold text-dash-ink">
                      {animalDisplayName(animalNameSource(animal))}
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
                  <p className="mt-0.5 truncate text-xs text-dash-muted">
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
