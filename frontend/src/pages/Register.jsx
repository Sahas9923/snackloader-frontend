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

  // Update input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = res.user.uid;

      // Save user in Firestore (IMPORTANT: save firebaseUid)
      await setDoc(doc(db, "users", uid), {
        firebaseUid: uid,   // 🔥 REQUIRED FOR LOGIN
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
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="register-input"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="register-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="register-input"
          />

          <button type="submit" className="register-button">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <a href="/login" className="register-link">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
