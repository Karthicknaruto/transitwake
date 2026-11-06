import { Platform } from 'react-native';
import { CommutePreset, TransferInterchange } from '../types/routes';

class RouteManager {
  private presets: CommutePreset[] = [];
  private activePresetId: string = 'default_commute';
  private readonly STORAGE_KEY = 'transitwake_presets_v1';

  constructor() {
    this.presets = this.getDefaultPresets();
    this.loadPersistedPresets();
  }

  private getDefaultPresets(): CommutePreset[] {
    return [
      {
        id: 'default_commute',
        name: 'Daily Commute',
        originName: 'Indiranagar Metro',
        originCoords: { latitude: 12.9784, longitude: 77.6408 },
        destinationName: 'Kempegowda Majestic',
        destinationCoords: { latitude: 12.9767, longitude: 77.5713 },
        radiusKm: 4.0,
        direction: 'OUTBOUND',
        lastUsedAt: Date.now(),
        transfer: {
          name: 'MG Road Interchange',
          coords: { latitude: 12.9756, longitude: 77.6066 },
          wakeRadiusKm: 2.0,
        },
      },
      {
        id: 'mumbai_local',
        name: 'Western Line Local',
        originName: 'Borivali Station',
        originCoords: { latitude: 19.2290, longitude: 72.8573 },
        destinationName: 'Churchgate Terminal',
        destinationCoords: { latitude: 18.9322, longitude: 72.8264 },
        radiusKm: 4.0,
        direction: 'OUTBOUND',
        lastUsedAt: Date.now() - 3600000,
        transfer: {
          name: 'Dadar Junction Interchange',
          coords: { latitude: 19.0178, longitude: 72.8478 },
          wakeRadiusKm: 2.0,
        },
      },
    ];
  }

  private loadPersistedPresets() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.presets = parsed;
          }
        }
      }
    } catch {}
  }

  private persistPresets() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.presets));
      }
    } catch {}
  }

  public getPresets(): CommutePreset[] {
    return [...this.presets];
  }

  public getActivePreset(): CommutePreset | null {
    const found = this.presets.find((p) => p.id === this.activePresetId);
    return found ? { ...found } : this.presets[0] ? { ...this.presets[0] } : null;
  }

  public setActivePreset(id: string): void {
    const exists = this.presets.some((p) => p.id === id);
    if (exists) {
      this.activePresetId = id;
    }
  }

  /**
   * 1-Tap Route Inversion (Home <-> Work)
   */
  public flipCurrentRoute(): CommutePreset {
    const current = this.getActivePreset();
    if (!current) {
      throw new Error('No active preset to flip');
    }

    const flipped: CommutePreset = {
      ...current,
      originName: current.destinationName,
      originCoords: { ...current.destinationCoords },
      destinationName: current.originName,
      destinationCoords: { ...current.originCoords },
      direction: current.direction === 'OUTBOUND' ? 'RETURN' : 'OUTBOUND',
      lastUsedAt: Date.now(),
      transfer: current.transfer ? { ...current.transfer } : undefined,
    };

    this.presets = this.presets.map((p) => (p.id === current.id ? flipped : p));
    this.persistPresets();
    return { ...flipped };
  }

  public setTransferInterchange(presetId: string, transfer?: TransferInterchange): CommutePreset | null {
    const target = this.presets.find((p) => p.id === presetId);
    if (!target) return null;

    const updated: CommutePreset = {
      ...target,
      transfer,
      lastUsedAt: Date.now(),
    };

    this.presets = this.presets.map((p) => (p.id === presetId ? updated : p));
    this.persistPresets();
    return { ...updated };
  }

  public createPreset(data: Omit<CommutePreset, 'id' | 'direction' | 'lastUsedAt'>): CommutePreset {
    const newPreset: CommutePreset = {
      ...data,
      id: `preset_${Math.random().toString(36).substring(2, 9)}`,
      direction: 'OUTBOUND',
      lastUsedAt: Date.now(),
    };

    this.presets = [...this.presets, newPreset];
    this.activePresetId = newPreset.id;
    this.persistPresets();
    return { ...newPreset };
  }

  public async resetForTesting(): Promise<void> {
    this.presets = this.getDefaultPresets();
    this.activePresetId = 'default_commute';
  }
}

export const routeManager = new RouteManager();
