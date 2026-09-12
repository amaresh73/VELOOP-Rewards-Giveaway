import giftBoxImg from '../../assets/gift_box_pedestal.jpg';
import ticketImg from '../../assets/giveaway_ticket_gold.jpg';

export default function GiveawayBanner({ onOpenCodeModal, onExploreClick }) {
  return (
    <section className="banner-promo-section">
      <div className="banner-promo">
        {/* Ambient neon purple border and backdrop glow */}
        <div className="banner-promo__glow" aria-hidden="true" />

        {/* Left 3D gift box with pedestal */}
        <div className="banner-promo__visual banner-promo__visual--left">
          <div className="banner-promo__img-wrap">
            <img
              src={giftBoxImg}
              alt="Exclusive Giveaway Gift Box on glowing pedestal"
              className="banner-promo__img"
            />
            <div className="banner-promo__pedestal-glow" aria-hidden="true" />
          </div>
        </div>

        {/* Center Content */}
        <div className="banner-promo__content">
          <div className="banner-promo__top-pills">
            <span className="banner-badge-pill">
              <span className="banner-badge-icon">🎁</span> Giveaway Code
            </span>
          </div>

          <div className="banner-promo__sparkle-text">
            ✦ Unlock Amazing Rewards ✦
          </div>

          <h2 className="banner-promo__title">
            Exclusive Giveaway <span className="banner-promo__title-highlight">Rewards</span>
          </h2>

          <p className="banner-promo__desc">
            Enter special giveaway codes and unlock exciting <strong>VEs rewards</strong> instantly.
          </p>

          {/* 3 Value props */}
          <div className="banner-promo__trust-points">
            <div className="banner-trust-item">
              <div className="banner-trust-icon banner-trust-icon--shield">
                🛡️
              </div>
              <div className="banner-trust-text">
                <strong>100% Safe</strong>
                <span>Secure &amp; Trusted</span>
              </div>
            </div>

            <div className="banner-trust-item">
              <div className="banner-trust-icon banner-trust-icon--zap">
                ⚡
              </div>
              <div className="banner-trust-text">
                <strong>Instant Rewards</strong>
                <span>Get Rewards Fast</span>
              </div>
            </div>

            <div className="banner-trust-item">
              <div className="banner-trust-icon banner-trust-icon--gift">
                🎁
              </div>
              <div className="banner-trust-text">
                <strong>Exclusive VEs</strong>
                <span>Special for You</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="banner-promo__actions">
            <button
              type="button"
              className="banner-promo__cta-btn"
              onClick={onOpenCodeModal}
              id="banner-enter-giveaway-btn"
            >
              <span>Enter Giveaway</span>
              <span className="banner-cta-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Right 3D golden ticket held in hand */}
        <div className="banner-promo__visual banner-promo__visual--right">
          <div className="banner-promo__img-wrap">
            <img
              src={ticketImg}
              alt="VIP Giveaway Prize Voucher Ticket"
              className="banner-promo__img"
            />
            <div className="banner-promo__ticket-glow" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
