import { Coordinates, Destination } from './index';

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
}
