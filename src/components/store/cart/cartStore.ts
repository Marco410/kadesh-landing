'use client';

import { useSyncExternalStore } from 'react';
import {
  STORE_CART_MAX_LINES,
  STORE_CART_MAX_QUANTITY,
  STORE_CART_STORAGE_KEY,
  STORE_COUPON_CODE_MAX,
  STORE_COUPON_STORAGE_KEY,
} from '../constants';
import type { CartItem } from '../types';

/**
 * The cart lives in the browser (localStorage): which variant and how many. No prices here: the
 * server quotes them (`storeCartQuote`) every time the cart opens or changes, so nothing stored
 * can be trusted or go stale. Nothing is written to the backend until the order is placed.
 * The coupon code typed in the cart is kept the same way: the server decides if it applies.
 *
 * A module-level store read with `useSyncExternalStore`: any component can use `useCart()` without
 * a provider, and two tabs stay in step through the `storage` event.
 */

const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let couponCode = '';
let loaded = false;
const listeners = new Set<() => void>();

function clean(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return EMPTY;
  const byVariant = new Map<string, number>();
  for (const entry of raw) {
    const variantId = typeof entry?.variantId === 'string' ? entry.variantId : '';
    const quantity = Math.floor(Number(entry?.quantity));
    if (!variantId || !Number.isFinite(quantity) || quantity < 1) continue;
    byVariant.set(variantId, Math.min((byVariant.get(variantId) ?? 0) + quantity, STORE_CART_MAX_QUANTITY));
  }
  return [...byVariant.entries()].slice(0, STORE_CART_MAX_LINES).map(([variantId, quantity]) => ({ variantId, quantity }));
}

function read(): CartItem[] {
  try {
    return clean(JSON.parse(window.localStorage.getItem(STORE_CART_STORAGE_KEY) ?? '[]'));
  } catch {
    return EMPTY;
  }
}

/** How the backend stores a code: "  verano 10 " → "VERANO10". */
export function normalizeCouponCode(code: string | null | undefined): string {
  return (code ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, STORE_COUPON_CODE_MAX);
}

function readCoupon(): string {
  try {
    return normalizeCouponCode(window.localStorage.getItem(STORE_COUPON_STORAGE_KEY));
  } catch {
    return '';
  }
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  items = read();
  couponCode = readCoupon();
  window.addEventListener('storage', (event) => {
    if (event.key !== STORE_CART_STORAGE_KEY && event.key !== STORE_COUPON_STORAGE_KEY) return;
    items = read();
    couponCode = readCoupon();
    listeners.forEach((listener) => listener());
  });
}

/** Writes the lines and, when given, the coupon code; listeners hear about both at once. */
function write(next: CartItem[], nextCoupon: string = couponCode) {
  items = next.length ? next : EMPTY;
  couponCode = nextCoupon;
  try {
    window.localStorage.setItem(STORE_CART_STORAGE_KEY, JSON.stringify(items));
    if (couponCode) window.localStorage.setItem(STORE_COUPON_STORAGE_KEY, couponCode);
    else window.localStorage.removeItem(STORE_COUPON_STORAGE_KEY);
  } catch {
    // Private mode or storage full: the cart still works for this page.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): CartItem[] {
  ensureLoaded();
  return items;
}

export const cart = {
  /** Adds units of a variant (on top of what is there), up to the per-order cap. */
  add(variantId: string, quantity = 1) {
    ensureLoaded();
    const existing = items.find((item) => item.variantId === variantId);
    if (!existing && items.length >= STORE_CART_MAX_LINES) return false;
    const total = Math.min((existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity)), STORE_CART_MAX_QUANTITY);
    write(
      existing
        ? items.map((item) => (item.variantId === variantId ? { ...item, quantity: total } : item))
        : [...items, { variantId, quantity: total }],
    );
    return true;
  },
  /** Sets the units of a line; 0 or less removes it. */
  setQuantity(variantId: string, quantity: number) {
    ensureLoaded();
    const next = Math.min(Math.floor(quantity), STORE_CART_MAX_QUANTITY);
    write(
      next < 1
        ? items.filter((item) => item.variantId !== variantId)
        : items.map((item) => (item.variantId === variantId ? { ...item, quantity: next } : item)),
    );
  },
  /**
   * Adds or takes units from what is stored right now, not from what the screen last showed: two
   * taps before the next render both count. Stays between 1 and `max` (removing is `remove`).
   */
  step(variantId: string, delta: number, max: number = STORE_CART_MAX_QUANTITY) {
    ensureLoaded();
    const existing = items.find((item) => item.variantId === variantId);
    if (!existing) return;
    const next = Math.max(1, Math.min(existing.quantity + Math.trunc(delta), max, STORE_CART_MAX_QUANTITY));
    if (next === existing.quantity) return;
    write(items.map((item) => (item.variantId === variantId ? { ...item, quantity: next } : item)));
  },
  remove(variantId: string) {
    ensureLoaded();
    write(items.filter((item) => item.variantId !== variantId));
  },
  /** Replaces the whole cart (after the server corrected quantities or refused the coupon). */
  replace(next: CartItem[], nextCoupon?: string) {
    ensureLoaded();
    write(clean(next), nextCoupon === undefined ? couponCode : normalizeCouponCode(nextCoupon));
  },
  /** The code to quote the cart with; empty removes it. */
  setCoupon(code: string) {
    ensureLoaded();
    write(items, normalizeCouponCode(code));
  },
  /** Empties the cart and forgets the coupon (the order was placed). */
  clear() {
    ensureLoaded();
    write(EMPTY, '');
  },
};

/** The lines of the cart. Empty on the server and on the first client render (no hydration mismatch). */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

function couponSnapshot(): string {
  ensureLoaded();
  return couponCode;
}

/** The coupon code the cart is quoted with; empty when none. */
export function useCartCoupon(): string {
  return useSyncExternalStore(subscribe, couponSnapshot, () => '');
}

/** Units in the cart, for the header badge. */
export function useCartCount(): number {
  return useCart().reduce((sum, item) => sum + item.quantity, 0);
}
