import type { Scene } from '../types/scene';

export const presetScenes: Scene[] = [
  {
    id: 'rainy-forest',
    title: 'Rainy Forest',
    subtitle: 'Deep Wilderness Peace',
    description: 'Immerse yourself into a quiet pine forest surrounded by soft raindrops, distant thunder, and singing woodland birds.',
    category: 'nature',
    coverImage: '/images/forest.jpg',
    isFeatured: true,
    layers: [
      { soundId: 'rain-gentle', name: 'Gentle Rain', defaultVolume: 0.75, category: 'nature' },
      { soundId: 'forest-birds', name: 'Forest Birds', defaultVolume: 0.5, category: 'nature' },
      { soundId: 'wind-breeze', name: 'Pine Wind', defaultVolume: 0.4, category: 'nature' },
      { soundId: 'thunder-distant', name: 'Distant Thunder', defaultVolume: 0.35, category: 'nature' },
    ],
  },
  {
    id: 'cozy-coffeehouse',
    title: 'Cozy Coffeehouse',
    subtitle: 'Warm Urban Flow',
    description: 'The subtle chatter of a quiet cafe, rain outside the window, and warm espresso steam for deep work.',
    category: 'urban',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    layers: [
      { soundId: 'cafe-murmur', name: 'Cafe Chatter', defaultVolume: 0.6, category: 'urban' },
      { soundId: 'espresso-machine', name: 'Espresso Bar', defaultVolume: 0.35, category: 'urban' },
      { soundId: 'rain-gentle', name: 'Window Rain', defaultVolume: 0.5, category: 'nature' },
    ],
  },
  {
    id: 'night-camp',
    title: 'Night Campfire',
    subtitle: 'Starlit Evening',
    description: 'A crackling wood fire beside a calming river stream under a clear night sky.',
    category: 'relax',
    coverImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
    layers: [
      { soundId: 'campfire', name: 'Campfire', defaultVolume: 0.7, category: 'nature' },
      { soundId: 'river-stream', name: 'Mountain Stream', defaultVolume: 0.45, category: 'nature' },
      { soundId: 'wind-breeze', name: 'Night Wind', defaultVolume: 0.3, category: 'nature' },
    ],
  },
  {
    id: 'deep-flow',
    title: 'Deep Flow State',
    subtitle: 'Minimal Alpha Focus',
    description: 'Zero distractions. Calming alpha binaural frequencies blended with gentle ocean waves and warm vinyl hum.',
    category: 'focus',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    layers: [
      { soundId: 'binaural-beats', name: 'Alpha Waves', defaultVolume: 0.5, category: 'ambient' },
      { soundId: 'ocean-waves', name: 'Distant Ocean', defaultVolume: 0.4, category: 'nature' },
      { soundId: 'vinyl-crackle', name: 'Vinyl Dust', defaultVolume: 0.25, category: 'music' },
    ],
  },
];
