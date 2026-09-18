import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VALID_CODES = {
  VELOOP2026: { amount: 500, label: 'VIP Welcome Bonus' },
  SUMMERDROP: { amount: 250, label: 'Summer Drop Access Pass' },
  REWARD500: { amount: 500, label: 'Exclusive Community Reward' },
  LUCKYVE: { amount: 1000, label: 'Grand Loyalty Boost' }
};

export default function GiveawayCodeModal({ show, onHide, onCodeRedeemed }) {
  const { user, setUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '', bonus: 0 }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setStatus({ type: 'warning', message: 'Please log in to redeem promo codes.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await api.post('/auth/redeem-code', { code: cleanCode });
      if (res.data?.success) {
        if (res.data.balances && user) {
          const updatedUser = {
            ...user,
            balances: res.data.balances,
            points: res.data.balances.VEs
          };
          setUser(updatedUser);
          localStorage.setItem('veloop-user', JSON.stringify(updatedUser));
        }
        setStatus({
          type: 'success',
          message: res.data.message || `Code redeemed successfully! Added ${res.data.bonus || 500} VEs to your account.`,
          bonus: res.data.bonus
        });
        if (onCodeRedeemed) {
          onCodeRedeemed(res.data.bonus || 500);
        }
      }
    } catch (err) {
      // Local fallback for offline/demo if server returns not-implemented or error
      const match = VALID_CODES[cleanCode];
      if (match) {
        if (user) {
          const updatedBalances = {
            ...(user.balances || { VEs: 0, SVEs: 0, Tokens: 0 }),
            VEs: ((user.balances?.VEs) || 0) + match.amount
          };
          const updatedUser = {
            ...user,
            balances: updatedBalances,
            points: updatedBalances.VEs
          };
          setUser(updatedUser);
          localStorage.setItem('veloop-user', JSON.stringify(updatedUser));
        }
        setStatus({
          type: 'success',
          message: `Code redeemed successfully! Added ${match.amount} VEs to your account.`,
          bonus: match.amount
        });
        if (onCodeRedeemed) {
          onCodeRedeemed(match.amount);
        }
      } else {
        const errorMsg = err.response?.data?.message || 'Invalid or expired giveaway code.';
        setStatus({
          type: 'danger',
          message: errorMsg
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setStatus(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ background: 'rgba(15, 20, 36, 0.98)', borderColor: 'rgba(140, 120, 255, 0.2)' }}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <span>🎁</span> {isLoggedIn ? 'Enter Giveaway Code' : 'Redeem Code (Login Required)'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'rgba(15, 20, 36, 0.98)', color: '#edf2ff' }}>
        {!isLoggedIn ? (
          <div className="text-center py-4 px-2">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 64,
                height: 64,
                background: 'rgba(140, 120, 255, 0.15)',
                border: '1px solid rgba(140, 120, 255, 0.4)',
                fontSize: '1.8rem'
              }}
            >
              🔐
            </div>
            <h5 className="fw-bold mb-2 text-white">Login Required</h5>
            <p className="text-white-50 small mb-4" style={{ maxWidth: 360, margin: '0 auto' }}>
              You must be logged in to your verified VELOOP account to redeem promo codes and deposit reward currency directly into your wallet.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="outline-light"
                className="px-3"
                onClick={() => {
                  handleClose();
                  navigate('/login');
                }}
              >
                Log In
              </Button>
              <Button
                className="btn-primary-custom px-3"
                onClick={() => {
                  handleClose();
                  navigate('/register');
                }}
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white-50 small mb-3">
              Have an exclusive VELOOP giveaway code? Enter it below to unlock extra VEs and entries instantly into your account.
            </p>

            {status && (
              <Alert variant={status.type} className="mb-3">
                {status.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-uppercase letter-spacing-wide">Promo / Voucher Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. VELOOP2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-uppercase fw-bold"
                  style={{
                    letterSpacing: '0.1em',
                    background: 'rgba(24, 34, 58, 0.9)',
                    color: '#fff',
                    borderColor: 'rgba(140, 120, 255, 0.3)'
                  }}
                  required
                />
                <Form.Text className="text-muted small">
                  demo codes: <strong className="text-primary">VELOOP2026</strong>, <strong className="text-primary">SUMMERDROP</strong>
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-light" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  type="submit"
                  className="btn-primary-custom"
                  disabled={isSubmitting || !code.trim()}
                >
                  {isSubmitting ? 'Redeeming...' : 'Redeem Code →'}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
