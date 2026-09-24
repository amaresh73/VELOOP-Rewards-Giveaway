import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Container, Row, Col, Modal } from 'react-bootstrap';
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
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to view giveaways.' }} />;
  }

  // Giveaways list initialized with giveawayData so it always renders without blank states
  const [giveaways, setGiveaways] = useState(giveawayData);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState(currentWinnerData);
  const [previousHistory, setPreviousHistory] = useState(previousWinnerData);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Search & Filter state for "All Giveaways"
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('ending-soon');

  // Ref for horizontal active giveaways carousel
  const activeScrollRef = useRef(null);

  // Live countdown timer matching Reference Image (12d : 08h : 45m : 32s)
  const [countdown, setCountdown] = useState({
    days: 12,
    hours: 8,
    mins: 45,
    secs: 32
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  // Load backend data if available, with graceful fallback to reference mock data
  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      try {
        const [response, winnersResponse, historyResponse] = await Promise.allSettled([
          fetchGiveaways(),
          api.get('/winners'),
          api.get('/giveaways/previous')
        ]);

        if (!isMounted) return;

        if (response.status === 'fulfilled' && Array.isArray(response.value?.data) && response.value.data.length > 0) {
          // Merge while ensuring all 8 reference drops are always present and properly enriched with local high-res images
          const backendList = response.value.data;
          const merged = giveawayData.map((refItem) => {
            const match = backendList.find((b) => b.slug === refItem.slug || b.title?.toLowerCase() === refItem.title?.toLowerCase());
            return match ? {
              ...refItem,
              ...match,
              image: refItem.image || match.image,
              glowColor: refItem.glowColor,
              category: refItem.category
            } : refItem;
          });
          setGiveaways(merged);
        } else {
          setGiveaways(giveawayData);
        }

        if (winnersResponse.status === 'fulfilled' && winnersResponse.value?.data?.data?.length) {
          setWinners(winnersResponse.value.data.data);
        }
        if (historyResponse.status === 'fulfilled' && historyResponse.value?.data?.data?.length) {
          setPreviousHistory(historyResponse.value.data.data);
        }
      } catch (error) {
        console.warn('Using standard mock dataset for giveaway dashboard:', error);
      }
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Scroll active giveaways carousel
  const handleActiveScroll = (direction) => {
    if (activeScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      activeScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered & sorted giveaways for "All Giveaways" section
  const filteredGiveaways = useMemo(() => {
    let list = [...giveaways];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) =>
        (g.title || '').toLowerCase().includes(q) ||
        (g.prize || '').toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q)
      );
    }

    // Filter by Category Pill
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Tech') {
        list = list.filter((g) => ['Tech', 'Mobile', 'Wearable', 'Audio'].includes(g.category) || ['Tech', 'Mobile', 'Wearable'].includes(g.prizeCategory));
      } else if (selectedCategory === 'Gift Cards') {
        list = list.filter((g) => ['Gift Cards', 'Gift Card', 'Digital'].includes(g.category) || ['Gift Cards', 'Gift Card'].includes(g.prizeCategory));
      } else if (selectedCategory === 'Gaming') {
        list = list.filter((g) => ['Gaming', 'Console'].includes(g.category) || ['Gaming'].includes(g.prizeCategory));
      } else if (selectedCategory === 'Lifestyle') {
        list = list.filter((g) => ['Lifestyle', 'Travel'].includes(g.category) || ['Lifestyle'].includes(g.prizeCategory));
      } else if (selectedCategory === 'Other') {
        list = list.filter((g) => !['Tech', 'Gift Cards', 'Gaming', 'Lifestyle'].includes(g.category));
      }
    }

    // Sort
    if (sortBy === 'ending-soon') {
      list.sort((a, b) => (a.entries || 0) - (b.entries || 0));
    } else if (sortBy === 'most-popular') {
      list.sort((a, b) => (b.entries || 0) - (a.entries || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
    }

    return list;
  }, [giveaways, searchQuery, selectedCategory, sortBy]);

  // Active Giveaways: First 4 live cards
  const activeGiveaways = useMemo(() => {
    return giveaways.slice(0, 4);
  }, [giveaways]);

  // Handle Newsletter Subscribe
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterSuccess(false);
      setNewsletterEmail('');
    }, 4000);
  };

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

  const currentUserId = user?._id || user?.id || null;
  const grandPrize = giveaways[0] || giveawayData[0];

  if (loading) return <GiveawayLoader fullPage />;

  return (
    <>
      <main id="top" className="giveaway-main-wrapper" style={{ background: '#050711', color: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
        <Container className="container-shell py-4">

          {/* ══════════════════════════════════════════════════════════════
              1. HERO SECTION — PREMIUM 3-COL LAYOUT
              ══════════════════════════════════════════════════════════════ */}
          <section className="position-relative mb-5 pt-3">
            {/* Ambient Cosmic Violet Lighting Auras */}
            <div
              className="position-absolute"
              style={{
                top: '-80px',
                left: '-100px',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />
            <div
              className="position-absolute"
              style={{
                top: '-40px',
                right: '-80px',
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, transparent 70%)',
                filter: 'blur(55px)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <Row className="g-4 align-items-stretch position-relative" style={{ zIndex: 2 }}>

              {/* ── COL 1: Headline & Trust Badges ── */}
              <Col lg={4} xl={4} className="d-flex flex-column justify-content-between">
                <div>
                  {/* Eyebrow Pill */}
                  <div
                    className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>🎁</span>
                    <span className="text-uppercase fw-bold" style={{ letterSpacing: '0.12em', color: '#c084fc', fontSize: '0.72rem' }}>
                      EXCLUSIVE GIVEAWAYS
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="fw-bolder text-white mb-3" style={{ fontSize: 'clamp(2.5rem, 3.4vw, 3.6rem)', lineHeight: 1.12, letterSpacing: '-0.03em' }}>
                    Unlock<br />
                    <span style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 35px rgba(168, 85, 247, 0.4)' }}>
                      Rewards.
                    </span><br />
                    Enter. Win.
                  </h1>

                  {/* Subtitle */}
                  <p className="text-white-50 mb-4 lh-base" style={{ fontSize: '0.98rem', maxWidth: '380px' }}>
                    Join VELOOP Rewards giveaways, complete simple tasks and get a chance to win amazing prizes.
                  </p>

                  {/* CTA Buttons */}
                  <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                    <a
                      href="#all-giveaways"
                      className="btn rounded-pill px-4 py-2 fw-semibold text-white d-flex align-items-center gap-2 border-0 shadow"
                      style={{
                        background: 'linear-gradient(90deg, #7c3aed, #9333ea)',
                        boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)',
                        fontSize: '0.92rem'
                      }}
                    >
                      <span>Explore Giveaways</span>
                      <span>→</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="btn rounded-pill px-4 py-2 fw-medium text-white d-flex align-items-center gap-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        fontSize: '0.92rem'
                      }}
                    >
                      <span>▷</span>
                      <span>Watch Video</span>
                    </button>
                  </div>
                </div>

                {/* 3 Micro-trust Badges */}
                <div className="pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.9rem' }}>
                        🛡️
                      </div>
                      <div className="lh-1">
                        <div className="fw-bold text-white" style={{ fontSize: '0.78rem' }}>100% Free</div>
                        <div className="text-white-50" style={{ fontSize: '0.68rem' }}>to Participate</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.9rem' }}>
                        🏆
                      </div>
                      <div className="lh-1">
                        <div className="fw-bold text-white" style={{ fontSize: '0.78rem' }}>Real Prizes</div>
                        <div className="text-white-50" style={{ fontSize: '0.68rem' }}>Real Winners</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.9rem' }}>
                        🔒
                      </div>
                      <div className="lh-1">
                        <div className="fw-bold text-white" style={{ fontSize: '0.78rem' }}>Trusted</div>
                        <div className="text-white-50" style={{ fontSize: '0.68rem' }}>&amp; Transparent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* ── COL 2: Center Featured Card - PS5 Bundle Spotlight ── */}
              <Col lg={5} xl={5}>
                <div
                  className="h-100 p-4 rounded-4 position-relative d-flex flex-column justify-content-between overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(16, 19, 44, 0.94) 0%, rgba(9, 12, 28, 0.98) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  {/* Top Bar: Amber Badge & Countdown */}
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                      <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>★</span>
                      <span className="text-uppercase fw-bold" style={{ color: '#fbbf24', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                        FEATURED GIVEAWAY
                      </span>
                    </div>

                    {/* Clock Countdown */}
                    <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#c084fc' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span className="text-white-50" style={{ fontSize: '0.74rem' }}>Ends in</span>
                      <span className="text-white fw-bold font-monospace" style={{ fontSize: '0.78rem' }}>
                        {countdown.days}d : {String(countdown.hours).padStart(2, '0')}h : {String(countdown.mins).padStart(2, '0')}m
                      </span>
                    </div>
                  </div>

                  {/* Body: Title, Features Checklist & PS5 3D Render */}
                  <div className="row g-3 align-items-center my-auto">
                    <div className="col-7">
                      <h3 className="fw-bolder text-white mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                        PlayStation 5 Bundle
                      </h3>
                      <p className="text-white-50 small mb-3" style={{ fontSize: '0.82rem' }}>
                        Next gen gaming. Higher level experiences. Yours to win.
                      </p>

                      <div className="d-flex flex-column gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-white small" style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: '#38bdf8' }}>🛡️</span>
                          <span>PlayStation 5 Console</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-white small" style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: '#38bdf8' }}>🛡️</span>
                          <span>DualSense Wireless Controller</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-white small" style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: '#38bdf8' }}>🛡️</span>
                          <span>1 Year PS Plus Membership</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-5 text-center position-relative">
                      {/* Ambient Purple Halo Glow behind PS5 */}
                      <div
                        className="position-absolute top-50 start-50 translate-middle"
                        style={{
                          width: '130%',
                          height: '130%',
                          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 70%)',
                          filter: 'blur(22px)',
                          pointerEvents: 'none'
                        }}
                      />
                      <img
                        src="/images/ps5_bundle_spotlight.jpg"
                        alt="PlayStation 5 Bundle"
                        className="img-fluid position-relative"
                        style={{
                          maxHeight: '190px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))',
                          borderRadius: '12px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Live Progress Bar: 8,420 / 10,000 Entries */}
                  <div className="mt-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center text-white-50 small mb-1" style={{ fontSize: '0.76rem' }}>
                      <span><strong className="text-white">8,420</strong> / 10,000 Entries</span>
                      <span className="fw-bold" style={{ color: '#c084fc' }}>84%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)' }}>
                      <div
                        className="progress-bar rounded-pill"
                        role="progressbar"
                        style={{
                          width: '84%',
                          background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                          boxShadow: '0 0 12px rgba(168, 85, 247, 0.6)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Enter Button */}
                  <Link
                    to="/giveaway/playstation-5-bundle"
                    className="btn w-100 py-2 fw-semibold text-white rounded-pill d-flex align-items-center justify-content-center gap-2 border-0 shadow"
                    style={{
                      background: 'linear-gradient(90deg, #7c3aed, #9333ea)',
                      boxShadow: '0 0 25px rgba(124, 58, 237, 0.55)',
                      fontSize: '0.95rem'
                    }}
                  >
                    <span>Enter Now</span>
                    <span>→</span>
                  </Link>
                </div>
              </Col>

              {/* ── COL 3: Right Widgets Stack ── */}
              <Col lg={3} xl={3} className="d-flex flex-column justify-content-between gap-3">
                {/* Widget 1: Your Rewards */}
                <div
                  id="my-rewards-section"
                  className="p-3 rounded-4"
                  style={{
                    background: 'rgba(14, 18, 40, 0.88)',
                    border: '1px solid rgba(139, 92, 246, 0.28)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2 text-white fw-bold small">
                      <span style={{ color: '#fbbf24' }}>🪙</span>
                      <span>Your Rewards</span>
                    </div>
                    {/* Header Window Icons */}
                    <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: '0.75rem' }}>
                      <span>⛶</span>
                      <span>⤢</span>
                      <span>✕</span>
                    </div>
                  </div>

                  {/* Points Counter */}
                  <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)', boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)', fontSize: '1.3rem' }}>
                      🪙
                    </div>
                    <div>
                      <div className="fw-bolder text-white" style={{ fontSize: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        {isLoggedIn ? (user?.walletBalance || 8450).toLocaleString() : '8,450'}
                      </div>
                      <div className="text-white-50" style={{ fontSize: '0.74rem' }}>Reward Points</div>
                    </div>
                  </div>

                  {/* 3 Quick Action Tiles */}
                  <div className="d-flex justify-content-between gap-2 mb-3">
                    <div
                      onClick={() => setShowCodeModal(true)}
                      className="rounded-3 p-2 text-center flex-grow-1 text-white"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontSize: '1.1rem' }}>📅</div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Daily Check-in</div>
                    </div>
                    <div
                      onClick={() => setShowCodeModal(true)}
                      className="rounded-3 p-2 text-center flex-grow-1 text-white"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontSize: '1.1rem' }}>📋</div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Complete Tasks</div>
                    </div>
                    <div
                      onClick={() => setShowCodeModal(true)}
                      className="rounded-3 p-2 text-center flex-grow-1 text-white"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontSize: '1.1rem' }}>👥</div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Refer Friends</div>
                    </div>
                  </div>

                  {/* Full-width Button */}
                  <button
                    onClick={() => setShowCodeModal(true)}
                    className="btn w-100 py-2 fw-semibold text-white rounded-pill d-flex align-items-center justify-content-center gap-2 border-0"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #9333ea)', fontSize: '0.86rem' }}
                  >
                    <span>View All Rewards</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Widget 2: Refer & Earn with 3D Gift Box */}
                <div
                  className="p-3 rounded-4 position-relative overflow-hidden d-flex align-items-center justify-content-between"
                  style={{
                    background: 'linear-gradient(135deg, rgba(28, 20, 52, 0.92) 0%, rgba(16, 12, 38, 0.96) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div>
                    <div className="fw-bolder" style={{ color: '#fbbf24', fontSize: '0.98rem' }}>
                      Refer &amp; Earn
                    </div>
                    <div className="text-white-50 small mt-1" style={{ fontSize: '0.74rem', maxWidth: '140px' }}>
                      Invite your friends and earn extra entries!
                    </div>
                  </div>
                  <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 68, height: 68 }}>
                    <div className="position-absolute" style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)', filter: 'blur(10px)' }}></div>
                    <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5))' }}>🎁</span>
                  </div>
                </div>
              </Col>

            </Row>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              2. GRAND FEATURE SPOTLIGHT — DYNAMIC PRODUCT SHOWCASE
              ══════════════════════════════════════════════════════════════ */}
          <section className="mb-5 position-relative">
            <div
              className="p-4 p-lg-5 rounded-4 position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 14, 45, 0.95) 0%, rgba(9, 8, 25, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Ambient radial auras */}
              <div className="position-absolute" style={{ top: '10%', right: '15%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
              <div className="position-absolute" style={{ bottom: '10%', left: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none' }} />

              <Row className="align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
                {/* ── LEFT: Copy, Features, Countdown & CTA ── */}
                <Col lg={6}>
                  <div className="position-relative">
                    {/* Top Eyebrow */}
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                      <span style={{ fontSize: '0.85rem' }}>🎁</span>
                      <span className="text-uppercase fw-bold" style={{ color: '#fbbf24', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
                        GIVEAWAY
                      </span>
                    </div>

                    {/* Cursive handwritten note */}
                    <div className="position-absolute d-none d-sm-block" style={{ top: '-10px', left: '180px', fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '1.25rem', color: '#c084fc', transform: 'rotate(-6deg)' }}>
                      Bigger Rewards<br />Brighter Days! ⤹
                    </div>

                    {/* Headline */}
                    <h2 className="fw-bolder text-white mb-1" style={{ fontSize: 'clamp(2.4rem, 3.2vw, 3.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                      Enter to <span style={{ background: 'linear-gradient(90deg, #c084fc 0%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Win</span>
                    </h2>
                    <h3 className="fw-bold mb-3" style={{ color: '#fbbf24', fontSize: 'clamp(1.4rem, 2vw, 1.85rem)' }}>
                      Amazing Prizes Await!
                    </h3>

                    {/* Paragraph */}
                    <p className="text-white-50 mb-4" style={{ fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '480px' }}>
                      Join VELOOP Rewards giveaways, complete simple tasks and get a chance to win incredible prizes. More participation, more chances, more rewards!
                    </p>

                    {/* 3 Feature Pills */}
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ color: '#fbbf24' }}>⚡</span>
                        <div className="lh-1">
                          <div className="fw-bold text-white small" style={{ fontSize: '0.76rem' }}>Easy to Participate</div>
                          <div className="text-white-50" style={{ fontSize: '0.66rem' }}>Just a few steps</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ color: '#818cf8' }}>🛡️</span>
                        <div className="lh-1">
                          <div className="fw-bold text-white small" style={{ fontSize: '0.76rem' }}>100% Free</div>
                          <div className="text-white-50" style={{ fontSize: '0.66rem' }}>No purchase required</div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <span style={{ color: '#c084fc' }}>🎁</span>
                        <div className="lh-1">
                          <div className="fw-bold text-white small" style={{ fontSize: '0.76rem' }}>Real Rewards</div>
                          <div className="text-white-50" style={{ fontSize: '0.66rem' }}>Amazing prizes for users</div>
                        </div>
                      </div>
                    </div>

                    {/* Digital Countdown Box */}
                    <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(10, 8, 26, 0.85)', border: '1px solid rgba(139, 92, 246, 0.25)', maxWidth: '440px' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-white-50 small" style={{ fontSize: '0.76rem' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>Giveaway Ends In</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <div className="text-center p-2 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div className="fw-bolder text-white font-monospace fs-4">{String(countdown.days).padStart(2, '0')}</div>
                          <div className="text-white-50" style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}>DAYS</div>
                        </div>
                        <div className="text-center p-2 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div className="fw-bolder text-white font-monospace fs-4">{String(countdown.hours).padStart(2, '0')}</div>
                          <div className="text-white-50" style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}>HOURS</div>
                        </div>
                        <div className="text-center p-2 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div className="fw-bolder text-white font-monospace fs-4">{String(countdown.mins).padStart(2, '0')}</div>
                          <div className="text-white-50" style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}>MINUTES</div>
                        </div>
                        <div className="text-center p-2 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <div className="fw-bolder font-monospace fs-4" style={{ color: '#c084fc' }}>{String(countdown.secs).padStart(2, '0')}</div>
                          <div className="text-white-50" style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}>SECONDS</div>
                        </div>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                      <Link
                        to="/giveaway/iphone-15-pro"
                        className="btn rounded-pill px-4 py-2 fw-bold text-white d-flex align-items-center gap-2 border-0 shadow"
                        style={{ background: 'linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)', boxShadow: '0 0 25px rgba(168, 85, 247, 0.6)', fontSize: '0.94rem' }}
                      >
                        <span>🎁 Enter Giveaway</span>
                        <span>→</span>
                      </Link>
                      <a
                        href="#rules-section"
                        className="btn rounded-pill px-4 py-2 fw-medium text-white d-flex align-items-center gap-2"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.94rem' }}
                      >
                        <span>📄 View Details</span>
                      </a>
                    </div>

                    {/* Social Proof Avatar Row */}
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center">
                        <span className="rounded-circle d-inline-flex align-items-center justify-content-center text-white small fw-bold" style={{ width: 28, height: 28, background: '#7c3aed', border: '2px solid #0a081a', marginLeft: '0' }}>A</span>
                        <span className="rounded-circle d-inline-flex align-items-center justify-content-center text-white small fw-bold" style={{ width: 28, height: 28, background: '#3b82f6', border: '2px solid #0a081a', marginLeft: '-8px' }}>R</span>
                        <span className="rounded-circle d-inline-flex align-items-center justify-content-center text-white small fw-bold" style={{ width: 28, height: 28, background: '#ec4899', border: '2px solid #0a081a', marginLeft: '-8px' }}>S</span>
                        <span className="rounded-circle d-inline-flex align-items-center justify-content-center text-white small fw-bold" style={{ width: 28, height: 28, background: '#f59e0b', border: '2px solid #0a081a', marginLeft: '-8px' }}>+8.5K</span>
                      </div>
                      <div className="lh-1 ms-2">
                        <div className="fw-bold text-white" style={{ fontSize: '0.78rem' }}>8,500+ people have already joined!</div>
                        <div className="text-white-50" style={{ fontSize: '0.7rem' }}>Will you be the next winner?</div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* ── RIGHT: Illuminated Circular Pedestal with Floating Drops ── */}
                <Col lg={6} className="text-center position-relative">
                  <div className="position-relative d-inline-block" style={{ width: '100%', maxWidth: '520px' }}>
                    <img
                      src="/images/pedestal_stage_grand.png"
                      alt="Grand Prize Showcase: iPhone 15 Pro, AirPods Pro 2, Amazon Gift Card"
                      className="img-fluid position-relative"
                      style={{
                        maxHeight: '550px',
                        width: '150%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 20px 40px rgba(124, 58, 237, 0.45))'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/iphone_15_pro.jpg';
                      }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Bottom 3 Trust Cards Strip */}
              <div className="row g-3 mt-4 pt-3 position-relative" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 2 }}>
                <Col md={4}>
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ fontSize: '1.4rem' }}>👥</span>
                    <div className="lh-1">
                      <div className="fw-bold text-white small" style={{ fontSize: '0.85rem' }}>1.2K+ Prizes Won</div>
                      <div className="text-white-50" style={{ fontSize: '0.72rem' }}>Real winners, real happiness</div>
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                    <div className="lh-1">
                      <div className="fw-bold text-white small" style={{ fontSize: '0.85rem' }}>Trusted Platform</div>
                      <div className="text-white-50" style={{ fontSize: '0.72rem' }}>Secure, fair and transparent</div>
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <span style={{ fontSize: '1.4rem' }}>⭐</span>
                    <div className="lh-1">
                      <div className="fw-bold text-white small" style={{ fontSize: '0.85rem' }}>Open Worldwide</div>
                      <div className="text-white-50" style={{ fontSize: '0.72rem' }}>Everyone is welcome to participate</div>
                    </div>
                  </div>
                </Col>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              2. LIVE STATS BAR (4 METRIC COUNTERS - EXACT MATCH)
              ══════════════════════════════════════════════════════════════ */}
          <section className="mb-5">
            <div
              className="p-4 rounded-4 d-flex flex-wrap align-items-center justify-content-between gap-4"
              style={{
                background: 'rgba(12, 16, 38, 0.9)',
                border: '1px solid rgba(139, 92, 246, 0.22)',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Stat 1: 24 Active Giveaways */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(124, 58, 237, 0.18)', border: '1px solid rgba(124, 58, 237, 0.35)', color: '#c084fc', fontSize: '1.25rem' }}>
                  🎁
                </div>
                <div>
                  <h4 className="fw-bolder text-white mb-0" style={{ fontSize: '1.35rem' }}>24</h4>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.76rem' }}>Active Giveaways</p>
                </div>
              </div>

              {/* Stat 2: 8.5K+ Total Participants */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(56, 189, 248, 0.18)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', fontSize: '1.25rem' }}>
                  👥
                </div>
                <div>
                  <h4 className="fw-bolder text-white mb-0" style={{ fontSize: '1.35rem' }}>8.5K+</h4>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.76rem' }}>Total Participants</p>
                </div>
              </div>

              {/* Stat 3: 1.2K+ Prizes Won */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '1.25rem' }}>
                  🛡️
                </div>
                <div>
                  <h4 className="fw-bolder text-white mb-0" style={{ fontSize: '1.35rem' }}>1.2K+</h4>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.76rem' }}>Prizes Won</p>
                </div>
              </div>

              {/* Stat 4: 12d : 08h : 45m Next Draw */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontSize: '1.25rem' }}>
                  ⏱
                </div>
                <div>
                  <h4 className="fw-bolder text-white mb-0 font-monospace" style={{ fontSize: '1.25rem' }}>12d : 08h : 45m</h4>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.76rem' }}>Next Draw</p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              3. ACTIVE GIVEAWAYS (HORIZONTAL CAROUSEL ROW)
              ══════════════════════════════════════════════════════════════ */}
          <section id="active-giveaways" className="mb-5 pt-2">
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5">🔥</span>
                  <h2 className="fw-bolder mb-0 text-white" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                    Active Giveaways
                  </h2>
                </div>
                <p className="text-white-50 mb-0 small mt-1" style={{ fontSize: '0.85rem' }}>
                  Join these live giveaways and increase your chances to win amazing prizes.
                </p>
              </div>

              <div className="d-flex align-items-center gap-3">
                <a href="#all-giveaways" className="text-decoration-none small fw-semibold" style={{ color: '#c084fc', fontSize: '0.85rem' }}>
                  View All Giveaways →
                </a>
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => handleActiveScroll('left')}
                    className="rounded-circle d-flex align-items-center justify-content-center text-white p-0 border-0"
                    style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                    title="Previous"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleActiveScroll('right')}
                    className="rounded-circle d-flex align-items-center justify-content-center text-white p-0 border-0"
                    style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}
                    title="Next"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal 4-Card Row */}
            <div
              ref={activeScrollRef}
              className="d-flex gap-4 overflow-x-auto pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {activeGiveaways.map((item, idx) => (
                <div key={item.id || idx} style={{ minWidth: '270px', flex: '1 0 270px' }}>
                  <PrizeCard giveaway={item} index={idx} variant="live" />
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              4. WHY JOIN VELOOP REWARDS? (BENEFIT 4-CARD ROW)
              ══════════════════════════════════════════════════════════════ */}
          <section className="mb-5 pt-3">
            <div className="row g-4 align-items-center mb-4">
              <div className="col-lg-6">
                <div className="gh-section-eyebrow mb-2" style={{ color: '#38bdf8' }}>
                  WHY JOIN VELOOP REWARDS?
                </div>
                <h2 className="gh-section-title">
                  More Play.
                  <span style={{ background: 'linear-gradient(90deg, #a855f7, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> More Rewards.</span>
                </h2>
              </div>
              <div className="col-lg-6">
                <p className="text-white-50 mb-0" style={{ fontSize: '0.92rem', lineHeight: 1.65 }}>
                  VELOOP Rewards is the easiest way to win premium rewards by doing simple tasks. Join a growing community of reward hunters today!
                </p>
              </div>
            </div>

            {/* 4 Feature Benefit Cards */}
            <Row className="g-3">
              {[
                { icon: '🎁', title: 'Exciting Prizes', desc: 'Win the latest tech, gift cards, gadgets and more.', accent: '#c084fc' },
                { icon: '⚡', title: 'Simple Tasks', desc: 'Complete easy tasks and earn entries with just a few clicks.', accent: '#38bdf8' },
                { icon: '🛡️', title: 'Fair & Transparent', desc: 'All giveaways are conducted fairly, openly, and auditably.', accent: '#34d399' },
                { icon: '👥', title: 'Growing Community', desc: 'Join thousands of reward hunters worldwide.', accent: '#fbbf24' }
              ].map((card, i) => (
                <Col md={6} lg={3} key={i}>
                  <div className="gh-benefit-card">
                    <div
                      className="gh-benefit-icon"
                      style={{
                        background: `${card.accent}18`,
                        border: `1px solid ${card.accent}40`,
                        color: card.accent,
                      }}
                    >
                      {card.icon}
                    </div>
                    <h5 className="fw-bold text-white mb-2" style={{ fontSize: '1.02rem' }}>{card.title}</h5>
                    <p className="text-white-50 mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {card.desc}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              5. ALL GIVEAWAYS (FILTER PILLS + 8-CARD GRID)
              ══════════════════════════════════════════════════════════════ */}
          <section id="all-giveaways" className="mb-5 pt-3">
            {/* Header: Title & Search / Sort Controls */}
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
              <div>
                <h2 className="fw-bolder mb-1 text-white" style={{ fontSize: '1.85rem', letterSpacing: '-0.02em' }}>
                  All Giveaways
                </h2>
                <p className="text-white-50 mb-0 small" style={{ fontSize: '0.86rem' }}>
                  Explore all current and upcoming giveaways.
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="d-flex align-items-center flex-wrap gap-3">
                {/* Search Bar */}
                <div className="position-relative" style={{ width: '220px' }}>
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50" style={{ fontSize: '0.85rem' }}>
                    🔍
                  </span>
                  <input
                    id="giveaway-search-input"
                    type="text"
                    placeholder="Search giveaways..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control form-control-sm text-white rounded-pill ps-5 pe-3 py-2"
                    style={{
                      background: 'rgba(14, 18, 40, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="d-flex align-items-center gap-2">
                  <span className="text-white-50 small d-none d-sm-inline" style={{ fontSize: '0.82rem' }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select form-select-sm text-white rounded-pill px-3 py-2"
                    style={{
                      background: 'rgba(14, 18, 40, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.82rem',
                      width: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ending-soon">Ending Soon</option>
                    <option value="most-popular">Most Popular</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Exact Reference Categories & Counts) */}
            <div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'All', label: 'All (24)' },
                { id: 'Tech', label: 'Tech (8)' },
                { id: 'Gift Cards', label: 'Gift Cards (6)' },
                { id: 'Gaming', label: 'Gaming (4)' },
                { id: 'Lifestyle', label: 'Lifestyle (3)' },
                { id: 'Other', label: 'Other (3)' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className="rounded-pill px-3 py-1 fw-medium border-0 transition-all text-nowrap"
                  style={{
                    background: selectedCategory === pill.id ? 'linear-gradient(90deg, #7c3aed, #9333ea)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === pill.id ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    border: selectedCategory === pill.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.82rem',
                    boxShadow: selectedCategory === pill.id ? '0 0 15px rgba(124, 58, 237, 0.45)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* 8-Card Grid */}
            <Row className="g-4">
              {filteredGiveaways.map((item, idx) => (
                <Col key={item.id || idx} xs={12} sm={6} lg={3}>
                  <PrizeCard giveaway={item} index={idx} variant="category" />
                </Col>
              ))}
            </Row>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              6. NEWSLETTER SUBSCRIPTION BANNER ("DON'T MISS OUT!")
              ══════════════════════════════════════════════════════════════ */}
          <section className="mb-5">
            <div
              className="p-4 p-lg-5 rounded-4 position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(28, 18, 54, 0.95) 0%, rgba(14, 12, 36, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)'
              }}
            >
              {/* Background ambient glow */}
              <div
                className="position-absolute"
                style={{
                  top: '-50%',
                  left: '10%',
                  width: '350px',
                  height: '350px',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
                  filter: 'blur(45px)',
                  pointerEvents: 'none'
                }}
              />

              <Row className="align-items-center g-4 position-relative" style={{ zIndex: 2 }}>
                {/* Left: 3D Gift Box & Heading */}
                <Col lg={6} className="d-flex align-items-center gap-3">
                  <div className="position-relative flex-shrink-0" style={{ width: 75, height: 75 }}>
                    <div className="position-absolute" style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 70%)', filter: 'blur(10px)' }}></div>
                    <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 6px 16px rgba(124, 58, 237, 0.5))' }}>🎁</span>
                  </div>
                  <div>
                    <h3 className="fw-bolder text-white mb-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.02em' }}>
                      Don't Miss Out!
                    </h3>
                    <p className="text-white-50 mb-0 small" style={{ fontSize: '0.88rem' }}>
                      New giveaways added every week. More rewards. More chances. More fun!
                    </p>
                  </div>
                </Col>

                {/* Right: Email Subscribe Input */}
                <Col lg={6}>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span style={{ color: '#c084fc', fontSize: '0.9rem' }}>✉️</span>
                      <span className="fw-bold text-white small">Get Notified</span>
                      <span className="text-white-50 small ms-2 d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
                        Be the first to know about new giveaways and special rewards.
                      </span>
                    </div>

                    {newsletterSuccess ? (
                      <div className="p-2 px-3 rounded-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.85rem' }}>
                        ✓ You're all set! We'll notify you when new giveaways drop.
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="d-flex align-items-center gap-2">
                        <input
                          type="email"
                          required
                          placeholder="Enter your email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="form-control text-white rounded-pill px-3 py-2 flex-grow-1"
                          style={{
                            background: 'rgba(0, 0, 0, 0.45)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            fontSize: '0.88rem'
                          }}
                        />
                        <button
                          type="submit"
                          className="btn rounded-pill px-4 py-2 fw-semibold text-white border-0 text-nowrap"
                          style={{
                            background: 'linear-gradient(90deg, #7c3aed, #9333ea)',
                            boxShadow: '0 0 18px rgba(124, 58, 237, 0.5)',
                            fontSize: '0.88rem'
                          }}
                        >
                          <span>Subscribe</span>
                          <span className="ms-1">→</span>
                        </button>
                      </form>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* Winner Ticker */}
          <section className="winner-ticker-section mb-5">
            <div className="text-center mb-3">
              <span className="gh-section-eyebrow mb-1 d-block" style={{ color: '#c084fc' }}>Live Transparency</span>
              <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '1.6rem' }}>Recent Winner Announcements</h3>
            </div>
            <WinnerSlider winners={winners} />
          </section>

          {/* Winners Lifecycle Tabs */}
          <section id="winners" className="section pt-2 mb-5">
            <div className="section-header mb-4">
              <div>
                <p className="gh-section-eyebrow mb-2" style={{ color: '#c084fc' }}>Lifecycle Tracker</p>
                <h2 className="fw-bold mb-0 text-white" style={{ fontSize: '1.9rem' }}>Giveaway Winners &amp; Previous Draws</h2>
              </div>
            </div>
            <div className="card-glass p-4 rounded-4" style={{ background: 'rgba(14, 18, 40, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
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

          {/* How It Works - Premium Step Cards */}
          <section id="rules-section" className="mb-5 pt-3">
            <div id="how-it-works" />
            <div className="text-center mb-5">
              <span className="gh-section-eyebrow mb-2 d-block" style={{ color: '#38bdf8' }}>
                FAIR &amp; AUDITABLE PARTICIPATION
              </span>
              <h2 className="gh-section-title mb-2">How It Works</h2>
              <p className="text-white-50 mx-auto" style={{ maxWidth: 580, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Four transparent phases governing every reward drop — from ticket issuance to insured door-to-door delivery.
              </p>
            </div>

            <Row className="g-3">
              {[
                { phase: '01', icon: '🛡️', title: 'Verify Membership', text: 'One authenticated account per verified member ensures equal winning probabilities.', accent: '#818cf8' },
                { phase: '02', icon: '💎', title: 'Collect Currencies', text: 'Earn VEs, SVEs, and Tokens by completing platform loyalty milestones.', accent: '#38bdf8' },
                { phase: '03', icon: '🎟️', title: 'Stake Draw Entry', text: 'Select your preferred drop; entry amount is deducted and ticket is locked.', accent: '#34d399' },
                { phase: '04', icon: '🏆', title: 'Verifiable Claim', text: 'Provably fair winner selection followed by instant digital code or courier shipment.', accent: '#fbbf24' }
              ].map((step) => (
                <Col md={6} lg={3} key={step.phase}>
                  <div
                    className="gh-step-card"
                    style={{ '--step-color': `linear-gradient(90deg, transparent, ${step.accent}cc, transparent)` }}
                  >
                    <div className="fw-bolder fs-4 mb-3 font-monospace" style={{ color: step.accent, lineHeight: 1 }}>{step.phase}</div>
                    <div className="fs-2 mb-2">{step.icon}</div>
                    <h5 className="fw-bold text-white mb-2" style={{ fontSize: '1rem' }}>{step.title}</h5>
                    <p className="text-white-50 mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>{step.text}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="section pt-0 pb-4">
            <div className="text-center mb-5">
              <p className="gh-section-eyebrow mb-2" style={{ color: '#c084fc' }}>Frequently Asked</p>
              <h2 className="fw-bold text-white">Need answers before entering?</h2>
            </div>
            <FAQSection items={faqData} />
          </section>

        </Container>
      </main>

      {/* Giveaway Code Modal */}
      <GiveawayCodeModal
        show={showCodeModal}
        onHide={() => setShowCodeModal(false)}
        onCodeRedeemed={(amount) => {
          alert(`🎉 Successfully redeemed! +${amount} VEs credited.`);
        }}
      />

      {/* Demo Video Modal */}
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#0a0d1d', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Modal.Title className="text-white fs-6">VELOOP Rewards Platform Tour</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#070a14', color: '#fff', padding: '2rem' }}>
          <div className="text-center py-5">
            <div className="fs-1 mb-3">🎬</div>
            <h4 className="fw-bold text-white mb-2">How VELOOP Rewards Works</h4>
            <p className="text-white-50 mx-auto" style={{ maxWidth: '480px' }}>
              1. Choose your favorite giveaway item.<br />
              2. Complete simple partner activities or check in daily.<br />
              3. Earn entry tickets and win verified flagship tech prizes!
            </p>
            <button onClick={() => setShowVideoModal(false)} className="btn rounded-pill px-4 py-2 fw-semibold text-white mt-3" style={{ background: 'linear-gradient(90deg, #7c3aed, #9333ea)' }}>
              Got It, Let's Enter!
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          10. FOOTER (EXACT MATCHING REFERENCE)
          ══════════════════════════════════════════════════════════════ */}
      <footer className="giveaway-footer py-4" style={{ background: '#03050c', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Container className="container-shell">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            {/* Brand Logo & Tagline */}
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)'
                }}
              >
                VR
              </div>
              <div className="lh-1">
                <div className="fw-bolder text-white" style={{ letterSpacing: '0.08em', fontSize: '0.95rem' }}>VELOOP REWARDS</div>
                <div className="text-white-50 small" style={{ fontSize: '0.72rem' }}>Rewards for a Brighter Tomorrow</div>
              </div>
            </div>

            {/* Links */}
            <div className="d-flex align-items-center gap-4 text-white-50 small">
              <Link to="/" className="text-white-50 text-decoration-none hover-text-white transition-all">Home</Link>
              <a href="#all-giveaways" className="text-white-50 text-decoration-none hover-text-white transition-all">Giveaways</a>
              <a href="#my-rewards-section" className="text-white-50 text-decoration-none hover-text-white transition-all">Rewards</a>
              <a href="#rules-section" className="text-white-50 text-decoration-none hover-text-white transition-all">How It Works</a>
              <a href="#faq" className="text-white-50 text-decoration-none hover-text-white transition-all">Support</a>
            </div>

            {/* Social Icons */}
            <div className="d-flex align-items-center gap-3 text-white-50">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="text-white-50 hover-text-white" title="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-white-50 hover-text-white" title="Discord">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white-50 hover-text-white" title="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white-50 hover-text-white" title="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 text-white-50 small" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
            <div className="d-flex align-items-center gap-3">
              <a href="#privacy" className="text-white-50 text-decoration-none">Privacy</a>
              <a href="#terms" className="text-white-50 text-decoration-none">Terms</a>
              <a href="#cookies" className="text-white-50 text-decoration-none">Cookies</a>
            </div>
            <div>
              © 2026 VELOOP Rewards. All rights reserved.
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default GiveawayHome;
