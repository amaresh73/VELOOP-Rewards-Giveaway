import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthModal({ show, onHide, onGoogleSuccess, mode = 'signup' }) {
  const [selectedAccount, setSelectedAccount] = useState('alex.morgan@gmail.com');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    let emailToUse = selectedAccount;
    let nameToUse = 'Alex Morgan';

    if (useCustom) {
      if (!customEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim())) {
        setError('Please enter a valid Google email address.');
        return;
      }
      emailToUse = customEmail.trim().toLowerCase();
      nameToUse = customName.trim() || emailToUse.split('@')[0];
    }

    setLoading(true);
    try {
      await onGoogleSuccess({
        email: emailToUse,
        name: nameToUse,
        googleId: `google-${Date.now()}`
      });
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton style={{ background: '#182032', borderColor: 'rgba(255,255,255,0.1)' }}>
        <Modal.Title className="d-flex align-items-center gap-2 text-white fs-6">
          <GoogleIcon size={22} />
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#182032', color: '#edf2ff' }}>
        <p className="text-white-50 small mb-3">
          Choose a Google account to continue to <strong>VELOOP Rewards</strong>.
        </p>

        {error && (
          <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <span>⚠️</span>
            <div>{error}</div>
          </Alert>
        )}

        {/* Account 1: Quick Google Profile */}
        <div
          className={`p-3 rounded mb-2 d-flex align-items-center gap-3 border cursor-pointer ${
            !useCustom ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary border-opacity-25 bg-dark'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => setUseCustom(false)}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
            style={{ width: 40, height: 40, background: '#4285F4', fontSize: '1.1rem' }}
          >
            A
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="fw-bold text-white small">Alex Morgan</div>
            <div className="text-white-50 small text-truncate">alex.morgan@gmail.com</div>
          </div>
          {!useCustom && <span className="text-primary fw-bold">✓</span>}
        </div>

        {/* Option 2: Use another account */}
        <div
          className={`p-3 rounded mb-3 border cursor-pointer ${
            useCustom ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary border-opacity-25 bg-dark'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => setUseCustom(true)}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5">➕</span>
            <span className="text-white small fw-bold">Use another Google account</span>
          </div>

          {useCustom && (
            <div className="mt-3 pt-2 border-top border-secondary border-opacity-25" onClick={(e) => e.stopPropagation()}>
              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small fw-bold">Google Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="yourname@gmail.com"
                  size="sm"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="bg-dark text-white border-secondary"
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label className="text-white-50 small fw-bold">Your Name (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your Full Name"
                  size="sm"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="btn-primary-custom px-3"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Continue with Google →'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
