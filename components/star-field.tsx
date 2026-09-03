type Star = { x: number; y: number; r: number; o: number; delay: number; twinkle: boolean };

/** Small deterministic PRNG so the sky looks identical on every render. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const y = rand() ** 1.35 * 720; // denser toward the zenith, thinning toward the horizon
    const size = rand();
    return {
      x: rand() * 1000,
      y,
      r: 0.55 + size * size * 1.9,
      o: 0.32 + rand() * 0.62,
      delay: -rand() * 9,
      twinkle: rand() < 0.28,
    };
  });
}

const STARS = makeStars(210, 20260903);

export function StarField() {
  return (
    <svg
      className="star-field"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {STARS.map((star, index) => (
        <circle
          key={index}
          className={star.twinkle ? 'star twinkle' : 'star'}
          cx={star.x.toFixed(1)}
          cy={star.y.toFixed(1)}
          r={star.r.toFixed(2)}
          style={{ opacity: star.o, animationDelay: `${star.delay.toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}
