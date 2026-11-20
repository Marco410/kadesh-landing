'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Copy01Icon, LinkSquare02Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import StripePayStep from '../checkout/StripePayStep';
import { STORE_PROOF_MAX_BYTES, STORE_PROOF_TYPES, orderStatusText } from '../constants';
import { formatPrice, formatStoreDate } from '../format';
import {
  CANCEL_MY_STORE_ORDER_MUTATION,
  RESUME_STORE_ORDER_PAYMENT_MUTATION,
  UPLOAD_STORE_TRANSFER_PROOF_MUTATION,
  type ResumeStoreOrderPaymentResponse,
  type StoreOrderActionResult,
} from '../queries';
import type { StoreOrderDetail, StoreTransferInstructions } from '../types';

const cardClass = 'rounded-3xl border border-dash-line bg-dash-surface p-5 sm:p-6';
const titleClass = 'mb-3 text-[15px] font-semibold text-dash-ink';
const primaryButton =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';
const quietButton =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-dash-line-strong px-5 text-sm font-semibold text-dash-ink hover:border-kadesh disabled:opacity-60';

const TONE_CLASS: Record<string, string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  bad: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  neutral: 'bg-dash-surface-2 text-dash-soft',
};

export function OrderStatusPill({ order }: { order: Parameters<typeof orderStatusText>[0] }) {
  const status = orderStatusText(order);
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', TONE_CLASS[status.tone])}>
      {status.label}
    </span>
  );
}

function deadline(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  // "5:23 p.m." already ends in a period: drop it, the sentence adds its own.
  return date
    .toLocaleString('es-MX', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' })
    .replace(/\.$/, '');
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-dash-muted">{label}</p>
        <p className="font-semibold tabular-nums text-dash-ink [overflow-wrap:anywhere]">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void navigator.clipboard.writeText(value).then(() => sileo.success({ title: `${label} copiado` }))}
        aria-label={`Copiar ${label.toLowerCase()}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-dash-muted hover:bg-dash-surface-2 hover:text-dash-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh"
      >
        <HugeiconsIcon icon={Copy01Icon} size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * WhatsApp chat with Kadesh, already written: the order, who receives it, what it carries and the
 * total. The person only attaches the photo of the proof; an admin checks it and confirms the
 * payment in Operaciones.
 */
export function proofWhatsappHref(phone: string, order: StoreOrderDetail): string {
  const lines = order.items.map((item) => `• ${item.quantity} × ${item.name}${item.variantTitle ? ` (${item.variantTitle})` : ''}`);
  const text = [
    `Hola, te mando el comprobante de mi transferencia del pedido ${order.summary.number}.`,
    '',
    `Total: ${formatPrice(order.summary.totalCents)}`,
    `Concepto: ${order.transfer?.reference ?? order.summary.number}`,
    `A nombre de: ${order.address.recipientName}`,
    '',
    'Productos:',
    ...lines,
    '',
    'Adjunto la foto del comprobante.',
  ].join('\n');
  return `https://wa.me/52${phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`;
}

/**
 * Bank data of a transfer and how to send the proof: by WhatsApp when the store has a number
 * (an admin confirms the payment from there), or uploaded here.
 */
function TransferBox({
  order,
  transfer,
  proofUploaded,
  rejectedReason,
  whatsapp,
  onDone,
}: {
  order: StoreOrderDetail;
  transfer: StoreTransferInstructions;
  proofUploaded: boolean;
  rejectedReason: string | null;
  whatsapp: string | null;
  onDone: () => void;
}) {
  const orderNumber = order.summary.number;
  // With WhatsApp, uploading here is the second way: shown only when asked for.
  const [showUpload, setShowUpload] = useState(!whatsapp);
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProof] = useMutation<{ uploadStoreTransferProof: StoreOrderActionResult }>(UPLOAD_STORE_TRANSFER_PROOF_MUTATION);

  const pick = (picked: File | undefined) => {
    if (!picked) return;
    if (!STORE_PROOF_TYPES.includes(picked.type)) {
      sileo.warning({ title: 'Sube una foto o captura (JPG, PNG o WEBP).' });
      return;
    }
    if (picked.size > STORE_PROOF_MAX_BYTES) {
      sileo.warning({ title: 'El comprobante debe pesar menos de 8 MB.' });
      return;
    }
    setFile(picked);
  };

  const upload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const { data } = await uploadProof({ variables: { orderNumber, file, reference: reference.trim() || null } });
      const result = data?.uploadStoreTransferProof;
      if (result?.success) {
        sileo.success({ title: result.message });
        setFile(null);
        onDone();
      } else {
        sileo.error({ title: result?.message ?? 'No pudimos subir tu comprobante.' });
      }
    } catch {
      sileo.error({ title: 'No pudimos subir tu comprobante. Intenta de nuevo.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="transferencia-titulo">
      <h2 id="transferencia-titulo" className={titleClass}>
        {proofUploaded ? 'Estamos revisando tu comprobante' : 'Paga con una transferencia'}
      </h2>
      {proofUploaded ? (
        <p className="mb-3 text-sm text-dash-soft">
          Lo confirmamos en horario laboral y te avisamos por correo. Si te equivocaste de archivo, puedes subir otro.
        </p>
      ) : (
        <p className="mb-3 text-sm text-dash-soft">
          Transfiere el monto exacto y {whatsapp ? 'mándanos tu comprobante por WhatsApp' : 'sube tu comprobante'}. Tu pedido queda apartado
          {transfer.expiresAt ? ` hasta el ${deadline(transfer.expiresAt)}` : ''}.
        </p>
      )}
      {rejectedReason ? (
        <p role="alert" className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
          No pudimos confirmar tu comprobante anterior: {rejectedReason}
        </p>
      ) : null}
      <div className="divide-y divide-dash-line rounded-2xl bg-dash-surface-2 px-4">
        <CopyRow label="Monto" value={formatPrice(transfer.amountCents)} />
        {transfer.bankName ? <CopyRow label="Banco" value={transfer.bankName} /> : null}
        <CopyRow label="Beneficiario" value={transfer.beneficiary} />
        <CopyRow label="CLABE" value={transfer.clabe} />
        <CopyRow label="Concepto" value={transfer.reference} />
      </div>
      {transfer.note ? <p className="mt-3 whitespace-pre-line text-sm text-dash-soft">{transfer.note}</p> : null}

      {whatsapp ? (
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={proofWhatsappHref(whatsapp, order)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(primaryButton, 'gap-2 self-start bg-[#1fa855] hover:bg-[#178a45]')}
          >
            <HugeiconsIcon icon={WhatsappIcon} size={20} aria-hidden="true" />
            Mandar comprobante
            <span className="sr-only">por WhatsApp (se abre en otra pestaña)</span>
          </a>
          <p className="text-sm text-dash-muted">
            Se abre WhatsApp con los datos de tu pedido. Adjunta la foto o captura de tu comprobante y envíalo. Te avisamos por correo
            en cuanto confirmemos tu pago.
          </p>
          {!showUpload ? (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
            >
              Prefiero subirlo aquí
            </button>
          ) : null}
        </div>
      ) : null}

      {showUpload ? (
        <div className="mt-5 flex flex-col gap-3">
        <label className={cn(quietButton, 'cursor-pointer self-start')}>
          {file ? file.name : proofUploaded ? 'Elegir otro comprobante' : 'Elegir comprobante'}
          <input
            type="file"
            accept={STORE_PROOF_TYPES.join(',')}
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
        {file ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-dash-muted">
              Clave de rastreo o referencia (opcional)
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                maxLength={80}
                className="min-h-11 rounded-2xl border border-dash-line bg-dash-surface px-3.5 text-[15px] text-dash-ink focus:outline-none focus:ring-2 focus:ring-kadesh"
              />
            </label>
            <button type="button" onClick={() => void upload()} disabled={uploading} className={cn(primaryButton, 'self-start')}>
              {uploading ? 'Subiendo…' : 'Enviar comprobante'}
            </button>
          </>
        ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cardClass}>
      <h2 className={titleClass}>{title}</h2>
      {children}
    </section>
  );
}

/**
 * One order of the buyer: what is missing (pay, upload the proof), where each package is, what it
 * carries and what has happened. `justPaid` = arriving from the card form, where the payment may
 * take a few seconds to be confirmed.
 */
export default function OrderDetail({
  order,
  justPaid,
  justPlaced,
  onChanged,
}: {
  order: StoreOrderDetail;
  justPaid: boolean;
  justPlaced: boolean;
  onChanged: () => void;
}) {
  const { summary } = order;
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<{ clientSecret: string; totalCents: number } | null>(null);
  const [resumePayment] = useMutation<ResumeStoreOrderPaymentResponse>(RESUME_STORE_ORDER_PAYMENT_MUTATION);
  const [cancelOrder] = useMutation<{ cancelMyStoreOrder: StoreOrderActionResult }>(CANCEL_MY_STORE_ORDER_MUTATION);

  const unpaid = summary.paymentStatus !== 'paid' && summary.paymentStatus !== 'refunded' && summary.status === 'open';
  const confirming = justPaid && unpaid && summary.paymentMethod === 'stripe_card';

  const payNow = async () => {
    setBusy(true);
    try {
      const { data } = await resumePayment({ variables: { orderNumber: summary.number } });
      const result = data?.resumeStoreOrderPayment;
      if (result?.success && result.stripeClientSecret) {
        setPayment({ clientSecret: result.stripeClientSecret, totalCents: result.totalCents ?? summary.totalCents });
      } else if (result?.success) {
        // Stripe had already charged it: the order is paid now, just show it.
        sileo.success({ title: result.message });
        onChanged();
      } else {
        sileo.info({ title: result?.message ?? 'No pudimos preparar el pago.' });
        onChanged();
      }
    } catch {
      sileo.error({ title: 'No pudimos preparar el pago. Intenta de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm(`¿Cancelar el pedido ${summary.number}? No se hará ningún cobro.`)) return;
    setBusy(true);
    try {
      const { data } = await cancelOrder({ variables: { orderNumber: summary.number } });
      const result = data?.cancelMyStoreOrder;
      if (result?.success) sileo.success({ title: result.message });
      else sileo.error({ title: result?.message ?? 'No pudimos cancelar tu pedido.' });
      onChanged();
    } catch {
      sileo.error({ title: 'No pudimos cancelar tu pedido. Intenta de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const address = order.address;

  return (
    <div className="flex flex-col gap-4">
      <Link href={Routes.store.orders} className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-dash-soft hover:text-dash-ink">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden="true" />
        Todos mis pedidos
      </Link>

      <div className={cn(cardClass, 'flex flex-wrap items-center justify-between gap-3')}>
        <div>
          <p className="text-xs text-dash-muted">Pedido</p>
          <p className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-dash-ink">{summary.number}</p>
          <p className="text-sm text-dash-muted">{formatStoreDate(summary.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <OrderStatusPill order={summary} />
          <p className="text-lg font-semibold tabular-nums text-dash-ink">{formatPrice(summary.totalCents)}</p>
        </div>
      </div>

      {justPlaced && unpaid && !confirming ? (
        <p role="status" className="rounded-3xl bg-kadesh-50 px-5 py-4 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300">
          Apartamos tu pedido. Te mandamos estos mismos datos a tu correo.
        </p>
      ) : null}
      {confirming ? (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-kadesh-50 px-5 py-4 text-kadesh-700 dark:bg-kadesh/15 dark:text-kadesh-300">
          <p>Estamos confirmando tu pago con el banco. Suele tardar unos segundos.</p>
          <button type="button" onClick={onChanged} className={quietButton}>
            Actualizar
          </button>
        </div>
      ) : null}
      {justPaid && summary.paymentStatus === 'paid' ? (
        <p role="status" className="rounded-3xl bg-emerald-50 px-5 py-4 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          ¡Gracias por tu compra! Recibimos tu pago y ya estamos preparando tu pedido.
        </p>
      ) : null}
      {order.cancelReason && summary.status === 'cancelled' ? (
        <p className="rounded-3xl bg-dash-surface-2 px-5 py-4 text-sm text-dash-soft">{order.cancelReason}</p>
      ) : null}

      {order.transfer ? (
        <TransferBox
          order={order}
          transfer={order.transfer}
          proofUploaded={order.proofUploaded}
          rejectedReason={order.proofRejectedReason}
          whatsapp={order.supportWhatsapp}
          onDone={onChanged}
        />
      ) : null}

      {order.canPay && !confirming ? (
        <Section title="Falta el pago">
          {payment ? (
            <StripePayStep
              clientSecret={payment.clientSecret}
              orderNumber={summary.number}
              totalCents={payment.totalCents}
              onPaid={() => {
                setPayment(null);
                sileo.success({ title: 'Recibimos tu pago' });
                onChanged();
              }}
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-dash-soft">
                Tu pedido está apartado{summary.expiresAt ? ` hasta el ${deadline(summary.expiresAt)}` : ''}. Después se cancela solo.
              </p>
              <button type="button" onClick={() => void payNow()} disabled={busy} className={primaryButton}>
                Pagar {formatPrice(summary.totalCents)} con tarjeta
              </button>
            </>
          )}
        </Section>
      ) : null}

      {order.shipments.length > 0 ? (
        <Section title={order.shipments.length === 1 ? 'Tu paquete' : `Tus ${order.shipments.length} paquetes`}>
          <ul className="flex flex-col gap-4">
            {order.shipments.map((shipment) => (
              <li key={shipment.id} className="rounded-2xl bg-dash-surface-2 p-4">
                <p className="font-semibold text-dash-ink">{shipment.statusLabel}</p>
                <p className="mt-0.5 text-sm text-dash-soft">{shipment.items.join(' · ')}</p>
                {shipment.carrier || shipment.trackingCode ? (
                  <p className="mt-2 text-sm text-dash-ink">
                    {shipment.carrier ? `${shipment.carrier} · ` : ''}
                    {shipment.trackingCode ? <span className="font-semibold tabular-nums">Guía {shipment.trackingCode}</span> : null}
                  </p>
                ) : null}
                {shipment.trackingUrl ? (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                  >
                    Rastrear paquete
                    <HugeiconsIcon icon={LinkSquare02Icon} size={16} aria-hidden="true" />
                    <span className="sr-only">(se abre en otra pestaña)</span>
                  </a>
                ) : null}
                {shipment.deliveredAt ? (
                  <p className="mt-1 text-xs text-dash-muted">Entregado el {formatStoreDate(shipment.deliveredAt)}</p>
                ) : shipment.shippedAt ? (
                  <p className="mt-1 text-xs text-dash-muted">Salió el {formatStoreDate(shipment.shippedAt)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Productos">
        <ul className="divide-y divide-dash-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-dash-ink">
                  {item.productSlug ? (
                    <Link href={Routes.store.product(item.productSlug)} className="hover:underline">
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </p>
                <p className="text-sm text-dash-muted">
                  {item.variantTitle ? `${item.variantTitle} · ` : ''}
                  {item.quantity} × {formatPrice(item.unitPriceCents)}
                </p>
                {item.productSlug && summary.fulfillmentStatus === 'delivered' ? (
                  <Link
                    href={`${Routes.store.product(item.productSlug)}#resenas`}
                    className="text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                  >
                    Reseñar este producto y ganar huellitas
                  </Link>
                ) : null}
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-dash-ink">{formatPrice(item.totalCents)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1.5 border-t border-dash-line pt-3 text-sm text-dash-soft">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
          </div>
          {order.couponCode ? (
            <div className="flex justify-between gap-4">
              <dt className="min-w-0 [overflow-wrap:anywhere]">Cupón {order.couponCode}</dt>
              <dd className="shrink-0 tabular-nums">
                {order.couponDiscountCents > 0 ? `−${formatPrice(order.couponDiscountCents)}` : 'Envío gratis'}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Envío</dt>
            <dd className="tabular-nums">{order.shippingCents > 0 ? formatPrice(order.shippingCents) : 'Gratis'}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold text-dash-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(summary.totalCents)}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Se envía a">
        <p className="text-sm leading-relaxed text-dash-ink">
          {address.recipientName}
          <br />
          {address.street} {address.exteriorNumber}
          {address.interiorNumber ? ` int. ${address.interiorNumber}` : ''}, {address.neighborhood}
          <br />
          {address.postalCode} {address.city}, {address.stateName}
          <br />
          Tel. {address.phone}
        </p>
        {address.references ? <p className="mt-2 text-sm text-dash-muted">Referencias: {address.references}</p> : null}
        {order.customerNote ? <p className="mt-2 text-sm text-dash-muted">Tu nota: {order.customerNote}</p> : null}
      </Section>

      <Section title="Lo que ha pasado">
        <ol className="flex flex-col gap-3">
          {order.timeline.map((entry, index) => (
            <li key={`${entry.type}-${index}`} className="border-l-2 border-dash-line pl-3">
              <p className="text-sm text-dash-ink">{entry.message}</p>
              <p className="text-xs text-dash-muted">{deadline(entry.createdAt)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {order.returnPolicy ? (
        <details className={cardClass}>
          <summary className="cursor-pointer text-[15px] font-semibold text-dash-ink">Cambios y devoluciones</summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-dash-soft">{order.returnPolicy}</p>
        </details>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {order.supportWhatsapp ? (
          <a
            href={`https://wa.me/52${order.supportWhatsapp}?text=${encodeURIComponent(`Hola, tengo una duda de mi pedido ${summary.number}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={quietButton}
          >
            Ayuda con este pedido
          </a>
        ) : null}
        {order.canCancel ? (
          <button
            type="button"
            onClick={() => void cancel()}
            disabled={busy}
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Cancelar pedido
          </button>
        ) : null}
      </div>
    </div>
  );
}
