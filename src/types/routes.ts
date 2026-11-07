import { Coordinates } from './index';

export interface TransferInterchange {
  name: string;
  coords: Coordinates;
  wakeRadiusKm: number;
}

export type MultiLegPhase = 'NONE' | 'LEG1_TO_TRANSFER' | 'TRANSFER_DWELL' | 'LEG2_TO_FINAL';

export interface CommutePreset {
  id: string;
  name: string;
  originName: string;
  originCoords: Coordinates;
  destinationName: string;
  destinationCoords: Coordinates;
  radiusKm: number;
  direction: 'OUTBOUND' | 'RETURN';
  lastUsedAt: number;
  transfer?: TransferInterchange;
  userId?: string;
}
