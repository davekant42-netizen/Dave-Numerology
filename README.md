# DAVE Numerology

DAVE Numerology is a premium, full-stack web application designed for high-precision 120-year Dasha numerological calculations. It analyzes an individual's birth date to construct a detailed Vedic Grid and compute an exhaustive, multi-level timeline of life periods (Mahadashas, Antardashas, Pratyantar Dashas, and Daily Dashas).

---

## ✨ Features & Visual Innovations

### 1. Advanced Vedic Grid Visualizer
- **Split-Diagonal Styling**: Custom CSS diagonal-split cells that cleanly partition numbers in half when multiple active Dasha periods overlap or touch the same digit.
- **Dynamic Indicators**:
  - Highlights the **Root Number** (e.g., `3R`) and **Destiny Number`** (e.g., `4D`) natively inside the grid cells.
  - Features high-contrast, black-font overlays on active cells with zero opacity loss to ensure pristine text readability against light or dark background tokens.
- **Micro-Animations**: Hover-triggered translations, shadow effects, and dynamic border scaling for responsive cell interaction.

### 2. Active Dasha Showcase Panel
- **CSS Grid-Aligned Two-Column Layout**: Guarantees zero overlap or label-touching (specifically fixing the long `Pratyantar Dasha (PD)` text). Provides a generous, typographically aligned baseline layout.
- **Dynamic Birth Numbers List**: Displays all active, unique Birth Numbers (BN) present in the date of birth along with their ruling planets (e.g., `3, 8 - Jupiter, Saturn`) highlighted in signature orange.
- **Color-Coded Period Alignments**:
  - 🧡 **BN (Birth Numbers)**: Bright Orange (`rgb(249, 115, 22)`)
  - 🔴 **MD (Maha Dasha)**: Crimson Red (`hsl(var(--md-color))`)
  - 🟣 **AD (Antar Dasha)**: Indigo Purple (`hsl(var(--ad-color))`)
  - 🟢 **PD (Pratyantar Dasha)**: Vibrant Emerald Green (`hsl(var(--pd-color))`)
  - 🟡 **DD (Daily Dasha)**: Premium Lime Yellow (`hsl(var(--dd-color))`)

### 3. Compact Dasha Charts Section
- **High-Density Card layout**: Cards are dynamically packed into space-saving grids supporting up to 6 columns (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3`).
- **3x3 Mini Vedic Grids**: Fits perfectly inside compact, neat yearly/monthly/daily dashboards with minimal card padding (`p-3`) for state-of-the-art information density.
- **Abbreviated Legends**: Modern, unified `BN`, `MD`, `AD`, `PD`, `DD` dasha chart legends.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 19 with TypeScript
- **Build Tool**: Vite & Tailwind CSS
- **Styling & UI**: Custom Vanilla CSS Utilities, Shadcn UI Tokens, Radix Primitives

### Backend
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose)
- **Sessions & Security**: JWT Authentication and Secure Session Contexts

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed. If you're setting up the backend, you'll also need access to a MongoDB instance.

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

---

## 📐 Core Algorithms & Logic Highlights

The core calculations are implemented in pure, optimized TypeScript (`frontend/src/lib/numerology.ts`), capable of calculating over 100,000 dates in milliseconds:

- `calculateMahadashas`: Cycles through standard 45-year repeating sequence algorithms.
- `calculateAntardashas`: Employs modulo operations matching precise Vedic formulas.
- `calculatePratyantars`: Incorporates bonus-day calculations spanning non-leap and leap years for rigorous tracking.
- `buildDailyDasha`: Drills down to the specific day and accounts for varying lengths of Pratyantar phases.

---

## 📄 License
This project is licensed under the ISC License.
