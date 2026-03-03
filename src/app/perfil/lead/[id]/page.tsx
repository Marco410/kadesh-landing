"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  TECH_BUSINESS_LEAD_QUERY,
  UPDATE_TECH_BUSINESS_LEAD_MUTATION,
  type TechBusinessLeadResponse,
  type TechBusinessLeadVariables,
  type UpdateTechBusinessLeadVariables,
  type UpdateTechBusinessLeadMutation,
} from "kadesh/components/profile/sales/queries";
import {
  GOOGLE_PLACE_CATEGORIES,
  PIPELINE_STATUS,
  PIPELINE_STATUS_COLORS,
} from "kadesh/components/profile/sales/constants";
import { Routes } from "kadesh/core/routes";
import { Footer, Navigation } from "kadesh/components/layout";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { LeadCrmActions } from "kadesh/components/profile/sales/detail_lead";
import { getCategoryLabel } from "kadesh/components/blog/constants";
import { sileo } from "sileo";
import { useUser } from "kadesh/utils/UserContext";
import RegisterActivityModal from "kadesh/components/profile/sales/RegisterActivityModal";

const PIPELINE_OPTIONS = Object.values(PIPELINE_STATUS);
const DEFAULT_PIPELINE_HEADER =
  "bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
      <dt className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
        {label}
      </dt>
      <dd className="text-[#212121] dark:text-[#ffffff] min-w-0 break-words">
        {children ?? (value != null && value !== "" ? String(value) : "—")}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  headerClassName,
  children,
}: {
  title: string;
  headerClassName?: string;
  children: React.ReactNode;
}) {
  const headerClasses =
    headerClassName ??
    "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]";
  return (
    <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
      <h2 className={`${headerClasses}`}>{title}</h2>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data, loading, error } = useQuery<
    TechBusinessLeadResponse,
    TechBusinessLeadVariables
  >(TECH_BUSINESS_LEAD_QUERY, {
    variables: { where: { id } },
    skip: !id,
  });

  const [updateLead, { loading: saving }] = useMutation<
    UpdateTechBusinessLeadMutation,
    UpdateTechBusinessLeadVariables
  >(UPDATE_TECH_BUSINESS_LEAD_MUTATION, {
    refetchQueries: [
      { query: TECH_BUSINESS_LEAD_QUERY, variables: { where: { id } } },
    ],
  });

  const lead = data?.techBusinessLead ?? null;
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [xTwitter, setXTwitter] = useState("");
  const [productOffered, setProductOffered] = useState("");
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);

  useEffect(() => {
    if (lead) {
      setPipelineStatus(lead.pipelineStatus ?? "");
      setNotes(lead.notes ?? "");
      setFacebook(lead.facebook ?? "");
      setInstagram(lead.instagram ?? "");
      setTiktok(lead.tiktok ?? "");
      setXTwitter(lead.xTwitter ?? "");
      setProductOffered(lead.productOffered ?? "");
      setHasWebsite(lead.hasWebsite ?? null);
    }
  }, [
    lead?.id,
    lead?.pipelineStatus,
    lead?.notes,
    lead?.facebook,
    lead?.instagram,
    lead?.tiktok,
    lead?.xTwitter,
    lead?.productOffered,
    lead?.hasWebsite,
  ]);

  if (!id) {
    router.replace(Routes.profile);
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">
            Cargando lead...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
          <p className="text-red-600 dark:text-red-400">
            No se pudo cargar el lead o no existe.
          </p>
          <Link
            href={`${Routes.profile}?tab=ventas`}
            className="mt-4 inline-block text-orange-500 dark:text-orange-400 hover:underline"
          >
            Volver a Ventas
          </Link>
        </div>
      </div>
    );
  }

  const topReviews = [
    lead.topReview1,
    lead.topReview2,
    lead.topReview3,
    lead.topReview4,
    lead.topReview5,
  ].filter(Boolean) as string[];

  const handleSaveLead = async () => {
    if (!id) return;
    const data: UpdateTechBusinessLeadVariables["data"] = {};
    if (pipelineStatus !== undefined) data.pipelineStatus = pipelineStatus || null;
    if (notes.length > 0) data.notes = notes;
    if (facebook.length > 0) data.facebook = facebook;
    if (instagram.length > 0) data.instagram = instagram;
    if (tiktok.length > 0) data.tiktok = tiktok;
    if (xTwitter.length > 0) data.xTwitter = xTwitter;
    if (productOffered.length > 0) data.productOffered = productOffered;
    if (hasWebsite !== undefined && hasWebsite !== null) data.hasWebsite = hasWebsite;
    try {
      await updateLead({
        variables: {
          where: { id },
          data,
        },
      });
      sileo.success({ title: "Cambios guardados" });
    } catch {
      sileo.error({
        title: "No se pudieron guardar los cambios",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <div className="w-full max-w-[1920px] mx-auto px-15 pt-20 pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            href={`${Routes.profile}?tab=ventas`}
            className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Volver a Ventas
          </Link>
          <h1 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] truncate">
            {lead.businessName || "Lead sin nombre"}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <SectionCard
            title="Información de la empresa"
            headerClassName={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${
              PIPELINE_STATUS_COLORS[pipelineStatus] ?? DEFAULT_PIPELINE_HEADER
            }`}
          >
            <dl className="space-y-0">
              <Field label="Empresa" value={lead.businessName} />
              <Field label="Categoría">
              {getCategoryLabel(lead.category)}
              </Field>
              <Field label="Teléfono">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="text-orange-500 dark:text-orange-400 hover:underline"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Dirección" value={lead.address} />
              <Field label="Ciudad" value={lead.city} />
              <Field label="Estado" value={lead.state} />
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] items-center">
                <label htmlFor="lead-product-offered" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  Producto ofrecido
                </label>
                <input
                  id="lead-product-offered"
                  type="text"
                  value={productOffered}
                  onChange={(e) => setProductOffered(e.target.value)}
                  placeholder="Producto o servicio ofrecido"
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <Field label="Valor estimado" value={formatCurrency(lead.estimatedValue)} />
              <Field label="Oportunidad" value={lead.opportunityLevel} />
              <Field label="Fuente" value={lead.source} />
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] items-center">
                <label htmlFor="lead-has-website" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  Sitio web
                </label>
                <select
                  id="lead-has-website"
                  value={hasWebsite === null ? "" : hasWebsite ? "yes" : "no"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHasWebsite(v === "" ? null : v === "yes");
                  }}
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">—</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Info de Google"   headerClassName={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${
              PIPELINE_STATUS_COLORS[pipelineStatus] ?? DEFAULT_PIPELINE_HEADER
            }`}>
            <dl className="space-y-0">
              {lead.googleMapsUrl && (
                <Field label="Mapa">
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 dark:text-orange-400 hover:underline truncate block"
                  >
                    Ver en mapa
                  </a>
                </Field>
              )}
              <Field label="Rating" value={lead.rating} />
              <Field label="Nº reseñas" value={lead.reviewCount} />
              {topReviews.length > 0 && (
                <div className="pt-1.5 border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
                  <p className="text-[#616161] dark:text-[#b0b0b0] font-medium text-sm mb-1">
                    Reseñas destacadas
                  </p>
                  <ul className="space-y-1 text-[#212121] dark:text-[#ffffff] text-sm">
                    {topReviews.map((r, i) => (
                      <li key={i} className="line-clamp-2">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </dl>
          </SectionCard>

          <SectionCard 
          title="Redes sociales"
            headerClassName={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${
              PIPELINE_STATUS_COLORS[pipelineStatus] ?? DEFAULT_PIPELINE_HEADER
            }`}>
            <div className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
                <label htmlFor="lead-facebook" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  Facebook
                </label>
                <input
                  id="lead-facebook"
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
                <label htmlFor="lead-instagram" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  Instagram
                </label>
                <input
                  id="lead-instagram"
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
                <label htmlFor="lead-tiktok" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  TikTok
                </label>
                <input
                  id="lead-tiktok"
                  type="url"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://tiktok.com/..."
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
                <label htmlFor="lead-xtwitter" className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
                  X / Twitter
                </label>
                <input
                  id="lead-xtwitter"
                  type="url"
                  value={xTwitter}
                  onChange={(e) => setXTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Fechas"
            headerClassName={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${
              PIPELINE_STATUS_COLORS[pipelineStatus] ?? DEFAULT_PIPELINE_HEADER
            }`}>
            <dl className="space-y-0">
              <Field label="Primer contacto" value={formatDate(lead.firstContactDate)} />
              <Field label="Próx. seguimiento" value={formatDate(lead.nextFollowUpDate)} />
              <Field label="Actualizado" value={lead.updatedAt ? formatDate(lead.updatedAt) : "—"} />
            </dl>
          </SectionCard>
        </div>

        <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
          <h2 className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a] ${
              PIPELINE_STATUS_COLORS[pipelineStatus] ?? DEFAULT_PIPELINE_HEADER
            }`}>
            Acciones y edición
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e0e0e0] dark:divide-[#3a3a3a]">
            <div className="p-4 space-y-6">
              <div>
                <label htmlFor="lead-pipeline" className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Estatus
                </label>
                <select
                  id="lead-pipeline"
                  value={pipelineStatus}
                  onChange={(e) => setPipelineStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  aria-label="Estado del pipeline"
                >
                  <option value="">—</option>
                  {PIPELINE_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lead-notes" className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5">
                  Notas
                </label>
                <textarea
                  id="lead-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas del lead..."
                  className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y min-h-[80px]"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveLead}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
            <LeadCrmActions leadId={id} userId={user?.id ?? ""} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
