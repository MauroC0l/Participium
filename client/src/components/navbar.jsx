import { useNavigate, useLocation } from "react-router-dom";
import {
  Navbar as BSNavbar,
  Container,
  Nav,
  Button,
} from "react-bootstrap";

import "../css/Navbar.css";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();


  const showLogout = user && location.pathname.startsWith("/home");
  const isAdmin = user && user.role === 'Administrator';

  const queryParams = new URLSearchParams(location.search);
  const currentViewParam = queryParams.get('view_as');

  const handleBrandClick = () => {
    navigate(user ? "/home" : "/");
  };


  return (
    <BSNavbar
      fixed="top"
      style={{
        backgroundColor: 'var(--primary)',
        boxShadow: 'var(--shadow-md)',
        padding: '1rem 0',
        zIndex: 1030
      }}
      variant="dark"
      expand="lg"
    >
      <Container fluid className="px-4">
        <BSNavbar.Brand
          onClick={handleBrandClick}
          style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 'var(--font-bold)',
            letterSpacing: '-0.025em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <img
            src="/participium-circle.jpg"
            alt="Participium Logo"
            className="navbar-brand-logo"
          />
          Participium
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">

            {showLogout && (
              <>
                {/* --- User Info --- */}
                <div className="text-light me-3">
                  <div
                    style={{
                      fontWeight: 'var(--font-medium)',
                      fontSize: 'var(--font-sm)'
                    }}
                  >
                    {user.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      opacity: 0.8,
                      textTransform: 'capitalize'
                    }}
                  >
                    {isAdmin && currentViewParam
                      ? `Viewing as: ${currentViewParam}`
                      : user.role
                    }
                  </div>
                </div>

                {/* --- Logout Button --- */}
                <Button
                  variant="light"
                  onClick={onLogout}
                  style={{
                    fontWeight: 'var(--font-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1.5rem',
                    minHeight: 'var(--btn-height-sm)'
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}