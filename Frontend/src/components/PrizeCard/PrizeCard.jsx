import { Link } from 'react-router-dom';

const tierThemes = {
  '1st Prize': {
    themeClass: 'pcard--theme-purple',
    badgeClass: 'pcard__badge--gold',
    btnClass: 'pcard__btn--purple',
    badgeText: '1st Prize'
  },
  'Grand Prize': {
    themeClass: 'pcard--theme-purple',
    badgeClass: 'pcard__badge--gold',
    btnClass: 'pcard__btn--purple',
    badgeText: 'Grand Prize'
  },
  '2nd Prize': {
    themeClass: 'pcard--theme-blue',
    badgeClass: 'pcard__badge--blue',
    btnClass: 'pcard__btn--blue',
    badgeText: '2nd Prize'
  },
  '3rd Prize': {
    themeClass: 'pcard--theme-green',
    badgeClass: 'pcard__badge--green',
    btnClass: 'pcard__btn--green',
    badgeText: '3rd Prize'
  },
  'Lucky Draw': {
    themeClass: 'pcard--theme-orange',
    badgeClass: 'pcard__badge--orange',
    btnClass: 'pcard__btn--orange',
    badgeText: 'Lucky Draw'
  }
};

export default function PrizeCard({ giveaway, index = 0 }) {
  if (!giveaway) return null;

  const {
    slug,
    title,
    description,
    shortDescription,
    participants,
    endsIn,
    entryRequirement,
    image,
    prizes,
    prize
  } = giveaway;

  const primaryPrize = prizes?.[0];
  const position = primaryPrize?.position || (index === 0 ? '1st Prize' : index === 1 ? '2nd Prize' : index === 2 ? '3rd Prize' : 'Lucky Draw');
  const theme = tierThemes[position] || tierThemes['1st Prize'];

  const fee = entryRequirement?.amount || 250;
  const currency = entryRequirement?.currency || 'VEs';
  const subtitle = shortDescription || primaryPrize?.description || description || prize;

  return (
    <div className={`pcard ${theme.themeClass}`}>
      {/* Position tag top-left */}
      <div className="pcard__header-tag">
        <span className={`pcard__badge ${theme.badgeClass}`}>
          {theme.badgeText}
        </span>
      </div>

      {/* Media / Image with ambient spotlight glow */}
      <div className="pcard__media">
        <div className="pcard__glow-backdrop" aria-hidden="true" />
        <img
          src={image || primaryPrize?.image}
          alt={title || prize}
          className="pcard__img"
          loading="lazy"
        />
      </div>

      {/* Body content */}
      <div className="pcard__body">
        <h4 className="pcard__title">{prize || title}</h4>
        <p className="pcard__subtitle">{subtitle}</p>

        {/* Info Grid: Participants & Countdown */}
        <div className="pcard__meta-grid">
          <div className="pcard__meta-item">
            <span className="pcard__meta-icon" aria-hidden="true">👥</span>
            <span>{Number(participants || 0).toLocaleString()}+</span>
            <small className="pcard__meta-sub">Participants</small>
          </div>
          <div className="pcard__meta-item">
            <span className="pcard__meta-icon" aria-hidden="true">⏰</span>
            <span>{endsIn || '12d:08h:50m'}</span>
            <small className="pcard__meta-sub">left</small>
          </div>
        </div>

        {/* Entry Fee Row */}
        <div className="pcard__fee-row">
          <span className="pcard__fee-label">Entry Fee</span>
          <span className="pcard__fee-value">{fee} {currency}</span>
        </div>

        {/* Join button */}
        <Link
          to={`/giveaway/${slug}`}
          className={`pcard__cta-btn ${theme.btnClass}`}
          aria-label={`Join ${prize || title}`}
        >
          <span>Join Now</span>
          <span className="pcard__cta-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
