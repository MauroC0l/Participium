import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { getCurrentUser, logout } from "./api/authApi"; 
import Login from "./pages/Login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/homepage.jsx";
import Navbar from "./components/navbar.jsx";
import MainPage from "./pages/MainPage.jsx";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/";

  useEffect(() => {
    if (hideNavbar) {
      document.body.classList.remove('has-navbar');
    } else {
      document.body.classList.add('has-navbar');
    }
  }, [hideNavbar]);

  useEffect(() => {
    setIsAuthLoading(true);
    getCurrentUser()
      .then(setUser) 
      .catch(() => setUser(null)) 
      .finally(() => setIsAuthLoading(false));
  }, [location.pathname]);

  // --- Logout handler ---
  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/login");
  };

  const ProtectedHome = () => {
    if (isAuthLoading) {
      return <div>Loading session...</div>; 
    }
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Home user={user} />; 
  };

  return (
    <>
      {!hideNavbar && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<MainPage />} />
        
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={setUser} />} 
        />
        
        <Route path="/register" element={<Register />} />
        
        <Route path="/home" element={<ProtectedHome />} />

      </Routes>
    </>
  );
}

export default App;