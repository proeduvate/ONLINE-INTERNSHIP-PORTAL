import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // 🔹 Dummy Users
  const users = {
    admin: { email: "admin@gmail.com", password: "admin123" },
    mentor: { email: "mentor@gmail.com", password: "mentor123" },
    intern: { email: "intern@gmail.com", password: "intern123" },
  };

  const handleLogin = () => {
    if (!role || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = users[role];

    if (user && user.email === email && user.password === password) {
      alert("Login Successful!");

      // 🔥 Route based on role
      navigate(`/${role}`);
    } else {
      alert("Invalid Credentials!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="title">Internship Portal</h2>
        <p className="subtitle">Welcome back! Please login</p>

        <select 
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="mentor">Mentor</option>
          <option value="intern">Intern</option>
        </select>

        <input 
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        {/* Demo credentials */}
        <div style={{ marginTop: "15px", fontSize: "12px" }}>
          <p><b>Demo Logins:</b></p>
          <p>Admin → admin@gmail.com / admin123</p>
          <p>Mentor → mentor@gmail.com / mentor123</p>
          <p>Intern → intern@gmail.com / intern123</p>
        </div>

      </div>
    </div>
  );
}