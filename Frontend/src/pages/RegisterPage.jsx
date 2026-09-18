import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthModal, { GoogleIcon } from '../components/Common/GoogleAuthModal';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, resendVerification, googleAuth } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Verification sent screen state
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [devVerificationLink, setDevVerificationLink] = useState('');

  // Resend state
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  // Google Sign-Up state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form states
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setAlreadyRegistered(false);
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      return 'Please enter your full name.';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long.';
    }

    if (!email.trim() || !isValidEmail(email)) {
      return 'Please enter a valid email address.';
    }

    if (!password) {
      return 'Please enter a password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Password and confirm password do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyRegistered(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      setRegisteredEmail(formData.email.trim().toLowerCase());
      setVerificationSent(true);
      setResendCooldown(60); // 60s cooldown for initial resend
      if (result.verificationLink) {
        setDevVerificationLink(result.verificationLink);
      }
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyRegistered) {
        setAlreadyRegistered(true);
        setError('This email address is already registered.');
      } else {
        const serverMessage =
          err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Unable to connect to the backend server. Please make sure the server is running.'
            : err.message) ||
          'Registration failed. Please try again.';
        setError(serverMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setResendStatus('');
    setError('');
    setResending(true);

    try {
      const res = await resendVerification(registeredEmail);
      setResendStatus(res.message || 'A fresh verification link has been sent to your email.');
      setResendCooldown(60);
      if (res.verificationLink) {
        setDevVerificationLink(res.verificationLink);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        const retrySec = err.response.data?.retryAfterSeconds || 60;
        setResendCooldown(retrySec);
        setError(err.response.data?.message || `Please wait ${retrySec}s before requesting again.`);
      } else {
        setError(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      <Container className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>

          {/* VIEW A: Verification Link Sent (Confirmation Screen) */}
          {verificationSent ? (
            <div className="text-center py-2">
              <div
                className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
                style={{ width: 72, height: 72, fontSize: '2rem' }}
              >
                ✉️
              </div>
              <h3 className="fw-bold text-white mb-2">Check Your Email</h3>
              <p className="text-white-50 small mb-3">
                We've sent a verification link to <br />
                <strong className="text-white">{registeredEmail}</strong>
              </p>

              <div className="p-3 mb-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-30 text-start">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span>⏰</span>
                  <strong className="text-warning small">3-Minute Expiry Notice</strong>
                </div>
                <p className="text-white-50 small mb-0" style={{ fontSize: '0.82rem' }}>
                  For security, your verification link will expire in <strong>3 minutes</strong>. Click the link in the email to activate your account.
                </p>
              </div>

              {resendStatus && (
                <Alert variant="success" className="py-2 px-3 small mb-3">
                  ✓ {resendStatus}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="py-2 px-3 small mb-3">
                  ⚠️ {error}
                </Alert>
              )}

              {/* Dev shortcut when testing locally or without configured SMTP */}
              {devVerificationLink && (
                <div className="p-2 mb-3 rounded bg-dark border border-info border-opacity-40 text-start">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-info text-dark fw-bold">Test Link Available</span>
                    <small className="text-white-50">Local / Preview</small>
                  </div>
                  <a
                    href={devVerificationLink}
                    className="btn btn-outline-info btn-sm w-100 fw-bold mt-1"
                    id="dev-verify-link-btn"
                  >
                    Click Here to Verify Now →
                  </a>
                </div>
              )}

              <div className="d-grid gap-2 mb-3">
                <Button
                  variant="outline-primary"
                  className="fw-bold py-2"
                  onClick={handleResendVerification}
                  disabled={resending || resendCooldown > 0}
                  id="resend-verification-btn"
                >
                  {resending
                    ? 'Resending...'
                    : resendCooldown > 0
                    ? `Resend Link (${resendCooldown}s)`
                    : 'Resend Verification Email'}
                </Button>
                <Button
                  variant="secondary"
                  className="py-2 text-white-50"
                  onClick={() => navigate('/login', { state: { prefilledEmail: registeredEmail } })}
                >
                  Already verified? Log In
                </Button>
              </div>

              <div className="pt-3 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-link text-white-50 text-decoration-none small p-0"
                  onClick={() => {
                    setVerificationSent(false);
                    setError('');
                  }}
                >
                  ← Sign up with a different email
                </button>
              </div>
            </div>
          ) : (

            /* VIEW B: Standard Registration Form */
            <>
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
                  style={{ width: 62, height: 62, fontSize: '1.6rem' }}
                >
                  ✉️
                </div>
                <h2 className="fw-bold mb-1">Create Account</h2>
                <p className="text-white-50 mb-0 small">
                  Sign up with your email and password
                </p>
              </div>

              {/* Already registered warning card */}
              {alreadyRegistered && (
                <div className="p-3 mb-3 rounded border border-warning bg-warning bg-opacity-10">
                  <div className="d-flex align-items-start gap-2 mb-2">
                    <span className="fs-5">ℹ️</span>
                    <div>
                      <strong className="text-warning d-block">Already Registered</strong>
                      <span className="text-white-50 small">
                        An account with <strong>{formData.email}</strong> is already registered.
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2 pt-2 border-top border-warning border-opacity-25">
                    <Button
                      variant="warning"
                      size="sm"
                      className="w-50 fw-bold text-dark"
                      onClick={() => navigate('/login', { state: { prefilledEmail: formData.email } })}
                    >
                      Log In Instead
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="w-50 fw-bold"
                      onClick={() => navigate('/forgot-password', { state: { email: formData.email } })}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </div>
              )}

              {error && !alreadyRegistered && (
                <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>⚠️</span>
                  <div>{error}</div>
                </Alert>
              )}

              {/* Option 1: One-Click Sign Up with Google */}
              <Button
                variant="light"
                className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-dark mb-3 border-0 shadow-sm"
                style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '0.95rem'
                }}
                onClick={() => setShowGoogleModal(true)}
                disabled={loading || googleLoading}
                id="signup-google-btn"
              >
                <GoogleIcon size={20} />
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center my-3 text-white-50 small">
                <div className="flex-grow-1 border-top border-secondary border-opacity-25" />
                <span className="px-3 text-uppercase text-white-50 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                  or sign up with email
                </span>
                <div className="flex-grow-1 border-top border-secondary border-opacity-25" />
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Field 1: Full Name */}
                <Form.Group className="mb-3" controlId="register-name">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-dark text-white border-secondary"
                    autoFocus
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Field 2: Email Address */}
                <Form.Group className="mb-3" controlId="register-email">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-white-50 small" style={{ fontSize: '0.78rem' }}>
                    A 3-minute verification link will be emailed to this address.
                  </Form.Text>
                </Form.Group>

                {/* Field 3: Password */}
                <Form.Group className="mb-3" controlId="register-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Field 4: Confirm Password */}
                <Form.Group className="mb-4" controlId="register-confirm-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn-primary-custom w-100 py-3 fw-bold fs-6"
                  disabled={loading}
                  id="register-submit-btn"
                >
                  {loading ? 'Sending Verification Link...' : 'Create Account →'}
                </Button>
              </Form>

              {/* Switch to Login / Forgot Password */}
              <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
                <div>
                  <span className="text-white-50 small">Already have an account? </span>
                  <Link to="/login" className="text-primary fw-bold small text-decoration-none">
                    Log In
                  </Link>
                </div>
                <div>
                  <Link to="/forgot-password" className="text-white-50 small text-decoration-none hover-white">
                    Forgot your password? Reset here
                  </Link>
                </div>
              </div>
            </>
          )}

        </div>
      </Container>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        show={showGoogleModal}
        onHide={() => setShowGoogleModal(false)}
        mode="signup"
        onGoogleSuccess={async (googleUser) => {
          setGoogleLoading(true);
          try {
            await googleAuth(googleUser);
            navigate('/', {
              state: { message: `Welcome to VELOOP Rewards, ${googleUser.name}!` }
            });
          } catch (err) {
            setError(err.response?.data?.message || 'Google sign up failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        }}
      />
    </div>
  );
}

export default RegisterPage;
