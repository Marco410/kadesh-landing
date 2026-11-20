'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { sileo } from 'sileo';
import { Footer, Navigation } from 'kadesh/components/layout';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from 'kadesh/components/shared/TurnstileWidget';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { SESSION_TOKEN_KEY } from 'kadesh/utils/sessionToken';
import { useUser } from 'kadesh/utils/UserContext';
import { cart } from '../cart/cartStore';
import CartSummary from '../cart/CartSummary';
import CouponField from '../cart/CouponField';
import { useCartQuote } from '../cart/useCartQuote';
import { PAYMENT_METHOD_LABELS, STORE_GUEST_MIN_PASSWORD } from '../constants';
import { formatPrice } from '../format';
import {
  MY_STORE_ADDRESSES_QUERY,
  PLACE_STORE_ORDER_MUTATION,
  type MyStoreAddressesResponse,
  type PlaceStoreOrderResponse,
} from '../queries';
import type { StoreAddressInput, StorePaymentMethod } from '../types';
import AddressFields, {
  ADDRESS_FIELD_ORDER,
  CheckoutField,
  EMPTY_ADDRESS,
  addressErrors,
  addressFieldId,
  addressLine,
  addressToInput,
  checkoutFieldClass,
  checkoutFieldErrorClass,
  invalidProps,
  mxPhoneDigits,
} from './AddressFields';
import StripePayStep from './StripePayStep';

const NEW_ADDRESS = 'nueva';
const cardClass = 'rounded-2xl border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1e1e1e] sm:p-6';
const stepTitleClass = 'mb-4 text-lg font-bold text-[#121212] dark:text-white';

type Guest = { name: string; lastName: string; email: string; phone: string; password: string };
const EMPTY_GUEST: Guest = { name: '', lastName: '', email: '', phone: '', password: '' };

type GuestErrors = Partial<Record<keyof Guest, string>>;
const GUEST_FIELD_ORDER: Array<keyof Guest> = ['name', 'email', 'phone', 'password'];

function guestErrors(guest: Guest): GuestErrors {
  const errors: GuestErrors = {};
  if (guest.name.trim().length < 2) errors.name = 'Escribe tu nombre.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) errors.email = 'Escribe un correo válido.';
  if (mxPhoneDigits(guest.phone).length !== 10) errors.phone = 'Debe tener 10 dígitos.';
  if (guest.password.length < STORE_GUEST_MIN_PASSWORD) errors.password = `Usa al menos ${STORE_GUEST_MIN_PASSWORD} caracteres.`;
  return errors;
}

const guestFieldId = (field: keyof Guest) => `comprador-${field}`;

/** A random key for one attempt to pay: the server answers the same order to every retry of it. */
function newCheckoutKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * `/tienda/pagar`: who buys, where it goes and how it is paid, in one page.
 *
 * Without a session the same form creates the account (name, email, password): the person buys
 * and ends up signed in, so they can follow their order. The total shown is the server's quote,
 * and it is sent back with the order: if it changed in between, nothing is charged and the new
 * total is shown.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const { items, quote, loading, error: quoteError, notices, couponNotice, refresh } = useCartQuote();
  const { data: addressData } = useQuery<MyStoreAddressesResponse>(MY_STORE_ADDRESSES_QUERY, {
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });
  const [placeOrder] = useMutation<PlaceStoreOrderResponse>(PLACE_STORE_ORDER_MUTATION);

  const [guest, setGuest] = useState<Guest>(EMPTY_GUEST);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [addressChoice, setAddressChoice] = useState<string | null>(null);
  const [address, setAddress] = useState<StoreAddressInput>(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(true);
  const [method, setMethod] = useState<StorePaymentMethod | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // After the first try to pay, every field shows what is missing while the person fixes it.
  const [attempted, setAttempted] = useState(false);
  // State updates are not instant: two clicks in the same frame both see `submitting` false.
  const submittingRef = useRef(false);
  const checkoutKeyRef = useRef<string | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  // Card: the order exists and waits for its payment.
  const [payment, setPayment] = useState<{ clientSecret: string; orderNumber: string; totalCents: number } | null>(null);

  const saved = addressData?.myStoreAddresses ?? [];
  // Saved addresses: the default one is chosen until the person picks another or a new one.
  const choice = addressChoice ?? (saved.length > 0 ? saved[0].id ?? NEW_ADDRESS : NEW_ADDRESS);
  const chosenSaved = saved.find((entry) => entry.id === choice) ?? null;
  const methods = quote?.paymentMethods ?? [];
  const chosenMethod = method && methods.includes(method) ? method : methods[0] ?? null;

  const fieldsOfGuest = !user?.id && attempted ? guestErrors(guest) : {};
  const fieldsOfAddress = !chosenSaved && attempted ? addressErrors(address) : {};

  const guestControl = (field: keyof Guest) => ({
    id: guestFieldId(field),
    className: cn(checkoutFieldClass, fieldsOfGuest[field] && checkoutFieldErrorClass),
    ...invalidProps(guestFieldId(field), fieldsOfGuest[field]),
  });

  const goToOrder = (orderNumber: string, paid: boolean) => {
    router.push(`${Routes.store.order(orderNumber)}${paid ? '&pagado=1' : '&nuevo=1'}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!quote || submittingRef.current) return;
    setProblem(null);
    setEmailExists(false);
    setAttempted(true);

    // Every field with a problem is marked; the first one gets the focus (and scrolls into view).
    const guestIssues = user?.id ? {} : guestErrors(guest);
    const addressIssues = chosenSaved ? {} : addressErrors(address);
    const firstGuest = GUEST_FIELD_ORDER.find((field) => guestIssues[field]);
    const firstAddress = ADDRESS_FIELD_ORDER.find((field) => addressIssues[field]);
    const firstId = firstGuest ? guestFieldId(firstGuest) : firstAddress ? addressFieldId('direccion', firstAddress) : null;
    if (firstId) {
      document.getElementById(firstId)?.focus();
      return setProblem('Revisa los campos marcados en rojo.');
    }
    if (!user?.id && TURNSTILE_SITE_KEY && !turnstileToken) return setProblem('Espera a que termine la verificación de seguridad.');
    const shipTo = chosenSaved ? addressToInput(chosenSaved) : { ...address, phone: mxPhoneDigits(address.phone) };
    if (!chosenMethod) return setProblem('Por ahora no hay formas de pago disponibles. Intenta más tarde.');

    submittingRef.current = true;
    setSubmitting(true);
    // Same key for every retry of this attempt (a timeout, a second tab of the same click).
    checkoutKeyRef.current ??= newCheckoutKey();
    try {
      const { data } = await placeOrder({
        variables: {
          input: {
            items,
            paymentMethod: chosenMethod,
            address: shipTo,
            saveAddress: chosenSaved ? false : saveAddress,
            customerNote: note.trim() || null,
            couponCode: quote.couponApplied ? quote.couponCode : null,
            expectedTotalCents: quote.totalCents,
            channel: 'web',
            checkoutKey: checkoutKeyRef.current,
            guest: user?.id
              ? null
              : {
                  name: guest.name.trim(),
                  lastName: guest.lastName.trim(),
                  email: guest.email.trim(),
                  phone: mxPhoneDigits(guest.phone),
                  password: guest.password,
                  turnstileToken,
                },
          },
        },
      });
      const result = data?.placeStoreOrder;
      if (!result) throw new Error('empty');

      // The account of a guest exists from here on, even if the order did not go through.
      if (result.sessionToken) {
        try {
          window.localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
        } catch {
          // Without storage the session lasts for this page only.
        }
        // Before moving on: the order page lives in the account panel, which needs the session.
        await refreshUser();
      }

      if (!result.success || !result.orderNumber) {
        // Nothing was placed (or it was cancelled): the next try is a new attempt.
        checkoutKeyRef.current = null;
        setProblem(result.message);
        if (result.code === 'EMAIL_EXISTS') setEmailExists(true);
        // The cart or its total changed: show what the server says now.
        if (result.code === 'CART_CHANGED' || result.code === 'PRICE_CHANGED') refresh();
        // The coupon stopped applying (ran out, expired): the cart is quoted again without it.
        if (result.code === 'COUPON_INVALID') cart.setCoupon('');
        return;
      }

      // The order exists: the cart is done, whatever happens with the payment form.
      cart.clear();
      if (result.stripeClientSecret) {
        setPayment({
          clientSecret: result.stripeClientSecret,
          orderNumber: result.orderNumber,
          totalCents: result.totalCents ?? quote.totalCents,
        });
        window.scrollTo({ top: 0 });
      } else {
        // Transfer, or a card order that was already paid (the same attempt answered twice).
        goToOrder(result.orderNumber, chosenMethod === 'stripe_card');
      }
    } catch {
      // The key stays: if the order did get placed, the retry answers that same order.
      setProblem('No pudimos crear tu pedido. Revisa tu conexión e intenta de nuevo.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (payment) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        <Navigation />
        <main className="mx-auto max-w-xl px-4 pt-28 pb-20 sm:px-6">
          <h1 className="mb-2 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">Paga tu pedido</h1>
          <p className="mb-8 text-[#3a3a3a] dark:text-[#d0d0d0]">
            Apartamos tu pedido <strong>{payment.orderNumber}</strong>. Solo falta el pago.
          </p>
          <div className={cardClass}>
            <StripePayStep
              clientSecret={payment.clientSecret}
              orderNumber={payment.orderNumber}
              totalCents={payment.totalCents}
              onPaid={() => {
                sileo.success({ title: 'Recibimos tu pago' });
                goToOrder(payment.orderNumber, true);
              }}
            />
          </div>
          <p className="mt-6 text-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Si cierras esta página, puedes pagarlo después desde{' '}
            <Link href={Routes.store.order(payment.orderNumber)} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
              tu pedido
            </Link>
            .
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const empty = items.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-4xl">Finalizar compra</h1>

        {empty ? (
          <div className="rounded-2xl border border-dashed border-[#d8dee8] px-6 py-14 text-center dark:border-white/15">
            <p className="mb-4 text-lg font-bold text-[#121212] dark:text-white">Tu carrito está vacío</p>
            <Link
              href={Routes.store.index}
              className="inline-flex min-h-12 items-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600"
            >
              Ir a la tienda
            </Link>
            {/* The cart empties once an order is placed: a reload right then lands here. */}
            <p className="mt-4 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
              ¿Acabas de hacer un pedido?{' '}
              <Link href={Routes.store.orders} className="font-semibold text-kadesh underline-offset-2 hover:underline">
                Míralo en Mis pedidos
              </Link>
            </p>
          </div>
        ) : !quote ? (
          <p className="text-[#5a5a5a] dark:text-[#b0b0b0]" role={quoteError ? 'alert' : 'status'}>
            {quoteError ? 'No pudimos calcular tu pedido. Recarga la página para intentar de nuevo.' : 'Calculando tu pedido…'}
          </p>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex flex-col gap-6">
              {notices.length > 0 ? (
                <div role="status" className="rounded-2xl bg-amber-50 px-5 py-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                  <p className="mb-1 font-semibold">Tu carrito cambió</p>
                  <ul className="list-disc pl-5 text-sm">
                    {notices.map((notice) => (
                      <li key={notice}>{notice}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <section className={cardClass} aria-labelledby="paso-datos">
                <h2 id="paso-datos" className={stepTitleClass}>
                  1. Tus datos
                </h2>
                {user?.id ? (
                  <p className="text-[#3a3a3a] dark:text-[#d0d0d0]">
                    Compras como <strong>{[user.name, user.lastName].filter(Boolean).join(' ') || user.email}</strong>
                    {user.email ? ` (${user.email})` : ''}. Ahí te mandamos la confirmación.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                      Con estos datos creamos tu cuenta de Kadesh Pet para que sigas tu pedido.{' '}
                      <Link
                        href={`${Routes.auth.login}?redirect=${encodeURIComponent(Routes.store.checkout)}`}
                        className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
                      >
                        Ya tengo cuenta
                      </Link>
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <CheckoutField id={guestFieldId('name')} label="Nombre" error={fieldsOfGuest.name}>
                        <input
                          {...guestControl('name')}
                          value={guest.name}
                          onChange={(event) => setGuest({ ...guest, name: event.target.value })}
                          autoComplete="given-name"
                          maxLength={60}
                        />
                      </CheckoutField>
                      <CheckoutField id={guestFieldId('lastName')} label="Apellido">
                        <input
                          {...guestControl('lastName')}
                          value={guest.lastName}
                          onChange={(event) => setGuest({ ...guest, lastName: event.target.value })}
                          autoComplete="family-name"
                          maxLength={60}
                        />
                      </CheckoutField>
                      <CheckoutField id={guestFieldId('email')} label="Correo" error={fieldsOfGuest.email}>
                        <input
                          {...guestControl('email')}
                          type="email"
                          value={guest.email}
                          onChange={(event) => setGuest({ ...guest, email: event.target.value })}
                          autoComplete="email"
                        />
                      </CheckoutField>
                      <CheckoutField id={guestFieldId('phone')} label="Teléfono" error={fieldsOfGuest.phone}>
                        <input
                          {...guestControl('phone')}
                          value={guest.phone}
                          onChange={(event) => setGuest({ ...guest, phone: event.target.value })}
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={20}
                          placeholder="10 dígitos"
                        />
                      </CheckoutField>
                      <CheckoutField
                        id={guestFieldId('password')}
                        label="Crea una contraseña"
                        error={fieldsOfGuest.password}
                        className="sm:col-span-2"
                      >
                        <input
                          {...guestControl('password')}
                          type="password"
                          value={guest.password}
                          onChange={(event) => setGuest({ ...guest, password: event.target.value })}
                          autoComplete="new-password"
                        />
                        <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">
                          Al menos {STORE_GUEST_MIN_PASSWORD} caracteres. Con ella entras después a ver tu pedido.
                        </span>
                      </CheckoutField>
                    </div>
                    <TurnstileWidget onToken={setTurnstileToken} className="min-h-[65px]" />
                  </div>
                )}
              </section>

              <section className={cardClass} aria-labelledby="paso-envio">
                <h2 id="paso-envio" className={stepTitleClass}>
                  2. A dónde lo enviamos
                </h2>
                {saved.length > 0 ? (
                  <fieldset className="mb-4 flex flex-col gap-2">
                    <legend className="sr-only">Dirección de envío</legend>
                    {saved.map((entry) => (
                      <label
                        key={entry.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3',
                          choice === entry.id ? 'border-kadesh bg-kadesh-50 dark:bg-kadesh/15' : 'border-[#ececec] dark:border-[#2a2a2a]',
                        )}
                      >
                        <input
                          type="radio"
                          name="direccion"
                          checked={choice === entry.id}
                          onChange={() => setAddressChoice(entry.id)}
                          className="mt-1 size-4 accent-[var(--color-kadesh)]"
                        />
                        <span className="min-w-0 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                          <span className="block font-semibold text-[#121212] dark:text-white">
                            {entry.label ? `${entry.label} · ` : ''}
                            {entry.recipientName}
                          </span>
                          {addressLine(entry)}
                        </span>
                      </label>
                    ))}
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-sm font-semibold text-[#121212] dark:text-white',
                        choice === NEW_ADDRESS ? 'border-kadesh bg-kadesh-50 dark:bg-kadesh/15' : 'border-[#ececec] dark:border-[#2a2a2a]',
                      )}
                    >
                      <input
                        type="radio"
                        name="direccion"
                        checked={choice === NEW_ADDRESS}
                        onChange={() => setAddressChoice(NEW_ADDRESS)}
                        className="size-4 accent-[var(--color-kadesh)]"
                      />
                      Otra dirección
                    </label>
                  </fieldset>
                ) : null}
                {!chosenSaved ? (
                  <>
                    <AddressFields value={address} onChange={setAddress} errors={fieldsOfAddress} />
                    <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(event) => setSaveAddress(event.target.checked)}
                        className="size-4 accent-[var(--color-kadesh)]"
                      />
                      Guardar esta dirección para la próxima vez
                    </label>
                  </>
                ) : null}
                <CheckoutField id="pedido-nota" label="Nota para tu pedido (opcional)" className="mt-4">
                  <input
                    id="pedido-nota"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={500}
                    className={checkoutFieldClass}
                  />
                </CheckoutField>
              </section>

              <section className={cardClass} aria-labelledby="paso-pago">
                <h2 id="paso-pago" className={stepTitleClass}>
                  3. Cómo pagas
                </h2>
                {methods.length === 0 ? (
                  <p className="text-[#3a3a3a] dark:text-[#d0d0d0]">Por ahora no hay formas de pago disponibles. Intenta más tarde.</p>
                ) : (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="sr-only">Forma de pago</legend>
                    {methods.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4',
                          chosenMethod === option ? 'border-kadesh bg-kadesh-50 dark:bg-kadesh/15' : 'border-[#ececec] dark:border-[#2a2a2a]',
                        )}
                      >
                        <input
                          type="radio"
                          name="pago"
                          checked={chosenMethod === option}
                          onChange={() => setMethod(option)}
                          className="mt-1 size-4 accent-[var(--color-kadesh)]"
                        />
                        <span>
                          <span className="block font-semibold text-[#121212] dark:text-white">
                            {PAYMENT_METHOD_LABELS[option]?.title ?? option}
                          </span>
                          <span className="text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{PAYMENT_METHOD_LABELS[option]?.description}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
              </section>

              {quote.returnPolicy ? (
                <details className="rounded-2xl border border-[#ececec] p-5 dark:border-[#2a2a2a]">
                  <summary className="cursor-pointer font-semibold text-[#121212] dark:text-white">Cambios y devoluciones</summary>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{quote.returnPolicy}</p>
                </details>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 self-start lg:sticky lg:top-28">
              <CartSummary quote={quote} coupon={<CouponField quote={quote} notice={couponNotice} busy={loading || submitting} />}>
                <ul className="flex flex-col gap-1 border-b border-[#ececec] pb-3 text-sm text-[#3a3a3a] dark:border-[#2a2a2a] dark:text-[#d0d0d0]">
                  {quote.lines.map((line) => (
                    <li key={line.variantId} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">
                        {line.quantity} × {line.name}
                        {line.variantTitle ? ` (${line.variantTitle})` : ''}
                      </span>
                      <span className="shrink-0 tabular-nums">{formatPrice(line.lineTotalCents)}</span>
                    </li>
                  ))}
                </ul>
                {problem ? (
                  <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-500/10 dark:text-red-300">
                    {problem}
                    {emailExists ? (
                      <>
                        {' '}
                        <Link
                          href={`${Routes.auth.login}?redirect=${encodeURIComponent(Routes.store.checkout)}`}
                          className="font-bold underline"
                        >
                          Iniciar sesión
                        </Link>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting || loading || !quote.canCheckout || methods.length === 0}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
                >
                  {submitting
                    ? 'Creando tu pedido…'
                    : chosenMethod === 'bank_transfer'
                      ? 'Hacer pedido y ver datos de pago'
                      : 'Continuar al pago'}
                </button>
                <Link href={Routes.store.cart} className="text-center text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
                  Volver al carrito
                </Link>
              </CartSummary>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
