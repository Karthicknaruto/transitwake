import { Coordinates } from '../types';
import { TransferInterchange } from '../types/routes';

export interface RouteSyncPayload {
  version: 1;
  destinationName: string;
  destination: Coordinates;
  radiusKm: number;
  originName?: string;
  origin?: Coordinates;
  transfer?: TransferInterchange;
}

export interface WhatsAppEtaParams {
  destinationName: string;
  distanceKm: number | null;
  etaMinutes: number | null;
  speedKmh: number | null;
  radiusKm: number;
}

/**
 * Generates an encoded WhatsApp share URL with the commuter's real-time progress.
 */
export function generateWhatsAppEtaUrl(params: WhatsAppEtaParams): string {
  const { destinationName, distanceKm, etaMinutes, speedKmh, radiusKm } = params;
  const distStr = distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'tracking active';
  const etaStr = etaMinutes !== null ? `~${etaMinutes} mins` : 'calculating';
  const speedStr = speedKmh !== null && speedKmh > 0 ? `${Math.round(speedKmh)} km/h` : '45 km/h';

  const message = [
    `On the train to ${destinationName || 'destination'}.`,
    `Remaining: ${distStr} (ETA ${etaStr} @ ${speedStr}).`,
    `Alarm set to wake me ${radiusKm.toFixed(1)} km before station.`,
    `Live status: https://transitwake.app/eta#d=${encodeURIComponent(destinationName)}&km=${distanceKm?.toFixed(1) || '0'}&eta=${etaMinutes || '0'}`,
  ].join('\n');

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Encodes a commuter route into a compact sync token for QR code rendering.
 */
export function encodeRouteForSync(payload: RouteSyncPayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(jsonStr, 'utf-8').toString('base64');
    }
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return '';
  }
}

/**
 * Decodes a route sync token from a scanned QR code or URL hash fragment.
 */
export function decodeRouteFromSync(token: string): RouteSyncPayload | null {
  try {
    let clean = token.trim();
    if (clean.includes('#sync=')) {
      clean = clean.split('#sync=')[1];
    } else if (clean.includes('sync=')) {
      clean = clean.split('sync=')[1];
    }

    let jsonStr = '';
    if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(clean, 'base64').toString('utf-8');
    } else {
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    }

    const parsed = JSON.parse(jsonStr);
    if (
      parsed &&
      typeof parsed.destinationName === 'string' &&
      parsed.destination &&
      typeof parsed.destination.latitude === 'number' &&
      !isNaN(parsed.destination.latitude) &&
      typeof parsed.destination.longitude === 'number' &&
      !isNaN(parsed.destination.longitude) &&
      typeof parsed.radiusKm === 'number' &&
      !isNaN(parsed.radiusKm)
    ) {
      return parsed as RouteSyncPayload;
    }
    return null;
  } catch {
    return null;
  }
}
