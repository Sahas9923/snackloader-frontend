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

  // 🔥 LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Firebase Auth
      const res = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const firebaseUid = res.user.uid;

      // Step 2: Find Firestore user by firebaseUid
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("firebaseUid", "==", firebaseUid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("User not found in database.");
        setLoading(false);
        return;
      }

      // Get the user data
      const userData = snapshot.docs[0].data();
      const userId = userData.userId;

      // Save user data to localStorage (optional)
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect
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
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="login-input"
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <a href="/register" className="login-link">Create one</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
