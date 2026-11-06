// Text-to-Speech helper using the browser's Web Speech API

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private listeners: Array<(speaking: boolean, paused: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (speaking: boolean, paused: boolean) => void) {
    this.listeners.push(listener);
    listener(this.isSpeakingState, this.isPausedState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isSpeakingState, this.isPausedState));
  }

  public speak(text: string, rate: number = 1.0, onEnd?: () => void) {
    if (!this.synth) return;

    this.stop();

    // Clean markdown formatting characters for natural speech
    const cleanText = text
      .replace(/[`*_#~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (!this.synth || !this.isSpeakingState) return;
    this.synth.pause();
    this.isPausedState = true;
    this.notify();
  }

  public resume() {
    if (!this.synth || !this.isPausedState) return;
    this.synth.resume();
    this.isPausedState = false;
    this.notify();
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.currentUtterance = null;
    this.notify();
  }

  public isAvailable(): boolean {
    return Boolean(this.synth);
  }
}

export const speech = new SpeechService();
