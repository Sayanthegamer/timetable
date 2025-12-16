class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private userInteracted: boolean = false;

  constructor() {
    this.preloadSounds();
    this.setupInteractionListener();
  }

  private setupInteractionListener(): void {
    const markInteracted = () => {
      this.userInteracted = true;
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };

    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
  }

  private preloadSounds(): void {
    const soundFiles = ['click', 'hover', 'complete', 'notification', 'theme'];
    soundFiles.forEach(name => {
      const audio = new Audio(`/sounds/${name}.wav`);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    });
  }

  play(soundName: string): void {
    if (!this.enabled || !this.userInteracted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.warn('Sound play failed:', err));
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const sound = new SoundService();
