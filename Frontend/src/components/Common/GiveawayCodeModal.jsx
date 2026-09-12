import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const VALID_CODES = {
  VELOOP2026: { amount: 500, label: 'VIP Welcome Bonus' },
  SUMMERDROP: { amount: 250, label: 'Summer Drop Access Pass' },
  REWARD500: { amount: 500, label: 'Exclusive Community Reward' },
  LUCKYVE: { amount: 1000, label: 'Grand Loyalty Boost' }
};

export default function GiveawayCodeModal({ show, onHide, onCodeRedeemed }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '', bonus: 0 }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) return;

    setIsSubmitting(true);
    setStatus(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const match = VALID_CODES[cleanCode];

      if (match) {
        setStatus({
          type: 'success',
          message: `Code redeemed successfully! Added ${match.amount} VEs to your account.`,
          bonus: match.amount
        });
        if (onCodeRedeemed) {
          onCodeRedeemed(match.amount);
        }
      } else {
        setStatus({
          type: 'danger',
          message: 'Invalid or expired giveaway code.'
        });
      }
    }, 600);
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
          <span>🎁</span> Enter Giveaway Code
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'rgba(15, 20, 36, 0.98)', color: '#edf2ff' }}>
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
      </Modal.Body>
    </Modal>
  );
}
