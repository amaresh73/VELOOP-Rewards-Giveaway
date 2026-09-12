import { useEffect, useMemo, useState } from 'react';

function Countdown({ value, onEnd, compact = false }) {
  const initialParts = useMemo(() => String(value || '06:12:44:18').split(':'), [value]);
  const [timeLeft, setTimeLeft] = useState(() => {
    const [days = '0', hours = '0', minutes = '0', seconds = '0'] = initialParts;
    return Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  });
  const [ended, setEnded] = useState(false);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    setTimeLeft(() => {
      const [days = '0', hours = '0', minutes = '0', seconds = '0'] = initialParts;
      return Number(days) * 86400 + Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    });
    setEnded(false);
  }, [initialParts]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!ended) {
        setEnded(true);
        onEnd?.();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setEnded(true);
          onEnd?.();
          return 0;
        }
        setTick((t) => !t);
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, ended, onEnd]);

  if (ended) {
    return (
      <div className="countdown-ended">
        <span className="countdown-ended__label">Giveaway Ended</span>
        <small className="text-white-50">Winner selection is now in progress</small>
      </div>
    );
  }

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const parts = [days, hours, minutes, seconds].map((seg) => String(seg).padStart(2, '0'));
  const labels = ['Days', 'Hours', 'Min', 'Sec'];

  return (
    <div className={`countdown-row${compact ? ' countdown-row--compact' : ''}`}>
      {parts.map((seg, i) => (
        <div key={labels[i]} className="cbox" aria-label={`${seg} ${labels[i]}`}>
          <div className={`cbox__digit${i === 3 && tick ? ' cbox__digit--tick' : ''}`}>
            {seg}
          </div>
          <div className="cbox__label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
