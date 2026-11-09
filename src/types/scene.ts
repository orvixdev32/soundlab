export interface SoundLayerConfig {
  soundId: string;
  name: string;
  defaultVolume: number; // 0 to 1
  icon?: string;
  category?: 'nature' | 'urban' | 'ambient' | 'music' | 'white-noise';
}

export interface Scene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'focus' | 'relax' | 'nature' | 'urban';
  coverImage: string;
  layers: SoundLayerConfig[];
  isFeatured?: boolean;
}
