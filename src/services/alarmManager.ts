import { Vibration, Platform } from 'react-native';
import { adService } from './adService';

class AlarmManager {
  private isRinging: boolean = false;
  private audioContext: any = null;
  private oscillatorInterval: any = null;

  /**
   * Starts the loud persistent wake-up alarm.
   */
  public async startAlarm(destinationName: string, distanceKm: number) {
    if (this.isRinging) return;
    this.isRinging = true;

    // Block any popup ads while the alarm is active
    adService.setAlarmActive(true);

    // 1. Persistent Heavy Vibration
    try {
      if (Platform.OS !== 'web') {
        // Pattern: [vibrate 1s, pause 0.5s, vibrate 1s...], repeat = true
        Vibration.vibrate([1000, 500, 1000, 500], true);
      }
    } catch (err) {
      console.warn('Vibration not supported on this platform:', err);
    }

    // 2. Play Siren Audio
    try {
      await this.playAlarmSound();
    } catch (err) {
      console.warn('Error playing alarm sound:', err);
    }
  }

  /**
   * Plays loud waking siren sounds (compatible across Native & Web).
   */
  private async playAlarmSound() {
    if (Platform.OS === 'web') {
      // Use Web Audio API for guaranteed instant loud audio in browser
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          
          const playBeep = () => {
            if (!this.isRinging || !this.audioContext) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sawtooth';
            // Alternating two-tone siren (800Hz <-> 1200Hz)
            osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, this.audioContext.currentTime + 0.35);

            gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.45);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.5);
          };

          playBeep();
          this.oscillatorInterval = setInterval(playBeep, 600);
        }
      } catch (e) {
        console.warn('Web Audio error:', e);
      }
    } else {
      // In Native Expo, try importing expo-av dynamically if available
      try {
        const { Audio } = require('expo-av');
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });
        // Tone or siren asset playback
      } catch (err) {
        console.warn('Expo-av background audio initialization:', err);
      }
    }
  }

  /**
   * Stops the alarm and silences vibration.
   * If snoozing, ad suppression remains active to protect the commuter.
   */
  public stopAlarm(isSnoozing: boolean = false) {
    this.isRinging = false;
    if (!isSnoozing) {
      adService.setAlarmActive(false);
    }

    try {
      if (Platform.OS !== 'web') {
        Vibration.cancel();
      }
    } catch (err) {
      console.warn('Vibration cancel error:', err);
    }

    if (this.oscillatorInterval) {
      clearInterval(this.oscillatorInterval);
      this.oscillatorInterval = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const alarmManager = new AlarmManager();
