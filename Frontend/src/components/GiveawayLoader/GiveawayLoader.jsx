import { useEffect, useState } from 'react';

const loaderMessages = [
  'Preparing today\'s rewards...',
  'Checking active giveaways...',
  'Loading available prizes...',
  'Bringing your rewards closer...',
  'Verifying giveaway status...'
];

function GiveawayLoader({ fullPage = true }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loaderMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={fullPage ? 'giveaway-loader-shell' : 'giveaway-loader-inline'}>
      <div className="giveaway-loader-box">
        {/* Animated Gift Box */}
        <div className="giveaway-loader__icon" aria-hidden="true">
          <div className="loader-gift">
            <div className="loader-gift__lid" />
            <div className="loader-gift__body">
              <span className="loader-gift__ribbon" />
            </div>
          </div>
          <div className="loader-particles">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`loader-particle loader-particle--${i + 1}`} />
            ))}
          </div>
        </div>

        {/* VELOOP Brand */}
        <div className="giveaway-loader__brand">
          <span className="loader-brand-v">V</span>ELOOP
          <span className="loader-brand-sub">Rewards</span>
        </div>

        {/* Rotating Message */}
        <div className="giveaway-loader__message" key={msgIndex}>
          {loaderMessages[msgIndex]}
        </div>

        {/* Dots */}
        <div className="loader-dots" aria-label="Loading">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
      </div>
    </div>
  );
}

export default GiveawayLoader;
