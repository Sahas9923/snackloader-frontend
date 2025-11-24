import { useEffect, useState, useCallback } from "react";
import { auth, db, rtdb } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, set, onValue } from "firebase/database";

const AutomaticFeederService = () => {
  const [settings, setSettings] = useState(null);
  const [lastChecked, setLastChecked] = useState({});
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [tempAdapt, setTempAdapt] = useState(false);
  const [catBowl, setCatBowl] = useState(0);
  const [dogBowl, setDogBowl] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 5)); // "HH:MM" format
    };
    
    updateTime(); // Set immediately
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------
  // WEATHER / THI FUNCTIONS (now inside useCallback)
  // ---------------------------------------------------
  const getAdaptedAmount = useCallback((base) => {
    const num = Number(base);
    if (!tempAdapt) return num;

    if (temperature === null || humidity === null) return num;

    // THI calculation inline
    const getTHI = (t, h) => {
      if (!t || !h) return null;
      const dew = t - (100 - h) / 5; // dew point calculation
      return t + 0.36 * dew + 41.2;
    };

    const thi = getTHI(temperature, humidity);
    if (!thi || isNaN(thi)) return num;

    let adapted = num;

    if (thi < 70) adapted = Math.round(num * 1.10);
    else if (thi <= 75) adapted = num;
    else if (thi <= 80) adapted = Math.round(num * 0.90);
    else if (thi <= 85) adapted = Math.round(num * 0.80);
    else adapted = 0;

    // Ignore if change < 5g
    if (Math.abs(adapted - num) < 5) {
      return num;
    }

    return adapted;
  }, [tempAdapt, temperature, humidity]);

  // ---------------------------------------------------
  // AUTOMATIC FEEDING LOGIC
  // ---------------------------------------------------
  const triggerAutomaticFeed = useCallback(async (pet, amount, scheduleTime) => {
    const adjusted = getAdaptedAmount(amount);
    const bowlWeight = pet === "cat" ? catBowl : dogBowl;

    // THI danger check
    if (adjusted === 0 && tempAdapt) {
      console.log(`⚠️ Automatic feeding blocked for ${pet} at ${scheduleTime} due to dangerous heat (THI).`);
      return;
    }

    // Bowl check - if bowl has enough or more, skip feeding
    if (bowlWeight >= adjusted) {
      console.log(`${pet.toUpperCase()} bowl already has ${bowlWeight}g. Automatic feeding skipped for ${scheduleTime}.`);
      return;
    }

    const finalAmount = adjusted;

    try {
      console.log(`🔄 Automatic feeding: ${pet} ${finalAmount}g at ${scheduleTime}`);
      await set(ref(rtdb, `dispenser/${pet}/amount`), Number(finalAmount));
      await set(ref(rtdb, `dispenser/${pet}/run`), true);
      
      // Log the automatic feeding
      console.log(`✅ Automatic feeding triggered: ${pet} ${finalAmount}g at ${scheduleTime}`);
    } catch (error) {
      console.error(`❌ Automatic feeding failed for ${pet} at ${scheduleTime}:`, error);
    }
  }, [getAdaptedAmount, catBowl, dogBowl, tempAdapt]);

  const checkSchedules = useCallback(() => {
    if (!settings || !settings.autoFeedEnabled || !currentTime) return;

    const now = new Date();
    const today = now.toDateString();

    // Check cat schedule
    settings.cat?.schedule?.forEach(schedule => {
      const scheduleKey = `cat_${schedule.time}_${today}`;
      
      // Check if current time matches schedule time
      if (schedule.time === currentTime) {
        // Check if we've already processed this feeding today
        if (!lastChecked[scheduleKey]) {
          triggerAutomaticFeed('cat', schedule.amount, schedule.time);
          setLastChecked(prev => ({
            ...prev,
            [scheduleKey]: true
          }));
        }
      }
    });

    // Check dog schedule
    settings.dog?.schedule?.forEach(schedule => {
      const scheduleKey = `dog_${schedule.time}_${today}`;
      
      // Check if current time matches schedule time
      if (schedule.time === currentTime) {
        // Check if we've already processed this feeding today
        if (!lastChecked[scheduleKey]) {
          triggerAutomaticFeed('dog', schedule.amount, schedule.time);
          setLastChecked(prev => ({
            ...prev,
            [scheduleKey]: true
          }));
        }
      }
    });
  }, [settings, currentTime, lastChecked, triggerAutomaticFeed]);

  // ---------------------------------------------------
  // FIREBASE SUBSCRIPTIONS
  // ---------------------------------------------------
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Subscribe to Firestore settings
    const settingsRef = doc(db, "feederSettings", user.uid);
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    // Subscribe to Realtime Database for environment data
    const unsubTH = onValue(ref(rtdb, "temperature"), snap => {
      const data = snap.val();
      if (data) {
        setTemperature(data.temperature ?? null);
        setHumidity(data.humidity ?? null);
      }
    });

    const unsubAdapt = onValue(ref(rtdb, "settings/tempAdapt"), snap =>
      setTempAdapt(Boolean(snap.val()))
    );

    const unsubCatBowl = onValue(
      ref(rtdb, "petfeeder/cat/bowlWeight/weight"),
      snap => setCatBowl(Number(snap.val() || 0))
    );

    const unsubDogBowl = onValue(
      ref(rtdb, "petfeeder/dog/bowlWeight/weight"),
      snap => setDogBowl(Number(snap.val() || 0))
    );

    return () => {
      unsubscribeSettings();
      unsubTH();
      unsubAdapt();
      unsubCatBowl();
      unsubDogBowl();
    };
  }, []);

  // ---------------------------------------------------
  // SCHEDULE CHECKING - NOW EVERY SECOND
  // ---------------------------------------------------
  useEffect(() => {
    // Check schedules every second to catch exact times
    const interval = setInterval(checkSchedules, 1000);
    
    return () => clearInterval(interval);
  }, [checkSchedules]);

  // Clear lastChecked at midnight to allow new day's feedings
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight - now;

    const midnightTimeout = setTimeout(() => {
      setLastChecked({});
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  // This component doesn't render anything
  return null;
};

export default AutomaticFeederService;