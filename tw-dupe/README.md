# tw-dupe - Twitter Clone

A full-stack Twitter clone built with React, TypeScript, and Supabase Edge Functions. Features real-time engagement tracking and automatic stats reporting to Social Desk Analytics Dashboard.

## Features

- User authentication (register, login, JWT tokens)
- Tweet creation with 280 character limit
- Real-time engagement (likes, comments, retweets, views)
- Responsive design with Twitter-like UI
- Automatic view tracking
- Hourly stats aggregation and webhook to Social Desk

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Supabase Edge Functions** (Deno runtime)
- **PostgreSQL** database
- **Row Level Security** (RLS) for data protection

## API Endpoints

### Authentication
- `POST /tw-auth/register` - Register new user
- `POST /tw-auth/login` - Login and get JWT token
- `GET /tw-auth/me` - Get current user info

### Posts
- `POST /tw-posts` - Create new tweet
- `GET /tw-posts?page=1&limit=20` - Get tweet feed (paginated)
- `GET /tw-posts/:id` - Get single tweet
- `DELETE /tw-posts/:id` - Delete tweet

### Engagement
- `POST /tw-engagement/:postId/like` - Like a tweet
- `DELETE /tw-engagement/:postId/like` - Unlike a tweet
- `POST /tw-engagement/:postId/comments` - Add comment
- `GET /tw-engagement/:postId/comments` - Get comments
- `POST /tw-engagement/:postId/retweet` - Retweet
- `DELETE /tw-engagement/:postId/retweet` - Remove retweet
- `POST /tw-engagement/:postId/view` - Track view

### Stats
- `GET /tw-stats/holistic?from=&to=` - Get aggregated stats
- `POST /tw-stats/send-webhook` - Manually trigger webhook

### Cron Job
- `POST /tw-cron-stats` - Runs hourly to send stats to Social Desk

## Database Schema

### Tables
- `tw_users` - User accounts
- `tw_posts` - All tweets
- `tw_likes` - Post likes
- `tw_comments` - Post comments
- `tw_retweets` - Retweets and quote tweets
- `tw_follows` - Follow relationships
- `tw_hashtags` - Hashtag tracking
- `tw_post_hashtags` - Junction table for post-hashtag relationships
- `tw_post_views` - View tracking

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Social Desk dashboard deployed

### Backend Setup (Already Done)

All Edge Functions are deployed:
- `tw-auth` - Authentication endpoints
- `tw-posts` - Tweet management
- `tw-engagement` - Engagement tracking
- `tw-stats` - Stats aggregation
- `tw-cron-stats` - Hourly stats webhook

### Database Setup (Already Done)

Database schema created with:
- All tables
- Row Level Security policies
- Counter increment/decrement functions
- Indexes for performance

### Seed Test Data

Test data has been inserted:
- 5 test users (alice_wonder, bob_builder, carol_creative, dave_dev, emma_explorer)
- 20 tweets over the past 7 days
- Likes, views, and comments on tweets

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd tw-dupe/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_TW_API_URL=https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Testing the Application

### 1. Register a New User
- Navigate to http://localhost:5173/register
- Create account with username, email, password
- Automatically logged in after registration

### 2. View Tweet Feed
- See tweets from all users
- Tweets are sorted by most recent first
- Automatic view tracking when scrolling

### 3. Create a Tweet
- Use the tweet composer at the top of feed
- Maximum 280 characters
- Character counter shows remaining chars

### 4. Engage with Tweets
- Click heart icon to like/unlike
- Click comment icon (UI only, add comment modal coming soon)
- Click retweet icon (coming soon)
- Views are tracked automatically

### 5. Test Login
Use one of the seeded accounts:
- Email: `alice@example.com`
- Password: (empty string - hash of empty string used in seed data)

Or create your own account via register page.

## Social Desk Integration

### How It Works

1. **Hourly Stats Collection**: The `tw-cron-stats` function runs every hour
2. **Data Aggregation**: Queries database for posts, likes, views, comments from past hour
3. **Signature Generation**: Creates HMAC-SHA256 signature for security
4. **Webhook Delivery**: Sends POST request to Social Desk ingest endpoint
5. **Dashboard Update**: Stats appear in Social Desk analytics dashboard

### Webhook Payload Example

```json
{
  "platform": "tw-dupe",
  "period_start": "2025-11-07T12:00:00Z",
  "period_end": "2025-11-07T13:00:00Z",
  "totals": {
    "total_posts": 15,
    "total_likes": 234,
    "total_views": 5678,
    "total_comments": 89
  },
  "top_k_posts": [
    {
      "post_id": "uuid-here",
      "views": 1234,
      "likes": 56,
      "comments": 12
    }
  ]
}
```

### Test the Integration

1. **Manually trigger webhook**:
```bash
curl -X POST https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/tw-cron-stats \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

2. **Check Social Desk dashboard**:
- Open Social Desk at main dashboard URL
- Verify tw-dupe stats appear in Total Likes, Views, Comments, Posts
- Check calendar for tw-dupe activity
- View top posts from tw-dupe

3. **Monitor cron logs**:
- Cron function logs to Supabase Edge Function logs
- Check for `[CRON] Running tw-dupe stats aggregation`
- Verify successful webhook delivery

## Environment Variables

### Required for Backend (Auto-configured in Supabase)
```env
SUPABASE_URL=https://aabzwjzzchkddrlcxxjk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<auto-configured>
SUPABASE_ANON_KEY=<auto-configured>
```

### Optional (for custom configuration)
```env
SOCIAL_DESK_WEBHOOK_SECRET=shared-secret-key
SOCIAL_DESK_INGEST_URL=https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/ingest-platform-stats
```

### Frontend
```env
VITE_TW_API_URL=https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**:
```bash
cd tw-dupe/frontend
npm run build
```

2. **Deploy to Vercel**:
```bash
vercel --prod
```

3. **Set environment variables** in Vercel dashboard:
- `VITE_TW_API_URL=https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1`

### Backend (Already Deployed)

All Edge Functions are deployed to Supabase and ready to use.

## Troubleshooting

### Can't Login
- Verify email exists in database
- Check password hash matches
- Ensure API_BASE URL is correct

### Tweets Not Showing
- Check Edge Function logs in Supabase
- Verify RLS policies allow public reads
- Check network tab for API errors

### Stats Not Appearing in Social Desk
- Manually trigger cron: `POST /tw-cron-stats`
- Check webhook signature is correct
- Verify Social Desk ingest endpoint is working
- Check Edge Function logs for errors

## Next Steps

1. **Add Comment Modal**: Full comment thread UI
2. **Add Retweet Modal**: Quote tweet functionality
3. **Add Profile Pages**: View user profiles and their tweets
4. **Add Follow System**: Follow/unfollow users
5. **Add Hashtag Parsing**: Clickable hashtags in tweets
6. **Add Image Upload**: Upload images with tweets
7. **Add Notifications**: Real-time notifications for engagement
8. **Add Search**: Search tweets by content or hashtag

## API Documentation

Full API documentation is available in the main project's `API_DOCUMENTATION.md` file.

## License

MIT

## Support

For issues or questions, please open an issue in the project repository.
