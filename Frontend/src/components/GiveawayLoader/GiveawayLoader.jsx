import { useEffect, useState } from 'react';

const loaderMessages = [
  'Verifying VELOOP reward ledger...',
  'Checking active giveaway drops...',
  'Syncing provably fair draw seeds...',
  'Loading real-time reward pools...',
  'Securing wallet balances & fraud protection...'
];

function GiveawayLoader({ fullPage = true, customMessage = null }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loaderMessages.length);
    }, 1900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={fullPage ? 'giveaway-loader-shell' : 'giveaway-loader-inline'} role="status" aria-live="polite">
      <div className="giveaway-loader-box">
        {/* Holographic Orbital Rings & V Monogram */}
        <div className="veloop-orbital-loader">
          <div className="orbital-ring orbital-ring--outer" />
          <div className="orbital-ring orbital-ring--inner" />
          <div className="orbital-pulse-glow" />
          <div className="orbital-core">
            <span className="orbital-v">V</span>
          </div>
          {/* Micro-spark particles */}
          <span className="orbital-spark orbital-spark--1" />
          <span className="orbital-spark orbital-spark--2" />
          <span className="orbital-spark orbital-spark--3" />
        </div>

        {/* Brand Header */}
        <div className="giveaway-loader__brand">
          <span className="loader-brand-name">VELOOP</span>
          <span className="loader-brand-badge">Rewards</span>
        </div>

        {/* Live Authoritative Status Chip */}
        <div className="giveaway-loader__chip" key={customMessage || msgIndex}>
          <span className="loader-chip-pulse" aria-hidden="true" />
          <span className="loader-chip-text">{customMessage || loaderMessages[msgIndex]}</span>
        </div>

        {/* Cyber Neon Progress Bar */}
        <div className="giveaway-loader__track" aria-hidden="true">
          <div className="giveaway-loader__bar" />
        </div>

        {/* Subtle Assurance Tagline */}
        <div className="giveaway-loader__assurance">
          <span>SECURED BY VELOOP INTEGRITY LEDGER</span>
        </div>
      </div>
    </div>
  );
}

export default GiveawayLoader;
