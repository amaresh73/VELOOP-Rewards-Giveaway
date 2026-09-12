import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, InputGroup } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendEmailOtp, resetPassword } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [resendTimer, setResendTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const isValidEmail = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str).trim().toLowerCase());
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccessInfo('');
    setNotRegistered(false);

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      await sendEmailOtp({ email: normalizedEmail, purpose: 'reset-password' });
      setOtpSent(true);
      setResendTimer(30);
      setSuccessInfo(`A 6-digit password reset code has been sent to ${normalizedEmail}. Please check your email inbox.`);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.data?.notRegistered) {
        setNotRegistered(true);
        setError('No registered account was found with this email address.');
      } else {
        const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
        setError(msg);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmitReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');
    setNotRegistered(false);

    const normalizedEmail = email.trim().toLowerCase();
    const code = otpCode.trim();

    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        email: normalizedEmail,
        otp: code,
        newPassword,
        confirmNewPassword
      });

      // Redirect to login page with success notification
      navigate('/login', {
        state: {
          resetSuccess: true,
          prefilledEmail: normalizedEmail,
          message: 'Password reset successfully! Please log in with your new password.'
        }
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to connect to the backend server. Please verify the server is running.'
          : err.message) ||
        'Password reset failed. Please check the code and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <Container className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: 460, width: '100%' }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-warning bg-opacity-25 border border-warning border-opacity-50 d-flex align-items-center justify-content-center text-warning fw-bold mx-auto mb-3"
              style={{ width: 62, height: 62, fontSize: '1.6rem' }}
            >
              🔑
            </div>
            <h2 className="fw-bold mb-1">Reset Password</h2>
            <p className="text-white-50 mb-0 small">
              Verify your email to create a new password
            </p>
          </div>

          {/* Not Registered Warning */}
          {notRegistered && (
            <div className="p-3 mb-3 rounded border border-danger bg-danger bg-opacity-10">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="fs-5">⚠️</span>
                <div>
                  <strong className="text-danger d-block">Account Not Found</strong>
                  <span className="text-white-50 small">
                    There is no registered account associated with <strong>{email}</strong>.
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2 mt-2 pt-2 border-top border-danger border-opacity-25">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-100 fw-bold btn-primary-custom"
                  onClick={() => navigate('/register')}
                >
                  Create New Account →
                </Button>
              </div>
            </div>
          )}

          {error && !notRegistered && (
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

          <Form onSubmit={handleSubmitReset}>
            {/* Step 1: Registered Email Address */}
            <Form.Group className="mb-3" controlId="forgot-email">
              <Form.Label className="text-white-50 small fw-bold mb-1">
                Your Registered Email Address
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setNotRegistered(false);
                    if (otpSent) {
                      setOtpSent(false);
                      setOtpCode('');
                      setSuccessInfo('');
                    }
                  }}
                  className="bg-dark text-white border-secondary"
                  autoFocus
                  required
                  disabled={submitting}
                />
                <Button
                  variant="primary"
                  className="btn-primary-custom px-3"
                  onClick={handleSendOtp}
                  disabled={!isValidEmail(email) || sendingOtp || resendTimer > 0 || submitting}
                  id="forgot-send-otp-btn"
                >
                  {sendingOtp
                    ? 'Sending...'
                    : resendTimer > 0
                    ? `Resend (${resendTimer}s)`
                    : otpSent
                    ? 'Resend Code'
                    : 'Send Code'}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Step 2: Once OTP is sent, prompt for OTP & New Password */}
            {otpSent && (
              <>
                {/* 6-digit Code */}
                <Form.Group className="mb-3 p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-50" controlId="forgot-otp">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="text-white-50 small fw-bold mb-0">
                      Enter 6-Digit Email Code
                    </Form.Label>
                    <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>
                      Sent to {email}
                    </span>
                  </div>
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
                    disabled={submitting}
                    autoFocus
                    required
                  />
                </Form.Group>

                {/* New Password */}
                <Form.Group className="mb-3" controlId="forgot-new-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={submitting}
                  />
                </Form.Group>

                {/* Confirm New Password */}
                <Form.Group className="mb-4" controlId="forgot-confirm-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setError('');
                    }}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={submitting}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-custom w-100 py-3 fw-bold fs-6"
                  disabled={submitting || otpCode.length !== 6 || !newPassword || !confirmNewPassword}
                  id="reset-submit-btn"
                >
                  {submitting ? 'Resetting Password...' : 'Save New Password & Log In →'}
                </Button>
              </>
            )}
          </Form>

          {/* Navigation back to login */}
          <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between">
            <Link to="/login" className="text-white-50 small text-decoration-none hover-white">
              ← Back to Login
            </Link>
            <Link to="/register" className="text-primary fw-bold small text-decoration-none">
              Sign Up
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ForgotPasswordPage;
