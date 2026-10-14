# Som Chatterjee — Official Musician & Performer Portfolio

Official responsive portfolio website, backend REST API, and concert tour management system for **Som Chatterjee**, acclaimed singer from West Bengal and *Zee Bangla Sa Re Ga Ma Pa* performer.

## 🌟 Key Features

- **Centralized Full-Stack Backend**:
  - Express.js REST API with persistent file-based JSON database (`data/db.json`).
  - Bi-directional sync: all changes made in the Admin Portal (tours, photos, credentials) update the public website in real-time across all devices.
  - Public booking enquiries and newsletter subscriptions submitted on the site are saved to the backend database and instantly viewable in the admin dashboard.
- **Dynamic Hero Section**: High-voltage live stage background with glittering live star canvas, flowing particles, and artist biography.
- **Tour Dates & Live Schedule**: Synced tour management displaying upcoming concerts, festival headline shows, and ticket/enquiry actions.
- **Official Music Player**: Integrated HTML5 audio player featuring **“Ei Shohor Akkhep”** with custom play/pause controls, dynamic duration, interactive scrubbing, and animated equalizer bars.
- **Sliding Stage Gallery**: Interactive touch and mouse draggable photo slider with autoplay toggle and high-resolution fullscreen lightbox modal.
- **Admin Management Portal (`/admin.html`)**:
  - Secure credential authentication (`Som@chatterjee`).
  - Tour schedule manager (add, edit, toggle active, reorder, and duplicate tour stops).
  - Booking enquiries manager with status tracking (`new`, `contacted`, `confirmed`, `archived`) and quick WhatsApp/Email contact actions.
  - Public gallery photo management with automatic client-side compression and a 5-photo capacity safeguard.
  - Admin credentials manager (change username and password).
- **Contact & Booking**: Interactive booking enquiry form with direct WhatsApp booking and Google Maps studio location integration.

## 🚀 Tech Stack

- **Backend**: Node.js, Express 5, CORS, File-based JSON Database Engine
- **Frontend**: HTML5, Vanilla CSS3 (Times New Roman typography, rich glowing dark theme), Modern JavaScript (ES6+ Modules)
- **Tooling & Bundler**: Vite 6 (Dual-mode: dev middleware + production builder)

## 📡 Backend REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/sync` | Full state sync for tours, gallery, enquiries, subscribers, admin |
| `GET` | `/api/tours` | Get all tour dates |
| `POST` | `/api/tours` | Batch update/save tour dates |
| `POST` | `/api/tours/reset` | Reset tour dates to defaults |
| `GET` | `/api/gallery` | Get all stage gallery photos (up to 5) |
| `POST` | `/api/gallery` | Upload/add new stage photo or batch save |
| `PUT` | `/api/gallery/:id` | Update photo metadata (caption, tag, featured) |
| `DELETE` | `/api/gallery/:id` | Delete photo from gallery |
| `POST` | `/api/gallery/reset` | Reset gallery to default photos |
| `GET` | `/api/enquiries` | Get all booking enquiries |
| `POST` | `/api/enquiries` | Submit new booking enquiry (from public site) |
| `PATCH` | `/api/enquiries/:id` | Update enquiry status (`contacted`, `confirmed`, etc.) |
| `DELETE` | `/api/enquiries/:id` | Delete enquiry |
| `GET` | `/api/subscribers` | Get newsletter subscribers |
| `POST` | `/api/subscribers` | Subscribe email to newsletter |
| `DELETE` | `/api/subscribers/:id`| Remove subscriber |
| `POST` | `/api/auth/login` | Authenticate admin credentials |
| `GET` | `/api/auth/credentials` | Get current admin username |
| `POST` | `/api/auth/credentials` | Update admin username & password |

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation

```bash
# Clone the repository
git clone https://github.com/Chandrima2507/SOM_CHATTERJEE.git

# Navigate to project directory
cd SOM_CHATTERJEE

# Install dependencies
npm install
```

### Running in Development (Frontend + Backend API)

```bash
npm run dev
```
Starts the Vite development server with the integrated backend API middleware on `http://localhost:5173`. Any changes to the database or admin portal sync live.

### Running in Production (Express Server)

```bash
# 1. Build optimized frontend bundle
npm run build

# 2. Start full-stack Node/Express server
npm start
```
Starts the production server on `http://localhost:5000` (or `process.env.PORT`).

- **Public Website**: `http://localhost:5000/`
- **Admin Portal**: `http://localhost:5000/admin`
- **API Endpoints**: `http://localhost:5000/api/health`

## 🔐 Admin Portal Credentials

- **URL**: `/admin.html` (or `/admin` on production server)
- **Default Username**: `Som@chatterjee`
- **Default Password**: `Dino@2020`

## 📍 Studio & Office Location

- **Address**: Shop-4, Post Office Rd, Tarkeshwar, West Bengal 712410
- **Direct Phone**: +91 94338 19326
- **Booking Email**: somchatterjee001@gmail.com

---
© Som Chatterjee. All rights reserved.
