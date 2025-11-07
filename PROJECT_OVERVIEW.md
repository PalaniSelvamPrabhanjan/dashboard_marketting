# Social Desk - Project Overview

## Executive Summary

**Social Desk** is a unified analytics dashboard that aggregates and displays statistics from three independent social media platforms (fb-dupe, tw-dupe, tt-dupe). This document provides a comprehensive overview of the entire project architecture, deliverables, and next steps.

## Project Status: Phase 1 Complete ✓

**What's Built:**
1. ✅ Social Desk Analytics Dashboard (fully functional)
2. ✅ Backend API (Supabase Edge Functions)
3. ✅ Database schema (PostgreSQL via Supabase)
4. ✅ Mock data generator
5. ✅ Complete API documentation
6. ✅ Integration guides for dupe sites
7. ✅ Postman collection for testing

**What's Next:**
- Build the three dupe sites (fb-dupe, tw-dupe, tt-dupe)
- Connect dupe sites to Social Desk
- Deploy all four applications
- Verify end-to-end data flow

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Social Desk                            │
│                   Analytics Dashboard                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend (React + TypeScript + Tailwind)           │   │
│  │  - Dashboard UI with charts                         │   │
│  │  - Calendar widget                                   │   │
│  │  - Real-time stats display                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Backend (Supabase Edge Functions)                  │   │
│  │  - /ingest-platform-stats                           │   │
│  │  - /dashboard-summary                               │   │
│  │  - /dashboard-calendar                              │   │
│  │  - /dashboard-top-posts                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL via Supabase)                 │   │
│  │  - platform_stats                                   │   │
│  │  - top_posts                                        │   │
│  │  - activity_calendar                                │   │
│  │  - users                                            │   │
│  │  - scheduled_posts                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ HMAC-signed webhooks
                           │ (hourly stats push)
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
    │ fb-dupe │       │ tw-dupe │      │ tt-dupe │
    │ (Phase 2)│       │ (Phase 2)│      │ (Phase 2)│
    └─────────┘       └─────────┘      └─────────┘
```

---

## Deliverables Checklist

### Phase 1: Social Desk Dashboard ✓

#### Frontend Components ✓
- [x] `Sidebar.tsx` - Navigation sidebar with menu items
- [x] `StatCard.tsx` - Metric cards with mini line charts
- [x] `OverviewChart.tsx` - Monthly engagement bar chart
- [x] `CalendarWidget.tsx` - Activity calendar with date navigation
- [x] `Clock.tsx` - Real-time clock display
- [x] `App.tsx` - Main dashboard layout

#### Backend API ✓
- [x] `ingest-platform-stats` - Webhook endpoint for receiving data
- [x] `dashboard-summary` - Aggregated statistics endpoint
- [x] `dashboard-calendar` - Calendar activity endpoint
- [x] `dashboard-top-posts` - Top performing posts endpoint

#### Database Schema ✓
- [x] `platform_stats` table - Stores aggregated statistics
- [x] `top_posts` table - Stores top performing posts
- [x] `activity_calendar` table - Stores daily activity
- [x] `users` table - User accounts (optional)
- [x] `scheduled_posts` table - Scheduled posts (optional)
- [x] Row Level Security policies configured
- [x] Indexes for performance optimization

#### Documentation ✓
- [x] `README.md` - Project overview and setup instructions
- [x] `API_DOCUMENTATION.md` - Complete API reference
- [x] `DUPE_SITES_GUIDE.md` - Guide for building dupe sites
- [x] `PROJECT_OVERVIEW.md` - This file
- [x] `POSTMAN_COLLECTION.json` - API testing collection
- [x] `.env.dupe-site.example` - Environment variables template
- [x] `WEBHOOK_EXAMPLE.js` - Integration code examples

#### Testing & Deployment ✓
- [x] Mock data generator implemented
- [x] TypeScript type checking passing
- [x] Production build successful
- [x] Edge Functions deployed to Supabase

### Phase 2: Dupe Sites (To Be Built)

Each dupe site needs:

#### Core Features
- [ ] User authentication (register, login, logout)
- [ ] Post creation and management
- [ ] Engagement features (likes, comments, views)
- [ ] User profiles
- [ ] Feed/timeline
- [ ] Platform-specific features

#### API Endpoints
- [ ] `POST /api/v1/posts` - Create post
- [ ] `GET /api/v1/posts/:id/stats` - Get post stats
- [ ] `GET /api/v1/stats/holistic` - Get aggregated stats
- [ ] `POST /api/v1/webhook/send-stats` - Internal webhook trigger
- [ ] `DELETE /api/v1/posts/:id` - Delete post

#### Integration
- [ ] Webhook implementation with HMAC signing
- [ ] Hourly cron job for stats aggregation
- [ ] Stats calculation and top posts identification
- [ ] Error handling and retry logic

#### Deployment
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Backend deployed (Render/Railway)
- [ ] Database setup (Supabase/PostgreSQL)
- [ ] Environment variables configured
- [ ] Webhook tested with Social Desk

---

## Technology Stack

### Social Desk (Current Implementation)

**Frontend:**
- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- Recharts 2.x (data visualization)
- date-fns 3.x (date manipulation)
- Lucide React 0.344.0 (icons)
- Vite 5.4.2 (build tool)

**Backend:**
- Supabase Edge Functions (Deno runtime)
- Node crypto for HMAC verification
- CORS-enabled endpoints

**Database:**
- PostgreSQL 12+ (via Supabase)
- Row Level Security enabled
- Optimized indexes

**Hosting:**
- Frontend: Ready for deployment (Vercel recommended)
- Backend: Deployed on Supabase
- Database: Hosted on Supabase

### Recommended Stack for Dupe Sites

**Frontend:**
- React + TypeScript + Tailwind CSS
- React Router for navigation
- State management (Context API or Zustand)

**Backend Options:**

*Option 1: Node.js*
- Express.js framework
- PostgreSQL with pg or Supabase client
- JWT for authentication
- node-cron for scheduling
- bcrypt for password hashing

*Option 2: Python*
- FastAPI framework
- SQLAlchemy ORM
- APScheduler for scheduling
- bcrypt for password hashing

**Database:**
- Supabase (recommended)
- PostgreSQL on Railway/AWS RDS
- Redis for caching (optional)

---

## File Structure

```
social-desk/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.tsx
│   │   ├── StatCard.tsx
│   │   ├── OverviewChart.tsx
│   │   ├── CalendarWidget.tsx
│   │   └── Clock.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useDashboardData.ts
│   ├── lib/                # Library code
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── utils/              # Utility functions
│   │   └── seedData.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── functions/          # Edge Functions
│       ├── ingest-platform-stats/
│       ├── dashboard-summary/
│       ├── dashboard-calendar/
│       └── dashboard-top-posts/
├── docs/
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── DUPE_SITES_GUIDE.md
│   ├── PROJECT_OVERVIEW.md
│   ├── POSTMAN_COLLECTION.json
│   ├── WEBHOOK_EXAMPLE.js
│   └── .env.dupe-site.example
├── dist/                   # Production build
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Key Features Implemented

### 1. Dashboard UI
- **4 Stat Cards**: Likes, Views, Comments, Posts
  - Current totals with formatted numbers (1.5K, 2M, etc.)
  - Growth percentage vs. last week
  - Mini line charts showing 7-day trends
  - Color-coded gradients (pink, blue, purple, green)

- **Overview Chart**: Bar chart with monthly engagement
  - Views, Likes, Comments as stacked bars
  - Interactive tooltips
  - Responsive design
  - 6-month default view

- **Calendar Widget**: Activity calendar
  - Current month display
  - Previous/next month navigation
  - Activity indicators (pink dots)
  - Today's date highlighted
  - Responsive grid layout

- **Real-time Clock**: Live clock display
  - HH:MM:SS format
  - Full date display
  - Updates every second
  - Clean, modern design

- **Sidebar Navigation**: Left sidebar menu
  - Profile, Dashboard, Post Draft
  - Image Formatter, Calendar, Video Editor
  - Theme, Notifications, Settings
  - Log Out
  - Active state highlighting

### 2. Backend API

#### Ingest Platform Stats
- Receives webhook data from dupe sites
- Verifies HMAC-SHA256 signatures
- Validates platform identifiers
- Stores stats in database
- Records top performing posts
- Returns success/error responses

#### Dashboard Summary
- Aggregates data from all platforms
- Calculates 30-day totals
- Computes 7-day growth rates
- Generates chart data points
- Returns formatted JSON

#### Calendar Activities
- Queries 30 days of activity
- Groups by date and platform
- Returns activity indicators
- Supports date filtering

#### Top Posts
- Queries top posts by views
- Supports pagination (limit parameter)
- Returns multi-platform data
- Sorted by performance metrics

### 3. Security Features

- **HMAC-SHA256 Signature Verification**
  - All webhooks must be signed
  - Signatures validated before processing
  - Shared secret between platforms

- **Row Level Security (RLS)**
  - Enabled on all tables
  - Authenticated user policies
  - Service role for admin operations

- **CORS Configuration**
  - Properly configured headers
  - Supports all required methods
  - Whitelisted origins

- **Input Validation**
  - Platform identifiers validated
  - Date formats checked
  - Required fields enforced

### 4. Data Flow

1. **User Interaction** on dupe site (fb-dupe/tw-dupe/tt-dupe)
   - User creates post, likes, comments, views content

2. **Metric Tracking** on dupe site
   - Database counters incremented
   - Views, likes, comments recorded

3. **Hourly Aggregation** on dupe site
   - Cron job triggers every hour
   - Stats calculated for past hour
   - Top posts identified

4. **Webhook Transmission** to Social Desk
   - Payload created with stats
   - HMAC signature generated
   - POST request sent to `/ingest-platform-stats`

5. **Verification & Storage** in Social Desk
   - Signature verified
   - Data validated
   - Stored in database

6. **Dashboard Display** on Social Desk
   - Dashboard queries aggregated data
   - Charts updated with new stats
   - Real-time display to users

---

## API Endpoints Reference

### Social Desk APIs

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/ingest-platform-stats` | POST | Receive stats from dupe sites | Yes (anon key) |
| `/dashboard-summary` | GET | Get aggregated statistics | Yes (anon key) |
| `/dashboard-calendar` | GET | Get activity calendar data | Yes (anon key) |
| `/dashboard-top-posts` | GET | Get top performing posts | Yes (anon key) |

### Dupe Site APIs (To Implement)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/v1/auth/register` | POST | Register new user | No |
| `/api/v1/auth/login` | POST | Login user | No |
| `/api/v1/posts` | POST | Create post | Yes (JWT) |
| `/api/v1/posts` | GET | Get feed | Yes (JWT) |
| `/api/v1/posts/:id` | GET | Get single post | Yes (JWT) |
| `/api/v1/posts/:id` | DELETE | Delete post | Yes (JWT) |
| `/api/v1/posts/:id/like` | POST | Like post | Yes (JWT) |
| `/api/v1/posts/:id/comments` | POST | Comment on post | Yes (JWT) |
| `/api/v1/posts/:id/view` | POST | Track view | Yes (JWT) |
| `/api/v1/posts/:id/stats` | GET | Get post stats | Yes (JWT) |
| `/api/v1/stats/holistic` | GET | Get aggregated stats | Yes (Admin) |

---

## Database Schema

### platform_stats
Stores aggregated statistics received from platforms.

```sql
CREATE TABLE platform_stats (
  id UUID PRIMARY KEY,
  platform TEXT CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  total_likes BIGINT,
  total_views BIGINT,
  total_comments BIGINT,
  total_posts BIGINT,
  received_at TIMESTAMPTZ,
  signature_verified BOOLEAN
);
```

### top_posts
Stores top performing posts from all platforms.

```sql
CREATE TABLE top_posts (
  id UUID PRIMARY KEY,
  platform TEXT,
  post_id TEXT,
  likes BIGINT,
  views BIGINT,
  comments BIGINT,
  created_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ
);
```

### activity_calendar
Stores daily activity for calendar display.

```sql
CREATE TABLE activity_calendar (
  id UUID PRIMARY KEY,
  date DATE,
  platform TEXT,
  event_type TEXT,
  event_count INTEGER,
  color_code TEXT,
  created_at TIMESTAMPTZ
);
```

---

## Environment Variables

### Social Desk (.env)
```env
VITE_SUPABASE_URL=https://aabzwjzzchkddrlcxxjk.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Dupe Sites (.env)
See `.env.dupe-site.example` for complete list. Key variables:
```env
PLATFORM_ID=fb-dupe
DATABASE_URL=postgresql://...
JWT_SECRET=<secret>
SOCIAL_DESK_INGEST_URL=https://...
SOCIAL_DESK_WEBHOOK_SECRET=<shared-secret>
SOCIAL_DESK_ANON_KEY=<anon-key>
```

---

## Development Commands

### Social Desk
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
```

### Dupe Sites (Example)
```bash
npm install             # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm test                # Run tests
npm run migrate         # Run database migrations
npm run seed            # Seed database
```

---

## Testing

### Social Desk Testing

1. **Manual Testing**
   - Load dashboard at `http://localhost:5173`
   - Verify mock data loads
   - Check all components render
   - Test navigation
   - Verify charts display correctly

2. **API Testing**
   - Import `POSTMAN_COLLECTION.json` into Postman
   - Test GET endpoints
   - Test POST endpoint with valid signature
   - Verify error handling

3. **Integration Testing**
   - Send test webhook from dupe site
   - Verify data appears in dashboard
   - Check signature verification
   - Test with invalid signatures

### Dupe Site Testing (When Built)

1. **Unit Tests**
   - Test individual functions
   - Test database queries
   - Test signature generation

2. **Integration Tests**
   - Test API endpoints
   - Test authentication flow
   - Test webhook sending

3. **End-to-End Tests**
   - User registration/login
   - Post creation
   - Engagement actions
   - Stats aggregation
   - Webhook delivery

---

## Deployment Guide

### Social Desk Deployment

#### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

#### Backend (Already Deployed)
- Edge Functions are deployed on Supabase
- Accessible at: `https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/`

### Dupe Sites Deployment (When Built)

#### Frontend
- Deploy to Vercel, Netlify, or AWS Amplify
- Configure environment variables
- Set up custom domain (optional)

#### Backend
- Deploy to Render, Railway, or AWS
- Configure environment variables
- Set up database connection
- Enable cron jobs

---

## Next Steps

### Immediate (Phase 2)

1. **Choose First Dupe Site to Build**
   - Recommend: fb-dupe (most features)
   - Or tw-dupe (simplest to start)

2. **Set Up Project Structure**
   - Initialize React frontend
   - Set up Express/FastAPI backend
   - Configure database

3. **Implement Core Features**
   - User authentication
   - Post creation/management
   - Engagement features (likes, comments, views)
   - User profiles

4. **Implement Stats Aggregation**
   - Database queries for totals
   - Top posts identification
   - Webhook payload creation

5. **Integrate with Social Desk**
   - Implement HMAC signing
   - Set up cron job
   - Test webhook delivery
   - Verify data appears in dashboard

6. **Test End-to-End Flow**
   - Create posts on dupe site
   - Wait for hourly webhook
   - Check Social Desk dashboard
   - Verify stats accuracy

### Future Enhancements

- **Multi-user Support**: Add user authentication to Social Desk
- **Real-time Updates**: WebSocket connection for live data
- **Advanced Analytics**: Engagement rates, user demographics
- **Export Features**: PDF reports, CSV downloads
- **Alerts & Notifications**: Email alerts for milestones
- **Dark Mode**: Theme toggle
- **Mobile App**: React Native companion app
- **API Rate Limiting**: Advanced rate limiting per user
- **Caching Layer**: Redis for improved performance

---

## Support & Resources

### Documentation
- `README.md` - Getting started guide
- `API_DOCUMENTATION.md` - Complete API reference
- `DUPE_SITES_GUIDE.md` - Dupe site implementation guide
- `WEBHOOK_EXAMPLE.js` - Integration code examples

### Testing
- `POSTMAN_COLLECTION.json` - API testing collection
- Mock data generator included
- Example payloads in documentation

### Configuration
- `.env.dupe-site.example` - Environment variables template
- Comments explain each variable
- Platform-specific sections included

---

## Success Metrics

### Phase 1 (Complete)
- ✅ Dashboard loads without errors
- ✅ Mock data displays correctly
- ✅ All components render properly
- ✅ Charts show accurate data
- ✅ API endpoints respond correctly
- ✅ Build completes successfully

### Phase 2 (To Be Measured)
- [ ] All three dupe sites deployed
- [ ] Webhooks successfully delivering data
- [ ] Dashboard shows real-time stats
- [ ] End-to-end data flow verified
- [ ] User can interact with all platforms
- [ ] Performance benchmarks met

---

## Troubleshooting

### Common Issues

**Issue: Dashboard shows no data**
- Solution: Clear localStorage and refresh
- Check: Ensure mock data seeded successfully

**Issue: API errors in console**
- Solution: Verify Supabase credentials in `.env`
- Check: Edge Functions deployed correctly

**Issue: Build fails**
- Solution: Run `npm run typecheck` to identify issues
- Check: All imports are correct

**Issue: Webhook signature verification fails**
- Solution: Verify shared secret matches
- Check: Signature generation implementation

---

## Conclusion

Phase 1 of the Social Desk project is complete and production-ready. The analytics dashboard is fully functional with mock data, demonstrating all planned features. The system is ready for integration with the three dupe sites (fb-dupe, tw-dupe, tt-dupe).

Next steps involve building the dupe sites according to the specifications in `DUPE_SITES_GUIDE.md`, implementing the webhook integration as shown in `WEBHOOK_EXAMPLE.js`, and verifying end-to-end data flow.

All documentation is comprehensive and includes code examples, API references, and deployment guides. The project structure is clean, scalable, and follows best practices for TypeScript, React, and Supabase development.

---

**Project Status:** ✅ Phase 1 Complete | 🚧 Phase 2 Ready to Begin

**Built with:** React • TypeScript • Tailwind CSS • Recharts • Supabase • Vite
