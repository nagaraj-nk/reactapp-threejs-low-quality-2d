import { useRef, useEffect, useState, useMemo } from 'react';
import kural1 from '../../scenes/kural-1.json';

const TRANSPARENT = '.';
const TAMIL_STACK = "'Noto Sans Tamil', 'Nirmala UI', 'Latha', sans-serif";

// --- scene model ----------------------------------------------------------

const lastKeyTime = (scene) => {
  const keyed = [...(scene.actors ?? []), ...(scene.texts ?? [])];
  const times = keyed.flatMap((a) =>
    Object.values(a.tracks ?? {}).flatMap((tr) => tr.map((k) => k.t)),
  );
  const capts = (scene.captions ?? []).map((c) => c.until ?? c.at);
  const all = [...times, ...capts];
  return all.length ? Math.max(...all) : 0;
};

// An explicit duration wins, so a scene can hold on its last frame. Without
// one, the scene runs exactly as long as its keyframes.
const durationOf = (scene) => {
  const explicit = scene.timeline?.duration;
  return explicit && explicit > 0 ? explicit : lastKeyTime(scene);
};

const toScenes = (raw) => (Array.isArray(raw.scenes) ? raw.scenes : [raw]);

const buildFilm = (scenes, name) => {
  let start = 0;
  const clips = scenes.map((scene) => {
    const duration = durationOf(scene);
    const clip = { scene, start, duration, end: start + duration, fps: scene.timeline?.fps ?? 12 };
    start += duration;
    return clip;
  });
  return {
    name,
    clips,
    duration: start,
    canvas: scenes[0]?.canvas ?? { width: 120, height: 64, unit: 10 },
  };
};

const clipAt = (film, t) =>
  film.clips.find((c) => t < c.end) ?? film.clips[film.clips.length - 1];

// --- sampling -------------------------------------------------------------

const sampleStep = (track, t) => {
  let value = track?.[0]?.v;
  for (const key of track ?? []) {
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

// Merge runs of same-colored pixels in a row into one rect. Fewer fills, and
// no hairline seams between adjacent blocks once they're scaled up.
const drawSpriteHD = (ctx, sprite, pose, x, y, faceRight, colors, unit) => {
  const rows = sprite.frames?.[pose];
  if (!rows) return;

  // Snap to whole device pixels so block edges stay crisp, while motion can
  // still land between scene pixels — that's what makes HD movement smooth.
  const snap = (v) => Math.round(v * unit) / unit;
  const ox = snap(x);
  const oy = snap(y);

  for (let row = 0; row < rows.length; row += 1) {
    const line = rows[row];
    let col = 0;

    while (col < line.length) {
      const ch = line[col];
      if (ch === TRANSPARENT || !colors[ch]) {
        col += 1;
        continue;
      }

      let run = 1;
      while (col + run < line.length && line[col + run] === ch) run += 1;

      const localX = col + sprite.offsetX;
      const px = faceRight
        ? ox + localX
        : ox + sprite.pivot - (localX + run - 1) - 1;

      ctx.fillStyle = colors[ch];
      ctx.fillRect(px, oy + row + sprite.offsetY, run, 1);
      col += run;
    }
  }
};

const drawBackground = (ctx, scene) => {
  for (const band of scene.background ?? []) {
    if (Array.isArray(band.gradient)) {
      const g = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
      g.addColorStop(0, band.gradient[0]);
      g.addColorStop(1, band.gradient[1]);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = band.color;
    }
    ctx.fillRect(band.x, band.y, band.w, band.h);
  }
};

const renderScene = (ctx, scene, t, unit) => {
  drawBackground(ctx, scene);

  for (const actor of scene.actors ?? []) {
    const { tracks } = actor;
    if (tracks.visible && !sampleStep(tracks.visible, t)) continue;

    const sprite = scene.sprites?.[actor.sprite];
    if (!sprite) continue;

    drawSpriteHD(
      ctx,
      sprite,
      sampleStep(tracks.pose, t),
      sampleLerp(tracks.x, t),
      sampleLerp(tracks.y, t),
      actor.faceRight,
      { ...scene.palette, ...actor.palette },
      unit,
    );
  }
};

// Text that lives *in* the scene — positioned in scene coordinates and
// keyframed like an actor, not pinned to the top or bottom like a caption.
// Abstract kurals have no imagery to draw; the letters themselves are the
// subject, so they need to move.
const drawTexts = (ctx, scene, t, unit) => {
  for (const item of scene.texts ?? []) {
    const tr = item.tracks ?? {};
    const opacity = tr.opacity ? sampleLerp(tr.opacity, t) : 1;
    if (opacity <= 0.01) continue;

    const size = (tr.size ? sampleLerp(tr.size, t) : 8) * unit;
    if (size <= 0.5) continue;

    // Scene units are converted here because text is typeset in CSS pixels;
    // scaling the glyphs by the unit transform would blur them.
    const x = sampleLerp(tr.x, t) * unit;
    const y = sampleLerp(tr.y, t) * unit;

    ctx.save();
    ctx.globalAlpha = Math.min(1, opacity);
    ctx.font = `700 ${size}px ${TAMIL_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (item.glow) {
      ctx.shadowColor = item.color ?? '#fde68a';
      ctx.shadowBlur = size * 0.5;
    }

    ctx.fillStyle = item.color ?? '#e2e8f0';
    ctx.fillText(item.text, x, y);
    ctx.restore();
  }
};

const FADE = 0.35;

// Captions live on the full-resolution layer, in real type — Tamil at 5px in
// the sprite grid would be unreadable mush. Drawn on the canvas rather than in
// DOM so they composite into a future video export.
const drawCaptions = (ctx, scene, t, cssW, cssH) => {
  for (const cap of scene.captions ?? []) {
    const until = cap.until ?? cap.at + 3;
    if (t < cap.at || t > until) continue;

    const inAlpha = Math.min(1, (t - cap.at) / FADE);
    const outAlpha = Math.min(1, (until - t) / FADE);
    const alpha = Math.max(0, Math.min(inAlpha, outAlpha));
    if (alpha <= 0.01) continue;

    const size = cap.size ?? 26;
    ctx.font = `600 ${size}px ${TAMIL_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = cssW / 2;
    const y = cap.pos === 'bottom' ? cssH - size * 1.9 : size * 1.9;
    const w = ctx.measureText(cap.text).width;
    const padX = size * 0.7;
    const padY = size * 0.55;

    ctx.globalAlpha = alpha;

    // A soft plate behind the text, so it stays legible over any scene.
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2 - padX, y - size / 2 - padY, w + padX * 2, size + padY * 2, size * 0.4);
    ctx.fill();

    ctx.fillStyle = cap.color ?? '#ffffff';
    ctx.fillText(cap.text, x, y);

    ctx.globalAlpha = 1;
  }
};

const fmt = (t) => `${t.toFixed(1)}s`;

// --- page -----------------------------------------------------------------

const HDPixels = () => {
  const canvasRef = useRef();
  const fileRef = useRef();
  const timeRef = useRef(0);
  const playingRef = useRef(true);

  const [scenes, setScenes] = useState(() => toScenes(kural1));
  const [title, setTitle] = useState(kural1.name ?? 'Untitled');
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [error, setError] = useState(null);
  const [fontsReady, setFontsReady] = useState(false);

  playingRef.current = playing;

  const film = useMemo(() => buildFilm(scenes, title), [scenes, title]);
  const { width, height } = film.canvas;
  const unit = film.canvas.unit ?? 10;
  const total = film.duration;

  const cssW = width * unit;
  const cssH = height * unit;

  // Canvas text falls back to a default face if it draws before the font is
  // loaded — unlike DOM, it won't re-render itself once the font arrives.
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      if (playingRef.current && total > 0) {
        timeRef.current = (timeRef.current + dt) % total;
        setTime(timeRef.current);
      }

      const clip = clipAt(film, Math.min(timeRef.current, total));
      if (clip) {
        const localT = timeRef.current - clip.start;
        const frame = Math.floor(localT * clip.fps) / clip.fps;

        // Scene units → device pixels, so sprites draw in scene coordinates.
        ctx.setTransform(dpr * unit, 0, 0, dpr * unit, 0, 0);
        renderScene(ctx, clip.scene, frame, unit);

        // Text and captions are typeset in CSS pixels, not scene pixels, and
        // follow continuous time so their fades stay smooth at 12fps.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawTexts(ctx, clip.scene, localT, unit);
        drawCaptions(ctx, clip.scene, localT, cssW, cssH);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [film, total, unit, cssW, cssH, fontsReady]);

  const seek = (t) => {
    timeRef.current = t;
    setTime(t);
  };

  const handleExport = () => {
    const doc = scenes.length === 1 ? scenes[0] : { name: title, scenes };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <div className="max-w-5xl mx-auto px-4 py-10">
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
          {cssW}×{cssH} HD · from a {width}×{height} scene · {film.clips.length}{' '}
          {film.clips.length === 1 ? 'scene' : 'scenes'} · {fmt(total)}
        </p>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-3">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.1c.765-1.36 2.72-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {error}
          </p>
        )}

        <canvas
          ref={canvasRef}
          style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
          className="block rounded-lg bg-gray-100 dark:bg-gray-900"
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
      </div>
    </div>
  );
};

export default HDPixels;
