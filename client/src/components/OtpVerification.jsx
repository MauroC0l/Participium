import { useState } from "react";
import PropTypes from "prop-types";
import { Form, Spinner, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { verifyEmailCode } from "../api/citizenApi";
import "../css/OtpVerification.css";

const OtpVerification = ({ email, onResend }) => {
  const navigate = useNavigate();
  
  // --- STATO ---
  const [otp, setOtp] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- HANDLERS ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP code.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email,
        otp_code: otp 
      };

      await verifyEmailCode(payload.email, payload.otp_code);

      setSuccess("Account verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Verification failed:", err);
      handleApiError(err);
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    if (!err.status && (err.message === "Failed to fetch" || err.message.includes("Network"))) {
      setError("Unable to contact the server. Check your connection.");
    } else if (err.status === 400) {
      setError(err.message || "Invalid data or incorrect code.");
    } else if (err.status >= 500) {
      setError("Internal server error.");
    } else {
      setError(err.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="reg-alert">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")} className="reg-alert">
          {success}
        </Alert>
      )}

      <Form onSubmit={handleVerifyOtp} noValidate className="reg-form">
        <Form.Group className="reg-form-group">
          <div className={`reg-form-control-container ${focusedField === 'otp' || otp ? 'focused' : ''}`}>
            <FaCheckCircle className="reg-input-icon" />
            <Form.Control
              type="text"
              placeholder={focusedField === 'otp' ? '' : "Enter OTP Code"}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onFocus={() => setFocusedField('otp')}
              onBlur={() => setFocusedField('')}
              disabled={loading}
              className="reg-modern-input otp-input"
              maxLength={6}
            />
            <Form.Label className="reg-floating-label">Confirmation Code</Form.Label>
          </div>
          <Form.Text className="text-muted text-center d-block mt-2">
            Please check your email inbox (and spam folder) for the 6-digit code.
          </Form.Text>
        </Form.Group>

        <button type="submit" className="btn reg-btn-custom-primary reg-btn mt-3" disabled={loading}>
          {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Verifying...</> : "Verify & Login"}
        </button>

        <div className="text-center mt-3">
          <Button 
            variant="link" 
            className="text-decoration-none" 
            onClick={onResend}
            disabled={loading}
          >
            Resend Code
          </Button>
        </div>
      </Form>
    </div>
  );
};

OtpVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onResend: PropTypes.func,
};

export default OtpVerification;