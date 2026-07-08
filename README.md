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
