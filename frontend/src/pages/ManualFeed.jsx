import React, { useState } from "react";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/ManualFeed.css";

export default function ManualFeed() {
  const [catAmount, setCatAmount] = useState(30);
  const [dogAmount, setDogAmount] = useState(50);
  const [loading, setLoading] = useState({ cat: false, dog: false });
  const navigate = useNavigate();

  const feed = async (pet, amount) => {
    setLoading(prev => ({ ...prev, [pet]: true }));
    try {
      const token = await auth.currentUser.getIdToken();
      const r = await fetch(`${process.env.REACT_APP_BACKEND_URL}/feeder/feed-${pet}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const j = await r.json();
      alert(`${pet.charAt(0).toUpperCase() + pet.slice(1)} fed successfully!`);
    } catch (error) {
      console.error(`Error feeding ${pet}:`, error);
      alert(`Error feeding ${pet}`);
    } finally {
      setLoading(prev => ({ ...prev, [pet]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="manual-feed-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>SnackLoader</h2>
          <span>Automatic Pet Feeder</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manualFeed" className="nav-link active">Manual Feed</Link>
          <Link to="/feederSetting" className="nav-link">Feeder Settings</Link>
        </div>
        <div className="nav-user">
          <span className="user-email">{auth.currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="feed-content">
        <div className="feed-header">
          <div className="header-content">
            <h1>Manual Feed</h1>
            <p>Manually dispense food for your pets</p>
          </div>
        </div>

        <div className="feed-grid">
          {/* Cat Feed Card */}
          <div className="feed-card cat-card">
            <div className="card-header">
              <div className="pet-avatar">🐱</div>
              <div className="pet-info">
                <h3>Feed Cat</h3>
                <p>Dispense food for your cat</p>
              </div>
            </div>
            <div className="feed-controls">
              <div className="amount-control">
                <label className="amount-label">Amount (grams)</label>
                <input 
                  type="number" 
                  className="feed-input"
                  value={catAmount} 
                  onChange={e => setCatAmount(e.target.value)} 
                  min="1"
                  max="200"
                />
                <div className="amount-buttons">
                  <button onClick={() => setCatAmount(20)} className="amount-btn">20g</button>
                  <button onClick={() => setCatAmount(30)} className="amount-btn">30g</button>
                  <button onClick={() => setCatAmount(50)} className="amount-btn">50g</button>
                </div>
              </div>
              <button 
                className={`feed-button cat ${loading.cat ? 'loading' : ''}`}
                onClick={() => feed("cat", catAmount)}
                disabled={loading.cat}
              >
                {loading.cat ? (
                  <>
                    <div className="loading-spinner"></div>
                    Feeding...
                  </>
                ) : (
                  <>
                    🍖 Feed Cat
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dog Feed Card */}
          <div className="feed-card dog-card">
            <div className="card-header">
              <div className="pet-avatar">🐶</div>
              <div className="pet-info">
                <h3>Feed Dog</h3>
                <p>Dispense food for your dog</p>
              </div>
            </div>
            <div className="feed-controls">
              <div className="amount-control">
                <label className="amount-label">Amount (grams)</label>
                <input 
                  type="number" 
                  className="feed-input"
                  value={dogAmount} 
                  onChange={e => setDogAmount(e.target.value)} 
                  min="1"
                  max="500"
                />
                <div className="amount-buttons">
                  <button onClick={() => setDogAmount(50)} className="amount-btn">50g</button>
                  <button onClick={() => setDogAmount(100)} className="amount-btn">100g</button>
                  <button onClick={() => setDogAmount(150)} className="amount-btn">150g</button>
                </div>
              </div>
              <button 
                className={`feed-button dog ${loading.dog ? 'loading' : ''}`}
                onClick={() => feed("dog", dogAmount)}
                disabled={loading.dog}
              >
                {loading.dog ? (
                  <>
                    <div className="loading-spinner"></div>
                    Feeding...
                  </>
                ) : (
                  <>
                    🍖 Feed Dog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="quick-tips">
          <h3>💡 Quick Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Cat Portions</h4>
              <p>Typically 20-50g per meal depending on size and activity level</p>
            </div>
            <div className="tip-card">
              <h4>Dog Portions</h4>
              <p>Typically 50-200g per meal depending on breed and weight</p>
            </div>
            <div className="tip-card">
              <h4>Feeding Frequency</h4>
              <p>Adult pets usually need 2 meals per day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}