import { useState, useEffect } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthModal, { GoogleIcon } from '../components/Common/GoogleAuthModal';

function LoginPage({ defaultMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, resendVerification, googleAuth } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/';
  const urlMode = searchParams.get('mode');

  // Mode: 'register' or 'login'
  const [authMode, setAuthMode] = useState(
    defaultMode || urlMode || (location.pathname === '/register' ? 'register' : 'login')
  );

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email verification restriction states
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Success messages from router navigation
  const registrationSuccessMessage = location.state?.registered ? location.state.message : '';
  const resetSuccessMessage = location.state?.resetSuccess ? location.state.message : '';
  const promptMessage = !location.state?.registered && !location.state?.resetSuccess && location.state?.message ? location.state.message : '';

  // Form inputs state (supports both login and registration)
  const [formData, setFormData] = useState({
    fullName: '',
    email: location.state?.prefilledEmail || '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'female',
    rememberMe: true
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Cooldown timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setEmailNotVerified(false);
    setResendSuccess('');
  };

  const handleResendFromLogin = async () => {
    const targetEmail = unverifiedEmail || formData.email.trim();
    if (!targetEmail || resendCooldown > 0 || resendingVerification) return;

    setResendingVerification(true);
    setResendSuccess('');
    setError('');

    try {
      const res = await resendVerification(targetEmail);
      setResendSuccess(res.message || `A fresh verification link has been sent to ${targetEmail}. Valid for 3 minutes.`);
      setResendCooldown(60);
    } catch (err) {
      if (err.response?.status === 429) {
        const retry = err.response.data?.retryAfterSeconds || 60;
        setResendCooldown(retry);
        setError(err.response.data?.message || `Please wait ${retry}s before requesting again.`);
      } else {
        setError(err.response?.data?.message || 'Failed to resend verification email.');
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setResendSuccess('');

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      const user = response?.user;

      if (user?.role === 'admin' && redirectTarget === '/') {
        navigate('/admin');
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true);
        setUnverifiedEmail(err.response.data?.email || email);
        setError(err.response.data?.message || 'Your email address is not verified yet.');
      } else {
        const serverMessage = err.response?.data?.message
          || (err.code === 'ERR_NETWORK' ? 'Unable to reach the server. Please try again in a moment.' : err.message)
          || 'Invalid email or password.';
        setError(serverMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword
      });

      if (res?.requiresVerification) {
        setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
        setAuthMode('login');
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? 'Network error. Please try again.' : err.message)
        || 'Registration failed. Please check your information.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* ── Main Split Card ── */}
      <div className="auth-split-card">

        {/* ── Left Illustration Panel ── */}
        <div className="auth-left-art">
          {/* Background Illustration: 3D Glowing Green Gift Box */}
          <img
            src="/images/auth_giftbox_direct.png"
            alt="3D Glowing Rewards Gift Box"
            className="auth-left-art__bg"
          />
          <div className="auth-left-art__overlay" />

          {/* Top Brand Mark */}
          <div className="auth-left-art__brand">
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3" style={{ background: 'rgba(4, 10, 14, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 209, 0.25)' }}>
              <div
                className="d-flex align-items-center justify-content-center text-dark fw-bold shadow"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00ffd1, #10b981)',
                  boxShadow: '0 0 14px rgba(0, 255, 209, 0.5)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22L2 4h4.5l5.5 11.5L17.5 4H22L12 22z" />
                </svg>
              </div>
              <div className="fw-bolder text-white" style={{ letterSpacing: '0.12em', fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}>
                VELOOP REWARDS
              </div>
            </Link>
          </div>

          {/* Bottom subtle message */}
          <div className="auth-left-art__footer">
            <div className="text-white-50 small mb-1" style={{ fontSize: '0.75rem' }}>
              ✦ Fair &amp; Auditable Reward Draws
            </div>
            <div className="text-white fw-semibold small" style={{ fontSize: '0.85rem' }}>
              Every entry holds a real chance to win.
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-right-form">
          {/* Back to Home Link */}
          <div className="mb-2">
            <Link to="/" className="text-decoration-none small fw-semibold text-secondary d-inline-flex align-items-center gap-1 hover-text-primary" style={{ fontSize: '0.8rem' }}>
              ← Back to Home
            </Link>
          </div>

          {/* Header Row */}
          <div className="auth-form-header">
            <div>
              <h1 className="auth-form-title">
                {authMode === 'register' ? 'Registration' : 'Sign In'}
              </h1>
              <div className="auth-title-bar" />
            </div>

            {/* Mode Switch Pills & Language Badge */}
            <div className="d-flex align-items-center gap-2">
              <div className="p-1 rounded-pill d-flex align-items-center" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold ${authMode === 'login' ? 'text-white shadow-sm' : 'text-secondary'}`}
                  style={{ fontSize: '0.75rem', background: authMode === 'login' ? '#2563eb' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold ${authMode === 'register' ? 'text-white shadow-sm' : 'text-secondary'}`}
                  style={{ fontSize: '0.75rem', background: authMode === 'register' ? '#2563eb' : 'transparent', transition: 'all 0.2s ease' }}
                >
                  Register
                </button>
              </div>

              <div className="auth-lang-pill">
                <span>🌐</span>
                <span>En</span>
              </div>
            </div>
          </div>

          {/* Status Alerts */}
          {promptMessage && (
            <Alert variant="info" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>🔒</span>
              <div>{promptMessage}</div>
            </Alert>
          )}

          {registrationSuccessMessage && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{registrationSuccessMessage}</div>
            </Alert>
          )}

          {resetSuccessMessage && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{resetSuccessMessage}</div>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{success}</div>
            </Alert>
          )}

          {/* Email Not Verified Alert */}
          {emailNotVerified && (
            <div className="p-3 mb-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-40">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="fs-5">⚠️</span>
                <div>
                  <strong className="text-warning d-block">Account Verification Required</strong>
                  <span className="text-muted small">
                    Your email <strong>{unverifiedEmail}</strong> has not been verified yet. Verification links expire in 3 minutes.
                  </span>
                </div>
              </div>

              {resendSuccess && (
                <div className="p-2 mb-2 rounded bg-success bg-opacity-25 text-success small fw-bold">
                  ✓ {resendSuccess}
                </div>
              )}

              <button
                type="button"
                className="btn btn-warning btn-sm fw-bold w-100"
                onClick={handleResendFromLogin}
                disabled={resendingVerification || resendCooldown > 0}
              >
                {resendingVerification
                  ? 'Sending Verification Link...'
                  : resendCooldown > 0
                    ? `Resend Link (${resendCooldown}s)`
                    : 'Resend Verification Link'}
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && !emailNotVerified && (
            <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>⚠️</span>
              <div>{error}</div>
            </Alert>
          )}

          {/* ════════════════════════════════════════════════════════════════
              MODE: REGISTRATION FORM (MATCHING THE 2-COLUMN MOCKUP EXACTLY)
              ════════════════════════════════════════════════════════════════ */}
          {authMode === 'register' ? (
            <form onSubmit={handleRegisterSubmit}>
              <div className="auth-form-grid">
                {/* Full Name */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Please enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="auth-field-input"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="auth-field-input"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Phone Number */}
                <div className="auth-field-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="auth-field-label">Phone number</label>
                  <div className="auth-phone-group">
                    <div className="auth-phone-flag">🇮🇳</div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone number..."
                      value={formData.phone}
                      onChange={handleChange}
                      className="auth-field-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Please enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="auth-field-input"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Confirm Password */}
                <div className="auth-field-group">
                  <label className="auth-field-label">Confirm password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Please enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="auth-field-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Gender Radio Row */}
              <div className="auth-gender-section">
                <div className="auth-gender-label">Gender</div>
                <div className="auth-gender-options">
                  <label className="auth-gender-radio">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                    />
                    <span>Male</span>
                  </label>
                  <label className="auth-gender-radio">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                    />
                    <span>Female</span>
                  </label>
                  <label className="auth-gender-radio">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                    />
                    <span>Other</span>
                  </label>
                  <label className="auth-gender-radio">
                    <input
                      type="radio"
                      name="gender"
                      value="prefer_not_to_say"
                      checked={formData.gender === 'prefer_not_to_say'}
                      onChange={handleChange}
                    />
                    <span>Prefer not to say</span>
                  </label>
                </div>
              </div>

              {/* Action Button: Next Step */}
              <button
                type="submit"
                className="auth-btn-pill"
                disabled={loading}
                id="register-submit-btn"
              >
                <span>{loading ? 'Creating Account...' : 'Next Step'}</span>
                <span>→</span>
              </button>

              {/* Footer Switch */}
              <div className="auth-footer-link">
                <span>Already have an account? </span>
                <button type="button" onClick={() => setAuthMode('login')}>
                  Sign in
                </button>
              </div>
            </form>
          ) : (
            /* ════════════════════════════════════════════════════════════════
               MODE: SIGN IN FORM
               ════════════════════════════════════════════════════════════════ */
            <form onSubmit={handleLoginSubmit}>
              {/* Google Sign In Option */}
              <button
                type="button"
                className="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3 fw-semibold text-dark shadow-sm"
                style={{ borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem' }}
                onClick={() => setShowGoogleModal(true)}
                disabled={loading || googleLoading}
              >
                <GoogleIcon size={18} />
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="d-flex align-items-center my-3 text-muted small">
                <div className="flex-grow-1 border-top" />
                <span className="px-3 text-uppercase text-secondary fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  or sign in with email
                </span>
                <div className="flex-grow-1 border-top" />
              </div>

              {/* Email Address */}
              <div className="auth-field-group mb-3">
                <label className="auth-field-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-field-input"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="auth-field-group mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="auth-field-label mb-0">Password</label>
                  <Link
                    to="/forgot-password"
                    state={{ email: formData.email }}
                    className="text-decoration-none"
                    style={{ fontSize: '0.78rem', color: '#2563eb' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-field-input"
                  required
                  disabled={loading}
                />
              </div>

              {/* Remember Me */}


              {/* Action Button: Sign In */}
              <button
                type="submit"
                className="auth-btn-pill"
                disabled={loading}
                id="login-submit-btn"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <span>→</span>
              </button>

              {/* Footer Switch */}
              <div className="auth-footer-link">
                <span>Don't have an account? </span>
                <button type="button" onClick={() => setAuthMode('register')}>
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        show={showGoogleModal}
        onHide={() => setShowGoogleModal(false)}
        mode="signin"
        onGoogleSuccess={async (googleUser) => {
          setGoogleLoading(true);
          try {
            const res = await googleAuth(googleUser);
            const user = res?.user;
            if (user?.role === 'admin' && redirectTarget === '/') {
              navigate('/admin');
            } else {
              navigate(redirectTarget);
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Google login failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        }}
      />
    </div>
  );
}

export default LoginPage;
