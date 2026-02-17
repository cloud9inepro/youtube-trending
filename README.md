# TrendPulse — YouTube Trending Explorer

A full stack app to browse YouTube's trending videos filtered by **region** and **category**.

## Stack
- **Backend**: Node.js (no dependencies, uses built-in `http` and `https`)
- **Frontend**: Vanilla HTML/CSS/JS (served by the backend)
- **API**: YouTube Data API v3

## Setup

### 1. Get a YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Go to **Credentials** → Create **API Key**
4. (Optional) Restrict it to YouTube Data API v3

### 2. Run the Server

```bash
# Set your API key
export YOUTUBE_API_KEY=your_api_key_here

# Start the server
node server.js
```

Then open **http://localhost:3000** in your browser.

### Windows (PowerShell)
```powershell
$env:YOUTUBE_API_KEY="your_api_key_here"
node server.js
```

## Features
- 🌍 Filter by **20 regions** (US, Nigeria, UK, India, etc.)
- 🎬 Filter by **15 categories** (Music, Gaming, Sports, etc.)
- 📊 Show **10, 20, 30, or 50** results
- 🖼️ Displays: thumbnail, title, channel, views, likes, and YouTube link
- 🔴 Ranked #1–50

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Frontend UI |
| `GET /api/trending?region=US&category=10&limit=20` | Trending videos |
| `GET /api/meta` | Available regions & categories |

### Query Parameters for `/api/trending`
| Param | Default | Options |
|---|---|---|
| `region` | `US` | Any ISO 3166-1 country code |
| `category` | `0` (all) | See category IDs below |
| `limit` | `20` | 1–50 |

### Category IDs
| ID | Category |
|---|---|
| 0 | All Categories |
| 10 | Music |
| 17 | Sports |
| 20 | Gaming |
| 24 | Entertainment |
| 25 | News & Politics |
| 28 | Science & Technology |
| ... | (see server.js for full list) |

## Notes
- YouTube's trending API only reflects **current** trends (no historical data)
- The free API quota is **10,000 units/day** — each request costs 1 unit
- Some region/category combinations may return no results (YouTube limitation)
