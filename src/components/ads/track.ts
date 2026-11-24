/**
 * Impressions and clicks of the ads (`recordAdEvents` in kadesh-back → `AdDailyStat`).
 *
 * Same idea as `utils/activity/track.ts`: events wait in memory and go in one request every 10 s,
 * when the tab is hidden or when the page closes (`fetch` with `keepalive`). Nothing is sent if
 * nothing happened. Never throws: a failed batch is lost (an ad must not cost the page anything).
 * The backend drops repeats of the same person within 30 min, admins and bots.
 */

import type { AdPlacement } from './types';

const FLUSH_MS = 10_000;
const MAX_BATCH = 50;
const SESSION_TOKEN_KEY = 'keystonejs-session-token';

const RECORD_AD_EVENTS_MUTATION = `
  mutation RecordAdEvents($events: [AdEventInput!]!) {
    recordAdEvents(events: $events) {
      accepted
    }
  }
`;

type AdEvent = { adId: string; placement: AdPlacement; type: 'IMPRESSION' | 'CLICK' };

const queue: AdEvent[] = [];
/** Impressions already queued in this page view: one per ad and placement. */
const seen = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function readToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function flush(keepalive: boolean) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    queue.length = 0;
    return;
  }
  while (queue.length > 0) {
    const events = queue.splice(0, MAX_BATCH);
    // The session only tells the backend who is an admin (not counted) and who is the same person.
    const token = readToken();
    fetch(url, {
      method: 'POST',
      keepalive,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ query: RECORD_AD_EVENTS_MUTATION, variables: { events } }),
    }).catch(() => undefined);
  }
}

function listenForPageExit() {
  if (listening) return;
  listening = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', () => flush(true));
}

function enqueue(event: AdEvent, now: boolean) {
  if (typeof window === 'undefined') return;
  listenForPageExit();
  queue.push(event);
  if (now || queue.length >= MAX_BATCH) flush(now);
  else if (!timer) timer = setTimeout(() => flush(false), FLUSH_MS);
}

/** The card was at least half on screen for 1 s. Counted once per ad and placement per page view. */
export function trackAdImpression(adId: string, placement: AdPlacement, pageKey: string) {
  const key = `${pageKey}|${adId}|${placement}`;
  if (seen.has(key)) return;
  seen.add(key);
  enqueue({ adId, placement, type: 'IMPRESSION' }, false);
}

/** Sent right away (with `keepalive`): the click usually leaves the page. */
export function trackAdClick(adId: string, placement: AdPlacement) {
  enqueue({ adId, placement, type: 'CLICK' }, true);
}
