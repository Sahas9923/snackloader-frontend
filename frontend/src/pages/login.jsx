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

      alert("Login successful!");
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
        <h1 className="brand-title">Snack Loader</h1>
      </div>

      {/* Right Side - Floating Login Card */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Login</h2>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="login-input"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="login-input"
              required
            />

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <a href="/register" className="login-link">Create one here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;