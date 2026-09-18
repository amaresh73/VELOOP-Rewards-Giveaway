import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, InputGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthModal, { GoogleIcon } from '../components/Common/GoogleAuthModal';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, sendEmailOtp, verifyEmailOtp, googleAuth } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Google Sign-Up state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Status alerts
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setAlreadyRegistered(false);

    // If email changes after OTP is sent/verified, reset verification
    if (name === 'email' && (otpSent || otpVerified)) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
      setSuccessInfo('');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccessInfo('');
    setAlreadyRegistered(false);

    const email = formData.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address before requesting a verification code.');
      return;
    }

    setOtpSending(true);
    try {
      await sendEmailOtp({ email, purpose: 'registration' });
      setOtpSent(true);
      setResendTimer(30);
      setSuccessInfo(`A 6-digit verification code has been sent to ${email}. Please check your inbox or spam folder.`);
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.alreadyRegistered) {
        setAlreadyRegistered(true);
        setError('This email address is already registered in our system.');
      } else {
        const msg = err.response?.data?.message || 'Failed to send verification code. Please check your email address.';
        setError(msg);
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setAlreadyRegistered(false);
    const code = otpCode.trim();

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setOtpVerifying(true);
    try {
      await verifyEmailOtp({
        email: formData.email.trim().toLowerCase(),
        otp: code,
        purpose: 'registration'
      });
      setOtpVerified(true);
      setSuccessInfo('Email address verified successfully! ✓');
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code. Please check your email and try again.';
      setError(msg);
    } finally {
      setOtpVerifying(false);
    }
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

    if (!otpVerified) {
      return 'Please verify your email address with the verification code before completing registration.';
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
    setSuccessInfo('');
    setAlreadyRegistered(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        otp: otpCode.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Redirect to login page upon successful registration
      navigate('/login', {
        state: {
          registered: true,
          message: 'Account registered successfully! Please log in with your email and password.'
        }
      });
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

  return (
    <div className="auth-shell">
      <Container className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>
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
              Register with your verified email address
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
                    An account with <strong>{formData.email}</strong> is already registered in our system.
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

          {successInfo && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{successInfo}</div>
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
              or sign up with email [otp verification]
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

            {/* Field 2: Email Address with Send Verification Code Button */}
            <Form.Group className="mb-3" controlId="register-email">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="text-white-50 small fw-bold mb-0">
                  Email Address
                </Form.Label>
                {otpVerified ? (
                  <Badge bg="success" className="px-2 py-1">
                    ✓ Verified
                  </Badge>
                ) : (
                  <span className="text-warning small" style={{ fontSize: '0.78rem' }}>
                    * Requires Email Code
                  </span>
                )}
              </div>

              <InputGroup>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-dark text-white border-secondary"
                  required
                  disabled={otpVerified || loading}
                />
                {!otpVerified && (
                  <Button
                    variant="primary"
                    className="btn-primary-custom px-3"
                    onClick={handleSendOtp}
                    disabled={!isValidEmail(formData.email) || otpSending || resendTimer > 0 || loading}
                    id="send-email-otp-btn"
                  >
                    {otpSending
                      ? 'Sending...'
                      : resendTimer > 0
                      ? `Resend (${resendTimer}s)`
                      : otpSent
                      ? 'Resend Code'
                      : 'Send Code'}
                  </Button>
                )}
                {otpVerified && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="text-white-50"
                    onClick={() => {
                      setOtpVerified(false);
                      setOtpSent(false);
                      setOtpCode('');
                      setSuccessInfo('');
                    }}
                  >
                    Change
                  </Button>
                )}
              </InputGroup>
            </Form.Group>

            {/* Email OTP Code Entry (Shown after Send Code is clicked and before verified) */}
            {otpSent && !otpVerified && (
              <Form.Group className="mb-3 p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-50" controlId="register-otp">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="text-white-50 small fw-bold mb-0">
                    Enter 6-Digit Email Code
                  </Form.Label>
                  <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>
                    Sent to {formData.email}
                  </span>
                </div>
                <InputGroup>
                  <Form.Control
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    className="bg-dark text-white border-secondary text-center letter-spacing-2 fw-bold fs-5"
                    disabled={otpVerifying || loading}
                    autoFocus
                  />
                  <Button
                    variant="success"
                    className="px-3 fw-bold"
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length !== 6 || otpVerifying || loading}
                    id="verify-email-otp-btn"
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify Code ✓'}
                  </Button>
                </InputGroup>
              </Form.Group>
            )}

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
              disabled={loading || !otpVerified}
              id="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
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
