# DAVE Numerology

DAVE Numerology is a full-stack web application designed for high-precision 120-year Dasha numerological calculations. It analyzes an individual's birth date to construct a detailed Vedic Grid and compute an exhaustive, multi-level timeline of life periods (Mahadashas, Antardashas, Pratyantar Dashas, and Daily Dashas).

## Features

- **Core Numerology Calculation**: Calculates Root Number, Destiny Number, and Weekday Value with high precision.
- **Vedic Grid**: Generates a classic 3x3 Vedic Grid mapping the user's birth date digits, actively highlighting numbers corresponding to the currently active Dasha periods.
- **120-Year Timeline Generation**:
  - **Mahadasha**: 45-year repeating life cycles.
  - **Antardasha**: Yearly sub-periods based on intricate modulus calculations.
  - **Pratyantar Dasha**: Detailed sub-sub-periods considering exact days in a given year (automatically adjusting for leap years).
  - **Daily Dasha**: Day-to-day numerological guidance.
- **Real-Time Status**: Instantly shows the active Mahadasha, Antardasha, Pratyantar, and Daily Dasha for the current date.
- **Interactive Dasha Table**: An expandable timeline UI that allows users to drill down from 120-year lifespans to the specific Dasha for any given day.

## Tech Stack

### Frontend
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Routing**: React Router DOM

### Backend
- **Environment**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT / Context-based User Sessions

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
If you're setting up the backend, you'll also need access to a MongoDB instance.

### Installation

1. **Clone or Download the Repository**
2. **Install Root Dependencies**
   Navigate to the project root and install `concurrently` (used for running both servers at once):
   ```bash
   npm install
   ```
3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
4. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Project Locally

You can launch both the frontend and backend servers simultaneously from the root directory using the custom script:

```bash
npm run dev
```

Alternatively, you can run them in separate terminals:
- **Frontend**: `cd frontend && npm run dev`
- **Backend**: `cd backend && npm run dev`

By default, the frontend will be available at `http://localhost:5173`.

## Architecture & Logic Highlights

The core numerology logic is implemented natively in TypeScript (`frontend/src/lib/numerology.ts`) ensuring blazingly fast calculation of over 100,000 dates within milliseconds. 

- `calculateMahadashas`: Leverages standard cyclic sequence algorithms.
- `calculateAntardashas`: Employs modulo-based operations matching specific numerological formulas.
- `calculatePratyantars`: Incorporates bonus-day logic spanning non-leap and leap years for rigorous tracking.
- `buildDailyDasha`: Drills down to the specific day and accounts for varying lengths of Pratyantar phases.

## License

This project is licensed under the ISC License.
