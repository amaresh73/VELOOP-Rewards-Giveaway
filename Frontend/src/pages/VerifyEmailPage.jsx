import { useState, useEffect } from 'react';
import { Container, Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  // Verification states: 'verifying' | 'success' | 'expired' | 'error' | 'no_token'
  const [status, setStatus] = useState(token ? 'verifying' : 'no_token');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend form state
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Attempt verification on mount if token is provided
  useEffect(() => {
    if (!token) {
      setStatus('no_token');
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      try {
        const result = await verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          setSuccessMessage(result.message || 'Email verified successfully!');
        }
      } catch (err) {
        if (!isMounted) return;
        const data = err.response?.data;
        if (data?.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setErrorMessage('This verification link has expired. Verification links are valid for 3 minutes for security.');
          if (data.email) setResendEmail(data.email);
        } else {
          setStatus('error');
          setErrorMessage(data?.message || 'Invalid or already used verification link.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    setResendError('');
    setResendSuccess('');

    const targetEmail = resendEmail.trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setResendError('Please enter a valid email address.');
      return;
    }

    setResending(true);
    try {
      const response = await resendVerification(targetEmail);
      setResendSuccess(response.message || `A fresh verification link has been sent to ${targetEmail}. Valid for 3 minutes.`);
      setCooldown(60); // 60-second cooldown
    } catch (err) {
      if (err.response?.status === 429) {
        const retry = err.response.data?.retryAfterSeconds || 60;
        setCooldown(retry);
        setResendError(err.response.data?.message || `Please wait ${retry}s before requesting again.`);
      } else {
        setResendError(err.response?.data?.message || 'Unable to send verification link. Please check your email and try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      <Container className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>

          {/* STATE 1: Verifying */}
          {status === 'verifying' && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" style={{ width: '3.2rem', height: '3.2rem' }} className="mb-4" />
              <h3 className="fw-bold mb-2">Verifying Your Email</h3>
              <p className="text-white-50 small mb-0">
                Please wait while we validate your one-time verification link...
              </p>
            </div>
          )}

          {/* STATE 2: Success */}
          {status === 'success' && (
            <div className="text-center py-3">
              <div
                className="rounded-circle bg-success bg-opacity-25 border border-success border-opacity-50 d-flex align-items-center justify-content-center text-success fw-bold mx-auto mb-3"
                style={{ width: 72, height: 72, fontSize: '2rem' }}
              >
                ✓
              </div>
              <h3 className="fw-bold text-white mb-2">Email Verified!</h3>
              <p className="text-white-50 small mb-4">
                {successMessage || 'Your email address has been successfully verified. You now have full access to participate in giveaways and claim rewards.'}
              </p>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="fw-bold"
                  onClick={() => navigate('/')}
                  id="verified-continue-btn"
                >
                  Explore Giveaways
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="text-white-50"
                  onClick={() => navigate('/profile')}
                >
                  View My Profile
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: Expired (3-Minute Limit Exceeded) */}
          {status === 'expired' && (
            <div>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-warning bg-opacity-25 border border-warning border-opacity-50 d-flex align-items-center justify-content-center text-warning fw-bold mx-auto mb-3"
                  style={{ width: 68, height: 68, fontSize: '1.8rem' }}
                >
                  ⏰
                </div>
                <h3 className="fw-bold text-white mb-1">Link Expired</h3>
                <p className="text-white-50 small">
                  For your security, verification links expire in <strong>3 minutes</strong>.
                </p>
              </div>

              <Alert variant="warning" className="small py-2 px-3 mb-3">
                {errorMessage}
              </Alert>

              {resendSuccess && (
                <Alert variant="success" className="small py-2 px-3 mb-3">
                  ✓ {resendSuccess}
                </Alert>
              )}

              {resendError && (
                <Alert variant="danger" className="small py-2 px-3 mb-3">
                  ⚠️ {resendError}
                </Alert>
              )}

              {/* Resend Form */}
              <Form onSubmit={handleResend} className="mt-3">
                <Form.Group className="mb-3" controlId="resend-email-input">
                  <Form.Label className="text-white-50 small fw-bold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={resending || cooldown > 0}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold py-2 mb-3"
                  disabled={resending || cooldown > 0}
                  id="resend-link-btn"
                >
                  {resending
                    ? 'Sending Verification Link...'
                    : cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : 'Resend Verification Link'}
                </Button>
              </Form>

              <div className="text-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                <Link to="/login" className="text-white-50 text-decoration-none small">
                  ← Back to Log In
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: Invalid Token or General Error */}
          {status === 'error' && (
            <div>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-danger bg-opacity-25 border border-danger border-opacity-50 d-flex align-items-center justify-content-center text-danger fw-bold mx-auto mb-3"
                  style={{ width: 68, height: 68, fontSize: '1.8rem' }}
                >
                  ✕
                </div>
                <h3 className="fw-bold text-white mb-1">Invalid Link</h3>
                <p className="text-white-50 small">
                  This verification link is invalid, expired, or has already been used.
                </p>
              </div>

              <Alert variant="danger" className="small py-2 px-3 mb-3">
                ⚠️ {errorMessage}
              </Alert>

              {resendSuccess && (
                <Alert variant="success" className="small py-2 px-3 mb-3">
                  ✓ {resendSuccess}
                </Alert>
              )}

              {resendError && (
                <Alert variant="danger" className="small py-2 px-3 mb-3">
                  ⚠️ {resendError}
                </Alert>
              )}

              {/* Request New Link Form */}
              <Form onSubmit={handleResend} className="mt-3">
                <Form.Group className="mb-3" controlId="error-resend-email-input">
                  <Form.Label className="text-white-50 small fw-bold">Request a Fresh Verification Link</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={resending || cooldown > 0}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold py-2 mb-3"
                  disabled={resending || cooldown > 0}
                  id="error-resend-link-btn"
                >
                  {resending
                    ? 'Sending Verification Link...'
                    : cooldown > 0
                    ? `Resend available in ${cooldown}s`
                    : 'Send New Verification Link'}
                </Button>
              </Form>

              <div className="d-flex justify-content-between text-white-50 small mt-3 pt-3 border-top border-secondary border-opacity-25">
                <Link to="/login" className="text-white-50 text-decoration-none">
                  Log In
                </Link>
                <Link to="/register" className="text-primary text-decoration-none">
                  Create New Account
                </Link>
              </div>
            </div>
          )}

          {/* STATE 5: Direct Visit Without Token */}
          {status === 'no_token' && (
            <div>
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
                  style={{ width: 68, height: 68, fontSize: '1.8rem' }}
                >
                  ✉️
                </div>
                <h3 className="fw-bold text-white mb-1">Verify Your Email</h3>
                <p className="text-white-50 small">
                  Need a new email activation link? Enter your email address below.
                </p>
              </div>

              {resendSuccess && (
                <Alert variant="success" className="small py-2 px-3 mb-3">
                  ✓ {resendSuccess}
                </Alert>
              )}

              {resendError && (
                <Alert variant="danger" className="small py-2 px-3 mb-3">
                  ⚠️ {resendError}
                </Alert>
              )}

              <Form onSubmit={handleResend}>
                <Form.Group className="mb-3" controlId="notoken-email-input">
                  <Form.Label className="text-white-50 small fw-bold">Registered Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={resending || cooldown > 0}
                  />
                  <Form.Text className="text-white-50 small">
                    Links are valid for 3 minutes upon delivery.
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold py-2 mb-3"
                  disabled={resending || cooldown > 0}
                  id="direct-resend-link-btn"
                >
                  {resending
                    ? 'Sending Link...'
                    : cooldown > 0
                    ? `Wait ${cooldown}s to resend`
                    : 'Send Verification Link'}
                </Button>
              </Form>

              <div className="text-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                <Link to="/login" className="text-white-50 text-decoration-none small">
                  ← Back to Log In
                </Link>
              </div>
            </div>
          )}

        </div>
      </Container>
    </div>
  );
}
