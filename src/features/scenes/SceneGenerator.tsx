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
      subtitle: subtitle.trim() || 'Custom Acoustic Space',
      description:
        description.trim() ||
        `Atmosphere engineered with ${layers.map((l) => l.name).join(', ')}.`,
      category,
      coverImage: coverUrl,
      layers,
    };

    onSceneCreated(newScene);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.kicker}>Atelier / Scene Synthesis</span>
        <h1 className={styles.title}>Construct custom acoustic chamber</h1>
        <p className={styles.subtitle}>
          Assemble bespoke multi-track environments by combining acoustic layers, mood archetypes,
          and atmospheric visual backdrops.
        </p>
      </header>

      <form className={styles.workGrid} onSubmit={handleCreateScene}>
        {/* Module 1: Architecture & Visual Scenery */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Environment Blueprint</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="scene-title">
              Chamber Identifier *
            </label>
            <input
              id="scene-title"
              type="text"
              required
              placeholder="e.g. Nordic Fjords, Tokyo Midnight..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (!keyword && title.trim()) {
                  setKeyword(title.trim());
                  fetchImageByKeyword(title.trim());
                }
              }}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="scene-subtitle">
              Atmospheric Subtitle
            </label>
            <input
              id="scene-subtitle"
              type="text"
              placeholder="e.g. Dense Fog & Low Frequency Rain"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="scene-desc">
              Curator Notes (Optional)
            </label>
            <textarea
              id="scene-desc"
              placeholder="Atmospheric narrative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.fieldTextarea}
              rows={2}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="scene-category">
              Mood Archetype
            </label>
            <select
              id="scene-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'focus' | 'relax' | 'nature' | 'urban')
              }
              className={styles.fieldSelect}
            >
              <option value="nature">Nature / Organic</option>
              <option value="focus">Focus / Intellectual</option>
              <option value="relax">Relax / Restorative</option>
              <option value="urban">Urban / Architectural</option>
            </select>
          </div>

          {/* Visual Scenery Query */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="scene-keyword">
              Query Backdrop By Keyword
            </label>
            <div className={styles.searchBar}>
              <input
                id="scene-keyword"
                type="text"
                placeholder="e.g. dunes, fog, rain..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={styles.fieldInput}
              />
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => fetchImageByKeyword(keyword)}
                disabled={isSearchingImage}
              >
                {isSearchingImage ? 'Searching' : 'Search Canvas'}
              </button>
            </div>
          </div>

          {/* Scenery Viewport */}
          <div className={styles.visualViewport}>
            <img
              src={coverUrl}
              alt="Canvas Preview"
              className={styles.viewportImg}
              onError={() => setCoverUrl(CURATED_PRESETS[0].url)}
            />
            {isSearchingImage && (
              <div className={styles.viewportOverlay}>Resolving Media Canvas...</div>
            )}
          </div>

          {/* Presets & Local Upload */}
          <div className={styles.presetBar}>
            {CURATED_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`${styles.presetChip} ${coverUrl === p.url ? styles.selected : ''}`}
                onClick={() => setCoverUrl(p.url)}
              >
                {p.label}
              </button>
            ))}
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
            className={styles.uploadTrigger}
            onClick={() => fileInputRef.current?.click()}
          >
            ↑ Mount Custom Image File
          </button>
        </div>

        {/* Module 2: Channel Matrix */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            2. Sound Layer Matrix ({selectedSoundIds.length} Selected)
          </h2>

          <div className={styles.matrixGrid}>
            {availableSounds.map((sound) => {
              const isSelected = selectedSoundIds.includes(sound.id);
              return (
                <label
                  key={sound.id}
                  className={`${styles.matrixItem} ${isSelected ? styles.active : ''}`}
                >
                  <div className={styles.trackData}>
                    <span className={styles.trackTitle}>{sound.name}</span>
                    <span className={styles.trackCategory}>{sound.category}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSound(sound.id)}
                    className={styles.matrixCheck}
                  />
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!title.trim() || selectedSoundIds.length === 0}
          >
            Synthesize & Engage Environment →
          </button>
        </div>
      </form>
    </div>
  );
};

export default SceneGenerator;
