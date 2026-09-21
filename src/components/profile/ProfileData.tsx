"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";
import {
  UPDATE_USER_MUTATION,
  USER_QUERY,
  type UpdateUserResponse,
  type UpdateUserVariables,
  type UserQueryResponse,
  type UserQueryVariables,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  fieldErrorFromGraphQL,
  normalizePhone,
  validateProfileFields,
  type ProfileFieldErrors,
  type ProfileFieldKey,
} from "./validateProfile";
import { useProfileMotion } from "./motion";

const INPUT_CLASS =
  "w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2] disabled:cursor-not-allowed disabled:opacity-60";

const INPUT_ERROR_CLASS =
  "border-red-400 focus:ring-red-400 dark:border-red-500/70";

function fieldClass(hasError: boolean) {
  return hasError ? `${INPUT_CLASS} ${INPUT_ERROR_CLASS}` : INPUT_CLASS;
}

const DISABLED_FIELD_CLASS =
  "w-full rounded-xl border border-[#ececec] bg-[#f3f5f8] px-4 py-3 text-sm text-[#5a5a5a] dark:border-white/10 dark:bg-night dark:text-[#9aa3b2]";

function toDateInputValue(isoOrNull: string | null | undefined): string {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface SaveChangesButtonProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  className?: string;
}

function SaveChangesButton({
  isDirty,
  saving,
  onSave,
  className = "hidden sm:inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto lg:min-h-9",
}: SaveChangesButtonProps) {
  const motionPrefs = useProfileMotion();
  return (
    <AnimatePresence>
      {isDirty ? (
        <motion.button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={className}
          initial={motionPrefs.reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={motionPrefs.transition}
          whileTap={motionPrefs.tap}
        >
          {saving ? (
            <>
              <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

interface ProfileDataProps {
  user: AuthenticatedItem;
}

export default function ProfileData({ user: userProp }: ProfileDataProps) {
  const { refreshUser } = useUser();
  const motionPrefs = useProfileMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data,
    loading: userLoading,
    refetch: refetchUser,
  } = useQuery<UserQueryResponse, UserQueryVariables>(USER_QUERY, {
    variables: { where: { id: userProp.id } },
    skip: !userProp?.id,
  });

  const user = data?.user ?? userProp;

  const [name, setName] = useState(user.name ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [secondLastName, setSecondLastName] = useState(
    user.secondLastName ?? "",
  );
  const [phone, setPhone] = useState(user.phone ?? "");
  const [birthday, setBirthday] = useState(toDateInputValue(user.birthday));
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  useEffect(() => {
    setName(user.name ?? "");
    setLastName(user.lastName ?? "");
    setSecondLastName(user.secondLastName ?? "");
    setPhone(user.phone ?? "");
    setBirthday(toDateInputValue(user.birthday));
  }, [user]);

  const currentBirthdayIso = user.birthday
    ? toDateInputValue(user.birthday)
    : "";
  const isDirty =
    name !== (user.name ?? "") ||
    lastName !== (user.lastName ?? "") ||
    (secondLastName || "") !== (user.secondLastName ?? "") ||
    (phone || "") !== (user.phone ?? "") ||
    (birthday || "") !== currentBirthdayIso;

  const [saveError, setSaveError] = useState("");

  const [updateUser, { loading: saving }] = useMutation<
    UpdateUserResponse,
    UpdateUserVariables
  >(UPDATE_USER_MUTATION, {
    onCompleted: async () => {
      setSaveError("");
      setFieldErrors({});
      await Promise.all([refetchUser(), refreshUser()]);
    },
    onError: (error) => {
      const fromGraphQL = fieldErrorFromGraphQL(error.message);
      if (Object.keys(fromGraphQL).length > 0) {
        setFieldErrors(fromGraphQL);
        setSaveError("");
        return;
      }
      setSaveError("No se pudo guardar. Intenta de nuevo.");
    },
  });

  const clearFieldError = (key: ProfileFieldKey) => {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    if (!isDirty || !user.id) return;
    const nextErrors = validateProfileFields({
      name,
      lastName,
      phone,
      birthday,
    });
    setFieldErrors(nextErrors);
    setSaveError("");
    if (Object.keys(nextErrors).length > 0) {
      const first = (Object.keys(nextErrors) as ProfileFieldKey[])[0];
      document.getElementById(`profile-${first}`)?.focus();
      return;
    }

    await updateUser({
      variables: {
        where: { id: user.id },
        data: {
          name: name.trim(),
          lastName: lastName.trim(),
          secondLastName: secondLastName.trim() || null,
          phone: normalizePhone(phone),
          birthday: birthday || null,
        },
      },
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !user.id) {
      if (file && !file.type.startsWith("image/")) {
        setImageError("Selecciona un archivo de imagen (JPG, PNG, etc.).");
      }
      e.target.value = "";
      return;
    }
    setImageError("");
    setImageUploading(true);
    try {
      await updateUser({
        variables: {
          where: { id: user.id },
          data: { profileImage: { upload: file } },
        },
      });
      await refreshUser();
    } catch {
      setImageError("No se pudo actualizar la imagen. Intenta de nuevo.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (userLoading && !data?.user) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised sm:p-6">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-[#e6e9ef] dark:bg-white/10" />
        <div className="mt-5 flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-[#e6e9ef] dark:bg-white/10" />
          <div className="h-5 w-48 animate-pulse rounded-lg bg-[#e6e9ef] dark:bg-white/10" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised sm:p-6"
      variants={motionPrefs.item}
      initial={motionPrefs.reduce ? false : "hidden"}
      animate="show"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Subir nueva foto de perfil"
              onChange={handleImageChange}
            />
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              whileTap={motionPrefs.tap}
              className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-kadesh text-2xl font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-night-raised"
            >
              {user.profileImage?.url ? (
                <Image
                  src={user.profileImage.url}
                  alt={user.name || "Usuario"}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span>{user.name?.charAt(0) || "U"}</span>
              )}
              {/* Gradient + lápiz siempre visible */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity">
                <span className="rounded-full bg-white/90 dark:bg-black/50 p-1.5">
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    className="size-5 text-[#212121] dark:text-white"
                  />
                </span>
              </span>
              {imageUploading && (
                <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <span className="animate-spin size-6 border-2 border-white border-t-transparent rounded-full" />
                </span>
              )}
            </motion.button>
            {imageError && (
              <p className="text-sm text-red-600 dark:text-red-400 max-w-[24rem]">
                {imageError}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
              {user.name} {user.lastName} {user.secondLastName || ""}
            </h3>
            {user.verified && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-kadesh">
                <Image
                  src="/icons/firmar.png"
                  alt=""
                  width={14}
                  height={14}
                  className="object-contain"
                />
                Verificado
              </span>
            )}
          </div>
        </div>
        <SaveChangesButton
          isDirty={isDirty}
          saving={saving}
          onSave={handleSave}
        />
      </div>

      {saveError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
          >
            Nombre
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            placeholder="Tu nombre"
            autoComplete="given-name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? "profile-name-error" : undefined
            }
            className={fieldClass(Boolean(fieldErrors.name))}
          />
          {fieldErrors.name ? (
            <p
              id="profile-name-error"
              className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="profile-lastName"
            className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
          >
            Apellido paterno
          </label>
          <input
            id="profile-lastName"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearFieldError("lastName");
            }}
            placeholder="Apellido paterno"
            autoComplete="family-name"
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={
              fieldErrors.lastName ? "profile-lastName-error" : undefined
            }
            className={fieldClass(Boolean(fieldErrors.lastName))}
          />
          {fieldErrors.lastName ? (
            <p
              id="profile-lastName-error"
              className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>

        {/* Apellido Materno - editable */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Apellido materno
          </label>
          <input
            type="text"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            placeholder="Apellido materno (opcional)"
            className={INPUT_CLASS}
          />
        </div>

        {/* Username - no editable */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Usuario
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={user.username ? `@${user.username}` : ""}
              readOnly
              disabled
              className={DISABLED_FIELD_CLASS}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Si necesitas actualizar este campo, envía un mensaje en{" "}
            <Link
              href={Routes.contact}
              className="font-medium text-kadesh hover:underline"
            >
              contacto
            </Link>
            .
          </p>
        </div>

        {/* Email - no editable */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
            Correo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={user.email ?? ""}
              readOnly
              disabled
              className={DISABLED_FIELD_CLASS}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Si necesitas actualizar este campo, envía un mensaje en{" "}
            <Link
              href={Routes.contact}
              className="font-medium text-kadesh hover:underline"
            >
              contacto
            </Link>
            .
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-phone"
            className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
          >
            Teléfono
          </label>
          <input
            id="profile-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearFieldError("phone");
            }}
            placeholder="55 1234 5678"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={
              fieldErrors.phone ? "profile-phone-error" : undefined
            }
            className={fieldClass(Boolean(fieldErrors.phone))}
          />
          {fieldErrors.phone ? (
            <p
              id="profile-phone-error"
              className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="profile-birthday"
            className="mb-1.5 block text-sm font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]"
          >
            Fecha de nacimiento
          </label>
          <input
            id="profile-birthday"
            type="date"
            value={birthday}
            onChange={(e) => {
              setBirthday(e.target.value);
              clearFieldError("birthday");
            }}
            aria-invalid={Boolean(fieldErrors.birthday)}
            aria-describedby={
              fieldErrors.birthday ? "profile-birthday-error" : undefined
            }
            className={fieldClass(Boolean(fieldErrors.birthday))}
          />
          {fieldErrors.birthday ? (
            <p
              id="profile-birthday-error"
              className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {fieldErrors.birthday}
            </p>
          ) : null}
        </div>

        {/* Miembro desde */}
        <div className="md:col-span-2">
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Miembro desde {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="sticky bottom-4 mt-4 sm:hidden">
        <SaveChangesButton
          isDirty={isDirty}
          saving={saving}
          onSave={handleSave}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </motion.div>
  );
}
