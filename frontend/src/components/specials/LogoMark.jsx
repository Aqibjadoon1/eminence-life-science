/**
 * LogoMark — Animated SVG recreation of the Eminence Life Science logo.
 * 
 * Three leaves (left, right, centre) draw in sequentially via stroke-dashoffset,
 * then the 4-point star sparkle pulses once on load.
 * 
 * Props:
 *   size     — px, controls viewBox scale (default 120)
 *   animated — boolean, enables entrance animation (default true)
 *   color    — 'gold' (default) | 'white'
 */
import styles from './LogoMark.module.css';

const GOLD_GRADIENT_ID  = 'logoGold';
const GOLD_SHIMMER_ID   = 'logoShimmer';

export default function LogoMark({ size = 120, animated = true, color = 'gold' }) {
  const isGold = color === 'gold';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={animated ? styles.logoAnimated : ''}
      role="img"
    >
      <defs>
        {/* Metallic gold gradient matching brand token */}
        <linearGradient id={GOLD_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8CE8E" />
          <stop offset="45%"  stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#8A6A28" />
        </linearGradient>

        {/* Shimmer sweep — used on hover */}
        <linearGradient id={GOLD_SHIMMER_ID} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8A6A28"  />
          <stop offset="40%"  stopColor="#C9A24B"  />
          <stop offset="55%"  stopColor="#F5E4A8"  />
          <stop offset="70%"  stopColor="#C9A24B"  />
          <stop offset="100%" stopColor="#8A6A28"  />
        </linearGradient>
      </defs>

      {/* ── Left leaf ─────────────────────────────────────── */}
      <path
        d="M30 82 C18 68, 22 46, 38 36 C32 52, 38 66, 52 72 C44 76, 36 80, 30 82Z"
        fill={isGold ? `url(#${GOLD_GRADIENT_ID})` : 'white'}
        className={animated ? styles.leafLeft : ''}
      />

      {/* ── Right leaf ────────────────────────────────────── */}
      <path
        d="M90 82 C102 68, 98 46, 82 36 C88 52, 82 66, 68 72 C76 76, 84 80, 90 82Z"
        fill={isGold ? `url(#${GOLD_GRADIENT_ID})` : 'white'}
        className={animated ? styles.leafRight : ''}
      />

      {/* ── Centre leaf (tallest) ─────────────────────────── */}
      <path
        d="M60 86 C48 72, 48 44, 60 22 C72 44, 72 72, 60 86Z"
        fill={isGold ? `url(#${GOLD_GRADIENT_ID})` : 'white'}
        className={animated ? styles.leafCenter : ''}
      />

      {/* ── 4-point star sparkle ──────────────────────────── */}
      <path
        d="M60 14 L62 19 L67 21 L62 23 L60 28 L58 23 L53 21 L58 19 Z"
        fill={isGold ? `url(#${GOLD_GRADIENT_ID})` : 'white'}
        className={animated ? styles.sparkle : ''}
      />
    </svg>
  );
}
