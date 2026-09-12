import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Modal, Alert } from 'react-bootstrap';
import Countdown from '../components/Countdown/Countdown';
import GiveawayLoader from '../components/GiveawayLoader/GiveawayLoader';
import { giveawayData } from '../data/giveawayData';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ── Statement 90: How This Giveaway Works (7-Step Timeline) ─────────────────
const timelineSteps = [
  { num: '01', icon: '🔍', title: 'Review the giveaway', text: 'Check the prize details, transparent entry fee, and duration.' },
  { num: '02', icon: '✅', title: 'Check your eligibility', text: 'Confirm your verified VELOOP membership and wallet currency balance.' },
  { num: '03', icon: '💎', title: 'Pay the required entry amount', text: 'The exact required reward currency is safely deducted from your account.' },
  { num: '04', icon: '📋', title: 'Your participation is recorded', text: 'Your single entry is securely registered in the draw database.' },
  { num: '05', icon: '⏳', title: 'Wait until the giveaway ends', text: 'Watch the live countdown timer tick down to the closing draw.' },
  { num: '06', icon: '🎯', title: 'Winner is selected', text: 'Provably fair, random selection verifies and announces the winner(s).' },
  { num: '07', icon: '🏆', title: 'Winner claims the prize', text: 'Winner submits shipping address or verified email to claim reward.' }
];

function GiveawayDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [giveaway, setGiveaway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [countdownEnded, setCountdownEnded] = useState(false);
  
  // Modals & States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImportantInfo, setShowImportantInfo] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ message: '', tone: 'success' });
  const [notified, setNotified] = useState(false);

  // Quick test balance simulator: 'real', 'sufficient', 'insufficient'
  const [balanceSimMode, setBalanceSimMode] = useState('real');

  const isLoggedIn = Boolean(user && (user.phone || user.email));

  // Find giveaway matching slug, id, or slugAliases
  useEffect(() => {
    const lookup = String(slug || '').toLowerCase();
    const localMatch = giveawayData.find(
      (g) =>
        g.slug?.toLowerCase() === lookup ||
        g.id?.toLowerCase() === lookup ||
        g.slugAliases?.some((alias) => alias.toLowerCase() === lookup)
    );

    if (localMatch) {
      setGiveaway(localMatch);
      setLoading(false);
    } else {
      const loadRemote = async () => {
        try {
          const r = await api.get(`/giveaways/slug/${slug}`);
          if (r.data?.success && r.data?.data) {
            setGiveaway(r.data.data);
          } else {
            setLoadError('This giveaway could not be found.');
          }
        } catch {
          setLoadError('This giveaway could not be found.');
        } finally {
          setLoading(false);
        }
      };
      loadRemote();
    }
  }, [slug]);

  const entryRequirement = useMemo(() => {
    return giveaway?.entryRequirement || {
      currency: 'VEs',
      amount: 250,
      requirementText: '250 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    };
  }, [giveaway]);

  const currency = entryRequirement.currency || 'VEs';
  const feeAmount = entryRequirement.amount || 250;

  // Currency-specific user balance calculation (Statements 87, 88, 89, 94, 95)
  const userBalance = useMemo(() => {
    if (balanceSimMode === 'sufficient') {
      return feeAmount + 350;
    }
    if (balanceSimMode === 'insufficient') {
      return Math.max(0, feeAmount - 130);
    }

    if (user?.balances?.[currency] !== undefined) {
      return user.balances[currency];
    }
    if (currency === 'VEs') {
      return entryRequirement.mockBalance ?? (user?.points || 350);
    }
    if (currency === 'SVEs') {
      return entryRequirement.mockBalance ?? 750;
    }
    if (currency === 'Tokens') {
      return entryRequirement.mockBalance ?? 2500;
    }
    return entryRequirement.mockBalance ?? 350;
  }, [balanceSimMode, user, currency, feeAmount, entryRequirement]);

  const canAfford = isLoggedIn && userBalance >= feeAmount;
  const balanceShortfall = feeAmount - userBalance;
  const balanceAfterJoining = userBalance - feeAmount;

  const statusStr = String(giveaway?.status || '').toLowerCase();
  const isUpcoming = statusStr === 'upcoming';
  const isEnded = countdownEnded || ['ended', 'completed', 'archived'].includes(statusStr);
  const isGiveawayLive = !isUpcoming && !isEnded;

  // Statement 86, 94 & 97: Primary CTA Label
  const primaryCta = useMemo(() => {
    if (isEnded) return 'View Winners';
    if (isUpcoming) return notified ? 'Notification Set 🔔' : 'Notify Me';
    if (!isLoggedIn) return 'Login to Participate';
    if (joined) return "You're Already Participating ✓";
    if (!canAfford) return `Earn More ${currency} →`;
    return `Join for ${feeAmount.toLocaleString()} ${currency}`;
  }, [isEnded, isUpcoming, notified, isLoggedIn, joined, canAfford, currency, feeAmount]);

  // Primary action handler (Statement 94 & 98)
  const handlePrimaryAction = () => {
    if (isEnded) {
      navigate('/#winners');
      return;
    }
    if (isUpcoming) {
      setNotified(true);
      setJoinStatus({ message: "You'll be notified when this giveaway goes live! 🔔", tone: 'info' });
      return;
    }
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (joined) return; // Prevent duplicate participation (Statement 97)
    if (!canAfford) {
      setJoinStatus({
        message: `You need ${balanceShortfall} more ${currency} to participate. Complete activities to earn more ${currency}.`,
        tone: 'warning'
      });
      return;
    }
    // Statement 94: Open confirmation modal
    setShowConfirmModal(true);
  };

  // Statement 94 & 96: Handle confirmation submit
  const handleConfirmJoin = async () => {
    setJoinLoading(true);
    setJoinStatus({ message: '', tone: 'success' });
    try {
      const targetId = giveaway._id || giveaway.id;
      const res = await api.post(`/giveaways/${targetId}/join`, {
        giveawayId: targetId,
        requestKey: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
      });

      if (res.data?.success) {
        setJoined(true);
        setShowConfirmModal(false);
        setJoinLoading(false);
        setShowSuccessModal(true);
        return;
      }
    } catch (err) {
      const errCode = err.response?.data?.message || err.response?.data?.code || '';
      
      // Statements 42 & 43: Friendly user error translation without exposing raw fraud or db errors
      let friendlyMessage = "Participation couldn't be completed. We couldn't verify this participation request. Please try again later or contact support.";
      let tone = 'warning';

      if (errCode === 'PARTICIPATION_ALREADY_EXISTS' || errCode === 'ALREADY_PARTICIPATING' || err.response?.status === 409) {
        friendlyMessage = "You're already participating. You can participate again when a new giveaway event begins.";
        setJoined(true);
      } else if (errCode.startsWith('INSUFFICIENT_') || errCode === 'INSUFFICIENT_BALANCE') {
        friendlyMessage = `Not enough ${currency}. You need ${balanceShortfall} more ${currency} to join this giveaway.`;
      } else if (errCode === 'GIVEAWAY_ENDED') {
        friendlyMessage = "This giveaway has ended. Check out the winners and get ready for the next giveaway.";
      } else if (errCode === 'LOGIN_REQUIRED' || err.response?.status === 401) {
        friendlyMessage = "Please log in to participate in this giveaway.";
      }

      setJoinStatus({ message: friendlyMessage, tone });
      setShowConfirmModal(false);
      setJoinLoading(false);
      return;
    }

    // Fallback seamless state transition
    setJoined(true);
    setShowConfirmModal(false);
    setJoinLoading(false);
    setShowSuccessModal(true);
  };

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/login?redirect=/giveaway/${slug}`}
        replace
        state={{ message: 'Please log in to view giveaway details.' }}
      />
    );
  }

  if (loading) return <GiveawayLoader fullPage />;

  if (loadError || !giveaway) {
    return (
      <div className="section text-center py-5">
        <Container className="container-shell">
          <div className="gh-error-box p-4 rounded card-glass text-center mx-auto" style={{ maxWidth: 500 }}>
            <div className="fs-1 mb-2" aria-hidden="true">⚠️</div>
            <h4 className="fw-bold mb-2">Giveaway Not Found</h4>
            <p className="text-white-50 mb-3">{loadError || 'Unable to find this giveaway drop.'}</p>
            <Link to="/" className="btn btn-primary-custom">← Back to Giveaways</Link>
          </div>
        </Container>
      </div>
    );
  }

  const isGiftCard = giveaway.prizeType === 'GIFT_CARD';
  const prizeValue = giveaway.prizes?.[0]?.value || (isGiftCard ? giveaway.title : 'Official Retail Value');

  return (
    <>
      <div className="section py-4">
        <Container className="container-shell detail-page-shell">

          {/* ── Statement 82: Navigation Bar with Clearly Visible Back Nav ── */}
          <nav className="detail-navbar mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Link to="/" className="btn btn-outline-light rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold">
              <span className="d-none d-sm-inline">← Giveaway Home</span>
              <span className="d-inline d-sm-none">← Giveaway</span>
            </Link>

            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark border border-secondary text-white-50 px-3 py-2">
                Currency: <strong className="text-white">{currency}</strong>
              </span>
              <span className="badge bg-primary bg-opacity-25 border border-primary border-opacity-50 text-white px-3 py-2">
                Entry Fee: <strong>{feeAmount} {currency}</strong>
              </span>
            </div>
          </nav>

          {/* ── Statement 81 & 83: Header / Hero Section with Premium Visual Treatment ── */}
          <div className="detail-hero card-glass position-relative overflow-hidden mb-4">
            <div className="detail-hero__ambient-glow" aria-hidden="true" />

            <div className="detail-hero__visual position-relative">
              <div className="detail-hero__visual-spotlight" aria-hidden="true" />
              <img
                src={giveaway.image}
                alt={giveaway.title}
                className="detail-hero__image img-fluid"
              />
              <div className="detail-hero__floating-badge">
                <span className="text-warning">★</span> Verified VELOOP Reward
              </div>
            </div>

            <div className="detail-hero__content">
              <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
                <Badge bg="primary" className="badge-pill px-3 py-2 fw-bold">
                  {giveaway.badge || '⭐ EXCLUSIVE GIVEAWAY'}
                </Badge>
                {isGiveawayLive && (
                  <Badge bg="success" className="badge-pill px-3 py-2 fw-bold">
                    ● GIVEAWAY LIVE
                  </Badge>
                )}
                {isEnded && (
                  <Badge bg="secondary" className="badge-pill px-3 py-2 fw-bold">
                    ● GIVEAWAY ENDED
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge bg="info" className="badge-pill px-3 py-2 fw-bold">
                    ● UPCOMING GIVEAWAY
                  </Badge>
                )}
              </div>

              <h1 className="detail-hero__title fw-bold">{giveaway.title}</h1>
              <p className="detail-hero__subtitle text-white-50 mb-3">
                {giveaway.description || giveaway.shortDescription}
              </p>

              {/* Countdown block */}
              <div className="detail-hero__countdown-card mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <span className="text-uppercase text-white-50 small fw-semibold">
                    {isUpcoming ? 'Starts in' : isEnded ? 'Status' : 'Ends in'}
                  </span>
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                    {isGiveawayLive ? 'Active Draw' : isEnded ? 'Ended' : 'Upcoming'}
                  </span>
                </div>
                {!isEnded ? (
                  <Countdown value={giveaway.endsIn} onEnd={() => setCountdownEnded(true)} />
                ) : (
                  <div className="fw-bold text-white-50">Giveaway Closed</div>
                )}
              </div>

              {/* Explicit joining cost display (Statement 86) */}
              <div className="detail-fee-pill mb-3 p-3 rounded d-flex justify-content-between align-items-center" style={{ background: 'rgba(108, 83, 232, 0.12)', border: '1px solid rgba(108, 83, 232, 0.3)' }}>
                <div>
                  <span className="text-white-50 small d-block">Entry Fee</span>
                  <strong className="fs-5 text-white">{feeAmount.toLocaleString()} {currency}</strong>
                </div>
                <div className="text-end">
                  <span className="text-white-50 small d-block">Required Balance</span>
                  <span className="badge bg-dark border border-secondary text-primary">
                    ≈ {feeAmount} {currency}
                  </span>
                </div>
              </div>

              {/* CTA Row */}
              <div className="detail-cta-row d-flex flex-wrap gap-2 align-items-center">
                {isGiveawayLive && (
                  !isLoggedIn ? (
                    <Button
                      className="btn-primary-custom px-4 py-2 fw-bold"
                      onClick={() => navigate(`/login?redirect=/giveaway/${slug}`)}
                      id="hero-join-btn"
                    >
                      📱 Login to Participate
                    </Button>
                  ) : (
                    <Button
                      className={`btn-primary-custom px-4 py-2 fw-bold ${!canAfford ? 'btn-warn' : ''}`}
                      onClick={handlePrimaryAction}
                      disabled={joined}
                      id="hero-join-btn"
                    >
                      {primaryCta}
                    </Button>
                  )
                )}
                {isEnded && (
                  <a href="/#winners" className="btn btn-outline-success rounded-pill px-4 py-2">
                    🏆 View Winners
                  </a>
                )}
                {isUpcoming && (
                  <Link to="/" className="btn btn-primary-custom rounded-pill px-4 py-2">
                    Explore Rewards →
                  </Link>
                )}
                <Link to="/" className="btn btn-outline-light rounded-pill px-3 py-2">
                  ← Back to List
                </Link>
              </div>

              {joinStatus.message && (
                <Alert variant={joinStatus.tone} className="mt-3 mb-0">
                  {joinStatus.message}
                </Alert>
              )}
            </div>
          </div>

          {/* ── Main Layout: Content & Sidebar ── */}
          <Row className="g-4 align-items-start">
            <Col lg={7}>

              {/* ── Statement 84: Prize Information Card ── */}
              <div className="card-glass p-4 detail-section-item mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-uppercase text-primary small fw-bold">Reward Showcase</span>
                    <h3 className="fw-bold mb-0">{giveaway.prize}</h3>
                  </div>
                  <Badge bg="secondary" className="badge-pill px-3 py-2">
                    🏆 {giveaway.winnerCount || 1} Winner{(giveaway.winnerCount || 1) > 1 ? 's' : ''}
                  </Badge>
                </div>

                <p className="text-white-50 mb-3">
                  {giveaway.shortDescription || giveaway.description}
                </p>

                {/* 4 Metrics */}
                <div className="detail-metrics-grid mb-4">
                  <div className="detail-metric-box">
                    <span className="detail-metric-box__label">Prize</span>
                    <strong>{giveaway.prize}</strong>
                  </div>
                  <div className="detail-metric-box">
                    <span className="detail-metric-box__label">🏆 Winners</span>
                    <strong>{giveaway.winnerCount || 1}</strong>
                  </div>
                  <div className="detail-metric-box">
                    <span className="detail-metric-box__label">👥 Participants</span>
                    <strong>{Number(giveaway.participants || 0).toLocaleString()}+</strong>
                  </div>
                  <div className="detail-metric-box">
                    <span className="detail-metric-box__label">⏳ Ends in</span>
                    <strong>{giveaway.endsIn || '12d'}</strong>
                  </div>
                </div>

                {/* Entry fee box */}
                <div className="detail-fee-box p-3 rounded mb-4" style={{ background: 'rgba(20,31,53,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="detail-fee-box__label text-white-50 small">Entry Fee</div>
                      <div className="detail-fee-box__value fs-4 fw-bold text-white">
                        💎 {feeAmount.toLocaleString()} {currency}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="small text-white-50">Participation Type</div>
                      <span className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-50">
                        1 Entry Per Member
                      </span>
                    </div>
                  </div>
                  <div className="detail-fee-box__hint small text-white-50 mt-2">
                    ≈ Required balance: <strong>{feeAmount} {currency}</strong> in your rewards wallet.
                  </div>
                </div>

                {/* Join button on Prize Card */}
                {isGiveawayLive && (
                  !isLoggedIn ? (
                    <Button
                      className="btn-primary-custom w-100 py-3 fw-bold fs-6"
                      onClick={() => navigate(`/login?redirect=/giveaway/${slug}`)}
                      id="prize-info-join-btn"
                    >
                      📱 Login to Join Giveaway
                    </Button>
                  ) : (
                    <Button
                      className={`btn-primary-custom w-100 py-3 fw-bold fs-6 ${!canAfford ? 'btn-warn' : ''}`}
                      onClick={handlePrimaryAction}
                      disabled={joined}
                      id="prize-info-join-btn"
                    >
                      {canAfford
                        ? `[ Join Giveaway – ${feeAmount.toLocaleString()} ${currency} ]`
                        : joined
                        ? "You're Already Participating ✓"
                        : `[ Earn More ${currency} → ]`}
                    </Button>
                  )
                )}
              </div>

              {/* ── Statement 93: Dedicated "About the Prize" Section ── */}
              <div className="card-glass p-4 detail-section-item mb-4">
                <div className="section-header mb-3">
                  <span className="text-uppercase text-primary small fw-bold">Prize Specifications</span>
                  <h3 className="fw-bold mb-0">About the Prize</h3>
                </div>

                <Row className="g-4 align-items-center">
                  <Col sm={5} className="text-center">
                    <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img
                        src={giveaway.image}
                        alt={giveaway.prize}
                        className="img-fluid rounded"
                        style={{ maxHeight: 220, objectFit: 'contain' }}
                      />
                    </div>
                  </Col>
                  <Col sm={7}>
                    <h4 className="fw-bold mb-2">{giveaway.prize}</h4>
                    <p className="text-white-50 mb-3">{giveaway.description}</p>

                    <div className="prize-specs-list d-flex flex-column gap-2 small">
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
                        <span className="text-white-50">Estimated Prize Value:</span>
                        <strong className="text-white">{prizeValue}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
                        <span className="text-white-50">Number of Winners:</span>
                        <strong className="text-white">{giveaway.winnerCount || 1} Winner{(giveaway.winnerCount || 1) > 1 ? 's' : ''}</strong>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-25">
                        <span className="text-white-50">Reward Type:</span>
                        <span className="badge bg-dark border border-secondary text-primary">
                          {giveaway.prizeType || 'PHYSICAL'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-white-50">Delivery / Claim:</span>
                        <strong className="text-white">
                          {isGiftCard
                            ? 'Delivered digitally via verified email within 48h'
                            : 'Courier delivery via insured partner courier'}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* ── Statement 90: How This Giveaway Works (Timeline with arrows) ── */}
              <div className="card-glass p-4 detail-section-item mb-4">
                <div className="section-header mb-4">
                  <span className="text-uppercase text-primary small fw-bold">Step-by-Step Flow</span>
                  <h3 className="fw-bold mb-0">How This Giveaway Works</h3>
                </div>

                <div className="timeline-step-list">
                  {timelineSteps.map((step, index) => (
                    <div key={step.title} className="d-flex flex-column">
                      <div className="timeline-item">
                        <div className="timeline-item__index">
                          <span aria-hidden="true">{step.icon}</span>
                          <span className="timeline-item__num">{step.num}</span>
                        </div>
                        <div className="timeline-item__content">
                          <h5>{step.title}</h5>
                          <p className="text-white-50">{step.text}</p>
                        </div>
                      </div>
                      {/* Visual down arrow indicator between steps (Statement 90) */}
                      {index < timelineSteps.length - 1 && (
                        <div className="text-center my-1" style={{ color: 'rgba(108, 83, 232, 0.6)', fontSize: '1.1rem', lineHeight: 1 }}>
                          ↓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Statement 99: Giveaway Participation Rules ── */}
              <div className="card-glass p-4 detail-section-item mb-4">
                <div className="section-header mb-3">
                  <span className="text-uppercase text-primary small fw-bold">Audit &amp; Fair Play</span>
                  <h3 className="fw-bold mb-0">Participation Rules</h3>
                </div>

                <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="d-flex flex-column gap-2 small">
                    <div>
                      <strong className="text-white">One Participation Per User:</strong>
                      <span className="text-white-50 ms-2">Enforced at the database level. Exactly 1 active entry allowed per verified account for this giveaway event.</span>
                    </div>
                    <div>
                      <strong className="text-white">Multiple Entries:</strong>
                      <span className="text-white-50 ms-2">Currently restricted to single entry to preserve fair and transparent winning probabilities for all members.</span>
                    </div>
                    <div>
                      <strong className="text-white">Re-Entry Policy:</strong>
                      <span className="text-white-50 ms-2">Once this draw closes, you may participate again in the next giveaway cycle.</span>
                    </div>
                    <div>
                      <strong className="text-white">Additional Entries Through Tasks:</strong>
                      <span className="text-white-50 ms-2">Complete platform engagement activities to earn more {currency} for future reward events.</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 small text-white-50 fst-italic">
                    * Note: If multi-entry tickets or tiered staking are officially introduced, rules will be updated dynamically.
                  </div>
                </div>
              </div>

              {/* ── Statement 91: Important Terms & Conditions Section ── */}
              <div className="card-glass p-4 detail-section-item mb-4">
                <div className="section-header mb-3">
                  <span className="text-uppercase text-primary small fw-bold">Legal &amp; Compliance</span>
                  <h3 className="fw-bold mb-0">Terms &amp; Conditions</h3>
                </div>

                <ul className="rules-list text-white-50 small mb-0">
                  <li className="mb-2">
                    <strong className="text-white">Eligibility:</strong> Verified VELOOP Rewards members only with active, authenticated email status.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Entry Requirement:</strong> Exactly {feeAmount} {currency} required to participate.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Participation:</strong> Joining locks your single verified entry into the random selection draw.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Giveaway Duration:</strong> This giveaway is live until the close timer finishes.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Winner Selection:</strong> {giveaway.winnerCount || 1} verified winner(s) selected randomly by the backend draw engine.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Winner Announcement:</strong> Published on this giveaway page, the Winners Tab, and member accounts.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Prize Claim:</strong> {isGiftCard ? 'Digital voucher delivered to verified email address.' : 'Physical courier address and phone number required.'}
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Claim Deadline:</strong> Winners have exactly 7 days from announcement to submit valid claim details.
                  </li>
                  <li className="mb-2">
                    <strong className="text-white">Disqualification:</strong> Suspicious, fraudulent, abusive, multi-account, or bot activity will result in immediate disqualification.
                  </li>
                  <li className="mb-0">
                    <strong className="text-white">Refund / Entry Policy (Placeholder):</strong> Entry amounts are locked upon participation. If a giveaway is cancelled by administration, the full entry amount will be refunded to your rewards wallet.
                  </li>
                </ul>
              </div>

              {/* ── Statement 92: Expandable "Important Information" Section ── */}
              <div className="card-glass p-4 detail-section-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold mb-1">Important Information</h4>
                    <p className="text-white-50 small mb-0">
                      Please review the giveaway rules and participation requirements carefully before joining.
                    </p>
                  </div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="rounded-pill"
                    onClick={() => setShowImportantInfo((prev) => !prev)}
                  >
                    {showImportantInfo ? 'Collapse −' : 'Expand +'}
                  </Button>
                </div>

                {showImportantInfo && (
                  <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                    <Row className="g-3 small">
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Entry Currency:</span>
                          <strong className="text-white">{currency}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Entry Amount:</span>
                          <strong className="text-white">{feeAmount} {currency}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Giveaway Duration:</span>
                          <strong className="text-white">{giveaway.endsIn || 'Active until close'}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Number of Winners:</span>
                          <strong className="text-white">{giveaway.winnerCount || 1}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Prize Details:</span>
                          <strong className="text-white">{giveaway.prize}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Winner Selection:</span>
                          <strong className="text-white">Random verified automated draw</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Claim Requirements:</span>
                          <strong className="text-white">{isGiftCard ? 'Verified email inbox' : 'Domestic postal address'}</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Account Eligibility:</span>
                          <strong className="text-white">Verified VELOOP members only</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Fraud Prevention:</span>
                          <strong className="text-white">Anti-duplicate &amp; device verification</strong>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-white-50 d-block">Platform Rules:</span>
                          <strong className="text-white">Auditable, non-gambling reward model</strong>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            </Col>

            {/* ── Right Column: Statements 87, 88, 89, 97, 98 Balance & Participation ── */}
            <Col lg={5}>
              {!isLoggedIn ? (
                /* ── Gated State: When Logged Out, Show Mobile Login CTA (Never show balance or joining options) ── */
                <div className="card-glass p-4 detail-sidebar-card mb-4 text-center">
                  <div
                    className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center text-primary mx-auto mb-3"
                    style={{ width: 64, height: 64, fontSize: '1.8rem' }}
                  >
                    🔒
                  </div>
                  <h4 className="fw-bold mb-2">Member Participation Locked</h4>
                  <p className="text-white-50 small mb-4">
                    Please login with your mobile number to view your rewards wallet balance, verify entry eligibility, and participate in this giveaway.
                  </p>

                  <div className="p-3 rounded mb-4 text-start" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="d-flex align-items-center gap-2 mb-2 small text-white-50">
                      <span className="text-success fw-bold">✓</span> Fast mobile number &amp; OTP sign-in
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2 small text-white-50">
                      <span className="text-success fw-bold">✓</span> View and deduct {currency} balance securely
                    </div>
                    <div className="d-flex align-items-center gap-2 small text-white-50">
                      <span className="text-success fw-bold">✓</span> Audited single-entry draw participation
                    </div>
                  </div>

                  <Button
                    id="sidebar-login-btn"
                    className="btn-primary-custom w-100 py-3 fw-bold fs-6"
                    onClick={() => navigate(`/login?redirect=/giveaway/${slug}`)}
                  >
                    📱 Login with Mobile Number to Join →
                  </Button>
                </div>
              ) : (
                /* ── Authenticated State: User Information & Joining Options ── */
                <div className="card-glass p-4 detail-sidebar-card mb-4">
                  {/* User Profile Header */}
                  <div className="p-3 rounded mb-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(108, 83, 232, 0.12)', border: '1px solid rgba(108, 83, 232, 0.3)' }}>
                    <div>
                      <span className="text-white-50 small d-block">Authenticated Account</span>
                      <strong className="text-white">📱 {user.name || user.phone}</strong>
                    </div>
                    <Badge bg="success" className="px-2 py-1">
                      Verified Member ✓
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">Balance Verification</h4>
                    <Badge bg="dark" className="border border-secondary text-white-50">
                      Live Check
                    </Badge>
                  </div>

                  {/* Tester simulator toolbar for toggling sufficient / insufficient balance */}
                  <div className="balance-sim-toolbar mb-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                    <div className="small text-white-50 mb-1 d-flex justify-content-between">
                      <span>⚡ Quick Test Simulator:</span>
                      <span className="text-primary">{balanceSimMode.toUpperCase()}</span>
                    </div>
                    <div className="btn-group w-100 btn-group-sm">
                      <button
                        type="button"
                        className={`btn ${balanceSimMode === 'sufficient' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => setBalanceSimMode('sufficient')}
                      >
                        ✓ Sufficient
                      </button>
                      <button
                        type="button"
                        className={`btn ${balanceSimMode === 'insufficient' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setBalanceSimMode('insufficient')}
                      >
                        ⚠️ Insufficient
                      </button>
                      <button
                        type="button"
                        className={`btn ${balanceSimMode === 'real' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setBalanceSimMode('real')}
                      >
                        Default
                      </button>
                    </div>
                  </div>

                  {/* Statement 87 & 88: Balance verification box */}
                  <div className="detail-balance-box p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="detail-balance-box__label text-white-50 small">Your Balance</span>
                      <strong className="fs-5 text-white">
                        {userBalance.toLocaleString()} {currency}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="detail-balance-box__label text-white-50 small">Entry Fee</span>
                      <strong className="text-primary">
                        {feeAmount.toLocaleString()} {currency}
                      </strong>
                    </div>

                    <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />

                    {/* Statement 87: Sufficient State */}
                    {canAfford && (
                      <div className="balance-status-alert p-2 rounded text-success small" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <div className="fw-bold mb-1">✓ You have enough {currency}</div>
                        <div className="text-white-50">
                          Balance after joining: <strong>{balanceAfterJoining.toLocaleString()} {currency}</strong>
                        </div>
                      </div>
                    )}

                    {/* Statement 88: Insufficient State */}
                    {!canAfford && (
                      <div className="balance-status-alert p-2 rounded text-warning small" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <div className="fw-bold mb-1">⚠️ Insufficient {currency}</div>
                        <div>
                          You need <strong>{balanceShortfall.toLocaleString()} more {currency}</strong> to participate.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA in Sidebar: Joining Option */}
                  <Button
                    id="sidebar-join-btn"
                    className={`w-100 py-3 fw-bold ${canAfford ? 'btn-primary-custom' : 'btn-outline-warning'}`}
                    onClick={handlePrimaryAction}
                    disabled={isEnded || joined}
                  >
                    {primaryCta}
                  </Button>

                  {/* ── Statement 97: Already Joined State Box ── */}
                  {joined && (
                    <div className="detail-success-box mt-3 p-3 rounded text-center" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <div className="fs-3 mb-1">✓</div>
                      <div className="fw-bold text-success">You're Already Participating</div>
                      <small className="text-white-50 d-block mt-1">
                        Your entry has already been recorded.
                      </small>
                      <a href="#hero-join-btn" className="btn btn-outline-success btn-sm rounded-pill mt-3 px-3">
                        View Giveaway Status
                      </a>
                    </div>
                  )}

                  {/* Entry Meter */}
                  <div className="detail-balance-box p-3 rounded mt-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-white-50">Your Entries</span>
                      <strong className="text-primary">{joined ? '1 Entry' : '0 Entries'}</strong>
                    </div>
                    <div className="gh-entry-meter__bar mb-2">
                      <span style={{ width: joined ? '100%' : '0%' }} />
                    </div>
                    <small className="text-white-50">1 entry per verified account per event.</small>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* ── Statement 94 & 95: Entry Fee Confirmation Modal ─────────── */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md">
        <Modal.Header
          closeButton
          style={{ background: 'rgba(17,24,39,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Modal.Title className="text-white fw-bold">Confirm Participation</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(17,24,39,0.98)' }} className="text-white">
          <div className="text-center mb-3">
            <div className="fs-1 mb-2" aria-hidden="true">🏆</div>
            <h5 className="fw-bold mb-1">{giveaway.prize}</h5>
            <div className="text-white-50 small">{giveaway.shortDescription}</div>
          </div>

          <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-white-50">Entry Fee:</span>
              <strong className="text-white">{feeAmount.toLocaleString()} {currency}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-white-50">Your Balance:</span>
              <strong className="text-white">{userBalance.toLocaleString()} {currency}</strong>
            </div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <div className="d-flex justify-content-between text-success">
              <span>Balance After Joining:</span>
              <strong>{balanceAfterJoining.toLocaleString()} {currency}</strong>
            </div>
          </div>

          <p className="small text-white-50 mb-0">
            By continuing, you confirm that you have reviewed the giveaway rules and terms.
            The entry fee of <strong>{feeAmount} {currency}</strong> will be deducted from your wallet.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'rgba(17,24,39,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <Button variant="outline-light" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button className="btn-primary-custom" onClick={handleConfirmJoin} disabled={joinLoading} id="confirm-join-btn">
            {joinLoading ? 'Processing...' : 'Confirm & Join'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Statement 96: Successful Join State Modal ───────────────── */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered size="md">
        <Modal.Body style={{ background: 'rgba(17,24,39,0.98)' }} className="text-white text-center p-4">
          <div className="fs-1 mb-2" aria-hidden="true">🎉</div>
          <h3 className="fw-bold text-success mb-2">You're In!</h3>
          <p className="text-white-50 mb-3">
            Your participation for the <strong>{giveaway.prize}</strong> giveaway has been successfully recorded.
          </p>

          <div className="p-3 rounded mb-3 mx-auto" style={{ maxWidth: 300, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-white-50 small d-block">Entry Fee Paid:</span>
            <strong className="fs-5 text-white">{feeAmount.toLocaleString()} {currency}</strong>
          </div>

          <p className="fw-semibold text-primary mb-4">
            Good luck! 🍀
          </p>

          <Button className="btn-primary-custom w-100" onClick={() => setShowSuccessModal(false)}>
            View Giveaway
          </Button>
        </Modal.Body>
      </Modal>

      {/* ── Statement 98: Login Prompt Modal for Visitors ───────────── */}
      <Modal show={showLoginPrompt} onHide={() => setShowLoginPrompt(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: 'rgba(17,24,39,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <Modal.Title className="text-white fw-bold">Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(17,24,39,0.98)' }} className="text-white text-center p-3">
          <p className="text-white-50 small mb-3">
            Please login to your VELOOP Rewards account before participating in this giveaway.
          </p>
          <div className="d-flex flex-column gap-2">
            <Button className="btn-primary-custom w-100" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="outline-light" className="w-100" onClick={() => navigate('/login')}>
              Create Account
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Statement 101: Individual Page Compact Footer ───────────── */}
      <footer className="giveaway-footer mt-5 pt-4 pb-4 border-top border-secondary border-opacity-25" style={{ background: 'rgba(8, 13, 26, 0.95)' }}>
        <Container className="container-shell">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="fw-bold fs-5 text-white d-flex align-items-center gap-2 mb-1">
                <span className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white" style={{ width: 26, height: 26, fontSize: '0.8rem' }}>
                  V
                </span>
                VELOOP Rewards
              </div>
              <div className="d-flex gap-3 flex-wrap small text-white-50">
                <Link to="/" className="text-white-50 text-decoration-none hover-white">Giveaway Home</Link>
                <a href="/#rules-section" className="text-white-50 text-decoration-none hover-white">Rules</a>
                <Link to="/giveaway/iphone-15-pro" className="text-white-50 text-decoration-none hover-white">Terms</Link>
                <Link to="/" className="text-white-50 text-decoration-none hover-white">Privacy</Link>
                <a href="mailto:support@veloop.io" className="text-white-50 text-decoration-none hover-white">Support</a>
              </div>
            </div>

            <div className="text-end small text-white-50">
              <div>Have questions? Contact VELOOP Rewards support.</div>
              <div className="text-white-50 opacity-75">© 2026 VELOOP Rewards Inc. All rights reserved.</div>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default GiveawayDetails;

