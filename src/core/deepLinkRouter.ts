import { App as CapApp, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from './bulathCodec';

type DeepLinkCallback = (payload: BulathHurullaPayload) => void;

export function extractBulathFromUrl(rawUrl: string): BulathHurullaPayload | null {
  try {
    const normalized = rawUrl.startsWith('kalukumara://')
      ? rawUrl.replace('kalukumara://summon', 'https://kalukumara.aftermonsoon.lk/')
      : rawUrl;
    const parsed = new URL(normalized, 'https://kalukumara.aftermonsoon.lk');
    const token = parsed.searchParams.get('bulath');
    return token ? decodeBulathPayload(token) : null;
  } catch {
    return null;
  }
}

export function getInitialWebBulath(): BulathHurullaPayload | null {
  if (typeof window === 'undefined') return null;
  const token = new URLSearchParams(window.location.search).get('bulath');
  return token ? decodeBulathPayload(token) : null;
}

export function resolveCasefileConfig(search: string, _graph?: unknown) {
  const p = new URLSearchParams(search);
  const token = p.get('bulath');
  const c = p.get('case') || p.get('casefile');
  const incoming = token ? decodeBulathPayload(token) : null;
  const isC4 = Boolean(
    c === '4' || c === '04' || c?.toLowerCase() === 'mahasona' ||
    incoming?.casefile === 'CF04' || incoming?.avatar === 'JAYASENA_YAKA' || incoming?.avatar === 'MAHA_SOHONA'
  );
  const isC3 = !isC4 && Boolean(
    c === '3' || c === '03' || c?.toLowerCase() === 'riri' || c?.toLowerCase() === 'riri_yaka' ||
    incoming?.casefile === 'CF03' || incoming?.avatar?.endsWith('RIRI')
  );
  const isC2 = !isC4 && !isC3 && Boolean(
    c === '2' || c === '02' || c?.toLowerCase() === 'mohini' ||
    incoming?.casefile === 'CF02' || incoming?.avatar?.endsWith('MOHINI')
  );
  const casefileId: CasefileId = isC4 ? 'CF04' : isC3 ? 'CF03' : isC2 ? 'CF02' : 'CF01';
  return {
    isCase02: isC2,
    isCase03: isC3,
    isCase04: isC4,
    casefileId,
    incomingBulath: incoming,
    startingPassageId: isC4
      ? (incoming ? 'Kattadiya_Mahasona_Entry' : 'Crossroads_Midnight_Start')
      : isC3
      ? (incoming ? 'Kattadiya_Riri_Entry' : 'Crimson_Hearth_Start')
      : isC2
      ? (incoming ? 'Kattadiya_Mohini_Entry' : 'Upper_Lake_Mist_Start')
      : (incoming ? 'Kattadiya_Sastra_Entry' : 'Dusk_Balcony_Check'),
    initialSamayam: isC4 ? ('MADDHAMA_MIDNIGHT' as const) : isC3 ? ('SANDHYA_DUSK' as const) : isC2 ? ('MADDHAMA_MIDNIGHT' as const) : ('SANDHYA_DUSK' as const),
  };
}

export function listenForBulathDeepLinks(onSummonReceived: DeepLinkCallback): () => void {
  let removed = false;
  let listenerHandle: { remove: () => Promise<void> } | null = null;

  if (Capacitor.isNativePlatform()) {
    CapApp.getLaunchUrl()
      .then((launchResult) => {
        if (!removed && launchResult?.url) {
          const decoded = extractBulathFromUrl(launchResult.url);
          if (decoded) onSummonReceived(decoded);
        }
      })
      .catch(() => {});

    CapApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (removed) return;
      const decoded = extractBulathFromUrl(event.url);
      if (decoded) onSummonReceived(decoded);
    }).then((handle) => {
      listenerHandle = handle;
    });
  }

  return () => {
    removed = true;
    listenerHandle?.remove().catch(() => {});
  };
}

export function buildWhatsAppSummonLink(urlParam: string, shareCode: string): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin.startsWith('http')
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://kalukumara.aftermonsoon.lk/';
  const webLink = `${origin}?bulath=${urlParam}`;
  const text = `Bulath Hurulla Summons [${shareCode}] — Something struck me during the Samayam watch. Open the Kattadiya triage: ${webLink}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
