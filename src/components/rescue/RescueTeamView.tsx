"use client";

import { useId, useState, type FormEvent } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Logout01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import {
  DashAvatar,
  DashButton,
  DashErrorState,
  DashLoadingRows,
  DashStatusBadge,
  dashButtonClass,
  dashInputClass,
  dashLabelClass,
  dashSelectClass,
} from "kadesh/components/app-shell";
import { ConfirmModal } from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";
import {
  RESCUE_MEMBER_ROLE,
  RESCUE_MEMBER_ROLE_OPTIONS,
  RESCUE_MEMBER_USER_NOT_FOUND,
  canManageRescueTeam,
  rescueRoleLabel,
  type RescueMemberRole,
} from "./constants";
import {
  ADD_RESCUE_MEMBER_MUTATION,
  REMOVE_RESCUE_MEMBER_MUTATION,
  RESCUE_ORG_DETAIL_QUERY,
  RESCUE_REFETCH,
  SET_RESCUE_MEMBER_ROLE_MUTATION,
  type RescueMemberResult,
  type RescueOrgDetailResponse,
} from "./queries";
import type { RescueMember, RescueOrganization } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Equipo del espacio. Solo un admin agrega (por correo de una cuenta que ya existe), cambia roles o
 * quita gente; cualquiera puede salirse. El backend no deja al espacio sin admin.
 */
export default function RescueTeamView({
  org,
  onChanged,
}: {
  org: RescueOrganization;
  onChanged: () => void;
}) {
  const router = useRouter();
  const client = useApolloClient();
  const formId = useId();
  const { data, loading, error, refetch } = useQuery<RescueOrgDetailResponse>(RESCUE_ORG_DETAIL_QUERY, {
    variables: { id: org.id },
    fetchPolicy: "cache-and-network",
  });
  const [addMember, { loading: adding }] = useMutation<{ addRescueOrganizationMember: RescueMemberResult }>(
    ADD_RESCUE_MEMBER_MUTATION,
  );
  const [setRole] = useMutation<{ setRescueOrganizationMemberRole: RescueMemberResult }>(
    SET_RESCUE_MEMBER_ROLE_MUTATION,
  );
  const [removeMember, { loading: removing }] = useMutation<{ removeRescueOrganizationMember: RescueMemberResult }>(
    REMOVE_RESCUE_MEMBER_MUTATION,
  );

  const [email, setEmail] = useState("");
  const [role, setRoleValue] = useState<RescueMemberRole>(RESCUE_MEMBER_ROLE.VOLUNTEER);
  const [formError, setFormError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<RescueMember | null>(null);

  const members = data?.rescueOrganization?.members ?? [];
  const isAdmin = canManageRescueTeam(data?.rescueOrganization?.viewerRole ?? org.viewerRole);
  const leaving = Boolean(toRemove?.isViewer);

  const refresh = async () => {
    await client.refetchQueries({ include: RESCUE_REFETCH });
    onChanged();
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setFormError("Escribe un correo válido.");
      return;
    }
    setFormError("");
    setNotFound(false);
    try {
      const result = await addMember({ variables: { organizationId: org.id, email: value, role } });
      const payload = result.data?.addRescueOrganizationMember;
      if (!payload?.success) {
        if (payload?.code === RESCUE_MEMBER_USER_NOT_FOUND) setNotFound(true);
        setFormError(payload?.message ?? "No pudimos agregar a esta persona.");
        return;
      }
      sileo.success({ title: payload.message });
      setEmail("");
      await refresh();
    } catch {
      setFormError("No pudimos agregar a esta persona. Intenta de nuevo.");
    }
  };

  const handleRole = async (member: RescueMember, next: string) => {
    if (next === member.role) return;
    setSavingRoleId(member.id);
    try {
      const result = await setRole({ variables: { memberId: member.id, role: next } });
      const payload = result.data?.setRescueOrganizationMemberRole;
      if (!payload?.success) {
        sileo.error({ title: "No se cambió el rol", description: payload?.message });
        return;
      }
      sileo.success({ title: `${member.userName || "La persona"} ahora es ${rescueRoleLabel(next).toLowerCase()}` });
      await refresh();
    } catch {
      sileo.error({ title: "No se cambió el rol", description: "Intenta de nuevo." });
    } finally {
      setSavingRoleId(null);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    try {
      const result = await removeMember({ variables: { memberId: toRemove.id } });
      const payload = result.data?.removeRescueOrganizationMember;
      if (!payload?.success) {
        sileo.error({ title: leaving ? "No pudiste salir" : "No se quitó", description: payload?.message });
        return;
      }
      setToRemove(null);
      sileo.success({ title: payload.message });
      if (leaving) {
        await client.refetchQueries({ include: ["MyRescueOrganizations"] });
        router.replace(Routes.profileRescue());
        return;
      }
      await refresh();
    } catch {
      sileo.error({ title: "Algo falló", description: "Intenta de nuevo." });
    }
  };

  if (loading && members.length === 0) return <DashLoadingRows rows={3} label="Cargando equipo" />;
  if (error && members.length === 0) {
    return (
      <DashErrorState
        message="No pudimos cargar el equipo."
        action={
          <button type="button" onClick={() => refetch()} className={dashButtonClass({ variant: "outline", size: "sm" })}>
            Reintentar
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="divide-y divide-dash-line">
        {members.map((member) => {
          const name = member.userName || "Sin nombre";
          const canEditRow = isAdmin && !member.isViewer;
          return (
            <li key={member.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <DashAvatar name={name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dash-ink">
                  {name}
                  {member.isViewer ? <span className="font-normal text-dash-muted"> (tú)</span> : null}
                </p>
                {member.userEmail ? <p className="truncate text-[13px] text-dash-muted">{member.userEmail}</p> : null}
              </div>
              {canEditRow ? (
                <label className="flex items-center gap-2">
                  <span className="sr-only">Rol de {name}</span>
                  <select
                    value={member.role}
                    onChange={(event) => handleRole(member, event.target.value)}
                    disabled={savingRoleId === member.id}
                    className={dashSelectClass}
                  >
                    {RESCUE_MEMBER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <DashStatusBadge
                  label={rescueRoleLabel(member.role)}
                  tone={member.role === RESCUE_MEMBER_ROLE.ADMIN ? "accent" : "neutral"}
                />
              )}
              {canEditRow || member.isViewer ? (
                <button
                  type="button"
                  onClick={() => setToRemove(member)}
                  className={dashButtonClass({ variant: "ghost", size: "icon-sm" })}
                  aria-label={member.isViewer ? "Salir del espacio" : `Quitar a ${name} del equipo`}
                >
                  <HugeiconsIcon icon={member.isViewer ? Logout01Icon : Cancel01Icon} size={18} strokeWidth={1.6} aria-hidden />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {isAdmin ? (
        <form onSubmit={handleAdd} noValidate className="rounded-2xl bg-dash-surface-2 p-4">
          <p className="mb-3 text-sm font-semibold text-dash-ink">Agregar a alguien</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
            <div>
              <label htmlFor={`${formId}-email`} className={dashLabelClass}>
                Correo de su cuenta KADESH
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                inputMode="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={dashInputClass}
                placeholder="voluntaria@correo.com"
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? `${formId}-error` : `${formId}-role-hint`}
              />
            </div>
            <div>
              <label htmlFor={`${formId}-role`} className={dashLabelClass}>
                Rol
              </label>
              <select
                id={`${formId}-role`}
                value={role}
                onChange={(event) => setRoleValue(event.target.value as RescueMemberRole)}
                className={dashSelectClass}
              >
                {RESCUE_MEMBER_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DashButton type="submit" variant="dark" icon={UserAdd01Icon} disabled={adding}>
              {adding ? "Agregando…" : "Agregar"}
            </DashButton>
          </div>
          <p id={`${formId}-role-hint`} className="mt-2 text-[13px] text-dash-muted">
            {RESCUE_MEMBER_ROLE_OPTIONS.find((option) => option.value === role)?.hint}
          </p>
          {formError ? (
            <p id={`${formId}-error`} role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {formError}
              {notFound ? (
                <>
                  {" "}
                  Puede crearla gratis en <span className="font-semibold">pet.kadesh.com.mx</span>.
                </>
              ) : null}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-dash-muted">Solo un administrador del espacio puede agregar o quitar gente.</p>
      )}

      <ConfirmModal
        isOpen={Boolean(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
        isLoading={removing}
        title={leaving ? `¿Salir de ${org.name}?` : `¿Quitar a ${toRemove?.userName || "esta persona"}?`}
        message={
          leaving
            ? "Dejarás de ver el espacio y ya no podrás actualizar sus animales."
            : "Dejará de ver el espacio y ya no podrá actualizar sus animales. Los animales que publicó se quedan."
        }
        confirmText={leaving ? "Salir" : "Quitar"}
      />
    </div>
  );
}
