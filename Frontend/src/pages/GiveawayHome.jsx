import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { faqData, giveawayData, currentWinnerData, previousWinnerData } from '../data/giveawayData';
import { useAuth } from '../context/AuthContext';
import PrizeCard from '../components/PrizeCard/PrizeCard';
import WinnersTabs from '../components/WinnersTabs/WinnersTabs';
import WinnerSlider from '../components/WinnerSlider/WinnerSlider';
import FAQSection from '../components/FAQ/FAQSection';
import TrustSection from '../components/TrustSection/TrustSection';
import GiveawayLoader from '../components/GiveawayLoader/GiveawayLoader';
import GiveawayCodeModal from '../components/Common/GiveawayCodeModal';
import { fetchGiveaways } from '../services/giveawayService';
import api from '../services/api';


function GiveawayHome() {
  const { user } = useAuth();
  const [giveaways, setGiveaways] = useState(giveawayData);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState(currentWinnerData);
  const [previousHistory, setPreviousHistory] = useState(previousWinnerData);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [bonusNotification, setBonusNotification] = useState('');

  // Current authenticated user identity (null if unauthenticated)
  const currentUserId = user?.id || user?.phone || user?.email || null;
  const isLoggedIn = Boolean(user && (user.phone || user.email));

  // Load all data
  useEffect(() => {
    let isMounted = true;

    // Safety timeout: ensure loader never hangs indefinitely
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1500);

    const loadAll = async () => {
      try {
        const [response, winnersResponse, historyResponse] = await Promise.allSettled([
          fetchGiveaways(),
          api.get('/winners'),
          api.get('/giveaways/previous')
        ]);

        if (!isMounted) return;

        if (response.status === 'fulfilled' && response.value?.data?.length) {
          setGiveaways(response.value.data);
        } else {
          setGiveaways(giveawayData);
        }

        if (winnersResponse.status === 'fulfilled' && winnersResponse.value?.data?.data?.length) {
          setWinners(winnersResponse.value.data.data);
        } else {
          setWinners(currentWinnerData);
        }

        if (historyResponse.status === 'fulfilled' && historyResponse.value?.data?.data?.length) {
          setPreviousHistory(historyResponse.value.data.data);
        } else {
          setPreviousHistory(previousWinnerData);
        }
      } catch (err) {
        console.error('Data loading error, fallback to mock data:', err);
        if (isMounted) {
          setGiveaways(giveawayData);
          setWinners(currentWinnerData);
          setPreviousHistory(previousWinnerData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleClaimSubmit = async ({ winner, form }) => {
    const response = await api.post('/claims', {
      giveawayId: winner.giveawayId,
      winnerId: winner._id,
      prizeId: winner.prizeId,
      name: form.fullName,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      pin: form.pin,
      email: form.email
    });
    return response.data;
  };

  const handleCodeRedeemed = (amount) => {
    setBonusNotification(`🎉 Awesome! +${amount} VEs added to your rewards wallet!`);
    setTimeout(() => setBonusNotification(''), 6000);
  };

  // Filter state for drops
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('closing-soon');

  // Filtered and sorted giveaways
  const filteredGiveaways = useMemo(() => {
    let list = [...giveaways];

    if (selectedCategory === 'tech') {
      list = list.filter((g) => ['Mobile', 'Wearable'].includes(g.prizeCategory));
    } else if (selectedCategory === 'audio') {
      list = list.filter((g) => g.prizeCategory === 'Audio');
    } else if (selectedCategory === 'vouchers') {
      list = list.filter((g) => ['Gift Card', 'Digital'].includes(g.prizeCategory));
    }

    if (sortBy === 'lowest-fee') {
      list.sort((a, b) => (a.entryRequirement?.amount || 0) - (b.entryRequirement?.amount || 0));
    } else if (sortBy === 'highest-value') {
      list.sort((a, b) => (b.winnerCount || 1) - (a.winnerCount || 1));
    }

    return list;
  }, [giveaways, selectedCategory, sortBy]);

  // Grand prize item (iPhone 15 Pro)
  const grandPrize = giveaways[0] || giveawayData[0];

  const handleQuickCodeSubmit = (e) => {
    e.preventDefault();
    setShowCodeModal(true);
  };

  if (loading) return <GiveawayLoader fullPage />;

  return (
    <>
      <main className="giveaway-main-wrapper">
        {bonusNotification && (
          <div className="bonus-floating-alert">
            {bonusNotification}
          </div>
        )}

        <Container className="container-shell">

          {/* ══════════════════════════════════════════════════════════════
              ORIGINAL SIGNATURE HERO: VELOOP REWARD ARENA COMMAND CENTER
              ══════════════════════════════════════════════════════════════ */}
          <section className="arena-hero card-glass position-relative overflow-hidden mb-5">
            {/* Animated ambient mesh aurora */}
            <div className="arena-hero__aurora" aria-hidden="true" />
            <div className="arena-hero__grid-pattern" aria-hidden="true" />

            <Row className="g-4 align-items-center position-relative" style={{ zIndex: 2 }}>
              {/* Left Column: Command & Value Proposition */}
              <Col lg={7}>
                <div className="arena-hero__content pe-lg-3">
                  <div className="d-inline-flex align-items-center gap-2 mb-3">
                    <span className="arena-badge-pill">
                      <span className="arena-badge-pulse" />
                      VELOOP PROTOCOL • VERIFIED DROPS
                    </span>
                    <span className="badge bg-dark border border-secondary text-white-50 px-2 py-1 small">
                      Zero Gambling • Pure Loyalty
                    </span>
                  </div>

                  <h1 className="arena-hero__title">
                    The Premier <span className="arena-title-gradient">Rewards Arena</span>
                  </h1>

                  <p className="arena-hero__description text-white-50 fs-6 mb-4">
                    Earn verified entries with your loyalty currencies (<strong>VEs</strong>, <strong>SVEs</strong>, <strong>Tokens</strong>).
                    Every draw is provably random, strictly 1 entry per member, and audited on-chain for 100% fair play.
                  </p>

                  {/* Integrated Quick Code Vault Bar */}
                  <div className="arena-code-bar p-2 rounded-pill d-flex align-items-center gap-2 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', maxWidth: 480 }}>
                    <span className="ps-3 text-warning">🔑</span>
                    <input
                      type="text"
                      placeholder="Have a promo code? (e.g. VELOOP2026)"
                      className="form-control bg-transparent border-0 text-white shadow-none small"
                      onClick={() => setShowCodeModal(true)}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary-custom rounded-pill px-3 py-1 text-nowrap fw-semibold small"
                      onClick={() => setShowCodeModal(true)}
                    >
                      Redeem Code →
                    </button>
                  </div>

                  {/* 4 Protocol Performance Metrics */}
                  <div className="arena-metrics-strip">
                    <div className="arena-metric-item">
                      <div className="arena-metric-item__val text-purple">24 Active</div>
                      <div className="arena-metric-item__label">Reward Drops</div>
                    </div>
                    <div className="arena-metric-item">
                      <div className="arena-metric-item__val text-blue">8.5K+</div>
                      <div className="arena-metric-item__label">Verified Members</div>
                    </div>
                    <div className="arena-metric-item">
                      <div className="arena-metric-item__val text-green">1.2K+</div>
                      <div className="arena-metric-item__label">Rewards Dispatched</div>
                    </div>
                    <div className="arena-metric-item">
                      <div className="arena-metric-item__val text-warning">100%</div>
                      <div className="arena-metric-item__label">Audited Integrity</div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Right Column: Featured Grand Prize Showcase Vault */}
              <Col lg={5}>
                <div className="grand-prize-vault p-4 rounded card-glass position-relative overflow-hidden">
                  <div className="grand-prize-vault__glow" aria-hidden="true" />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-3 py-1 fw-bold">
                      ⭐ GRAND PRIZE SPOTLIGHT
                    </span>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1 small">
                      ● Live Draw
                    </span>
                  </div>

                  {/* Holographic showcase visual */}
                  <div className="grand-prize-vault__visual text-center my-3 position-relative">
                    <div className="grand-prize-vault__halo" aria-hidden="true" />
                    <img
                      src={grandPrize.image}
                      alt={grandPrize.prize}
                      className="grand-prize-vault__img img-fluid"
                    />
                  </div>

                  <div className="grand-prize-vault__body">
                    <h3 className="fw-bold text-white mb-1">{grandPrize?.prize || grandPrize?.title || 'Featured Prize'}</h3>
                    <p className="text-white-50 small mb-3">{grandPrize?.shortDescription || grandPrize?.description || 'Exclusive VIP Reward'}</p>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <span className="text-white-50 small d-block">Entry Requirement</span>
                        <strong className="text-primary fs-5">{grandPrize?.entryRequirement?.amount || 250} {grandPrize?.entryRequirement?.currency || 'VEs'}</strong>
                      </div>
                      <div className="text-end">
                        <span className="text-white-50 small d-block">Closes in</span>
                        <span className="badge bg-dark border border-secondary text-white">
                          {grandPrize?.endsIn || '12d : 08h'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/giveaway/${grandPrize?.slug || 'iphone-15-pro'}`}
                      className="btn btn-primary-custom w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      id="hero-explore-grand-prize"
                    >
                      <span>Explore &amp; Enter Draw</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              ORIGINAL: THE VELOOP PROTOCOL (HOW IT WORKS ROADMAP)
              ══════════════════════════════════════════════════════════════ */}
          <section className="protocol-flow-section mb-5">
            <div className="section-header text-center mb-4">
              <span className="text-uppercase text-primary small fw-bold">Fair &amp; Auditable Participation</span>
              <h2 className="fw-bold mb-2">The VELOOP Protocol</h2>
              <p className="text-white-50 mx-auto small" style={{ maxWidth: 600 }}>
                Four transparent phases governing every reward drop from ticket issuance to insured door-to-door delivery.
              </p>
            </div>

            <Row className="g-3">
              {[
                { phase: '01', icon: '🛡️', title: 'Verify Membership', text: 'One authenticated account per verified member ensures equal winning probabilities.', color: 'purple' },
                { phase: '02', icon: '💎', title: 'Collect Currencies', text: 'Earn VEs, SVEs, and Tokens by completing platform loyalty milestones.', color: 'blue' },
                { phase: '03', icon: '🎟️', title: 'Stake Draw Entry', text: 'Select your preferred drop; entry amount is deducted and ticket is locked.', color: 'green' },
                { phase: '04', icon: '🏆', title: 'Verifiable Claim', text: 'Provably fair winner selection followed by instant digital code or courier shipment.', color: 'orange' }
              ].map((step) => (
                <Col md={6} lg={3} key={step.phase}>
                  <div className={`protocol-step-card card-glass protocol-step-card--${step.color} p-4 h-100 position-relative`}>
                    <div className="protocol-step-card__phase">{step.phase}</div>
                    <div className="protocol-step-card__icon fs-3 mb-3">{step.icon}</div>
                    <h5 className="fw-bold text-white mb-2">{step.title}</h5>
                    <p className="text-white-50 small mb-0">{step.text}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              ORIGINAL: DYNAMIC LIVE DROPS EXPLORER & CATEGORIES
              ══════════════════════════════════════════════════════════════ */}
          <section id="all-giveaways" className="drops-explorer-section mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <span className="text-uppercase text-primary small fw-bold">Active Loyalty Drops</span>
                <h2 className="fw-bold mb-0">Explore Available Giveaways</h2>
              </div>

              {/* Category Filter Pills */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="btn-group btn-group-sm p-1 rounded-pill" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { id: 'all', label: '🔥 All Drops' },
                    { id: 'tech', label: '📱 Tech & Flagships' },
                    { id: 'audio', label: '🎧 Audio & Sound' },
                    { id: 'vouchers', label: '🎁 Gift Vouchers' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`btn rounded-pill px-3 py-1 ${selectedCategory === tab.id ? 'btn-primary-custom' : 'btn-link text-white-50 text-decoration-none'}`}
                      onClick={() => setSelectedCategory(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sort Toggle */}
                <select
                  className="form-select form-select-sm bg-dark text-white border-secondary rounded-pill px-3 py-1"
                  style={{ width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="closing-soon">Sort: Closing Soonest</option>
                  <option value="lowest-fee">Sort: Lowest Entry Fee</option>
                  <option value="highest-value">Sort: Most Winners</option>
                </select>
              </div>
            </div>

            {/* 6 Original Holographic Cards Grid */}
            <div className="featured-cards-grid">
              {filteredGiveaways.map((item, idx) => (
                <PrizeCard
                  key={item.id || item.slug || idx}
                  giveaway={item}
                  index={idx}
                />
              ))}
            </div>
          </section>


          {/* ══════════════════════════════════════════════════════════════
              REFERENCE IMAGE 2: Bottom Trust Bar (4 items)
              ══════════════════════════════════════════════════════════════ */}
          <section className="trust-strip-section">
            <div className="trust-strip card-glass">
              {/* 1. 100% Fair & Transparent */}
              <div className="trust-strip__item">
                <div className="trust-strip__icon trust-strip__icon--purple">
                  🛡️
                </div>
                <div className="trust-strip__info">
                  <h6 className="trust-strip__heading">100% Fair &amp; Transparent</h6>
                  <p className="trust-strip__desc">
                    All giveaways are conducted fairly and transparently.
                  </p>
                </div>
              </div>

              {/* 2. Secure & Safe */}
              <div className="trust-strip__item">
                <div className="trust-strip__icon trust-strip__icon--blue">
                  🔒
                </div>
                <div className="trust-strip__info">
                  <h6 className="trust-strip__heading">Secure &amp; Safe</h6>
                  <p className="trust-strip__desc">
                    Your data and privacy are our top priority.
                  </p>
                </div>
              </div>

              {/* 3. Trusted by 10K+ Users */}
              <div className="trust-strip__item">
                <div className="trust-strip__icon trust-strip__icon--green">
                  ✓
                </div>
                <div className="trust-strip__info">
                  <h6 className="trust-strip__heading">Trusted by 10K+ Users</h6>
                  <p className="trust-strip__desc">
                    Join thousands of happy users who trust VELoop Rewards.
                  </p>
                </div>
              </div>

              {/* 4. 24/7 Customer Support */}
              <div className="trust-strip__item">
                <div className="trust-strip__icon trust-strip__icon--orange">
                  🎧
                </div>
                <div className="trust-strip__info">
                  <h6 className="trust-strip__heading">24/7 Customer Support</h6>
                  <p className="trust-strip__desc">
                    We're here to help you anytime, anywhere.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              ALL GIVEAWAYS SHOWCASE (Statements 79 & 85)
              ══════════════════════════════════════════════════════════════ */}
          <section id="all-giveaways" className="section pt-4">
            <div className="section-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <p className="text-uppercase text-primary mb-1 small fw-bold">Active Reward Drops</p>
                <h2 className="fw-bold mb-0">All Available Giveaways</h2>
              </div>
              <div className="text-white-50 small">
                Showing all <strong>{giveaways.length}</strong> active reward opportunities
              </div>
            </div>

            <div className="featured-cards-grid">
              {giveaways.map((item, idx) => (
                <PrizeCard
                  key={item.id || item.slug || idx}
                  giveaway={item}
                  index={idx}
                />
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              Live Winner Activity Slider
              ══════════════════════════════════════════════════════════════ */}
          <section className="winner-ticker-section">
            <div className="text-center mb-3">
              <span className="text-uppercase text-primary small fw-bold">Live Transparency</span>
              <h3 className="fw-bold mb-1">Recent Winner Announcements</h3>
            </div>
            <WinnerSlider winners={winners} />
          </section>

          {/* ══════════════════════════════════════════════════════════════
              Winners Lifecycle Tabs (Current & Previous)
              ══════════════════════════════════════════════════════════════ */}
          <section id="winners" className="section pt-3">
            <div className="section-header mb-4">
              <div>
                <p className="text-uppercase text-primary mb-2 small fw-bold">Lifecycle Tracker</p>
                <h2 className="fw-bold mb-0">Giveaway Winners &amp; Previous Draws</h2>
              </div>
            </div>
            <div className="card-glass p-4">
              <WinnersTabs
                activeGiveaway={grandPrize}
                winners={winners}
                previousHistory={previousHistory}
                currentUserId={currentUserId}
                isLoggedIn={isLoggedIn}
                onClaimSubmit={handleClaimSubmit}
              />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              Dedicated Trust Section (Requirement 43)
              ══════════════════════════════════════════════════════════════ */}
          <section className="section pt-0">
            <TrustSection />
          </section>

          {/* ══════════════════════════════════════════════════════════════
              Rules & Guidelines
              ══════════════════════════════════════════════════════════════ */}
          <section id="rules-section" className="section pt-0">
            <div className="section-header mb-4">
              <div>
                <p className="text-uppercase text-primary mb-2 small fw-bold">Participation Rules</p>
                <h2 className="fw-bold mb-0">Rules &amp; Guidelines</h2>
              </div>
            </div>
            <div className="card-glass p-4">
              <Row className="g-4">
                {[
                  { title: 'Eligibility', text: 'Participation is open to verified VELOOP Rewards members only.' },
                  { title: 'Entry Requirements', text: 'The required VEs, SVEs, or Tokens must be available in your wallet before joining.' },
                  { title: 'One Entry Per Event', text: 'Each verified account may participate once per giveaway event. This is enforced at the database level.' },
                  { title: 'Winner Selection', text: 'Winners are selected by the VELOOP backend after the giveaway closes. Selection is random among all verified participants.' },
                  { title: 'Prize Claim', text: 'Winners must submit claim details within 7 days of announcement. Unclaimed prizes may be forfeited.' },
                  { title: 'Fraud Policy', text: 'Suspicious, fraudulent, or abusive activity results in immediate disqualification and platform-level action.' }
                ].map((rule) => (
                  <Col md={6} lg={4} key={rule.title}>
                    <div className="rule-card">
                      <h5 className="rule-card__title">{rule.title}</h5>
                      <p className="rule-card__text">{rule.text}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              FAQ Section
              ══════════════════════════════════════════════════════════════ */}
          <section id="faq" className="section pt-0 pb-5">
            <div className="text-center mb-5">
              <p className="text-uppercase text-primary mb-2 small fw-bold">Frequently Asked</p>
              <h2 className="fw-bold">Need answers before entering?</h2>
            </div>
            <FAQSection items={faqData} />
          </section>
        </Container>
      </main>

      {/* Giveaway Code Modal */}
      <GiveawayCodeModal
        show={showCodeModal}
        onHide={() => setShowCodeModal(false)}
        onCodeRedeemed={handleCodeRedeemed}
      />

      {/* Footer */}
      <footer className="giveaway-footer">
        <Container className="container-shell">
          <div className="giveaway-footer__inner">
            <div>
              <div className="giveaway-footer__brand">VELOOP Rewards</div>
              <div className="giveaway-footer__links">
                <Link to="/">Giveaway Home</Link>
                <a href="#rules-section">Rules</a>
                <a href="#faq">Terms</a>
                <a href="#faq">Privacy</a>
                <a href="#faq">Support</a>
              </div>
            </div>
            <div className="giveaway-footer__support">
              Have questions? Contact VELOOP Rewards support.
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default GiveawayHome;
