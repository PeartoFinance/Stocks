# 🚀 Stocks App - Backend Integration Update

This document outlines the architectural updates made to align the **Next.js Frontend** with the **Flask Backend** API standards.

---

## 🛠 Changes Made

### 1. API Endpoints Alignment
Endpoints have been restructured to follow the Flask blueprint namespacing.

| Feature | Old Client Path | New Backend Route |
| :--- | :--- | :--- |
| **Active Stocks** | `/api/market/stocks` | `/api/stocks/most-active` |
| **Market Movers** | `/api/market/movers` | `/api/stocks/movers` |
| **Search** | `/api/market/search` | `/api/stocks/search` |
| **Stock Profile** | `/api/market/quote/{symbol}` | `/api/stocks/profile/{symbol}` |
| **Crypto Data** | `/api/market/crypto` | `/api/crypto/quotes` |
| **Geo Detection** | `/api/geo` | `/api/geo/detect` |

### 2. Response Format & Data Mapping
* **Direct Access:** The frontend now consumes data directly from the response body (Backend no longer wraps everything in a `{ data: ... }` object unless necessary).
* **Naming Convention:** Logic has been updated to handle `snake_case` from the Python backend (e.g., `avatar_url`, `change_percent`).

### 3. Authentication & Session Management

* **Context Provider:** Implemented `AuthContext.tsx` to manage global user state.
* **Persistence:** User sessions are persisted via `localStorage` and validated on mount.
* **Interceptors:** API utilities now automatically inject identifying headers for session tracking.

### 4. News & Market Intelligence
**New File:** `app/utils/newsAPI.ts` handles:
* Market-wide news and trending topics.
* Symbol-specific news feeds.
* Economic and Earnings calendars.

---

## 🔐 API Header Standards
To satisfy CORS and localization requirements, all requests sent via `AuthContext` or API utils include:

| Header | Purpose |
| :--- | :--- |
| `Content-Type` | `application/json` |
| `X-User-Email` | Used by Flask to identify user sessions without heavy DB lookups. |
| `X-User-Country` | Provides localized stock market data (Defaults to `NP`). |
| `Authorization` | Bearer token for protected portfolio/watchlist routes. |

---

## ⚙️ Environment Setup

1. **Local Config:**
   ```bash
   cp .env.example .env.local