import React, { useState, useRef } from 'react';
import type { Scene, SoundLayerConfig } from '../../types/scene';
import { availableSounds } from '../../data/sounds';
import styles from './SceneGenerator.module.css';

interface SceneGeneratorProps {
  onSceneCreated: (newScene: Scene) => void;
}

const CURATED_PRESETS: { label: string; url: string }[] = [
  { label: 'Dunes', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Misty Pine', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Deep Cosmos', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Warm Hearth', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Solitary Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Night City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80' },
];

export const SceneGenerator: React.FC<SceneGeneratorProps> = ({ onSceneCreated }) => {
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'focus' | 'relax' | 'nature' | 'urban'>('nature');
  const [keyword, setKeyword] = useState<string>('desert');

  // Canvas visual state
  const [coverUrl, setCoverUrl] = useState<string>(CURATED_PRESETS[0].url);
  const [isSearchingImage, setIsSearchingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected tracks matrix
  const [selectedSoundIds, setSelectedSoundIds] = useState<string[]>([
    'rain-gentle',
    'wind-breeze',
  ]);

  const handleToggleSound = (soundId: string) => {
    setSelectedSoundIds((prev) =>
      prev.includes(soundId) ? prev.filter((id) => id !== soundId) : [...prev, soundId]
    );
  };

  // Wikipedia Open Media Search
  const fetchImageByKeyword = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingImage(true);

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

      setCoverUrl(`https://picsum.photos/1200/800?random=${Date.now()}`);
    } catch {
      setCoverUrl(CURATED_PRESETS[0].url);
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setCoverUrl(localUrl);
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
      subtitle: subtitle.trim() || 'Custom soundscape',
      description:
        description.trim() ||
        `Atmosphere with ${layers.map((l) => l.name).join(', ')}.`,
      category,
      coverImage: coverUrl,
      layers,
    };

    onSceneCreated(newScene);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create a Scene</h1>
        <p className={styles.subtitle}>
          Assemble your own custom environment by combining sound layers and choosing a cover image.
        </p>
      </div>

      <form className={styles.formGrid} onSubmit={handleCreateScene}>
        {/* Left Column: Scene Metadata & Cover */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Scene Information</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scene-title">
              Scene Name *
            </label>
            <input
              id="scene-title"
              type="text"
              required
              placeholder="e.g. Autumn Forest, Tokyo Rainy Night..."
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

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scene-subtitle">
              Subtitle / Mood
            </label>
            <input
              id="scene-subtitle"
              type="text"
              placeholder="e.g. Distant wind with soft rain"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scene-desc">
              Description (optional)
            </label>
            <textarea
              id="scene-desc"
              placeholder="Brief notes about this atmosphere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scene-category">
              Category
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

          <hr className={styles.divider} />

          <h2 className={styles.panelTitle}>Cover Image</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scene-keyword">
              Search by Keyword
            </label>
            <div className={styles.searchRow}>
              <input
                id="scene-keyword"
                type="text"
                placeholder="e.g. forest, mountains, coffee..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.searchBtn}
                onClick={() => fetchImageByKeyword(keyword)}
                disabled={isSearchingImage}
              >
                {isSearchingImage ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className={styles.previewContainer}>
            <img
              src={coverUrl}
              alt="Cover preview"
              className={styles.previewImg}
              onError={() => setCoverUrl(CURATED_PRESETS[0].url)}
            />
            {isSearchingImage && (
              <div className={styles.previewOverlay}>Searching Wikipedia images...</div>
            )}
          </div>

          <div className={styles.presetSection}>
            <span className={styles.presetLabel}>Or select a preset:</span>
            <div className={styles.presetButtons}>
              {CURATED_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={`${styles.presetChip} ${coverUrl === p.url ? styles.presetChipActive : ''}`}
                  onClick={() => setCoverUrl(p.url)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

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
            Upload image from computer
          </button>
        </div>

        {/* Right Column: Sound Layers Checklist */}
        <div className={styles.panel}>
          <div className={styles.panelHeaderRow}>
            <h2 className={styles.panelTitle}>2. Choose Sound Layers</h2>
            <span className={styles.selectionCount}>
              {selectedSoundIds.length} {selectedSoundIds.length === 1 ? 'sound' : 'sounds'} selected
            </span>
          </div>

          <p className={styles.panelHelp}>
            Select the audio layers you want to include in this soundscape. You can adjust individual volumes in the player.
          </p>

          <div className={styles.soundsList}>
            {availableSounds.map((sound) => {
              const isSelected = selectedSoundIds.includes(sound.id);
              return (
                <label
                  key={sound.id}
                  className={`${styles.soundItem} ${isSelected ? styles.soundItemActive : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSound(sound.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.soundMeta}>
                    <span className={styles.soundName}>{sound.name}</span>
                    <span className={styles.soundCategory}>{sound.category}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className={styles.submitSection}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!title.trim() || selectedSoundIds.length === 0}
            >
              Create Scene and Open Player →
            </button>
            {selectedSoundIds.length === 0 && (
              <span className={styles.validationHint}>
                Please select at least 1 sound layer.
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SceneGenerator;
