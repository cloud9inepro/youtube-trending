const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const PORT = 3000;
const API_KEY = process.env.YOUTUBE_API_KEY || "YOUR_API_KEY_HERE";

const CATEGORY_MAP = {
  "0": "All Categories",
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "20": "Gaming",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
};

const REGION_MAP = {
  US: "United States",
  NG: "Nigeria",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  BR: "Brazil",
  MX: "Mexico",
  ZA: "South Africa",
  GH: "Ghana",
  KE: "Kenya",
  EG: "Egypt",
  KR: "South Korea",
  ID: "Indonesia",
  PH: "Philippines",
  PK: "Pakistan",
  TR: "Turkey",
};

function fetchYouTubeTrending(regionCode, categoryId, maxResults) {
  return new Promise((resolve, reject) => {
    let apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=${maxResults}&key=${API_KEY}&regionCode=${regionCode}`;
    if (categoryId && categoryId !== "0") {
      apiUrl += `&videoCategoryId=${categoryId}`;
    }

    https
      .get(apiUrl, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Failed to parse YouTube response"));
          }
        });
      })
      .on("error", reject);
  });
}

function formatNumber(num) {
  if (!num) return "N/A";
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve the frontend
  if (pathname === "/" || pathname === "/index.html") {
    const filePath = path.join(__dirname, "public", "index.html");
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading frontend");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
    return;
  }

  // API: Get trending videos
  if (pathname === "/api/trending") {
    const regionCode = parsedUrl.query.region || "US";
    const categoryId = parsedUrl.query.category || "0";
    const maxResults = Math.min(parseInt(parsedUrl.query.limit) || 20, 50);

    try {
      const data = await fetchYouTubeTrending(regionCode, categoryId, maxResults);

      if (data.error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: data.error.message }));
        return;
      }

      const videos = (data.items || []).map((item) => ({
        id: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        views: formatNumber(item.statistics?.viewCount),
        likes: formatNumber(item.statistics?.likeCount),
        viewsRaw: parseInt(item.statistics?.viewCount) || 0,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description?.slice(0, 150) + "...",
      }));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          videos,
          region: REGION_MAP[regionCode] || regionCode,
          category: CATEGORY_MAP[categoryId] || "All Categories",
          total: videos.length,
        })
      );
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Get regions and categories
  if (pathname === "/api/meta") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ regions: REGION_MAP, categories: CATEGORY_MAP }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n🚀 YouTube Trending Server running at http://localhost:${PORT}`);
  console.log(`\n📌 Make sure to set your API key:`);
  console.log(`   export YOUTUBE_API_KEY=your_key_here`);
  console.log(`   node server.js\n`);
});
