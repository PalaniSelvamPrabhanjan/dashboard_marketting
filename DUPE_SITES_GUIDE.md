# Guide to Building the Dupe Sites (fb-dupe, tw-dupe, tt-dupe)

## Overview

This guide provides instructions for building the three social media clone platforms that feed data into the Social Desk analytics dashboard.

Each dupe site should:
- Function as an independent social media platform
- Have its own backend, database, and hosting
- Implement the required API endpoints
- Send aggregated statistics to Social Desk

---

## Architecture Requirements

### Technology Stack (Recommended)

**Frontend:**
- React + TypeScript + Tailwind CSS
- React Router for navigation
- State management (React Context or Zustand)

**Backend:**
- Node.js + Express OR Python + FastAPI
- PostgreSQL or Supabase for database
- JWT for authentication
- Node-cron or similar for scheduled tasks

**Hosting:**
- Frontend: Vercel, Netlify, or AWS Amplify
- Backend: Render, Railway, or AWS
- Database: Supabase, Railway, or AWS RDS

---

## Database Schema (Common for All Dupe Sites)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', etc.
  likes_count BIGINT DEFAULT 0,
  views_count BIGINT DEFAULT 0,
  comments_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Likes Table
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Views Table
```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Required API Endpoints

### 1. Authentication

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt-token"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": {...},
  "token": "jwt-token"
}
```

### 2. Posts

#### Create Post
```
POST /api/v1/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Check out my latest post!",
  "media_url": "https://example.com/image.jpg",
  "media_type": "image"
}

Response:
{
  "post": {
    "id": "uuid",
    "user_id": "uuid",
    "content": "...",
    "media_url": "...",
    "likes_count": 0,
    "views_count": 0,
    "comments_count": 0,
    "created_at": "2025-11-07T12:00:00Z"
  }
}
```

#### Get Feed
```
GET /api/v1/posts?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

#### Get Single Post
```
GET /api/v1/posts/:id
Authorization: Bearer <token>

Response:
{
  "post": {...},
  "user": {...}
}
```

#### Delete Post
```
DELETE /api/v1/posts/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

### 3. Engagement

#### Like Post
```
POST /api/v1/posts/:id/like
Authorization: Bearer <token>

Response:
{
  "liked": true,
  "likes_count": 125
}
```

#### Unlike Post
```
DELETE /api/v1/posts/:id/like
Authorization: Bearer <token>

Response:
{
  "liked": false,
  "likes_count": 124
}
```

#### Comment on Post
```
POST /api/v1/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!"
}

Response:
{
  "comment": {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "content": "Great post!",
    "created_at": "2025-11-07T12:00:00Z"
  }
}
```

#### Track View
```
POST /api/v1/posts/:id/view
Authorization: Bearer <token>

Response:
{
  "views_count": 1500
}
```

### 4. Statistics (Required for Social Desk Integration)

#### Get Post Stats
```
GET /api/v1/posts/:id/stats
Authorization: Bearer <token>

Response:
{
  "post_id": "uuid",
  "likes": 1250,
  "views": 15000,
  "comments": 85,
  "engagement_rate": 0.089
}
```

#### Get Holistic Stats
```
GET /api/v1/stats/holistic?from=2025-11-01&to=2025-11-07
Authorization: Bearer <admin-token>

Response:
{
  "period_start": "2025-11-01T00:00:00Z",
  "period_end": "2025-11-07T23:59:59Z",
  "total_posts": 120,
  "total_likes": 45000,
  "total_views": 900000,
  "total_comments": 7000,
  "top_posts": [
    {
      "post_id": "uuid1",
      "views": 12345,
      "likes": 540,
      "comments": 100
    }
  ]
}
```

---

## Social Desk Integration

### 1. Setup Webhook Secret

Store a shared secret for HMAC signature generation:

```env
SOCIAL_DESK_WEBHOOK_SECRET=your-secret-key-here
SOCIAL_DESK_INGEST_URL=https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/ingest-platform-stats
PLATFORM_ID=fb-dupe  # or tw-dupe, tt-dupe
```

### 2. Implement Stats Aggregation

**Node.js Example:**

```javascript
const crypto = require('crypto');

async function aggregateStats(periodStart, periodEnd) {
  // Query database for stats
  const stats = await db.query(`
    SELECT
      COUNT(DISTINCT id) as total_posts,
      COALESCE(SUM(likes_count), 0) as total_likes,
      COALESCE(SUM(views_count), 0) as total_views,
      COALESCE(SUM(comments_count), 0) as total_comments
    FROM posts
    WHERE created_at >= $1 AND created_at < $2
  `, [periodStart, periodEnd]);

  // Get top posts
  const topPosts = await db.query(`
    SELECT id as post_id, views_count as views,
           likes_count as likes, comments_count as comments
    FROM posts
    WHERE created_at >= $1 AND created_at < $2
    ORDER BY views_count DESC
    LIMIT 10
  `, [periodStart, periodEnd]);

  return {
    platform: process.env.PLATFORM_ID,
    period_start: periodStart,
    period_end: periodEnd,
    totals: {
      total_posts: stats.rows[0].total_posts,
      total_likes: stats.rows[0].total_likes,
      total_views: stats.rows[0].total_views,
      total_comments: stats.rows[0].total_comments
    },
    top_k_posts: topPosts.rows
  };
}
```

### 3. Generate HMAC Signature

```javascript
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}
```

### 4. Send Stats to Social Desk

```javascript
async function sendStatsToSocialDesk() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const payload = await aggregateStats(oneHourAgo, now);
  const signature = generateSignature(
    payload,
    process.env.SOCIAL_DESK_WEBHOOK_SECRET
  );

  const response = await fetch(process.env.SOCIAL_DESK_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error('Failed to send stats:', await response.text());
  } else {
    console.log('Stats sent successfully');
  }
}
```

### 5. Schedule Stats Sending

**Using node-cron:**

```javascript
const cron = require('node-cron');

// Run every hour at minute 0
cron.schedule('0 * * * *', () => {
  console.log('Sending hourly stats to Social Desk...');
  sendStatsToSocialDesk();
});
```

---

## Platform-Specific Features

### fb-dupe (Facebook Clone)

**Unique Features:**
- News feed with algorithmic sorting
- Friend connections
- Photo albums
- Reactions (like, love, laugh, etc.)
- Groups and events

**UI Considerations:**
- Blue color scheme (#1877f2)
- Card-based post layout
- Prominent photo/video display

### tw-dupe (Twitter Clone)

**Unique Features:**
- 280 character limit
- Retweets and quote tweets
- Hashtags and trending topics
- Following/followers model
- Timeline view

**UI Considerations:**
- Light blue accent (#1DA1F2)
- Compact post layout
- Left sidebar navigation
- Real-time feed updates

### tt-dupe (TikTok Clone)

**Unique Features:**
- Short-form video focus
- Vertical scroll interface
- For You Page algorithm
- Duets and stitches
- Sound library

**UI Considerations:**
- Dark theme by default
- Full-screen video player
- Bottom navigation
- Engagement buttons on right side

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] HMAC signature implementation verified
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Error handling in place

### Testing

- [ ] Test user registration/login
- [ ] Test post creation
- [ ] Test likes/comments/views
- [ ] Test stats aggregation
- [ ] Test webhook sending
- [ ] Verify signature verification on Social Desk

### Production

- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] Cron job for stats sending active
- [ ] API documentation complete
- [ ] Health check endpoint implemented

---

## Example Codebase Structure

```
dupe-site/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Feed.tsx
│   │   │   ├── Post.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── stats.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── services/
│   │   │   ├── statsAggregation.js
│   │   │   └── webhookSender.js
│   │   ├── db/
│   │   │   └── migrations/
│   │   └── server.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Security Considerations

1. **Authentication**: Use JWT with appropriate expiration times
2. **Password Hashing**: Use bcrypt with salt rounds >= 10
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize user-generated content
6. **Rate Limiting**: Prevent API abuse
7. **CORS**: Configure allowed origins properly
8. **HTTPS**: Enforce SSL/TLS
9. **Secrets Management**: Never commit secrets to git

---

## Performance Optimization

1. **Database Indexing**: Index frequently queried columns
2. **Caching**: Use Redis for session storage and caching
3. **CDN**: Serve static assets via CDN
4. **Pagination**: Implement efficient pagination
5. **Lazy Loading**: Load images and content on demand
6. **Connection Pooling**: Use database connection pools
7. **Compression**: Enable gzip compression

---

## Next Steps

1. Choose which dupe site to build first
2. Set up development environment
3. Implement core features (auth, posts, engagement)
4. Implement statistics aggregation
5. Set up webhook integration with Social Desk
6. Deploy to production
7. Monitor and iterate

For any questions or support, refer to the API_DOCUMENTATION.md file.
