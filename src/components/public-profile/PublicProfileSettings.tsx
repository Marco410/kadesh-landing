'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { sileo } from 'sileo';
import {
  DashButton,
  DashSectionCard,
  DashSwitch,
  dashButtonClass,
  dashLabelClass,
  dashTextareaClass,
} from 'kadesh/components/app-shell';
import { Routes } from 'kadesh/core/routes';

const BIO_MAX = 280;

const MY_PUBLIC_PROFILE_QUERY = gql`
  query MyPublicProfileSettings($id: ID!) {
    user(where: { id: $id }) {
      id
      username
      bio
      publicProfileEnabled
      showPhoneOnProfile
      showEmailOnProfile
    }
  }
`;

const UPDATE_PUBLIC_PROFILE_MUTATION = gql`
  mutation UpdatePublicProfileSettings($id: ID!, $data: UserUpdateInput!) {
    updateUser(where: { id: $id }, data: $data) {
      id
      bio
      publicProfileEnabled
      showPhoneOnProfile
      showEmailOnProfile
    }
  }
`;

type Settings = {
  id: string;
  username: string;
  bio: string | null;
  publicProfileEnabled: boolean;
  showPhoneOnProfile: boolean;
  showEmailOnProfile: boolean;
};

/**
 * «Perfil público» en Datos del perfil: biografía, si el perfil abre (y sale como autor de sus
 * reportes) y si muestra teléfono o correo (apagados por defecto). Consulta propia para no tocar el
 * formulario de datos; se guarda con el botón y corrige la caché con la respuesta.
 */
export default function PublicProfileSettings({ userId, hasPhone }: { userId: string; hasPhone: boolean }) {
  const ids = { enabled: useId(), phone: useId(), email: useId(), bio: useId(), bioHelp: useId() };
  const { data, loading } = useQuery<{ user: Settings | null }>(MY_PUBLIC_PROFILE_QUERY, {
    variables: { id: userId },
    fetchPolicy: 'cache-and-network',
  });
  const saved = data?.user ?? null;

  const [bio, setBio] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (!saved) return;
    setBio(saved.bio ?? '');
    setEnabled(saved.publicProfileEnabled !== false);
    setShowPhone(Boolean(saved.showPhoneOnProfile));
    setShowEmail(Boolean(saved.showEmailOnProfile));
  }, [saved]);

  const [update, { loading: saving }] = useMutation(UPDATE_PUBLIC_PROFILE_MUTATION);

  const dirty =
    Boolean(saved) &&
    (bio.trim() !== (saved?.bio ?? '').trim() ||
      enabled !== (saved?.publicProfileEnabled !== false) ||
      showPhone !== Boolean(saved?.showPhoneOnProfile) ||
      showEmail !== Boolean(saved?.showEmailOnProfile));

  const save = async () => {
    try {
      await update({
        variables: {
          id: userId,
          data: {
            bio: bio.trim().slice(0, BIO_MAX),
            publicProfileEnabled: enabled,
            showPhoneOnProfile: showPhone,
            showEmailOnProfile: showEmail,
          },
        },
      });
      sileo.success({ title: 'Perfil público guardado' });
    } catch {
      sileo.error({ title: 'No pudimos guardar', description: 'Intenta de nuevo en un momento.' });
    }
  };

  return (
    <div className="min-w-0">
      <DashSectionCard
        index={2}
        title="Perfil público"
        description="Lo que ve cualquiera al tocar tu nombre en un reporte o en el ranking."
        action={
          saved?.username && enabled ? (
            <Link
              href={Routes.publicProfile(saved.username)}
              target="_blank"
              className={dashButtonClass({ variant: 'outline', size: 'sm' })}
            >
              Ver mi perfil
            </Link>
          ) : null
        }
      >
        {loading && !saved ? (
          <div className="space-y-3" aria-busy="true">
            <div className="dash-shimmer h-10 rounded-2xl" />
            <div className="dash-shimmer h-24 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-5">
            <Toggle
              id={ids.enabled}
              title="Mostrar mi perfil público"
              description="Apagado, tu perfil no abre y tus reportes salen sin tu nombre. El ranking se controla aparte, en Huellitas."
              checked={enabled}
              onChange={setEnabled}
            />

            <div>
              <label htmlFor={ids.bio} className={dashLabelClass}>
                Biografía
              </label>
              <textarea
                id={ids.bio}
                value={bio}
                maxLength={BIO_MAX}
                onChange={(event) => setBio(event.target.value)}
                aria-describedby={ids.bioHelp}
                placeholder="Ej.: Rescato perros en Morelia desde 2019. Si ves uno en la calle, avísame."
                className={dashTextareaClass}
                disabled={!enabled}
              />
              <p id={ids.bioHelp} className="mt-1 text-xs text-dash-muted">
                {bio.length}/{BIO_MAX}. No pongas teléfonos ni direcciones aquí: para eso están las opciones de abajo.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl bg-dash-surface-2 p-4">
              <p className="text-[13px] font-semibold text-dash-soft">Contacto en tu perfil (apagado por defecto)</p>
              <Toggle
                id={ids.phone}
                title="Mostrar mi teléfono"
                description={hasPhone ? 'Con botón de WhatsApp y de llamada.' : 'Primero agrega tu teléfono arriba.'}
                checked={showPhone}
                onChange={setShowPhone}
                disabled={!enabled || !hasPhone}
              />
              <Toggle
                id={ids.email}
                title="Mostrar mi correo"
                description="Cualquiera podrá escribirte."
                checked={showEmail}
                onChange={setShowEmail}
                disabled={!enabled}
              />
            </div>

            <div className="flex justify-end">
              <DashButton onClick={() => void save()} disabled={!dirty || saving}>
                {saving ? 'Guardando…' : 'Guardar perfil público'}
              </DashButton>
            </div>
          </div>
        )}
      </DashSectionCard>
    </div>
  );
}

function Toggle({
  id,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-semibold text-dash-ink">
          {title}
        </p>
        <p id={`${id}-desc`} className="mt-0.5 text-[13px] text-dash-muted">
          {description}
        </p>
      </div>
      <DashSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        labelledBy={`${id}-label`}
        describedBy={`${id}-desc`}
        size="sm"
      />
    </div>
  );
}
