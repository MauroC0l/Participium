import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTelegram, FaTimes, FaCopy, FaCheck, FaClock, FaEdit, FaUnlink, FaExclamationTriangle } from 'react-icons/fa';
import { generateTelegramLinkCode, getTelegramStatus, updateTelegramUsername, unlinkTelegramAccount } from '../api/authApi';
import '../css/TelegramLinkModal.css';

const TelegramLinkModal = ({ onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadTelegramStatus();
  }, []);

  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          setCode(null);
          setExpiresAt(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const loadTelegramStatus = async () => {
    try {
      setLoading(true);
      const telegramStatus = await getTelegramStatus();
      setStatus(telegramStatus);
      
      if (telegramStatus.activeCode) {
        setCode(telegramStatus.activeCode.code);
        setExpiresAt(telegramStatus.activeCode.expiresAt);
      }
    } catch (err) {
      setError('Error loading Telegram status');
      console.error('Error loading Telegram status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      setError(null);
      const result = await generateTelegramLinkCode();
      setCode(result.code);
      setExpiresAt(result.expiresAt);
    } catch (err) {
      setError('Error generating code');
      console.error('Error generating code:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateUsername = async () => {
    if (!newUsername || !newUsername.trim()) {
      setError('Please enter a valid Telegram username');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await updateTelegramUsername(newUsername.trim());
      setSuccessMessage('Telegram username updated successfully!');
      setIsEditing(false);
      setNewUsername('');
      await loadTelegramStatus();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Error updating Telegram username');
      console.error('Error updating username:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      setUnlinking(true);
      setError(null);
      await unlinkTelegramAccount();
      setSuccessMessage('Telegram account unlinked successfully!');
      setShowUnlinkConfirm(false);
      await loadTelegramStatus();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Error unlinking Telegram account');
      console.error('Error unlinking account:', err);
    } finally {
      setUnlinking(false);
    }
  };

  if (loading) {
    return (
      <div className="ch-modal-overlay" onClick={onClose}>
        <div className="ch-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="ch-modal-icon-box">
            <FaTelegram />
          </div>
          <h3 className="ch-modal-title">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-modal-overlay" onClick={onClose}>
      <div className="ch-modal-content telegram-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ch-modal-close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="ch-modal-icon-box">
          <FaTelegram />
        </div>

        <h3 className="ch-modal-title">Link Telegram Account</h3>

        {status?.isLinked ? (
          <div className="telegram-status">
            {successMessage && (
              <div className="success-message">
                <FaCheck className="success-icon" />
                {successMessage}
              </div>
            )}

            {!isEditing && !showUnlinkConfirm && (
              <>
                <div className="status-success">
                  <FaCheck className="status-icon" />
                  <p>Account linked to <strong>{status.telegramUsername}</strong></p>
                </div>
                <p className="telegram-desc">
                  Now you can create reports directly from the Telegram bot!
                </p>

                <div className="telegram-actions">
                  <button
                    className="telegram-action-btn secondary"
                    onClick={() => {
                      setIsEditing(true);
                      setNewUsername(status.telegramUsername?.replace('@', '') || '');
                    }}
                  >
                    <FaEdit /> Update Username
                  </button>
                  <button
                    className="telegram-action-btn danger"
                    onClick={() => setShowUnlinkConfirm(true)}
                  >
                    <FaUnlink /> Unlink Account
                  </button>
                </div>
              </>
            )}

            {isEditing && (
              <div className="edit-username-section">
                <h4>Update Telegram Username</h4>
                <p className="edit-desc">
                  Enter your new Telegram username (without @)
                </p>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                <div className="input-group">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    className="telegram-input"
                    placeholder="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={updating}
                  />
                </div>
                <div className="action-buttons">
                  <button
                    className="telegram-action-btn secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setNewUsername('');
                      setError(null);
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    className="telegram-action-btn primary"
                    onClick={handleUpdateUsername}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}

            {showUnlinkConfirm && (
              <div className="unlink-confirm-section">
                <div className="warning-box">
                  <FaExclamationTriangle className="warning-icon" />
                  <h4>Unlink Telegram Account</h4>
                  <p>
                    Are you sure you want to unlink your Telegram account?
                  </p>
                  <p className="warning-text">
                    You will no longer be able to create reports via Telegram until you link again.
                  </p>
                </div>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                <div className="action-buttons">
                  <button
                    className="telegram-action-btn secondary"
                    onClick={() => {
                      setShowUnlinkConfirm(false);
                      setError(null);
                    }}
                    disabled={unlinking}
                  >
                    Cancel
                  </button>
                  <button
                    className="telegram-action-btn danger"
                    onClick={handleUnlinkAccount}
                    disabled={unlinking}
                  >
                    {unlinking ? 'Unlinking...' : 'Yes, Unlink'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="telegram-setup">
            <p className="telegram-desc">
              Link your Telegram account to create reports directly from the bot.
              This is secure and requires your confirmation.
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {code ? (
              <div className="code-display">
                <div className="code-header">
                  <h4>Verification Code</h4>
                  <div className="time-left">
                    <FaClock />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <div className="code-box">
                  <span className="code-text">{code}</span>
                  <button
                    className="copy-btn"
                    onClick={copyToClipboard}
                    title="Copy code"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <div className="code-instructions">
                  <p><strong>Step 1:</strong> Open Telegram and go to the bot @ParticipiumBot</p>
                  <p><strong>Step 2:</strong> Send the command: <code>/link {code}</code></p>
                  <p><strong>Step 3:</strong> The link will be completed automatically</p>
                </div>
                <button
                  className="telegram-action-btn"
                  onClick={handleGenerateCode}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate New Code'}
                </button>
              </div>
            ) : (
              <div className="generate-section">
                <button
                  className="telegram-action-btn primary"
                  onClick={handleGenerateCode}
                  disabled={generating}
                >
                  {generating ? 'Generating Code...' : 'Generate Verification Code'}
                </button>
                <p className="code-note">
                  The code will be valid for 10 minutes
                </p>
              </div>
            )}
          </div>
        )}

        <div className="telegram-benefits">
          <h4>Benefits of linking:</h4>
          <ul>
            <li>✅ Create reports directly from Telegram</li>
            <li>✅ Receive notifications on your reports</li>
            <li>✅ Simple and fast interface</li>
            <li>✅ Always available on your phone</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

TelegramLinkModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TelegramLinkModal;