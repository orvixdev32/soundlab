/**
 * Web Audio Engine for soundlab
 * Manages AudioContext, GainNodes for each layer, and seamless looping.
 */

interface TrackNode {
  audio: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode;
  gainNode: GainNode;
  isMuted: boolean;
  userVolume: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks: Map<string, TrackNode> = new Map();
  private isPlaying: boolean = false;
  private masterVolume: number = 0.8;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async setSceneLayers(
    layers: { soundId: string; src: string; defaultVolume: number }[],
    autoPlay: boolean = true
  ): Promise<void> {
    const ctx = this.initContext();
    this.stopAll();

    // Setup tracks
    layers.forEach((layer) => {
      const audio = new Audio(layer.src);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      const sourceNode = ctx.createMediaElementSource(audio);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(layer.defaultVolume, ctx.currentTime);

      sourceNode.connect(gainNode);
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      }

      this.tracks.set(layer.soundId, {
        audio,
        sourceNode,
        gainNode,
        isMuted: false,
        userVolume: layer.defaultVolume,
      });
    });

    if (autoPlay) {
      await this.play();
    }
  }

  public async play(): Promise<void> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const promises: Promise<void>[] = [];
    this.tracks.forEach((track) => {
      promises.push(track.audio.play().catch((err) => {
        console.warn('Playback error / Autoplay prevented:', err);
      }));
    });

    await Promise.allSettled(promises);
    this.isPlaying = true;
  }

  public pause(): void {
    this.tracks.forEach((track) => {
      track.audio.pause();
    });
    this.isPlaying = false;
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setLayerVolume(soundId: string, volume: number): void {
    const track = this.tracks.get(soundId);
    if (!track) return;
    track.userVolume = Math.max(0, Math.min(1, volume));

    if (!track.isMuted && this.ctx) {
      track.gainNode.gain.setTargetAtTime(track.userVolume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleLayerMute(soundId: string): boolean {
    const track = this.tracks.get(soundId);
    if (!track) return false;

    track.isMuted = !track.isMuted;
    if (this.ctx) {
      const targetGain = track.isMuted ? 0 : track.userVolume;
      track.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return track.isMuted;
  }

  public stopAll(): void {
    this.pause();
    this.tracks.forEach((track) => {
      track.audio.pause();
      track.audio.src = '';
      try {
        track.sourceNode.disconnect();
        track.gainNode.disconnect();
      } catch {
        // Already disconnected
      }
    });
    this.tracks.clear();
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const globalAudioEngine = new AudioEngine();
