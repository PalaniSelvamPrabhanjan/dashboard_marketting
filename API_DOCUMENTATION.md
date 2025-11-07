# Social Desk API Documentation

## Overview

Social Desk is a unified analytics platform that collects and displays statistics from three social media platforms (fb-dupe, tw-dupe, tt-dupe). This document describes the API endpoints and integration patterns.

## Base URL

All API endpoints are accessed via Supabase Edge Functions:
```
https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1
```

## Authentication

All requests require the Supabase anon key in the Authorization header:
```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

---

## Social Desk API Endpoints

### 1. Ingest Platform Stats

**Endpoint:** `POST /ingest-platform-stats`

**Description:** Receives aggregated statistics from social media platforms.

**Headers:**
```
Content-Type: application/json
X-Signature: sha256=<HMAC-SHA256-signature>
```

**Request Body:**
```json
{
  "platform": "fb-dupe",
  "period_start": "2025-11-07T00:00:00Z",
  "period_end": "2025-11-07T23:59:59Z",
  "totals": {
    "total_posts": 120,
    "total_likes": 45000,
    "total_views": 900000,
    "total_comments": 7000
  },
  "top_k_posts": [
    {
      "post_id": "uuid1",
      "views": 12345,
      "likes": 540,
      "comments": 100
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data ingested successfully"
}
```

**Security:**
- The `X-Signature` header must contain an HMAC-SHA256 signature of the request body
- Signature format: `sha256=<hex-digest>`
- Secret key: Configured in environment variables (shared between platforms)

**Signature Generation (Node.js):**
```javascript
const crypto = require('crypto');

function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}
```

---

### 2. Get Dashboard Summary

**Endpoint:** `GET /dashboard-summary`

**Description:** Returns aggregated statistics from all platforms.

**Response:**
```json
{
  "totals": {
    "likes": 105000,
    "views": 2000000,
    "comments": 50000,
    "posts": 200
  },
  "growth": {
    "likes": 0.28,
    "views": 0.30,
    "comments": 0.12,
    "posts": 0.10
  },
  "charts": {
    "likes": [10, 11, 12, 13, 15],
    "views": [100, 120, 150, 170, 200],
    "comments": [5, 6, 7, 8, 10],
    "posts": [20, 22, 25, 28, 30]
  }
}
```

---

### 3. Get Calendar Activities

**Endpoint:** `GET /dashboard-calendar`

**Description:** Returns activity data for the calendar widget.

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "date": "2025-11-07",
      "platform": "fb-dupe",
      "event_type": "post",
      "event_count": 5,
      "color_code": "#EC4899",
      "created_at": "2025-11-07T12:00:00Z"
    }
  ]
}
```

---

### 4. Get Top Posts

**Endpoint:** `GET /dashboard-top-posts?limit=10`

**Description:** Returns the top performing posts across all platforms.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of posts to return

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "platform": "tt-dupe",
      "post_id": "tt-dupe-post-1",
      "views": 125000,
      "likes": 8500,
      "comments": 450,
      "created_at": "2025-11-06T10:00:00Z",
      "received_at": "2025-11-07T01:00:00Z"
    }
  ]
}
```

---

## Required API Endpoints for Dupe Sites

Each social media platform (fb-dupe, tw-dupe, tt-dupe) must implement these endpoints:

### 1. Create Post
```
POST /api/v1/posts
Content-Type: application/json

{
  "user_id": "uuid",
  "content": "Post content",
  "media_url": "https://example.com/image.jpg"
}
```

### 2. Get Post Stats
```
GET /api/v1/posts/:id/stats

Response:
{
  "post_id": "uuid",
  "likes": 1250,
  "views": 15000,
  "comments": 85
}
```

### 3. Get Holistic Stats
```
GET /api/v1/stats/holistic?from=2025-11-01&to=2025-11-07

Response:
{
  "period_start": "2025-11-01T00:00:00Z",
  "period_end": "2025-11-07T23:59:59Z",
  "total_posts": 120,
  "total_likes": 45000,
  "total_views": 900000,
  "total_comments": 7000
}
```

### 4. Send Stats Webhook
```
POST /api/v1/webhook/send-stats

This endpoint should be called internally (via cron/scheduler) to push
stats to Social Desk's /ingest-platform-stats endpoint.
```

### 5. Delete Post (Admin)
```
DELETE /api/v1/posts/:id
Authorization: Bearer <admin-token>
```

---

## Integration Workflow

1. **Data Collection Phase**
   - Users interact with fb-dupe, tw-dupe, or tt-dupe platforms
   - Each platform tracks engagement metrics (likes, views, comments)

2. **Aggregation Phase**
   - Every hour (or on a schedule), each dupe site:
     - Calculates aggregate statistics for the period
     - Identifies top performing posts
     - Generates HMAC signature for the payload

3. **Transmission Phase**
   - Each dupe site sends POST request to `/ingest-platform-stats`
   - Includes platform identifier, time period, and statistics
   - Signs the payload with shared secret

4. **Verification Phase**
   - Social Desk verifies the HMAC signature
   - Validates platform identifier and data structure
   - Stores statistics in the database

5. **Display Phase**
   - Dashboard fetches aggregated data via `/dashboard-summary`
   - Real-time updates as new data arrives
   - Calendar shows activity patterns

---

## Database Schema

### platform_stats
```sql
CREATE TABLE platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_likes BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_comments BIGINT DEFAULT 0,
  total_posts BIGINT DEFAULT 0,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  signature_verified BOOLEAN DEFAULT FALSE
);
```

### top_posts
```sql
CREATE TABLE top_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  likes BIGINT DEFAULT 0,
  views BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ DEFAULT NOW()
);
```

### activity_calendar
```sql
CREATE TABLE activity_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  color_code TEXT DEFAULT '#EC4899',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Testing with Mock Data

The Social Desk dashboard includes a mock data generator that seeds the database with realistic sample data for testing. The data is automatically seeded on first load.

To manually reseed:
1. Clear localStorage: `localStorage.removeItem('dataSeeded')`
2. Refresh the page
3. Mock data will be regenerated

---

## Security Best Practices

1. **HTTPS Only** - All API endpoints must use HTTPS
2. **HMAC Signatures** - Verify signatures on all incoming data
3. **Rate Limiting** - Implement rate limits to prevent abuse
4. **Input Validation** - Validate all incoming data structures
5. **CORS Configuration** - Properly configure CORS headers
6. **Secret Rotation** - Regularly rotate webhook secrets

---

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (signature verification failed)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Rate Limits

- Ingest endpoint: 1 request per minute per platform
- Dashboard endpoints: 60 requests per minute
- Top posts endpoint: 10 requests per minute

---

## Support

For integration support or questions:
- Review this documentation
- Check the example payloads
- Test with the provided mock data
- Verify HMAC signature implementation
