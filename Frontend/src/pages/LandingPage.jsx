import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState(null);

  const perksData = {
    game: { title: 'Game Items', desc: 'Unlock exclusive in-game skins, battle passes, and legendary loot crates.', icon: '🎮', color: '#a855f7' },
    vcs: { title: 'VCs & Credits', desc: 'Earn platform currency and convertible points directly into your reward wallet.', icon: '💎', color: '#38bdf8' },
    premium: { title: 'Premium Access', desc: 'Gain VIP entry into high-value exclusive drops with amplified win odds.', icon: '👑', color: '#fbbf24' },
    gifts: { title: 'Special Gifts', desc: 'Receive physical gadget drops and digital gift cards delivered to you.', icon: '🎁', color: '#f472b6' }
  };

  return (
    <div className="landing-page-root">
      {/* Fixed Full-Screen Background */}
      <div className="landing-bg-overlay" />
      <div className="landing-aurora-glow-1" />
      <div className="landing-aurora-glow-2" />

      {/* ══════════════════════════════════════════════════════════════
          NAVBAR — FIXED, FULL-WIDTH
          ══════════════════════════════════════════════════════════════ */}
      <nav className="landing-navbar">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: '10px',
                background: 'linear-gradient(135deg, #00ffd1, #10b981)',
                boxShadow: '0 0 20px rgba(0, 255, 209, 0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#040811">
                <path d="M12 22L2 4h4.5l5.5 11.5L17.5 4H22L12 22z" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif" }}>
              VELOP
            </span>
          </Link>

          {/* Navigation Pills */}
          <div className="d-none d-md-flex" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link to="/" className="landing-nav-pill active">Home</Link>
            <Link to="/login" state={{ message: 'Please log in to view and enter giveaways.' }} className="landing-nav-pill">Giveaways</Link>
            <Link to="/login" state={{ message: 'Please log in to view available rewards.' }} className="landing-nav-pill">Rewards</Link>
            <Link to="/login" state={{ message: 'Please log in to explore how giveaways work.' }} className="landing-nav-pill">How It Works</Link>
            <Link to="/login" state={{ message: 'Please log in to access premium perks.' }} className="landing-nav-pill">Premium</Link>
          </div>
        </div>

        {/* Right Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="landing-theme-toggle d-none d-md-flex"
            title="Toggle Ambient Glow"
            onClick={() => { }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          <Link to="/login" className="landing-login-btn">Login</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          HERO — TRUE FULL-SCREEN TWO-COLUMN LAYOUT
          ══════════════════════════════════════════════════════════════ */}
      <main className="landing-hero-container">
        {/* Full-width row: no Bootstrap container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
          minHeight: 'calc(100vh - 64px)',
          alignItems: 'stretch',
        }}>
          {/* ── LEFT COLUMN: Text, CTAs, Trust Badges ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(2rem, 5vw, 5rem) clamp(1.5rem, 4vw, 5rem) clamp(2rem, 5vw, 5rem) clamp(2rem, 6vw, 8rem)',
            zIndex: 10,
            position: 'relative',
          }}>
            {/* Badge */}
            <div className="landing-badge-pill">
              <span>✦</span>
              <span>Good Rewards Happen Here</span>
            </div>

            {/* Title */}
            <h1 className="landing-title">
              Exclusive
              <span className="landing-title-highlight">Giveaway</span>
              Rewards
            </h1>

            {/* Subtitle */}
            <p className="landing-desc">
              Enter special giveaway codes and unlock amazing rewards, premium access, and more. Fast. Secure. Yours.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                state={{ message: 'Please log in to view and explore all live giveaways.' }}
                className="landing-btn-explore"
              >
                <span>Explore Giveaways</span>
                <span>→</span>
              </Link>

              <button
                onClick={() => setShowDemoModal(true)}
                className="landing-btn-demo"
              >
                <div className="landing-play-circle">▶</div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 3 Trust Feature Cards */}
            <div className="landing-trust-row">
              <div className="landing-trust-card">
                <div className="landing-trust-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  🛡️
                </div>
                <div>
                  <div className="landing-trust-title">100% Secure</div>
                  <div className="landing-trust-subtitle">Safe &amp; Trusted</div>
                </div>
              </div>

              <div className="landing-trust-card">
                <div className="landing-trust-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  ⚡
                </div>
                <div>
                  <div className="landing-trust-title">Instant Rewards</div>
                  <div className="landing-trust-subtitle">Get Prizes Fast</div>
                </div>
              </div>

              <div className="landing-trust-card">
                <div className="landing-trust-icon-box" style={{ background: 'rgba(0, 255, 209, 0.12)', color: '#00ffd1' }}>
                  👥
                </div>
                <div>
                  <div className="landing-trust-title">Exclusive Perks</div>
                  <div className="landing-trust-subtitle">Only for You</div>
                </div>
              </div>
            </div>

            {/* Social Proof Row */}
            <div className="landing-social-proof">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="landing-avatar-stack">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="Winner"
                    className="landing-avatar-item"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    alt="Winner"
                    className="landing-avatar-item"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                    alt="Winner"
                    className="landing-avatar-item"
                  />
                  <div className="landing-avatar-pill">+100K</div>
                </div>
                <div style={{ lineHeight: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.84rem' }}>Join 100K+ happy winners</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.73rem', marginTop: '3px' }}>Real people. Real rewards.</div>
                </div>
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: '#fbbf24', fontSize: '0.86rem', fontWeight: 700 }}>
                  <span>★★★★★</span>
                  <span style={{ color: '#fff', marginLeft: '4px' }}>4.2/5</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.72rem', marginTop: '2px' }}>
                  &ldquo;More Surprises Everyday&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Futuristic 3D Cyber Stage Showcase ── */}
          <div className="landing-art-container">
            <div className="landing-showcase-stage">
              {/* Pedestal Ambient Glow behind stage */}
              <div className="landing-stage-glow" />

              {/* Master 3D Showcase Artwork matching the exact reference */}
              <img
                src="/images/landing_hero_showcase.jpg"
                alt="VELOP Rewards Futuristic Giveaway Showcase"
                className="landing-showcase-artwork"
              />

              {/* Interactive Hotspot 1: Game Items (Top-Left) */}
              <button
                type="button"
                className="landing-hotspot hotspot-game-items"
                onClick={() => setSelectedPerk(perksData.game)}
                title="View Game Items perk"
                aria-label="Game Items perk"
              >
                <span className="hotspot-pulse-ring" />
              </button>

              {/* Interactive Hotspot 2: VCs & Credits (Top-Right) */}
              <button
                type="button"
                className="landing-hotspot hotspot-vcs-credits"
                onClick={() => setSelectedPerk(perksData.vcs)}
                title="View VCs & Credits perk"
                aria-label="VCs & Credits perk"
              >
                <span className="hotspot-pulse-ring" />
              </button>

              {/* Interactive Hotspot 3: Premium Access (Bottom-Left) */}
              <button
                type="button"
                className="landing-hotspot hotspot-premium-access"
                onClick={() => setSelectedPerk(perksData.premium)}
                title="View Premium Access perk"
                aria-label="Premium Access perk"
              >
                <span className="hotspot-pulse-ring" />
              </button>

              {/* Interactive Hotspot 4: Special Gifts (Bottom-Right) */}
              <button
                type="button"
                className="landing-hotspot hotspot-special-gifts"
                onClick={() => setSelectedPerk(perksData.gifts)}
                title="View Special Gifts perk"
                aria-label="Special Gifts perk"
              >
                <span className="hotspot-pulse-ring" />
              </button>

              {/* Interactive Center Hotspot: VELOOP Gift Box */}
              <button
                type="button"
                className="landing-hotspot hotspot-center-giftbox"
                onClick={() => navigate('/login', { state: { message: 'Sign in to unlock and enter the live giveaways!' } })}
                title="Claim VELOOP Giveaway Gift Box"
                aria-label="Claim VELOOP Giveaway Gift Box"
              />

              {/* Interactive Hint Pill */}
              <div className="landing-showcase-tag">
                <span className="pulse-dot" />
                <span>Interactive Perks · Click any card to explore</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER — FULL-WIDTH
          ══════════════════════════════════════════════════════════════ */}
      <footer className="landing-footer">
        {/* Left Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '7px',
              background: 'linear-gradient(135deg, #00ffd1, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#040811">
              <path d="M12 22L2 4h4.5l5.5 11.5L17.5 4H22L12 22z" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', letterSpacing: '0.1em' }}>VELOP</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginLeft: '6px' }}>Play · Enter · Win</span>
        </div>

        {/* Right Links & Socials */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="#privacy" className="landing-footer-link">Privacy</a>
          <a href="#terms" className="landing-footer-link">Terms</a>
          <a href="#support" className="landing-footer-link">Support</a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '6px' }}>
            <a href="#" className="landing-social-icon" title="Discord">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25-1.845-.277-3.68-.277-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 12.3 12.3 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.098.246.197.372.292a.077.077 0 01-.007.128 12.3 12.3 0 01-1.873.891.077.077 0 00-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 19.86 19.86 0 006.002-3.03.077.077 0 00.032-.055c.5-5.177-.839-9.674-3.549-13.66a.061.061 0 00-.031-.029zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
              </svg>
            </a>
            <a href="#" className="landing-social-icon" title="Twitter/X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="landing-social-icon" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* ── Demo Preview Modal ── */}
      <Modal
        show={showDemoModal}
        onHide={() => setShowDemoModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ background: '#08111e', borderBottom: '1px solid rgba(0, 255, 209, 0.2)' }}>
          <Modal.Title className="text-white d-flex align-items-center gap-2">
            <span style={{ color: '#00ffd1' }}>▶</span> Quick Platform Demo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#08111e', color: '#edf2f7' }}>
          <div className="text-center p-3">
            <div className="fs-1 mb-2">🎁</div>
            <h5 className="fw-bold text-white mb-2">Experience VELOOP Rewards</h5>
            <p className="text-white-50 small mb-4">
              Enter promotional giveaway codes, explore guaranteed drop pools, and claim real prizes. Start exploring right now with 1-click access.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-light"
                onClick={() => setShowDemoModal(false)}
                className="rounded-pill px-4"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDemoModal(false);
                  navigate('/login');
                }}
                className="rounded-pill px-4 fw-bold"
                style={{ background: 'linear-gradient(90deg, #00ffd1, #10b981)', border: 'none', color: '#040811' }}
              >
                Go To Login →
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Perk Information Modal ── */}
      <Modal
        show={!!selectedPerk}
        onHide={() => setSelectedPerk(null)}
        centered
      >
        <Modal.Header closeButton style={{ background: '#08111e', borderBottom: `1px solid ${selectedPerk?.color || 'rgba(0,255,209,0.3)'}40` }}>
          <Modal.Title className="text-white d-flex align-items-center gap-2">
            <span>{selectedPerk?.icon}</span> {selectedPerk?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#08111e', color: '#edf2f7' }}>
          <div className="p-2">
            <p className="text-white-50 mb-4">{selectedPerk?.desc}</p>
            <Button
              onClick={() => {
                setSelectedPerk(null);
                navigate('/login');
              }}
              className="w-100 rounded-pill py-2 fw-bold"
              style={{ background: `linear-gradient(90deg, ${selectedPerk?.color || '#00ffd1'}, #10b981)`, border: 'none', color: '#040811' }}
            >
              Unlock with VELOOP Account →
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
