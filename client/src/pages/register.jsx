import { useState } from "react";
import { Alert, Card, Form, Button, Container, Row, Col, InputGroup } from "react-bootstrap";
import { registerCitizen } from "../api/citizenApi";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Map client camelCase fields to server expected snake_case and include role
      const payload = {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: "Citizen",
      };

      await registerCitizen(payload);

      // Show success message
      setSuccess("Account created successfully! Redirecting to login...");

      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration failed:", err);

      // Clear password fields on error
      setPassword("");
      setConfirmPassword("");

      // Set user-friendly error message
      if (err.status === 409) {
        setError("Username or email already exists. Please try another.");
      } else if (err.status === 400) {
        setError(
          err.message || "Invalid registration data. Please check your input."
        );
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError(err.message || "Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center min-vh-100" 
      style={{ backgroundColor: 'var(--bg-lighter)', padding: '2rem 0' }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card 
            className="shadow-lg" 
            style={{ 
              borderRadius: 'var(--radius-xl)',
              border: 'none'
            }}
          >
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <h1 
                  style={{ 
                    color: 'var(--primary)',
                    fontWeight: 'var(--font-bold)',
                    fontSize: 'var(--font-xxxl)',
                    marginBottom: 'var(--spacing-sm)',
                    letterSpacing: '-0.025em'
                  }}
                >
                  Participium
                </h1>
                <p 
                  className="text-muted mb-0" 
                  style={{ fontSize: 'var(--font-base)' }}
                >
                  Create your account
                </p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" onClose={() => setSuccess("")} dismissible className="mb-4">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleRegister} noValidate>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                        First Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                        Last Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 mb-4" 
                  size="lg"
                  disabled={loading}
                  style={{ fontWeight: 'var(--font-semibold)' }}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </Form>

              <div className="text-center">
                <span 
                  className="text-muted" 
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  Already have an account?{" "}
                </span>
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => !loading && navigate("/login")}
                  disabled={loading}
                  style={{ 
                    fontSize: 'var(--font-sm)',
                    fontWeight: 'var(--font-semibold)'
                  }}
                >
                  Sign in
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}