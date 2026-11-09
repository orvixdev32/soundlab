import type { SoundTrack } from '../types/audio';

export const availableSounds: SoundTrack[] = [
  // First Scene: Rainy Forest (файли вже завантажені)
  { id: 'forest-birds', name: 'Forest Birds', category: 'nature', defaultVolume: 0.5, src: '/audio/forest-birds.wav' },
  { id: 'rain-gentle', name: 'Gentle Rain', category: 'nature', defaultVolume: 0.7, src: '/audio/rain-gentle.mp3' },
  { id: 'thunder-distant', name: 'Distant Thunder', category: 'nature', defaultVolume: 0.35, src: '/audio/thunder-distant.wav' },
  { id: 'wind-breeze', name: 'Pine Wind', category: 'nature', defaultVolume: 0.45, src: '/audio/wind-breeze.mp3' },

  // Інші звуки (під наступні сцени)
  { id: 'river-stream', name: 'Mountain Stream', category: 'nature', defaultVolume: 0.6, src: '/audio/river-stream.mp3' },
  { id: 'campfire', name: 'Campfire Crackle', category: 'nature', defaultVolume: 0.5, src: '/audio/campfire.mp3' },
  { id: 'ocean-waves', name: 'Ocean Waves', category: 'nature', defaultVolume: 0.6, src: '/audio/ocean-waves.mp3' },
  { id: 'cafe-murmur', name: 'Coffee Shop Ambience', category: 'urban', defaultVolume: 0.5, src: '/audio/cafe-murmur.mp3' },
  { id: 'espresso-machine', name: 'Espresso Bar', category: 'urban', defaultVolume: 0.3, src: '/audio/espresso-machine.mp3' },
  { id: 'night-city', name: 'City Night Traffic', category: 'urban', defaultVolume: 0.4, src: '/audio/night-city.mp3' },
  { id: 'white-noise', name: 'Deep White Noise', category: 'white-noise', defaultVolume: 0.3, src: '/audio/white-noise.mp3' },
  { id: 'binaural-beats', name: 'Alpha Focus Waves', category: 'ambient', defaultVolume: 0.4, src: '/audio/binaural-beats.mp3' },
  { id: 'vinyl-crackle', name: 'Lo-Fi Vinyl Dust', category: 'music', defaultVolume: 0.3, src: '/audio/vinyl-crackle.mp3' },
];

export const getSoundSrc = (soundId: string): string | undefined => {
  const sound = availableSounds.find((s) => s.id === soundId);
  return sound?.src;
};
