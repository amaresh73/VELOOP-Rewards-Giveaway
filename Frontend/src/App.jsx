import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import GiveawayHome from './pages/GiveawayHome';
import GiveawayDetails from './pages/GiveawayDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import VerifyEmailPage from './pages/VerifyEmailPage';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to explore giveaways and rewards.' }} />;
  }
  return children;
}

function AppShell() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/signup', '/forgot-password', '/verify-email'].includes(location.pathname);
  const isLandingPage = (!isLoggedIn && location.pathname === '/') || location.pathname === '/landing';
  const showDashboardNav = !isAuthPage && !isLandingPage && isLoggedIn;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScroll = (e, targetId) => {
    if (e?.preventDefault) e.preventDefault();
    
    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const isHome = location.pathname === '/' || location.pathname === '/giveaways' || location.pathname === '/dashboard';
    
    if (!isHome) {
      navigate('/#' + targetId);
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      element.classList.remove('section-target-highlight');
      void element.offsetWidth;
      element.classList.add('section-target-highlight');
      setTimeout(() => element.classList.remove('section-target-highlight'), 1900);

      if (targetId === 'all-giveaways') {
        setTimeout(() => {
          const searchInput = document.getElementById('giveaway-search-input');
          if (searchInput) searchInput.focus();
        }, 500);
      }
    }
  };

  return (
    <>
      {showDashboardNav && (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'rgba(5, 7, 17, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.8rem 0', zIndex: 1000 }}>
          <div className="container-shell d-flex align-items-center justify-content-between gap-3">
            {/* Brand Logo & Name */}
            <div className="d-flex align-items-center gap-4">
              <a href="#top" onClick={(e) => handleScroll(e, 'top')} className="d-flex align-items-center gap-2 text-white text-decoration-none cursor-pointer">
                <div className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: 34, height: 34, borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)' }}>
                  VR
                </div>
                <div className="lh-1">
                  <div className="fw-bolder text-white" style={{ letterSpacing: '0.06em', fontSize: '1.05rem', fontFamily: "'Inter', sans-serif" }}>
                    VELOOP
                  </div>
                  <div style={{ color: '#c084fc', fontSize: '0.62rem', letterSpacing: '0.14em', fontWeight: 700 }}>
                    REWARDS
                  </div>
                </div>
              </a>

              {/* Navigation Links Matching Reference */}
              <div className="d-none d-lg-flex align-items-center gap-4 text-white-50 small fw-semibold ms-3">
                <a 
                  href="#top" 
                  onClick={(e) => handleScroll(e, 'top')} 
                  className="text-white-50 text-decoration-none hover-text-white transition-all cursor-pointer"
                >
                  Home
                </a>
                <a 
                  href="#all-giveaways" 
                  onClick={(e) => handleScroll(e, 'all-giveaways')} 
                  className="text-white text-decoration-none position-relative py-1 fw-bold cursor-pointer" 
                  style={{ textShadow: '0 0 12px rgba(124, 58, 237, 0.5)' }}
                >
                  Giveaways
                  <span className="position-absolute bottom-0 start-0 w-100" style={{ height: '2px', background: 'linear-gradient(90deg, #7c3aed, #ec4899)', borderRadius: '2px', boxShadow: '0 0 8px #7c3aed' }}></span>
                </a>
                <a 
                  href="#my-rewards-section" 
                  onClick={(e) => handleScroll(e, 'my-rewards-section')} 
                  className="text-white-50 text-decoration-none hover-text-white transition-all cursor-pointer"
                >
                  Rewards
                </a>
                <a 
                  href="#winners" 
                  onClick={(e) => handleScroll(e, 'winners')} 
                  className="text-white-50 text-decoration-none hover-text-white transition-all cursor-pointer"
                >
                  Leaderboard
                </a>
                <a 
                  href="#rules-section" 
                  onClick={(e) => handleScroll(e, 'rules-section')} 
                  className="text-white-50 text-decoration-none hover-text-white transition-all cursor-pointer"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right Tools: Search, Connect Wallet, Notification, Profile */}
            <div className="d-flex align-items-center gap-3">
              {/* Search Icon */}
              <button 
                onClick={(e) => handleScroll(e, 'all-giveaways')} 
                className="btn btn-link text-white-50 p-1 d-flex align-items-center justify-content-center"
                style={{ fontSize: '1rem' }}
                title="Search Giveaways"
              >
                🔍
              </button>

              {/* Connect Wallet Button */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate('/login');
                  } else {
                    navigate('/profile');
                  }
                }}
                className="btn btn-sm fw-semibold rounded-pill px-3 py-2 text-white border-0 d-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #9333ea)',
                  boxShadow: '0 0 16px rgba(124, 58, 237, 0.45)',
                  fontSize: '0.82rem'
                }}
              >
                <span>Connect Wallet</span>
              </button>

              {/* Notification Bell with Badge 3 */}
              <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' }} title="Notifications">
                <span style={{ fontSize: '0.9rem' }}>🔔</span>
                <span 
                  className="position-absolute top-0 end-0 translate-middle badge rounded-circle" 
                  style={{ background: '#ef4444', fontSize: '0.6rem', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  3
                </span>
              </div>

              {/* User Profile / Auth State */}
              {isLoggedIn ? (
                <div className="d-flex align-items-center gap-2 p-1 pe-2 rounded-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white" 
                      style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #7c3aed, #9333ea)', border: '1.5px solid rgba(255,255,255,0.2)', fontSize: '0.78rem' }}
                    >
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-link text-white-50 p-0 ms-1" style={{ fontSize: '0.75rem' }} title="Logout">
                    ⏻
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="btn btn-sm text-white fw-semibold rounded-pill px-3 py-1 text-decoration-none" 
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.82rem' }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Animated Route View Wrapper */}
      <div key={location.pathname} className="page-route-transition">
        <Routes>
          <Route path="/" element={!isLoggedIn ? <LandingPage /> : <GiveawayHome />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/giveaways" element={<ProtectedRoute><GiveawayHome /></ProtectedRoute>} />
          <Route path="/giveaway" element={<ProtectedRoute><GiveawayHome /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><GiveawayHome /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/giveaway/:slug" element={<ProtectedRoute><GiveawayDetails /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}


function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
