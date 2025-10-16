// ------------------------------
// Firebase Imports (CDN modular)
// ------------------------------
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  GeoPoint
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ------------------------------
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZegGPZx6MvrNvRQsFCvx2qkJ62oIkULM",
  authDomain: "mohit-45547.firebaseapp.com",
  projectId: "mohit-45547",
  storageBucket: "mohit-45547.firebasestorage.app",
  messagingSenderId: "778528943574",
  appId: "1:778528943574:web:ccd84ce0fad485619b0877",
  measurementId: "G-ES0PK3WFT3"
};


// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------------------
// Helper: Show messages
// ------------------------------
function showMessage(msg, isError = true) {
  const msgEl = document.getElementById("message");
  if (!msgEl) return alert(msg);
  msgEl.textContent = msg;
  msgEl.style.color = isError ? "#ff4d4d" : "#FFD700";
}
async function sendTokenToBackend(idToken) {
  try {
    await fetch("/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    console.log("✅ Token sent/refreshed on backend");
  } catch (err) {
    console.error("Error sending token:", err);
  }
}

// Listen for login and token refresh
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Send immediately on login
    const token = await user.getIdToken(true);
    await sendTokenToBackend(token);

    // Refresh every 50 minutes (tokens expire in ~60)
    setInterval(async () => {
      const refreshed = await user.getIdToken(true);
      await sendTokenToBackend(refreshed);
      console.log("🔄 Refreshed ID token");
    }, 50 * 60 * 1000);
  }
});
// ------------------------------
// Login
// ------------------------------
document.getElementById("login-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return showMessage("Enter email & password!");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/home";
  } catch (err) {
    showMessage("Login error: " + err.message);
  }
});

// ------------------------------
// Signup
// ------------------------------
document.getElementById("signup-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return showMessage("Enter email & password!");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "/home";
  } catch (err) {
    showMessage("Signup error: " + err.message);
  }
});

// ------------------------------
// Logout
// ------------------------------
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/";
  } catch (err) {
    showMessage("Logout error: " + err.message);
  }
});

// ------------------------------
// Forgot Password
// ------------------------------
document.getElementById("forgot-link")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Enter your registered email:");
  if (!email) return showMessage("Email is required!");

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Password reset email sent!", false);
  } catch (err) {
    showMessage("Error: " + err.message);
  }
});

// ------------------------------
// Driver Location Tracking (optional)
// ------------------------------
const toggleBtn = document.getElementById("toggle-location");
if (toggleBtn) {
  let watchId = null;
  toggleBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    if (!watchId) {
      watchId = navigator.geolocation.watchPosition(async (pos) => {
        const user = auth.currentUser;
        if (!user) return;
        const driverRef = doc(db, "drivers", user.uid);
        await setDoc(driverRef, {
          location: new GeoPoint(pos.coords.latitude, pos.coords.longitude),
          online: true,
          updatedAt: new Date()
        }, { merge: true });
      }, (err) => console.error(err), { enableHighAccuracy: true });
      toggleBtn.textContent = "Stop Tracking";
    } else {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      toggleBtn.textContent = "Start Tracking";
    }
  });
  
}
