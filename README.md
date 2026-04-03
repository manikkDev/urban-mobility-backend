# Urban Mobility Backend

Backend server for the Inclusive Urban Mobility Intelligence Platform.

## Tech Stack

- Node.js + Express
- Firebase Admin SDK for Firestore
- Rule-based issue classification
- Accessibility scoring engine

## Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Firebase Admin SDK service account credentials

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```
FIREBASE_PROJECT_ID=urban-mobility-5a13e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@urban-mobility-5a13e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=5000
```

**Important:** Make sure to replace `\n` in the private key with actual newlines, or keep it as a single line with `\\n` escape sequences.

### 3. Seed the Database

Before starting the server, seed Firestore with initial data:

```bash
npm run seed
```

This will populate:
- 10 stations with varying accessibility scores
- 4 routes connecting the stations
- Sample feedback records

### 4. Start the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Stations

- `GET /api/stations` - Get all stations (supports query params: search, riskLevel, routeId)
- `GET /api/stations/:id` - Get station details with recent feedback and analytics

### Routes

- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route details with station summaries

### Feedback

- `POST /api/feedback` - Submit new feedback

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Firebase configuration
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (classification, scoring)
│   ├── middleware/      # Validation and error handling
│   ├── utils/           # Helper functions and response formats
│   ├── data/            # Seed data
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── package.json
└── .env
```

## Scoring Logic

Stations are scored based on:

**Base Score (0-100):**
- Ramps: +15
- Elevators: +20
- Seating: +10
- Tactile Paths: +10
- Accessible Toilet: +10
- Staff Assistance: +10
- Clear Signage: +10
- Safe Boarding Support: +15

**Penalties from Open Issues:**
- Infrastructure: severity × 2.5
- Safety: severity × 3.0
- Crowding: severity × 2.0
- Reliability: severity × 1.5
- Information Gap: severity × 1.0

**Risk Levels:**
- Low: 80-100
- Medium: 50-79
- High: 0-49

## Issue Classification

Rule-based classifier identifies issue types from descriptions:
- Keywords in description → Issue type → Category
- If no type provided, automatically inferred
- All issues mapped to defined taxonomy
