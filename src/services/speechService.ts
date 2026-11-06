import { Platform } from 'react-native';

type MilestoneKey = '10KM' | '5KM' | 'ARRIVAL_ZONE' | '1KM';

interface MilestoneCheckPayload {
  destinationName: string;
  distanceKm: number;
  radiusKm: number;
}

class SpeechService {
  private muted: boolean = false;
  private spokenMilestones: Set<MilestoneKey> = new Set();
  private lastSpokenMilestone: MilestoneKey | null = null;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted && Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getLastSpokenMilestone(): MilestoneKey | null {
    return this.lastSpokenMilestone;
  }

  public resetMilestones(): void {
    this.spokenMilestones.clear();
    this.lastSpokenMilestone = null;
  }

  /**
   * Evaluates current distance and triggers speech announcement if passing a new milestone
   */
  public async checkMilestoneAndSpeak(payload: MilestoneCheckPayload): Promise<boolean> {
    if (this.muted) return false;

    const { destinationName, distanceKm, radiusKm } = payload;
    let milestone: MilestoneKey | null = null;
    let announcement = '';

    if (distanceKm <= 1.0) {
      milestone = '1KM';
      announcement = `Immediate stop alert. One kilometer to ${destinationName}.`;
    } else if (distanceKm <= radiusKm) {
      milestone = 'ARRIVAL_ZONE';
      announcement = `Approaching destination. Within ${radiusKm.toFixed(1)} kilometers of ${destinationName}. Prepare to alight.`;
    } else if (distanceKm <= 5.2 && distanceKm >= 4.8) {
      milestone = '5KM';
      announcement = `Transit wake update. Five kilometers remaining to ${destinationName}.`;
    } else if (distanceKm <= 10.3 && distanceKm >= 9.5) {
      milestone = '10KM';
      announcement = `Transit wake update. Ten kilometers remaining to ${destinationName}.`;
    }

    if (!milestone) return false;

    // Deduplication check: do not repeat if already spoken for this commute
    if (this.spokenMilestones.has(milestone)) {
      return false;
    }

    this.spokenMilestones.add(milestone);
    this.lastSpokenMilestone = milestone;

    await this.speak(announcement);
    return true;
  }

  /**
   * Synthesizes speech using Web Speech API or native TTS
   */
  public async speak(text: string): Promise<void> {
    if (this.muted) return;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis silent fallback
    }
  }

  public resetForTesting(): void {
    this.muted = false;
    this.resetMilestones();
  }
}

export const speechService = new SpeechService();
