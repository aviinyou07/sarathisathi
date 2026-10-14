import * as Speech from 'expo-speech';

class TTSService {
  private isSpeaking = false;

  async speak(text: string, onDone?: () => void, onError?: () => void) {
    try {
      if (this.isSpeaking) {
        await this.stop();
      }

      // Format markdown away for smooth spoken dialogue
      const spokenText = text
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/---/g, '')
        .replace(/•/g, '')
        .trim();

      this.isSpeaking = true;

      Speech.speak(spokenText, {
        language: 'en-IN', // Indian English accent for authentic persona
        pitch: 0.95,       // Calm, serene, resonant pitch
        rate: 0.88,        // Measured meditative cadence
        onDone: () => {
          this.isSpeaking = false;
          onDone?.();
        },
        onStopped: () => {
          this.isSpeaking = false;
          onDone?.();
        },
        onError: () => {
          this.isSpeaking = false;
          onError?.();
        },
      });
    } catch {
      this.isSpeaking = false;
      onError?.();
    }
  }

  async stop() {
    try {
      await Speech.stop();
    } catch {
      // Ignore stop errors
    } finally {
      this.isSpeaking = false;
    }
  }

  getSpeakingStatus() {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
