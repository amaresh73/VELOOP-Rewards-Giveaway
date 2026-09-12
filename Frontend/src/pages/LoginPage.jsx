import { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/';

  // If navigated with state messages
  const registrationSuccessMessage = location.state?.registered ? location.state.message : '';
  const resetSuccessMessage = location.state?.resetSuccess ? location.state.message : '';
  const promptMessage = !location.state?.registered && !location.state?.resetSuccess && location.state?.message ? location.state.message : '';

  const [formData, setFormData] = useState({
    email: location.state?.prefilledEmail || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const serverMessage = err.response?.data?.message 
        || (err.code === 'ERR_NETWORK' ? 'Unable to connect to the backend server. Please make sure the backend is running on port 5000.' : err.message)
        || 'Invalid email or password.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Container className="d-flex justify-content-center">
        <div className="auth-card" style={{ maxWidth: 440, width: '100%' }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
              style={{ width: 62, height: 62, fontSize: '1.6rem' }}
            >
              🔐
            </div>
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-white-50 mb-0 small">
              Log in with your registered email and password
            </p>
          </div>

          {/* Prompt Banner */}
          {promptMessage && (
            <Alert variant="info" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>🔒</span>
              <div>{promptMessage}</div>
            </Alert>
          )}

          {/* Registration Success Banner */}
          {registrationSuccessMessage && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{registrationSuccessMessage}</div>
            </Alert>
          )}

          {/* Reset Password Success Banner */}
          {resetSuccessMessage && (
            <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>✅</span>
              <div>{resetSuccessMessage}</div>
            </Alert>
          )}

          {/* Error Banner */}
          {error && (
            <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <span>⚠️</span>
              <div>{error}</div>
            </Alert>
          )}

          {/* Login Form: Strictly Two Fields (Email & Password) */}
          <Form onSubmit={handleSubmit}>
            {/* Field 1: Email */}
            <Form.Group className="mb-3" controlId="login-email">
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
                autoFocus
                required
                disabled={loading}
              />
            </Form.Group>

            {/* Field 2: Password */}
            <Form.Group className="mb-4" controlId="login-password">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="text-white-50 small fw-bold mb-0">
                  Password
                </Form.Label>
                <Link
                  to="/forgot-password"
                  state={{ email: formData.email }}
                  className="text-white-50 small text-decoration-none"
                  style={{ fontSize: '0.8rem' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="bg-dark text-white border-secondary"
                required
                disabled={loading}
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-primary-custom w-100 py-3 fw-bold fs-6"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Logging In...' : 'Log In →'}
            </Button>
          </Form>

          {/* Switch to Registration */}
          <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
            <span className="text-white-50 small">Don't have an account? </span>
            <Link to="/register" className="text-primary fw-bold small text-decoration-none">
              Sign Up
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default LoginPage;
