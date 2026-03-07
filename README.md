# Divine Siwa Website

A modern, responsive website for Divine Siwa with Firebase integration for form submissions and contact management.

## Features

- ✅ **Responsive Design** - Works perfectly on mobile and desktop
- ✅ **Firebase Firestore** - Contact form submissions saved to database
- ✅ **Image Gallery** - High-quality images with smooth transitions
- ✅ **Modern UI** - Clean, professional design
- ✅ **Contact Form** - Functional form with validation

## Firebase Setup

This project uses Firebase for:
- **Firestore Database** - Storing contact form submissions
- **Hosting** - Production deployment

## Deployment

Automatically deployed via GitHub Actions to Firebase Hosting on every push to `main` branch.

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript with Firebase integration
├── assets/             # Image assets
├── .github/workflows/  # GitHub Actions configuration
├── firebase.json       # Firebase Hosting config
└── .firebaserc         # Firebase project config
```