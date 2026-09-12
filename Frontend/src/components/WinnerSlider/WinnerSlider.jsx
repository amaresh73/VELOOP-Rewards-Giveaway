import { useEffect, useRef, useState } from 'react';
import { demoWinnerSliderMessages } from '../../data/giveawayData';

function WinnerSlider({ winners = [] }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  // Build messages: real winners if available, else demo fallback
  const messages = winners.length > 0
    ? winners.map((w) => {
        const maskedId = String(w.userId || '').slice(0, 2) + '****' + String(w.userId || '').slice(-2);
        return `🎉 ${maskedId} won a verified reward!`;
      })
    : demoWinnerSliderMessages;

  // Duplicate for seamless loop
  const doubledMessages = [...messages, ...messages, ...messages];

  // CSS marquee approach – no JS interval needed, purely CSS animation
  // We pause via className toggle on hover
  return (
    <div
      className="ws-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ws-gradient-left" aria-hidden="true" />
      <div className="ws-gradient-right" aria-hidden="true" />

      <div className="ws-track-container" aria-live="polite" aria-label="Recent winner announcements">
        <div
          ref={trackRef}
          className={`ws-track${paused ? ' ws-track--paused' : ''}`}
          role="marquee"
        >
          {doubledMessages.map((msg, i) => (
            <div key={`ws-${i}`} className="ws-pill">
              <span className="ws-pill__dot" aria-hidden="true" />
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WinnerSlider;
