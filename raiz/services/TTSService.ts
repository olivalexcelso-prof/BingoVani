
class TTSService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  public enabled: boolean = true;
  public volume: number = 0.8;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoice();
    }
  }

  private loadVoice() {
    const voices = this.synth.getVoices();
    // Prefer a Portuguese female voice
    this.voice = voices.find(v => v.lang.includes('pt') && v.name.toLowerCase().includes('female')) 
                 || voices.find(v => v.lang.includes('pt'))
                 || voices[0];
  }

  public speak(text: string) {
    if (!this.enabled || !this.synth) return;
    
    this.synth.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = 1.1;
    this.synth.speak(utterance);
  }

  public setVolume(val: number) {
    this.volume = val;
  }

  public toggle(state: boolean) {
    this.enabled = state;
  }
}

export const tts = new TTSService();
