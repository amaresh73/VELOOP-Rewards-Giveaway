import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';
import GiveawayHome from './pages/GiveawayHome';
import GiveawayDetails from './pages/GiveawayDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark navbar-veloop sticky-top">
        <div className="container-shell d-flex align-items-center justify-content-between gap-3">
          <Link to="/" className="d-flex align-items-center gap-3 text-white text-decoration-none">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 38, height: 38 }}>
              V
            </div>
            <div>
              <div className="fw-bold">VELOOP</div>
              <small className="text-muted">Rewards</small>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-white-50 text-decoration-none">Featured</Link>
            <a href="/#winners" className="text-white-50 text-decoration-none">Winners</a>
            <a href="/#faq" className="text-white-50 text-decoration-none">FAQ</a>
            {(user?.phone || user?.email) ? (
              <>
                <Link to="/profile" className="text-white-50 text-decoration-none" id="nav-my-profile-link">
                  My Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="badge bg-primary bg-opacity-25 text-white border border-primary border-opacity-50 text-decoration-none px-2 py-1">
                    🛡️ Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="badge bg-dark border border-secondary text-white-50 px-2 py-1 text-decoration-none" title="View Profile">
                  👤 {user.name || user.email}
                </Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout} id="logout-btn">Logout</Button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm" id="nav-login-btn">Log In</Link>
                <Link to="/register" className="btn btn-primary-custom btn-sm" id="nav-signup-btn">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<GiveawayHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/giveaway/:slug" element={<GiveawayDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
