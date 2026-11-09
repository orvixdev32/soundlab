export type SoundCategory = 'nature' | 'urban' | 'ambient' | 'music' | 'white-noise';

export interface SoundTrack {
  id: string;
  name: string;
  category: SoundCategory;
  src?: string; // Path to audio file once ready
  defaultVolume: number;
}
