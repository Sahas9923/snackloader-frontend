import React, { useState } from "react";
import "../styles/Register.css";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = res.user.uid;

      await setDoc(doc(db, "users", uid), {
        firebaseUid: uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: "owner",
        devices: [],
        createdAt: serverTimestamp(),
      });

      alert("Registration Successful!");
      window.location.href = "/";

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      {/* Left Side - Brand Only */}
      <div className="register-left">
        <h1 className="brand-title">Snack Loader</h1>
      </div>

      {/* Right Side - Floating Register Card */}
      <div className="register-right">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>

          {error && <p className="register-error">{error}</p>}

          <form onSubmit={handleRegister} className="register-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="register-input"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="register-input"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="register-input"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="register-input"
              required
            />

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="register-footer">
            Already have an account?{" "}
            <a href="/login" className="register-link">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;