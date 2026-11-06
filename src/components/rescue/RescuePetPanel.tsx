"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, Megaphone01Icon } from "@hugeicons/core-free-icons";
import { dashButtonClass, dashInputClass, dashLabelClass, dashSelectClass } from "kadesh/components/app-shell";
import { getStatusColor, getStatusLabel } from "kadesh/components/animals/constants";
import {
  PET_REFETCH,
  TransferPetModal,
  UPDATE_PET_MUTATION,
  formatDay,
  petErrorMessage,
  todayYmd,
  type PetDetail,
} from "kadesh/components/pets";
import { Routes } from "kadesh/core/routes";
import CompleteAdoptionModal from "./CompleteAdoptionModal";
import {
  PET_RESCUE_STAGE_OPTIONS,
  RESCUE_ORG_STATUS,
  canManageRescueAnimals,
  canPublishForRescue,
  rescueRoleLabel,
  rescueStage,
  type RescuePublishStatus,
} from "./constants";
import PublishRescuePetModal from "./PublishRescuePetModal";
import { RESCUE_ORG_DETAIL_QUERY, type RescueOrgDetailResponse } from "./queries";
import type { RescueOrganization } from "./types";

/** Ya no busca hogar: no se ofrece publicarlo otra vez. */
const HOME_STATUSES = ["adopted", "in_family"];

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-dash-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-dash-ink">{children}</dd>
    </div>
  );
}

/**
 * Lo del espacio en la ficha de un animal (va dentro de la cartilla, `PetDetail`):
 * - Etapa y fecha de llegada: las cambia admin, coordinación y voluntariado.
 * - Hogar temporal: lo asignan admin y coordinación (alguien del equipo).
 * - Publicación: «Publicar en adopción / como rescatado» (`publishRescuePet`) y enlace al reporte.
 * - «Completar adopción»: admin y coordinación; la cartilla pasa al adoptante y sale del espacio.
 * Cada cambio se guarda al momento; los permisos los vuelve a revisar el backend.
 */
export default function RescuePetPanel({
  org,
  pet,
  onLeft,
}: {
  org: RescueOrganization;
  pet: PetDetail;
  /** La ficha ya no es del espacio (se completó la adopción): volver a la lista. */
  onLeft: () => void;
}) {
  const client = useApolloClient();
  const role = pet.viewerRole ?? org.viewerRole;
  const closed = org.status === RESCUE_ORG_STATUS.REJECTED || org.status === RESCUE_ORG_STATUS.SUSPENDED;
  const canEdit = canPublishForRescue(role);
  const canManage = canManageRescueAnimals(role);
  const active = pet.status === "active";
  const [publishing, setPublishing] = useState<RescuePublishStatus | null>(null);
  const [adopting, setAdopting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [updatePet] = useMutation(UPDATE_PET_MUTATION);
  const { data: detail } = useQuery<RescueOrgDetailResponse>(RESCUE_ORG_DETAIL_QUERY, {
    variables: { id: org.id },
    skip: !canManage,
    fetchPolicy: "cache-first",
  });
  const members = detail?.rescueOrganization?.members ?? [];

  const stage = rescueStage(pet.stage);
  const report = pet.publicReport;
  const reportStatus = report?.logs[0]?.status ?? null;
  const reportHref = report ? Routes.animals.detail(report.slug || report.id) : null;
  const canPublish = canEdit && !closed && active && !HOME_STATUSES.includes(reportStatus ?? "");

  const save = async (field: string, data: Record<string, unknown>, success: string) => {
    setSaving(field);
    try {
      await updatePet({ variables: { id: pet.id, data } });
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({ title: success });
    } catch (error) {
      sileo.error({ title: "No se pudo guardar", description: petErrorMessage(error) });
    } finally {
      setSaving(null);
    }
  };

  return (
    <section
      aria-labelledby={`rescue-pet-${pet.id}`}
      className="rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash"
    >
      <h3 id={`rescue-pet-${pet.id}`} className="font-semibold text-dash-ink">
        En {org.name}
      </h3>
      <p className="mt-0.5 text-sm text-dash-muted">Solo tu equipo ve esta ficha.</p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        {canEdit ? (
          <div>
            <label htmlFor={`stage-${pet.id}`} className={dashLabelClass}>
              Etapa
            </label>
            <select
              id={`stage-${pet.id}`}
              value={pet.stage ?? ""}
              disabled={saving === "stage"}
              onChange={(event) =>
                save("stage", { stage: event.target.value || null }, `Etapa: ${rescueStage(event.target.value)?.label ?? "sin etapa"}`)
              }
              className={dashSelectClass}
            >
              {PET_RESCUE_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Fact label="Etapa">{stage?.label ?? "Sin etapa"}</Fact>
        )}

        {canEdit ? (
          <div>
            <label htmlFor={`intake-${pet.id}`} className={dashLabelClass}>
              Llegó al espacio
            </label>
            <input
              id={`intake-${pet.id}`}
              type="date"
              max={todayYmd()}
              defaultValue={pet.intakeDate ?? ""}
              disabled={saving === "intakeDate"}
              onBlur={(event) => {
                const value = event.target.value || null;
                if (value === (pet.intakeDate ?? null)) return;
                if (value && value > todayYmd()) {
                  sileo.error({ title: "La fecha no puede ser posterior a hoy" });
                  return;
                }
                void save("intakeDate", { intakeDate: value }, "Fecha de llegada guardada");
              }}
              className={dashInputClass}
            />
          </div>
        ) : (
          <Fact label="Llegó al espacio">{pet.intakeDate ? formatDay(pet.intakeDate) : "Sin fecha"}</Fact>
        )}

        {canManage ? (
          <div>
            <label htmlFor={`foster-${pet.id}`} className={dashLabelClass}>
              Hogar temporal
            </label>
            <select
              id={`foster-${pet.id}`}
              value={pet.fosterMember?.id ?? ""}
              disabled={saving === "fosterMember" || members.length === 0}
              onChange={(event) => {
                const memberId = event.target.value;
                const member = members.find((item) => item.id === memberId);
                void save(
                  "fosterMember",
                  { fosterMember: memberId ? { connect: { id: memberId } } : { disconnect: true } },
                  memberId ? `${member?.userName || "La persona"} lo tiene en su hogar temporal` : "Sin hogar temporal",
                );
              }}
              className={dashSelectClass}
            >
              <option value="">Sin asignar</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.userName || "Sin nombre"} · {rescueRoleLabel(member.role)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-dash-muted">Ve y actualiza esta ficha aunque su rol sea «Hogar temporal».</p>
          </div>
        ) : (
          <Fact label="Hogar temporal">{pet.fosterMember?.userName || "Sin asignar"}</Fact>
        )}
      </dl>

      <div className="mt-4 flex flex-col gap-3 border-t border-dash-line pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <HugeiconsIcon icon={Megaphone01Icon} size={18} strokeWidth={1.6} className="text-dash-muted" aria-hidden />
          {reportStatus ? (
            <>
              <span className="text-sm text-dash-ink">Publicado como</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 text-white"
                style={{ backgroundColor: getStatusColor(reportStatus) }}
              >
                {getStatusLabel(reportStatus)}
              </span>
              {reportHref ? (
                <Link href={reportHref} className="text-sm font-semibold text-kadesh hover:underline">
                  Ver publicación
                </Link>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-dash-muted">Aún no está publicado. Solo tu equipo lo ve.</span>
          )}
        </div>

        {canPublish ? (
          <div className="flex flex-wrap gap-2">
            {reportStatus !== "in_adoption" ? (
              <button
                type="button"
                onClick={() => setPublishing("in_adoption")}
                className={dashButtonClass({ variant: "primary", size: "sm" })}
              >
                Publicar en adopción
              </button>
            ) : null}
            {!report ? (
              <button
                type="button"
                onClick={() => setPublishing("rescued")}
                className={dashButtonClass({ variant: "outline", size: "sm" })}
              >
                Publicar como rescatado
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {canManage && active && !closed ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-dash-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-dash-ink">¿Ya tiene familia?</p>
            <p className="mt-0.5 text-sm text-dash-muted">
              Su cartilla, con vacunas y recordatorios, pasa a la cuenta de quien lo adopta: con un código que
              escribe en su cuenta, o con su correo. Si llegó por una solicitud, complétala en «Solicitudes».
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTransferring(true)}
              className={dashButtonClass({ variant: "primary", size: "sm" })}
            >
              <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.8} aria-hidden />
              Entregar con código
            </button>
            <button
              type="button"
              onClick={() => setAdopting(true)}
              className={dashButtonClass({ variant: "outline", size: "sm" })}
            >
              Por correo
            </button>
          </div>
        </div>
      ) : null}

      <PublishRescuePetModal
        isOpen={publishing !== null}
        onClose={() => setPublishing(null)}
        pet={pet}
        initialStatus={publishing ?? "in_adoption"}
        hasReport={Boolean(report)}
      />
      <TransferPetModal
        isOpen={transferring}
        onClose={() => setTransferring(false)}
        pet={{ id: pet.id, name: pet.name }}
        organizationName={org.name}
      />
      <CompleteAdoptionModal
        isOpen={adopting}
        onClose={() => setAdopting(false)}
        pet={pet}
        orgName={org.name}
        onAdopted={onLeft}
      />
    </section>
  );
}
