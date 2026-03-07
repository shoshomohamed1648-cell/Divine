import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// --- Loader ---
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMjF5H8iu1cGwJdxXH8R4gN0o14bLgbDg",
  authDomain: "divinesiwa-c3234.firebaseapp.com",
  projectId: "divinesiwa-c3234",
  storageBucket: "divinesiwa-c3234.firebasestorage.app",
  messagingSenderId: "856060334276",
  appId: "1:856060334276:web:52a0a536814b2b1fa8f991",
  measurementId: "G-HTBC7F23LK"
};

// Initialize Firebase
let db;
let analytics;

try {
  const app = initializeApp(firebaseConfig);
  // Connect to the specific database 'da48' created by the user
  db = getFirestore(app, "da48");
  analytics = getAnalytics(app);
  console.log("Firebase initialized successfully with database: da48");
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading')
    document.body.classList.add('loaded')
  }, 800)
})

// --- Single Screen Navigation ---
const navLinks = document.querySelectorAll('[data-target]')
const sections = document.querySelectorAll('.app-section')
const mobileBtn = document.querySelector('.mobile-menu-btn')
const closeMenuBtn = document.querySelector('.close-menu')
const header = document.querySelector('.header')

// Navigation Handler
function navigateTo(targetId) {
  // Update Active Section
  sections.forEach(sec => {
    sec.classList.remove('active')
    if (sec.id === targetId) {
      sec.classList.add('active')
    }
  })

  // Update Active Link State
  navLinks.forEach(link => {
    link.classList.remove('active')
    if (link.getAttribute('data-target') === targetId) {
      link.classList.add('active')
    }
  })

  // Close mobile menu if open
  header.classList.remove('mobile-open')
}

// Click Listeners
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const targetId = link.getAttribute('data-target')
    if (targetId) navigateTo(targetId)
  })
})

// Mobile Menu Toggle
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    header.classList.add('mobile-open')
  })
}

if (closeMenuBtn) {
  closeMenuBtn.addEventListener('click', () => {
    header.classList.remove('mobile-open')
  })
}

// --- Intersection Observer for Active State ---
const observerOptions = {
  root: document.querySelector('.app-container'),
  threshold: 0.5
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Update Active Class on Section
      document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'))
      entry.target.classList.add('active')
      
      // Update Navigation
      const id = entry.target.id
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-target') === id)
      })
    }
  })
}, observerOptions)

sections.forEach(section => observer.observe(section))

// --- Activities Slider ---
const slides = document.querySelectorAll('.activity-slide')
const nextSlideBtn = document.querySelector('.next-slide')
const prevSlideBtn = document.querySelector('.prev-slide')
const indicators = document.querySelectorAll('.slide-indicators span')
let currentSlide = 0

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index)
  })
  indicators.forEach((dot, i) => {
    dot.classList.toggle('active', i === index)
  })
  currentSlide = index
}

if (nextSlideBtn && prevSlideBtn) {
  nextSlideBtn.addEventListener('click', () => {
    let next = (currentSlide + 1) % slides.length
    showSlide(next)
  })

  prevSlideBtn.addEventListener('click', () => {
    let prev = (currentSlide - 1 + slides.length) % slides.length
    showSlide(prev)
  })
}

// --- Scarcity Countdown ---
const releaseEl = document.getElementById('release-countdown')
if (releaseEl) {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diff = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24))
  releaseEl.textContent = `${diff} Days`
}

// --- Booking Form ---
const form = document.getElementById('booking-form')
const statusEl = document.getElementById('form-status')

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const btn = form.querySelector('button')
    const originalText = btn.textContent
    btn.textContent = 'Transmitting...'
    btn.disabled = true
    
    // Convert FormData to object
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
    
    // Check if Firebase is ready
    if (db) {
      console.log("Attempting to send request to Firebase...");
      
      // Create a timeout promise
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out. Check your network or Firestore rules.")), 10000)
      );

      // Race between addDoc and timeout
      Promise.race([
        addDoc(collection(db, "booking_requests"), {
          ...data,
          createdAt: serverTimestamp(),
          status: 'pending' // Initial status for dashboard
        }),
        timeout
      ])
      .then(() => {
        console.log("Request successful!");
        statusEl.textContent = 'Request Received. The sanctuary awaits.'
        statusEl.className = 'form-status success'
        
        btn.textContent = 'Sent'
        form.reset()
        setTimeout(() => {
          btn.textContent = originalText
          btn.disabled = false
        }, 3000)
      })
      .catch((error) => {
        console.error('Firebase Error Detail:', error);
        
        let errorMsg = 'Transmission failed. ';
        if (error.code === 'permission-denied') {
          errorMsg += 'Database permission denied. Check Firestore Rules.';
        } else if (error.message.includes("timed out")) {
          errorMsg += 'Request timed out. Check if Firestore is created.';
        } else {
          errorMsg += 'Please check connection.';
        }
        
        statusEl.textContent = errorMsg;
        statusEl.className = 'form-status error'
        btn.textContent = originalText
        btn.disabled = false
      })
    } else {
      console.warn("Firebase not initialized.")
      statusEl.textContent = 'Connection Error. Please reload.'
      statusEl.className = 'form-status error'
      btn.textContent = originalText
      btn.disabled = false
    }
  })
}
