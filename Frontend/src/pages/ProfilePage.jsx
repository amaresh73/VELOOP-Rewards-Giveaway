import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Modal, Badge } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, isLoggedIn, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Route protection
  if (!isLoggedIn) {
    return <Navigate to="/login?redirect=/profile" replace state={{ message: 'Please log in to view your profile.' }} />;
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm new password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setPasswordSuccess(response.message || 'Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please check your current password.';
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const confirmAccountDeletion = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      navigate('/login', {
        state: {
          registered: false,
          message: 'Your account has been permanently deleted. We are sorry to see you go.'
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect password. Account deletion aborted.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const balances = user?.balances || { VEs: 0, SVEs: 0, Tokens: 0 };

  return (
    <div className="section py-4">
      <Container className="container-shell" style={{ maxWidth: 900 }}>
        {/* Navigation / Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold">
            ← Back to Giveaways
          </Link>
          <Badge bg={user?.role === 'admin' ? 'primary' : 'secondary'} className="px-3 py-2 fs-6">
            {user?.role === 'admin' ? '🛡️ Administrator' : '👤 Verified Member'}
          </Badge>
        </div>

        <Row className="g-4">
          {/* Left Column: Profile Details & Balances */}
          <Col lg={5}>
            <div className="card-glass p-4 rounded mb-4">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary bg-opacity-25 border border-primary border-opacity-50 d-flex align-items-center justify-content-center text-primary fw-bold mx-auto mb-3"
                  style={{ width: 80, height: 80, fontSize: '2.2rem' }}
                >
                  {user?.name ? user.name[0].toUpperCase() : '👤'}
                </div>
                <h3 className="fw-bold mb-1">{user?.name || 'Member'}</h3>
                <p className="text-white-50 small mb-2">{user?.email || 'No email registered'}</p>
                <Badge bg="success" bg-opacity="25" className="text-success border border-success border-opacity-25">
                  ✓ Account Active
                </Badge>
              </div>

              <hr className="border-secondary border-opacity-25 my-3" />

              {/* Wallet Balances */}
              <h6 className="text-white-50 text-uppercase small fw-bold mb-3">Your Wallet Balances</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">💎 VEs (Veloop Entries)</span>
                  <span className="fw-bold text-white fs-6">{Number(balances.VEs || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">⚡ SVEs (Super VEs)</span>
                  <span className="fw-bold text-warning fs-6">{Number(balances.SVEs || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-2 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <span className="text-white-50 small">🪙 Tokens</span>
                  <span className="fw-bold text-info fs-6">{Number(balances.Tokens || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Column: Password Change & Danger Zone */}
          <Col lg={7}>
            {/* Password Change Card */}
            <div className="card-glass p-4 rounded mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-4">🔑</span>
                <div>
                  <h4 className="fw-bold mb-0">Change Password</h4>
                  <small className="text-white-50">Update your account login password</small>
                </div>
              </div>

              {passwordSuccess && (
                <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>✅</span>
                  <div>{passwordSuccess}</div>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <span>⚠️</span>
                  <div>{passwordError}</div>
                </Alert>
              )}

              <Form onSubmit={submitPasswordChange}>
                <Form.Group className="mb-3" controlId="current-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Current Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="new-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    placeholder="At least 6 characters"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="confirm-new-password">
                  <Form.Label className="text-white-50 small fw-bold mb-1">
                    Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmNewPassword"
                    placeholder="Re-enter new password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="bg-dark text-white border-secondary"
                    required
                    disabled={passwordLoading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-custom w-100 py-2 fw-semibold"
                  disabled={passwordLoading}
                  id="change-password-submit-btn"
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </Button>
              </Form>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div
              className="card-glass p-4 rounded"
              style={{ border: '1px solid rgba(220, 53, 69, 0.4)', background: 'rgba(220, 53, 69, 0.04)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                <span className="fs-4">⚠️</span>
                <h4 className="fw-bold mb-0">Danger Zone</h4>
              </div>
              <p className="text-white-50 small mb-3">
                Permanently delete your account. Once your account is deleted, your profile, entry tickets, and wallet balances will be permanently destroyed. This action cannot be reversed.
              </p>
              <Button
                variant="outline-danger"
                className="fw-bold w-100 py-2"
                onClick={() => {
                  setDeletePassword('');
                  setDeleteError('');
                  setShowDeleteModal(true);
                }}
                id="open-delete-modal-btn"
              >
                Delete Account Permanently
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        centered
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="text-danger fw-bold fs-5">
            ⚠️ Confirm Permanent Account Deletion
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={confirmAccountDeletion}>
          <Modal.Body>
            <p className="small text-white-50 mb-3">
              Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)? All your balances, entries, and rewards will be immediately purged from our servers.
            </p>

            {deleteError && (
              <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <span>⚠️</span>
                <div>{deleteError}</div>
              </Alert>
            )}

            <Form.Group controlId="delete-account-password" className="mb-2">
              <Form.Label className="text-white small fw-bold mb-1">
                Enter your password to authorize deletion:
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                className="bg-black text-white border-secondary"
                autoFocus
                required
                disabled={deleteLoading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={deleteLoading || !deletePassword}
              id="confirm-delete-account-btn"
            >
              {deleteLoading ? 'Deleting Account...' : 'Yes, Delete My Account'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
