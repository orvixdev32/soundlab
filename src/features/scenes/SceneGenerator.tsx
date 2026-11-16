import React, { useState, useRef } from 'react';
import type { Scene, SoundLayerConfig } from '../../types/scene';
import { availableSounds } from '../../data/sounds';
import styles from './SceneGenerator.module.css';

interface SceneGeneratorProps {
  onSceneCreated: (newScene: Scene) => void;
}

// Набір надійних якісних атмосферних пресетів
const CURATED_PRESETS: { label: string; url: string }[] = [
  { label: 'Desert Dunes', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pine Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Night Stars', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cozy Fireplace', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ocean Twilight', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rainy City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80' },
];

export const SceneGenerator: React.FC<SceneGeneratorProps> = ({ onSceneCreated }) => {
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'focus' | 'relax' | 'nature' | 'urban'>('nature');
  const [keyword, setKeyword] = useState<string>('desert');

  // Cover image states
  const [coverUrl, setCoverUrl] = useState<string>(CURATED_PRESETS[0].url);
  const [isSearchingImage, setIsSearchingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected sounds IDs map
  const [selectedSoundIds, setSelectedSoundIds] = useState<string[]>([
    'rain-gentle',
    'wind-breeze',
  ]);

  const handleToggleSound = (soundId: string) => {
    setSelectedSoundIds((prev) =>
      prev.includes(soundId) ? prev.filter((id) => id !== soundId) : [...prev, soundId]
    );
  };

  // Пошук фото через Wikipedia Wikimedia API за ключовим словом
  const fetchImageByKeyword = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingImage(true);
    setImageError(null);

    try {
      const endpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        query.trim()
      )}&gsrlimit=3&prop=pageimages&piprop=original&format=json&origin=*`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data?.query?.pages) {
        const pages = Object.values(data.query.pages) as Array<{
          original?: { source: string };
        }>;
        const pageWithImg = pages.find((p) => p.original?.source);
        if (pageWithImg?.original?.source) {
          setCoverUrl(pageWithImg.original.source);
          setIsSearchingImage(false);
          return;
        }
      }

      // Якщо нічого специфічного не знайдено — fallback на випадковий picsum
      setCoverUrl(`https://picsum.photos/1200/800?random=${Date.now()}`);
    } catch {
      setImageError('Failed to fetch image. Falling back to default.');
      setCoverUrl(CURATED_PRESETS[0].url);
    } finally {
      setIsSearchingImage(false);
    }
  };

  // Під час втрати фокусу з назви або теми
  const handleThemeBlur = () => {
    const term = keyword.trim() || title.trim();
    if (term) {
      fetchImageByKeyword(term);
    }
  };

  // Завантаження власного фото з диска користувача (працює без бекенду)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setCoverUrl(localUrl);
      setImageError(null);
    }
  };

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedSoundIds.length === 0) return;

    const layers: SoundLayerConfig[] = selectedSoundIds.map((id) => {
      const sound = availableSounds.find((s) => s.id === id);
      return {
        soundId: id,
        name: sound?.name || id,
        defaultVolume: sound?.defaultVolume || 0.6,
        category: sound?.category,
      };
    });

    const newScene: Scene = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom Atmosphere',
      description:
        description.trim() ||
        `Handcrafted soundscape featuring ${layers.map((l) => l.name).join(', ')}.`,
      category,
      coverImage: coverUrl,
      layers,
    };

    onSceneCreated(newScene);
  };

  return (
    <div className={styles.generatorContainer}>
      <div className={styles.header}>
        <span className={styles.tagline}>Constructor</span>
        <h2 className={styles.title}>Create Atmosphere</h2>
        <p className={styles.subtitle}>
          Mix your favorite sounds, choose a mood, and select or generate a stunning backdrop.
        </p>
      </div>

      <form className={styles.formGrid} onSubmit={handleCreateScene}>
        {/* Left Side: Metadata & Background Generator */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>1. Scene Identity</h3>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="scene-title">
              Scene Name *
            </label>
            <input
              id="scene-title"
              type="text"
              required
              placeholder="e.g. Desert Oasis, Rainy Tokyo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (!keyword && title.trim()) {
                  setKeyword(title.trim());
                  fetchImageByKeyword(title.trim());
                }
              }}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="scene-subtitle">
              Subtitle
            </label>
            <input
              id="scene-subtitle"
              type="text"
              placeholder="e.g. Warm Wind & Golden Sands"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="scene-desc">
              Description (optional)
            </label>
            <textarea
              id="scene-desc"
              placeholder="Describe your atmosphere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="scene-category">
              Mood Category
            </label>
            <select
              id="scene-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'focus' | 'relax' | 'nature' | 'urban')
              }
              className={styles.select}
            >
              <option value="nature">Nature</option>
              <option value="focus">Focus</option>
              <option value="relax">Relax</option>
              <option value="urban">Urban</option>
            </select>
          </div>

          {/* Theme search input */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="scene-keyword">
              Search Backdrop by Word
            </label>
            <div className={styles.searchRow}>
              <input
                id="scene-keyword"
                type="text"
                placeholder="e.g. desert, dunes, stars, forest..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onBlur={handleThemeBlur}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.searchBtn}
                onClick={() => fetchImageByKeyword(keyword)}
                disabled={isSearchingImage}
              >
                {isSearchingImage ? 'Searching...' : 'Find Photo'}
              </button>
            </div>
          </div>

          {/* Image Preview */}
          <div className={styles.imagePreviewWrapper}>
            <img
              src={coverUrl}
              alt="Scene preview"
              className={styles.previewImg}
              onError={() => {
                // Якщо картинка не завантажилась — підставляємо надійний дефолт
                setCoverUrl(CURATED_PRESETS[0].url);
              }}
            />
            {isSearchingImage && (
              <div className={styles.imageOverlay}>Finding live backdrop...</div>
            )}
          </div>
          {imageError && <div className={styles.errorText}>{imageError}</div>}

          {/* Preset Buttons & Custom File Upload */}
          <div className={styles.presetSection}>
            <span className={styles.presetLabel}>Quick Presets:</span>
            <div className={styles.presetChips}>
              {CURATED_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`${styles.presetBtn} ${coverUrl === p.url ? styles.activePreset : ''}`}
                  onClick={() => setCoverUrl(p.url)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.uploadRow}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <span>📁 Upload Your Own Photo</span>
            </button>
          </div>
        </div>

        {/* Right Side: Sound Layers Selector */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>
            2. Choose Sound Layers ({selectedSoundIds.length} selected)
          </h3>

          <div className={styles.soundList}>
            {availableSounds.map((sound) => {
              const isSelected = selectedSoundIds.includes(sound.id);
              return (
                <label
                  key={sound.id}
                  className={`${styles.soundItem} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.soundInfo}>
                    <span className={styles.soundName}>{sound.name}</span>
                    <span className={styles.soundCategory}>{sound.category}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSound(sound.id)}
                    className={styles.checkbox}
                  />
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!title.trim() || selectedSoundIds.length === 0}
          >
            <span>Create & Enter Scene →</span>
          </button>
          <div className={styles.hint}>
            {!title.trim()
              ? 'Enter a scene name to continue'
              : selectedSoundIds.length === 0
              ? 'Select at least 1 sound layer'
              : 'Your new scene will open directly in the mixer'}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SceneGenerator;
