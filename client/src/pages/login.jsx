import React, { useState } from "react";
import { Alert, Card, Form, Button, Container, Row, Col, InputGroup } from "react-bootstrap";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);

      // Clear password field on error
      setPassword("");

      // Set user-friendly error message
      if (err.status === 401) {
        setError("Invalid username or password. Please try again.");
      } else if (err.status === 400) {
        setError("Invalid request. Please check your input.");
      } else if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError(err.message || "Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center min-vh-100" 
      style={{ backgroundColor: 'var(--bg-lighter)' }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5} xl={4}>
          <Card 
            className="shadow-lg" 
            style={{ 
              borderRadius: 'var(--radius-xl)',
              border: 'none'
            }}
          >
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <img 
                  src="/participium-logo.png" 
                  alt="Participium Logo" 
                  style={{ height: '120px', width: 'auto', marginBottom: '1.5rem' }}
                />
                <p 
                  className="text-muted mb-0" 
                  style={{ fontSize: 'var(--font-base)' }}
                >
                  Sign in to your account
                </p>
              </div>

              {error && (
                <Alert 
                  variant="danger" 
                  onClose={() => setError("")} 
                  dismissible 
                  className="mb-4"
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin} noValidate>
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Username
                  </Form.Label>
                  <InputGroup size="lg">
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 'var(--font-medium)' }}>
                    Password
                  </Form.Label>
                  <InputGroup size="lg">
                    <Form.Control
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password"
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

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 mb-4" 
                  size="lg"
                  disabled={loading}
                  style={{ fontWeight: 'var(--font-semibold)' }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Form>

              <div className="text-center">
                <span 
                  className="text-muted" 
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  Don't have an account?{" "}
                </span>
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => !loading && navigate("/register")}
                  disabled={loading}
                  style={{ 
                    fontSize: 'var(--font-sm)',
                    fontWeight: 'var(--font-semibold)'
                  }}
                >
                  Create one
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}