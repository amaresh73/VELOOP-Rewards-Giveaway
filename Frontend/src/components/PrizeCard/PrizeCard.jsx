import { useState } from 'react';
import { Link } from 'react-router-dom';

const PRIZE_MAP = {
  'iphone-15-pro': { img: '/images/iphone_15_pro.jpg', fallback: '/images/ref_iphone_15_pro.png' },
  'airpods': { img: '/images/airpods_pro_2.jpg', fallback: '/images/ref_airpods_pro_2.png' },
  'airpods-pro-2': { img: '/images/airpods_pro_2.jpg', fallback: '/images/ref_airpods_pro_2.png' },
  'playstation-5-bundle': { img: '/images/ps5_bundle_spotlight.jpg', fallback: '/images/ref_ps5_bundle.png' },
  'ps5': { img: '/images/ps5_bundle_spotlight.jpg', fallback: '/images/ref_ps5_bundle.png' },
  'amazon-2000': { img: '/images/amazon_gift_card.jpg', fallback: '/images/ref_amazon_gift_card.png' },
  'amazon-500': { img: '/images/amazon_gift_card.jpg', fallback: '/images/ref_amazon_gift_card.png' },
  'amazon-20': { img: '/images/amazon_gift_card.jpg', fallback: '/images/ref_amazon_gift_card.png' },
  'apple-watch': { img: '/images/apple_watch_series_9.jpg', fallback: '/images/ref_apple_watch_s9.png' },
  'apple-watch-series-9': { img: '/images/apple_watch_series_9.jpg', fallback: '/images/ref_apple_watch_s9.png' },
  'samsung-galaxy-s24': { img: '/images/samsung_galaxy_s24.jpg', fallback: '/images/ref_samsung_galaxy_s24.png' },
  's24': { img: '/images/samsung_galaxy_s24.jpg', fallback: '/images/ref_samsung_galaxy_s24.png' },
  'macbook-air-m2': { img: '/images/macbook_air_m2.png', fallback: '/images/ps5_bundle_spotlight.jpg' },
  'nike-gift-card': { img: '/images/nike_gift_card.png', fallback: '/images/amazon_gift_card.jpg' }
};

// Category color map
const CAT_COLORS = {
  'gaming': { primary: '#c084fc', glow: 'rgba(192,132,252,0.45)', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
  'gift': { primary: '#fbbf24', glow: 'rgba(251,191,36,0.45)', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  'card': { primary: '#fbbf24', glow: 'rgba(251,191,36,0.45)', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  'lifestyle': { primary: '#f87171', glow: 'rgba(248,113,113,0.45)', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  'audio': { primary: '#38bdf8', glow: 'rgba(56,189,248,0.45)', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
  'wearable': { primary: '#34d399', glow: 'rgba(52,211,153,0.45)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  'default': { primary: '#a78bfa', glow: 'rgba(167,139,250,0.45)', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
};

function getCatColor(category = '', badge = '') {
  const s = (category + ' ' + badge).toLowerCase();
  if (s.includes('gaming') || s.includes('console')) return CAT_COLORS.gaming;
  if (s.includes('gift') || s.includes('card')) return CAT_COLORS.gift;
  if (s.includes('lifestyle') || s.includes('travel')) return CAT_COLORS.lifestyle;
  if (s.includes('audio')) return CAT_COLORS.audio;
  if (s.includes('wearable') || s.includes('watch')) return CAT_COLORS.wearable;
  return CAT_COLORS.default;
}

export default function PrizeCard({ giveaway, index = 0, variant = 'category' }) {
  if (!giveaway) return null;

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    slug,
    title,
    prize,
    image,
    category = 'Tech',
    badge,
    endsIn = '5d : 12h : 20m',
    entriesText,
    entries = 2400,
    glowColor,
    entryRequirement,
    winnerCount = 1,
  } = giveaway;

  const feeAmount = entryRequirement?.amount || giveaway.entryFee || 250;
  const currency = entryRequirement?.currency || 'VEs';
  const displayTitle = title || prize || 'Exclusive Prize';
  const displayEntries = entriesText || `${(entries / 1000).toFixed(1)}K`;
  const catColor = getCatColor(category, badge);
  const finalGlowColor = glowColor || catColor.glow;

  const lookupKey = (slug || '').toLowerCase();
  const matchedPreset = PRIZE_MAP[lookupKey] ||
    Object.entries(PRIZE_MAP).find(([k]) => lookupKey.includes(k) || (title || '').toLowerCase().includes(k))?.[1];

  const primaryImage = (image && !image.includes('unsplash.com'))
    ? image
    : (matchedPreset?.img || '/images/ps5_bundle_spotlight.jpg');

  // Parse endsIn for display (e.g. "5d : 12h : 20m" → show first 2 units cleanly)
  const endsInParts = (endsIn || '').split(':').map(s => s.trim());
  const timerLabel = endsInParts.slice(0, 2).join(' : ') || endsIn;

  // Entry fill bar: simulate ~60-84% full based on index
  const fillPercent = 55 + ((index * 7) % 35);

  return (
    <div
      className="prize-card-v2 position-relative d-flex flex-column h-100 rounded-4 overflow-hidden"
      style={{
        background: 'linear-gradient(175deg, rgba(16, 20, 46, 0.96) 0%, rgba(7, 9, 22, 0.99) 100%)',
        border: isHovered
          ? `1px solid ${catColor.primary}70`
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isHovered
          ? `0 28px 55px -10px rgba(0,0,0,0.9), 0 0 32px ${catColor.glow}`
          : '0 10px 28px rgba(0,0,0,0.6)',
        transform: isHovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top gradient accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${catColor.primary}, transparent)`,
          opacity: isHovered ? 1 : 0.4,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Header: Category badge + Favorite */}
      <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-0" style={{ zIndex: 10, position: 'relative' }}>
        <div className="d-flex align-items-center gap-2">
          {variant === 'live' ? (
            <span
              className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#34d399',
                fontSize: '0.67rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#10b981', boxShadow: '0 0 6px #10b981',
                display: 'inline-block', animation: 'pulseGlow 1.5s ease-in-out infinite',
              }} />
              LIVE
            </span>
          ) : (
            <span
              className="px-2 py-1 rounded-pill"
              style={{
                background: catColor.bg,
                border: `1px solid ${catColor.border}`,
                color: catColor.primary,
                fontSize: '0.67rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {(category || 'Tech').toUpperCase()}
            </span>
          )}
          {winnerCount > 1 && (
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
              {winnerCount} winners
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: isFavorite ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
            border: isFavorite ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: isFavorite ? '#ef4444' : 'rgba(255,255,255,0.4)',
            fontSize: '0.9rem', cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Product image showcase */}
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{ height: '172px', width: '100%', overflow: 'hidden', padding: '12px' }}
      >
        {/* Ambient radial glow */}
        <div
          className="position-absolute top-50 start-50 translate-middle"
          style={{
            width: '160px', height: '160px', borderRadius: '50%',
            background: `radial-gradient(circle, ${finalGlowColor} 0%, transparent 70%)`,
            filter: 'blur(28px)', pointerEvents: 'none',
            transform: isHovered ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
            transition: 'transform 0.4s ease',
          }}
        />
        <img
          src={primaryImage}
          alt={displayTitle}
          onError={(e) => {
            if (matchedPreset?.fallback && e.currentTarget.src !== matchedPreset.fallback) {
              e.currentTarget.src = matchedPreset.fallback;
            } else if (e.currentTarget.src !== '/images/ps5_bundle_spotlight.jpg') {
              e.currentTarget.src = '/images/ps5_bundle_spotlight.jpg';
            }
          }}
          className="img-fluid position-relative"
          style={{
            maxHeight: '145px',
            maxWidth: '88%',
            objectFit: 'contain',
            filter: `drop-shadow(0 16px 26px rgba(0,0,0,0.7))`,
            transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
            transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          loading="eager"
        />
      </div>

      {/* Card body */}
      <div className="px-3 pb-3 pt-1 d-flex flex-column flex-grow-1">
        {/* Title */}
        <h4
          className="fw-bold text-white mb-1 text-truncate"
          style={{ fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}
          title={displayTitle}
        >
          {displayTitle}
        </h4>

        {/* Timer row */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div
            className="d-flex align-items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.74rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Ends in <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{timerLabel}</strong></span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
            👥 {displayEntries} entries
          </span>
        </div>

        {/* Entry fill bar */}
        <div className="mb-3">
          <div
            style={{
              height: '4px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${fillPercent}%`,
                background: `linear-gradient(90deg, ${catColor.primary}99, ${catColor.primary})`,
                borderRadius: '99px',
                boxShadow: `0 0 8px ${catColor.glow}`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px', textAlign: 'right' }}>
            {fillPercent}% filled
          </div>
        </div>

        {/* Entry fee chip */}
        <div
          className="d-flex align-items-center justify-content-between px-2 py-1 rounded-3 mb-3"
          style={{
            background: catColor.bg,
            border: `1px solid ${catColor.border}`,
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>Entry Fee</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: catColor.primary }}>
            💎 {feeAmount.toLocaleString()} {currency}
          </span>
        </div>

        {/* CTA button */}
        <div className="mt-auto">
          <Link
            to={`/giveaway/${slug || 'iphone-15-pro'}`}
            className="btn w-100 fw-bold text-white rounded-pill d-flex align-items-center justify-content-center gap-2 border-0"
            style={{
              background: `linear-gradient(90deg, ${catColor.primary}cc, ${catColor.primary})`,
              boxShadow: isHovered ? `0 0 24px ${catColor.glow}` : `0 4px 16px ${catColor.glow}80`,
              fontSize: '0.86rem',
              padding: '0.55rem 1rem',
              transition: 'all 0.25s ease',
              letterSpacing: '0.01em',
            }}
          >
            <span>Enter Now</span>
            <span
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s ease',
              }}
            >→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
