import { useRef, useEffect, useState, useMemo } from 'react';
import defaultScene from '../data/scene.json';

const TRANSPARENT = '.';

// --- scene model ----------------------------------------------------------

const trackTimes = (scene) =>
  (scene.actors ?? []).flatMap((actor) =>
    Object.values(actor.tracks ?? {}).flatMap((track) =>
      track.map((key) => key.t),
    ),
  );

const lastKeyTime = (scene) => {
  const times = trackTimes(scene);
  return times.length ? Math.max(...times) : 0;
};

// An explicit duration wins, so a scene can hold on its last frame — the
// final beat after the last keyframe is often the whole point. Without one,
// the scene runs exactly as long as its keyframes.
const durationOf = (scene) => {
  const last = lastKeyTime(scene);
  const explicit = scene.timeline?.duration;
  return explicit && explicit > 0 ? explicit : last;
};

// Accepts either a single scene or a { scenes: [...] } document.
const toScenes = (raw) => (Array.isArray(raw.scenes) ? raw.scenes : [raw]);

// Lay the scenes end to end and derive the total length from them.
const buildFilm = (scenes, name) => {
  let start = 0;
  const clips = scenes.map((scene) => {
    const duration = durationOf(scene);
    const clip = {
      scene,
      start,
      duration,
      end: start + duration,
      fps: scene.timeline?.fps ?? 12,
      // Keyframes past an explicit duration are never sampled.
      dropped: Math.max(0, lastKeyTime(scene) - duration),
    };
    start += duration;
    return clip;
  });

  return {
    name,
    clips,
    duration: start,
    canvas: scenes[0]?.canvas ?? { width: 120, height: 64, scale: 6 },
  };
};

const clipAt = (film, t) => {
  for (const clip of film.clips) {
    if (t < clip.end) return clip;
  }
  return film.clips[film.clips.length - 1];
};

// --- sampling -------------------------------------------------------------

// Positions tween between keyframes; poses and visibility snap and hold.
// Blending a sprite halfway between two poses would just look broken.
const sampleStep = (track, t) => {
  let value = track[0]?.v;
  for (const key of track) {
    if (key.t > t) break;
    value = key.v;
  }
  return value;
};

const sampleLerp = (track, t) => {
  if (!track?.length) return 0;
  if (track.length === 1) return track[0].v;

  let prev = track[0];
  for (const key of track) {
    if (key.t > t) {
      const span = key.t - prev.t;
      if (span <= 0) return key.v;
      return prev.v + (key.v - prev.v) * ((t - prev.t) / span);
    }
    prev = key;
  }
  return prev.v;
};

// --- rendering ------------------------------------------------------------

const drawSprite = (ctx, sprite, pose, x, y, faceRight, colors) => {
  const rows = sprite.frames[pose];
  if (!rows) return;

  for (let row = 0; row < rows.length; row += 1) {
    for (let col = 0; col < rows[row].length; col += 1) {
      const ch = rows[row][col];
      if (ch === TRANSPARENT) continue;

      const color = colors[ch];
      if (!color) continue;

      const localX = col + sprite.offsetX;
      // Facing left mirrors around the body, not the wider weapon frame box.
      const px = faceRight ? x + localX : x + sprite.pivot - localX - 1;
      const py = y + row + sprite.offsetY;

      ctx.fillStyle = color;
      // Tweened positions are fractional; floor them or the canvas
      // antialiases the edges and the pixel art goes soft.
      ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
    }
  }
};

const renderScene = (ctx, scene, t) => {
  for (const band of scene.background ?? []) {
    ctx.fillStyle = band.color;
    ctx.fillRect(band.x, band.y, band.w, band.h);
  }

  for (const actor of scene.actors ?? []) {
    const { tracks } = actor;
    if (tracks.visible && !sampleStep(tracks.visible, t)) continue;

    const sprite = scene.sprites?.[actor.sprite];
    if (!sprite) continue;

    drawSprite(
      ctx,
      sprite,
      sampleStep(tracks.pose, t),
      sampleLerp(tracks.x, t),
      sampleLerp(tracks.y, t),
      actor.faceRight,
      { ...scene.palette, ...actor.palette },
    );
  }
};

const fmt = (t) => `${t.toFixed(1)}s`;

// --- page -----------------------------------------------------------------

const Pixels = () => {
  const canvasRef = useRef();
  const fileRef = useRef();
  const timeRef = useRef(0);
  const playingRef = useRef(true);

  const [scenes, setScenes] = useState(() => toScenes(defaultScene));
  const [title, setTitle] = useState(defaultScene.name ?? 'Untitled');
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [error, setError] = useState(null);

  playingRef.current = playing;

  const film = useMemo(() => buildFilm(scenes, title), [scenes, title]);
  const { width, height, scale } = film.canvas;
  const total = film.duration;

  const active = clipAt(film, Math.min(time, total));
  const dropped = film.clips.filter((c) => c.dropped > 0);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      if (playingRef.current && total > 0) {
        let next = timeRef.current + dt;
        if (next >= total) next = next % total;
        timeRef.current = next;
        setTime(next);
      }

      const clip = clipAt(film, Math.min(timeRef.current, total));
      if (clip) {
        // Quantize to the clip's fps so playback has the cadence of the
        // animation, not the 60Hz cadence of the monitor.
        const localT = timeRef.current - clip.start;
        const frame = Math.floor(localT * clip.fps) / clip.fps;
        renderScene(ctx, clip.scene, frame);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [film, total]);

  const seek = (t) => {
    timeRef.current = t;
    setTime(t);
  };

  const handleExport = () => {
    const doc = { name: title, scenes };
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import one file with many scenes, or many single-scene files at once.
  // They queue up in order and the total length follows.
  const handleImport = async (e) => {
    const files = [...(e.target.files ?? [])];
    if (!files.length) return;

    try {
      const loaded = [];
      let firstName = null;

      for (const file of files) {
        const raw = JSON.parse(await file.text());
        firstName ??= raw.name ?? file.name.replace(/\.json$/i, '');

        for (const scene of toScenes(raw)) {
          if (!scene.sprites || !scene.actors) {
            throw new Error(`${file.name}: missing sprites or actors.`);
          }
          loaded.push(scene);
        }
      }

      setScenes(loaded);
      setTitle(files.length === 1 ? firstName : `${loaded.length} scenes`);
      seek(0);
      setError(null);
    } catch (err) {
      setError(`Could not load: ${err.message}`);
    }

    e.target.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="flex-1 min-w-0 truncate text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          <button
            onClick={() => fileRef.current.click()}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Export
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            multiple
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {width}×{height} · {film.clips.length}{' '}
          {film.clips.length === 1 ? 'scene' : 'scenes'} · {fmt(total)} total ·
          scale {scale}×
        </p>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-3">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.1c.765-1.36 2.72-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {error}
          </p>
        )}

        {dropped.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mb-3">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.1c.765-1.36 2.72-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {dropped.length === 1 ? 'A scene has' : 'Scenes have'} keyframes past
            the set duration — they never play.
          </p>
        )}

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: width * scale,
            height: height * scale,
            imageRendering: 'pixelated',
          }}
          className="max-w-full rounded-md"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setPlaying((p) => !p)}
            title={playing ? 'Pause' : 'Play'}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {playing ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={total || 1}
            step={0.05}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 min-w-0 accent-blue-600"
          />

          <span className="shrink-0 text-xs tabular-nums text-gray-400">
            {fmt(time)} / {fmt(total)}
          </span>
        </div>

        {film.clips.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {film.clips.map((clip, i) => (
              <button
                key={i}
                onClick={() => seek(clip.start)}
                title={`Jump to ${fmt(clip.start)}`}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  clip === active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {clip.scene.name ?? `Scene ${i + 1}`}
                <span className="opacity-60"> · {fmt(clip.duration)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pixels;
