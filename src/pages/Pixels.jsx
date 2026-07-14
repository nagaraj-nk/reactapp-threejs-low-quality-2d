import { useRef, useEffect } from 'react';

// 120 x 6 = 720px, which is exactly the card's inner width.
const WIDTH = 120;
const HEIGHT = 64;
const SCALE = 6;
const GROUND_Y = 46;
const FRAMES_PER_PHASE = 12;
// Leaves the two kids ~18px apart, so the blades cross at mid-canvas.
const MARGIN = 37;

// Walk the pair through: ready stance -> wind up -> strike -> blades locked.
const GUARD = 0;
const WINDUP = 1;
const STRIKE = 2;
const CLASH = 3;

const SKY = '#7dd3fc';
const GROUND = '#4ade80';
const DIRT = '#78350f';
const HAIR_A = '#3f2412';
const HAIR_B = '#facc15';
const SKIN = '#fcd5b5';
const SHIRT_A = '#ef4444';
const SHIRT_B = '#8b5cf6';
const PANTS = '#1d4ed8';
const SHOE = '#1f2937';
const BLADE = '#d1d5db';
const HILT = '#92400e';
const SPARK = '#fef08a';

const KID_W = 12;
const KID_H = 23;

// Sword in the kid's local space, always drawn facing right.
// The caller mirrors it for the kid on the other side.
const drawSword = (ctx, phase) => {
  if (phase === GUARD) {
    ctx.fillStyle = BLADE;
    ctx.fillRect(12, 1, 2, 10);
    ctx.fillStyle = HILT;
    ctx.fillRect(11, 11, 4, 1);
    ctx.fillRect(12, 12, 2, 2);
    return;
  }

  if (phase === WINDUP) {
    // Cocked back over the shoulder, blade angled up and behind.
    ctx.fillStyle = HILT;
    ctx.fillRect(2, 10, 2, 2);
    ctx.fillStyle = BLADE;
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(0, 6, 2, 2);
    ctx.fillRect(-1, 4, 2, 2);
    ctx.fillRect(-2, 2, 2, 2);
    return;
  }

  // STRIKE and CLASH: arm extended, blade level and thrust forward.
  ctx.fillStyle = HILT;
  ctx.fillRect(11, 9, 2, 4);
  ctx.fillStyle = BLADE;
  ctx.fillRect(13, 10, 12, 2);
};

// Side-on pixel kid drawn from its top-left corner in local space.
const drawKidBody = (ctx, phase, hair, shirt) => {
  ctx.fillStyle = hair;
  ctx.fillRect(3, 0, 8, 3);
  ctx.fillStyle = SKIN;
  ctx.fillRect(3, 3, 8, 5);
  ctx.fillStyle = SHOE;
  ctx.fillRect(8, 5, 1, 1);

  ctx.fillStyle = shirt;
  ctx.fillRect(3, 8, 8, 8);

  // Sword arm follows the blade; back arm stays tucked for balance.
  ctx.fillStyle = SKIN;
  if (phase === WINDUP) {
    ctx.fillRect(3, 9, 2, 4);
  } else if (phase === GUARD) {
    ctx.fillRect(10, 9, 2, 5);
  } else {
    ctx.fillRect(10, 10, 3, 2);
  }

  // Braced fighting stance: front foot forward, back leg planted.
  ctx.fillStyle = PANTS;
  ctx.fillRect(2, 16, 3, 5);
  ctx.fillRect(8, 16, 3, 5);
  ctx.fillStyle = SHOE;
  ctx.fillRect(1, 21, 4, 2);
  ctx.fillRect(8, 21, 4, 2);
};

const drawKid = (ctx, x, y, phase, hair, shirt, faceRight) => {
  ctx.save();
  if (faceRight) {
    ctx.translate(x, y);
  } else {
    // Mirror horizontally so the same artwork faces left.
    ctx.translate(x + KID_W, y);
    ctx.scale(-1, 1);
  }
  drawKidBody(ctx, phase, hair, shirt);
  drawSword(ctx, phase);
  ctx.restore();
};

const Pixels = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    let tick = 0;
    let frame;

    const draw = () => {
      tick += 1;
      const phase = Math.floor(tick / FRAMES_PER_PHASE) % 4;

      // Both kids lunge in as the blades come together, then hold.
      const lunge = phase === STRIKE || phase === CLASH ? 2 : 0;
      const leftX = MARGIN + lunge;
      const rightX = WIDTH - KID_W - MARGIN - lunge;
      const kidY = GROUND_Y - KID_H;

      ctx.fillStyle = SKY;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, GROUND_Y, WIDTH, 3);
      ctx.fillStyle = DIRT;
      ctx.fillRect(0, GROUND_Y + 3, WIDTH, HEIGHT - GROUND_Y - 3);

      drawKid(ctx, leftX, kidY, phase, HAIR_A, SHIRT_A, true);
      drawKid(ctx, rightX, kidY, phase, HAIR_B, SHIRT_B, false);

      // Blades cross mid-screen on the clash: throw a spark off them.
      if (phase === CLASH) {
        const cx = WIDTH / 2;
        ctx.fillStyle = SPARK;
        ctx.fillRect(cx - 2, kidY + 8, 4, 2);
        ctx.fillRect(cx - 1, kidY + 6, 2, 2);
        ctx.fillRect(cx - 3, kidY + 12, 2, 2);
        ctx.fillRect(cx + 1, kidY + 12, 2, 2);
      }

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Pixels
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Two kids sword fighting on a {WIDTH}×{HEIGHT} canvas, scaled {SCALE}×.
        </p>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: WIDTH * SCALE,
            height: HEIGHT * SCALE,
            imageRendering: 'pixelated',
          }}
          className="max-w-full rounded-md"
        />
      </div>
    </div>
  );
};

export default Pixels;
