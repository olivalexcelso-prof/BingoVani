
export class TTSService {
  private static synth = window.speechSynthesis;
  private static enabled = true;
  private static volume = 0.7;

  static setEnabled(val: boolean) { this.enabled = val; }
  static setVolume(val: number) { this.volume = val; }

  static speak(text: string, priority: 'low' | 'high' = 'low') {
    if (!this.enabled || !this.synth) return;
    
    if (priority === 'high') {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.volume;
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    
    // Find a nice female voice if available
    const voices = this.synth.getVoices();
    const googlePt = voices.find(v => v.name.includes('Google') && v.lang.startsWith('pt'));
    if (googlePt) utterance.voice = googlePt;

    this.synth.speak(utterance);
  }

  static announceBall(num: number) {
    this.speak(`Bola número ${num}`);
  }

  static announceWinner(name: string, prize: string) {
    this.speak(`Parabéns ${name}, você ganhou a ${prize}!`, 'high');
  }

  static announceAlert(text: string) {
    this.speak(text, 'high');
  }
}
