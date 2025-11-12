import { Routes, Route , useLocation , Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/homepage.jsx";
import Navbar from "./components/navbar.jsx";

function App() {
  const location = useLocation();

  // Hide navbar on login and register pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/";
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
