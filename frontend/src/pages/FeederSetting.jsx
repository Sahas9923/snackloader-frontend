import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "../styles/FeederSettings.css";

export default function FeederSettings() {
  const [catSchedule, setCatSchedule] = useState([]);
  const [dogSchedule, setDogSchedule] = useState([]);
  const [newCatTime, setNewCatTime] = useState("");
  const [newCatAmount, setNewCatAmount] = useState("");
  const [newDogTime, setNewDogTime] = useState("");
  const [newDogAmount, setNewDogAmount] = useState("");
  const [autoFeedEnabled, setAutoFeedEnabled] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const r = await fetch(`${process.env.REACT_APP_BACKEND_URL}/feeder/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      setCatSchedule(data.cat?.schedule || []);
      setDogSchedule(data.dog?.schedule || []);
      setAutoFeedEnabled(data.autoFeedEnabled ?? true);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/feeder/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cat: { schedule: catSchedule },
          dog: { schedule: dogSchedule },
          autoFeedEnabled
        })
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const removeScheduleItem = (pet, index) => {
    if (pet === 'cat') {
      setCatSchedule(catSchedule.filter((_, i) => i !== index));
    } else {
      setDogSchedule(dogSchedule.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="feeder-settings-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h2>SnackLoader</h2>
          <span>Automatic Pet Feeder</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manualFeed" className="nav-link">Manual Feed</Link>
          <Link to="/feederSetting" className="nav-link active">Feeder Settings</Link>
        </div>
        <div className="nav-user">
          <span className="user-email">{auth.currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="settings-content">
        <div className="settings-header">
          <div className="header-content">
            <h1>Feeder Settings</h1>
            <p>Configure automatic feeding schedules for your pets</p>
          </div>
          <div className="header-actions">
            <button onClick={save} className="save-settings-btn">
              💾 Save Settings
            </button>
          </div>
        </div>

        <div className="settings-grid">
          {/* Cat Schedule */}
          <div className="settings-card">
            <div className="card-header">
              <div className="pet-icon">🐱</div>
              <h3>Cat Feeding Schedule</h3>
            </div>
            <div className="schedule-list">
              {catSchedule.length === 0 ? (
                <div className="empty-schedule">
                  <p>No feeding times scheduled</p>
                </div>
              ) : (
                catSchedule.map((s, i) => (
                  <div key={i} className="schedule-item">
                    <div className="schedule-info">
                      <span className="schedule-time">{s.time}</span>
                      <span className="schedule-amount">{s.amount}g</span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeScheduleItem('cat', i)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="schedule-inputs">
              <input 
                type="time" 
                className="schedule-input"
                value={newCatTime} 
                onChange={e => setNewCatTime(e.target.value)} 
              />
              <input 
                type="number" 
                className="schedule-input"
                placeholder="Grams" 
                value={newCatAmount} 
                onChange={e => setNewCatAmount(e.target.value)} 
                min="1"
              />
              <button 
                className="add-schedule-btn"
                onClick={() => { 
                  if (newCatTime && newCatAmount) {
                    setCatSchedule([...catSchedule, { time: newCatTime, amount: Number(newCatAmount) }]); 
                    setNewCatTime(""); 
                    setNewCatAmount(""); 
                  }
                }}
                disabled={!newCatTime || !newCatAmount}
              >
                Add Time
              </button>
            </div>
          </div>

          {/* Dog Schedule */}
          <div className="settings-card">
            <div className="card-header">
              <div className="pet-icon">🐶</div>
              <h3>Dog Feeding Schedule</h3>
            </div>
            <div className="schedule-list">
              {dogSchedule.length === 0 ? (
                <div className="empty-schedule">
                  <p>No feeding times scheduled</p>
                </div>
              ) : (
                dogSchedule.map((s, i) => (
                  <div key={i} className="schedule-item">
                    <div className="schedule-info">
                      <span className="schedule-time">{s.time}</span>
                      <span className="schedule-amount">{s.amount}g</span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeScheduleItem('dog', i)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="schedule-inputs">
              <input 
                type="time" 
                className="schedule-input"
                value={newDogTime} 
                onChange={e => setNewDogTime(e.target.value)} 
              />
              <input 
                type="number" 
                className="schedule-input"
                placeholder="Grams" 
                value={newDogAmount} 
                onChange={e => setNewDogAmount(e.target.value)} 
                min="1"
              />
              <button 
                className="add-schedule-btn"
                onClick={() => { 
                  if (newDogTime && newDogAmount) {
                    setDogSchedule([...dogSchedule, { time: newDogTime, amount: Number(newDogAmount) }]); 
                    setNewDogTime(""); 
                    setNewDogAmount(""); 
                  }
                }}
                disabled={!newDogTime || !newDogAmount}
              >
                Add Time
              </button>
            </div>
          </div>

          {/* Auto Feed Toggle */}
          <div className="settings-card toggle-card">
            <div className="card-header">
              <div className="pet-icon">⚡</div>
              <h3>Auto Feed Settings</h3>
            </div>
            <div className="toggle-section">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  className="toggle-checkbox"
                  checked={autoFeedEnabled} 
                  onChange={() => setAutoFeedEnabled(!autoFeedEnabled)} 
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="toggle-info">
                <h4>Automatic Feeding</h4>
                <p>Enable scheduled feeding times for your pets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}