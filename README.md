# Stock Analysis Pro

Next.js 14 stock analysis and trading platform.

---

## 🏗️ Architecture

```
app/
├── page.tsx             # Homepage - Stock screener
├── layout.tsx           # Root layout with providers
├── api/                 # API routes (if any)
├── stock/[symbol]/      # Dynamic stock detail pages
├── stocks/              # Stock listings
│   ├── gainers/         # Top gaining stocks
│   ├── losers/          # Top losing stocks
│   ├── sectors/         # Sector analysis
│   └── most-active/     # Most active stocks
├── etfs/                # ETF listings and details
├── ipos/                # IPO calendar and details
├── movers/              # Market movers
├── screener/            # Advanced stock screener
├── chart/               # Chart analysis page
├── news/                # Market news
├── trending/            # Trending stocks
├── watchlist/           # User watchlists
├── dashboard/           # User dashboard
├── profile/             # User profile pages
├── login/               # Login page
├── signup/              # Registration page
├── forgot-password/     # Password reset
├── newsletter/          # Newsletter subscription
├── pro/                 # Pro subscription features
├── articles/            # Educational articles
├── components/          # Shared components
├── context/             # React context providers
├── hooks/               # Custom hooks
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🔑 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5175

# Optional APIs
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=
NEXT_PUBLIC_FMP_KEY=
```

---

## 📄 Pages

### Stock Pages

| Route | Description |
|-------|-------------|
| `/` | Main stock screener with market overview |
| `/stock/[symbol]` | Individual stock analysis page |
| `/stocks/gainers` | Top gaining stocks |
| `/stocks/losers` | Top losing stocks |
| `/stocks/sectors` | Sector performance breakdown |
| `/stocks/most-active` | Most actively traded stocks |

### ETF Pages

| Route | Description |
|-------|-------------|
| `/etfs` | ETF listings |
| `/etfs/[symbol]` | Individual ETF details |
| `/etfs/gainers` | Top gaining ETFs |
| `/etfs/losers` | Top losing ETFs |
| `/etfs/categories` | ETF categories |

### IPO Pages

| Route | Description |
|-------|-------------|
| `/ipos` | IPO calendar |
| `/ipos/[symbol]` | IPO details |
| `/ipos/upcoming` | Upcoming IPOs |

### Analysis Pages

| Route | Description |
|-------|-------------|
| `/screener` | Advanced stock screener |
| `/chart` | TradingView-style charts |
| `/movers` | Market movers overview |
| `/trending` | Trending stocks analysis |

### User Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | User dashboard |
| `/watchlist` | Saved watchlists |
| `/profile` | User profile settings |
| `/profile/portfolio` | Portfolio management |
| `/profile/alerts` | Price alerts |
| `/pro` | Pro subscription features |

### Content Pages

| Route | Description |
|-------|-------------|
| `/news` | Market news feed |
| `/articles` | Educational articles |
| `/newsletter` | Newsletter subscription |

---

## 🧩 Key Components

| Component | Description |
|-----------|-------------|
| `StockCard` | Stock price display card |
| `StockTable` | Sortable stock data table |
| `PriceChart` | Interactive price chart |
| `Screener` | Stock screening filters |
| `WatchlistCard` | Watchlist item display |
| `MarketOverview` | Market indices summary |
| `SectorHeatmap` | Sector performance heatmap |
| `News Feed` | Real-time news ticker |

---

## 📡 Data Fetching

Uses **SWR** for data fetching with:
- Automatic revalidation
- Focus revalidation
- Error retry
- Deduplication

Example:
```typescript
const { data, error, isLoading } = useSWR(
  `/api/stocks/quote/${symbol}`,
  fetcher
);
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | React framework |
| `react` 18 | UI library |
| `tailwindcss` | Styling |
| `swr` | Data fetching |
| `recharts` | Chart library |
| `axios` | HTTP client |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `react-hook-form` | Forms |
| `zod` | Validation |

---

## 🎨 Styling

- **TailwindCSS** with custom configuration
- **Dark mode** support
- **Responsive** design for all screen sizes
- **@tailwindcss/forms** for form styling

---

## 🔧 Development

```bash
# Run linting
npm run lint

# Type checking
npm run type-check
```
