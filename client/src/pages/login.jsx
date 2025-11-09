import React , {useState} from "react";
import "../css/login.css";
import { useNavigate } from "react-router-dom";


export default function Login() {

const navigate = useNavigate();


const [username , setUsername] = useState('');
const [password , setPassword] = useState('');

const handleLogin = (e) => {
    e.preventDefault()

    //navigate ("/home");
};

return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-logo">Login</h1>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Log in</button>
        </form>

        <div className="signup-link">
          Don't have an account? <span>Register</span>
        </div>
      </div>
    </div>
  );
}