import React, { useState } from "react";
import "../styles/Login.css";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const firebaseUid = res.user.uid;
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("firebaseUid", "==", firebaseUid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("User not found in database.");
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      localStorage.setItem("user", JSON.stringify(userData));

      window.location.href = "/dashboard";

    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Left Side - Brand Only */}
      <div className="login-left">
        <div className="brand-section">
          <h1 className="brand-title">SnackLoader</h1>
          <p className="brand-subtitle">Automatic Pet Feeder</p>
          <div className="brand-features">
            <div className="feature">
              <span className="feature-icon">🐾</span>
              <span>Smart Feeding</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span>Remote Control</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌡️</span>
              <span>Environment Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Floating Login Card */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="login-input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="login-input"
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Signing In...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="/register" className="login-link">Create one here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;