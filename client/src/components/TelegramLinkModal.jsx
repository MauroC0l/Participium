import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTelegram, FaTimes, FaCopy, FaCheck, FaClock, FaUnlink, FaExclamationTriangle } from 'react-icons/fa';
import { generateTelegramLinkCode, getTelegramStatus, unlinkTelegramAccount } from '../api/authApi';
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
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [checking, setChecking] = useState(false);

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
      const res = await getTelegramStatus();
      setStatus(res);
      if (res.activeCode) {
        setCode(res.activeCode.code);
        setExpiresAt(res.activeCode.expiresAt);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible caricare lo stato di Telegram.');
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
      setError('Errore nella generazione del codice.');
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
        console.error(err);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckLinkStatus = async () => {
    try {
      setChecking(true);
      setError(null);
      const res = await getTelegramStatus();
      if (res.isLinked) {
        setSuccessMessage('Account collegato con successo!');
        setStatus(res);
        setCode(null);
        setExpiresAt(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Non ancora collegato. Hai inviato il codice al bot?');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Errore durante il controllo dello stato.');
    } finally {
      setChecking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      setUnlinking(true);
      await unlinkTelegramAccount();
      setSuccessMessage('Account scollegato correttamente.');
      setShowUnlinkConfirm(false);
      setCode(null);
      setExpiresAt(null);
      await loadTelegramStatus();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Errore durante lo scollegamento.');
    } finally {
      setUnlinking(false);
    }
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="ch-modal-overlay">
        <div className="ch-modal-content">
           <div className="tl-icon-box"><FaTelegram /></div>
           <h3 className="tl-title">Caricamento...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-modal-overlay" onClick={onClose}>
      {/* Usiamo la classe standard 'ch-modal-content' per lo sfondo bianco e le ombre */}
      <div className="ch-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="ch-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="tl-container">
          {/* Header Icona */}
          <div className="tl-header">
            <div className="tl-icon-box">
              <FaTelegram />
            </div>
            <h3 className="tl-title">Collega Telegram</h3>
            {!status?.isLinked && (
               <p className="tl-description">
                 Ricevi aggiornamenti in tempo reale e invia segnalazioni direttamente dalla chat.
               </p>
            )}
          </div>

          {/* Feedback Messaggi */}
          {error && <div className="tl-msg error">{error}</div>}
          {successMessage && <div className="tl-msg success"><FaCheck /> {successMessage}</div>}

          {status?.isLinked ? (
            /* --- SCENARIO 1: ACCOUNT COLLEGATO --- */
            <>
              {!showUnlinkConfirm ? (
                <>
                  <div className="tl-linked-card">
                    <div className="tl-avatar"><FaTelegram /></div>
                    <div className="tl-user-info">
                      <span className="tl-user-label">Account Collegato</span>
                      <span className="tl-username">@{status.telegramUsername}</span>
                    </div>
                  </div>
                  
                  <div className="tl-actions">
                     <button className="tl-btn tl-btn-danger" onClick={() => setShowUnlinkConfirm(true)}>
                       <FaUnlink /> Scollega Account
                     </button>
                  </div>
                </>
              ) : (
                /* --- SCENARIO 2: CONFERMA SCOLLEGAMENTO --- */
                <div className="tl-unlink-confirm">
                   <div style={{color: '#f59e0b', fontSize: '2.5rem', marginBottom: '1rem'}}>
                     <FaExclamationTriangle />
                   </div>
                   <p className="tl-description">
                     Sei sicuro? Non potrai più inviare segnalazioni via Telegram.
                   </p>
                   <div className="tl-actions">
                     <button className="tl-btn tl-btn-secondary" onClick={() => setShowUnlinkConfirm(false)}>
                       Annulla
                     </button>
                     <button className="tl-btn tl-btn-danger" onClick={handleUnlinkAccount} disabled={unlinking}>
                       {unlinking ? 'Scollegamento...' : 'Conferma'}
                     </button>
                   </div>
                </div>
              )}
            </>
          ) : (
            /* --- SCENARIO 3: GENERAZIONE CODICE --- */
            <>
              {code ? (
                <div className="tl-code-wrapper">
                  <div className="tl-code-header">
                    <span>Codice di verifica</span>
                    <div className="tl-timer">
                      <FaClock /> {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div className="tl-code-display" onClick={copyToClipboard} title="Clicca per copiare">
                    <span className="tl-code-text">{code}</span>
                    <span className="tl-copy-icon">
                       {copied ? <FaCheck /> : <FaCopy />}
                    </span>
                  </div>

                  <div className="tl-steps">
                    <div className="tl-step-row">
                      <div className="tl-step-num">1</div>
                      <span>Apri <strong>@ParticipiumBot</strong> su Telegram</span>
                    </div>
                    <div className="tl-step-row">
                      <div className="tl-step-num">2</div>
                      <span>Invia il comando: <code>/link {code}</code></span>
                    </div>
                  </div>

                  <div className="tl-actions">
                    <button 
                      className="tl-btn tl-btn-secondary" 
                      onClick={handleGenerateCode} 
                      disabled={generating}
                    >
                      Nuovo Codice
                    </button>
                    <button 
                      className="tl-btn tl-btn-primary" 
                      onClick={handleCheckLinkStatus} 
                      disabled={checking}
                    >
                      {checking ? 'Controllo...' : 'Ho inviato il codice'}
                    </button>
                  </div>
                </div>
              ) : (
                /* --- SCENARIO 4: STATO INIZIALE --- */
                <div className="tl-initial">
                  <button 
                    className="tl-btn tl-btn-primary" 
                    style={{width: '100%'}} 
                    onClick={handleGenerateCode} 
                    disabled={generating}
                  >
                    {generating ? 'Generazione...' : 'Genera Codice di Collegamento'}
                  </button>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem'}}>
                    Il codice sarà valido per 10 minuti.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

TelegramLinkModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TelegramLinkModal;