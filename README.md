# Pastebin‑Lite

A minimal Pastebin‑like web application built with **Node.js** and **Neon (PostgreSQL)**.  
Users can create text pastes, receive shareable links, and optionally set a time‑to‑live (TTL) or a view‑count limit.  
Designed to be deployed on serverless platforms like Vercel.

---

## Features

- ✅ Create a paste with arbitrary text (1 MB max).
- ✅ Receive a short, shareable URL (e.g., `/p/abc123`).
- ✅ View paste via **JSON API** or **HTML page**.
- ✅ Optional **TTL** (seconds) – paste expires after `created_at + ttl_seconds`.
- ✅ Optional **max views** – paste becomes unavailable after `N` fetches.
- ✅ Both constraints can be combined – expires when **either** triggers.
- ✅ **Deterministic expiry** via `TEST_MODE` and `x‑test‑now‑ms` header – essential for automated testing.
- ✅ Atomic view counting with PostgreSQL row‑locking – safe under concurrent requests.
- ✅ All API responses are JSON with proper status codes.
- ✅ HTML content is escaped to prevent XSS.

---

## Tech Stack

- **Runtime**: Node.js (Express)
- **Database**: Neon (serverless PostgreSQL) – persists across serverless invocations
- **Driver**: `@neondatabase/serverless` (optimised for serverless)
- **ID Generation**: `nanoid` (URL‑friendly, collision‑resistant)

---

## Prerequisites

- Node.js (v18 or higher)
- A PostgreSQL database (Neon recommended, but local is fine)
- Git (for cloning)

---

## Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/rupesh6314/Pastebin-App.git
cd Pastebin-App
2. Install Dependencies
bash
npm install
3. Set Up Environment Variables
Create a .env file in the project root with the following content:

env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
PORT=3000
BASE_URL=http://localhost:3000
If you are using Neon, your DATABASE_URL looks like this:

text
postgresql://neondb_owner:...@ep-....aws.neon.tech/neondb?sslmode=require
Important: Never commit .env to version control. It is already ignored via .gitignore.

4. Database Schema
The application automatically creates the required table on first start.
No manual migrations are needed.

5. Run the Application
bash
npm start
For development with auto‑restart:

bash
npm run dev
Your app will be available at http://localhost:3000.

API Endpoints
Health Check
GET /api/healthz → 200 { "ok": true }

Create a Paste
POST /api/pastes

Request body (JSON):

json
{
  "content": "string",      // required, non‑empty, max 1 MB
  "ttl_seconds": 60,        // optional, integer ≥ 1
  "max_views": 5            // optional, integer ≥ 1
}
Response (201):

json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
Fetch Paste (API)
GET /api/pastes/:id

Success (200):

json
{
  "content": "Hello, world!",
  "remaining_views": 4,     // null if unlimited
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no TTL
}
Unavailable (404):

json
{ "error": "Paste not found or expired" }
View Paste (HTML)
GET /p/:id → Returns an HTML page with the paste content.
If the paste is unavailable, returns HTTP 404.

Persistence Layer
I chose Neon (serverless PostgreSQL) for the following reasons:

Persistence – It survives Vercel/function invocations; in‑memory storage would not.

ACID transactions – Used to atomically increment view counts while checking expiry conditions.

Row‑level locking (SELECT ... FOR UPDATE) prevents race conditions under concurrent loads.

Serverless‑friendly – The driver handles connection pooling automatically, so there is no need to manage pools manually.

Database Schema
sql
CREATE TABLE pastes (
  id VARCHAR(21) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ttl_seconds INTEGER,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0
);
ttl_seconds – if present, expiry = created_at + ttl_seconds (in seconds).

max_views – if present, paste expires when view_count >= max_views.

view_count – incremented only on successful API fetches (GET /api/pastes/:id) and HTML views (GET /p/:id).

Deterministic Time for Tests
To support the required automated testing, the app respects the TEST_MODE environment variable:

If TEST_MODE=1, the server reads the x‑test‑now‑ms HTTP header.

The header value (milliseconds since epoch) is used as the current time only for expiry checks.

If the header is missing, real system time is used.

This allows testing TTL behaviour without waiting for real time to pass.

Deployment
This app is ready to be deployed on Vercel (or any Node.js hosting).

Push your code to a GitHub repository.

On Vercel, import the project.

Add the required environment variables in the Vercel dashboard:

DATABASE_URL

BASE_URL (set to your production URL, e.g., https://your-app.vercel.app)

Optionally TEST_MODE=1 for testing.

Deploy – Vercel will install dependencies and start the server automatically.

No manual database migrations are required – the table is created on first request.

Testing Locally with x‑test‑now‑ms
You can simulate future time to test expiry:

bash
# Create a paste with 60‑second TTL
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl_seconds":60}'

# Fetch it with a future timestamp (e.g., 2 minutes later)
curl -H "x-test-now-ms: $(date -d '+2 minutes' +%s%3N)" \
  http://localhost:3000/api/pastes/<id>
The response will be 404 if the TTL has passed.

Environment Variables
Variable	Description
DATABASE_URL	PostgreSQL connection string (Neon/local).
PORT	Port for local server (default: 3000).
BASE_URL	Base URL for constructing shareable links.
TEST_MODE	Set to 1 to enable deterministic time via header.
Folder Structure
text
.
├── db.js                 # Database connection & operations
├── server.js             # Express app, routes, middleware
├── views/
│   ├── index.html        # UI for creating pastes
│   └── view.html         # (optional) HTML view page
├── public/
│   └── style.css         # Styling
├── .env.example          # Example environment variables
├── package.json
├── README.md             # This file
└── .gitignore
License
MIT – free to use and modify.