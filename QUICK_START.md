# Quick Start Guide - Social Desk

Get the Social Desk dashboard up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Web browser (Chrome, Firefox, Safari, or Edge)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including React, TypeScript, Tailwind CSS, and Recharts.

### 2. Verify Environment Variables

The `.env` file should already contain:

```env
VITE_SUPABASE_URL=https://aabzwjzzchkddrlcxxjk.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

These are pre-configured and ready to use.

### 3. Start the Development Server

```bash
npm run dev
```

The dashboard will be available at: `http://localhost:5173`

### 4. View the Dashboard

Open your browser and navigate to `http://localhost:5173`

**What You'll See:**
- Loading screen (3-5 seconds) while mock data is being seeded
- Dashboard with 4 stat cards (Likes, Views, Comments, Posts)
- Monthly engagement bar chart
- Activity calendar with pink dots
- Real-time clock in bottom right
- Sidebar navigation on the left

## Features to Test

### 1. Stat Cards
- Look for the four colorful cards at the top
- Each shows: total count, growth percentage, and mini line chart
- Colors: Pink (Likes), Blue (Views), Purple (Comments), Green (Posts)

### 2. Overview Chart
- Bar chart showing monthly data
- Three metrics: Views, Likes, Comments
- Hover over bars to see exact numbers
- Use dropdown to change time period (currently non-functional in demo)

### 3. Calendar Widget
- Shows current month
- Pink dots indicate activity days
- Click arrows to navigate months
- Today's date is highlighted in blue

### 4. Real-time Clock
- Updates every second
- Shows time and full date
- Located in bottom right area

### 5. Sidebar Navigation
- Click different menu items
- Dashboard is currently active (blue highlight)
- Other items will be implemented in future phases

## Testing the API

### Option 1: Using Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. Collection includes all API endpoints
3. Test each endpoint:
   - Get Dashboard Summary
   - Get Calendar Activities
   - Get Top Posts
   - Ingest Platform Stats (with signature)

### Option 2: Using Browser

Open browser console and run:

```javascript
// Test Dashboard Summary
fetch('https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/dashboard-summary', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYnp3anp6Y2hrZGRybGN4eGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTkzMzgsImV4cCI6MjA3ODA5NTMzOH0.QEVjlkVCiYwPufEjGqwo3kc10HOeIBiVAye0Wmp-mUo'
  }
})
.then(r => r.json())
.then(d => console.log(d));
```

### Option 3: Using curl

```bash
curl -X GET \
  'https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/dashboard-summary' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYnp3anp6Y2hrZGRybGN4eGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTkzMzgsImV4cCI6MjA3ODA5NTMzOH0.QEVjlkVCiYwPufEjGqwo3kc10HOeIBiVAye0Wmp-mUo'
```

## Resetting Mock Data

If you want to regenerate the mock data:

1. Open browser console
2. Run: `localStorage.removeItem('dataSeeded')`
3. Refresh the page
4. New mock data will be generated

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Common Issues & Solutions

### Issue: "No mock data showing"

**Solution:**
```javascript
localStorage.clear();
location.reload();
```

### Issue: "API errors in console"

**Check:**
1. Supabase URL is correct in `.env`
2. Anon key is valid
3. Edge Functions are deployed

**Verify:**
```bash
curl https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/dashboard-summary
```

### Issue: "Build fails"

**Solution:**
```bash
npm run typecheck  # Check for TypeScript errors
npm run lint       # Check for linting errors
```

### Issue: "Charts not displaying"

**Check:**
1. Browser console for errors
2. Mock data was seeded successfully
3. Try clearing localStorage and refreshing

## What's Next?

Once you've verified the dashboard works:

1. **Review Documentation**
   - Read `API_DOCUMENTATION.md` for API details
   - Read `DUPE_SITES_GUIDE.md` to build dupe sites
   - Review `WEBHOOK_EXAMPLE.js` for integration code

2. **Build Your First Dupe Site**
   - Choose: fb-dupe, tw-dupe, or tt-dupe
   - Follow the guide in `DUPE_SITES_GUIDE.md`
   - Use `.env.dupe-site.example` for configuration

3. **Test Integration**
   - Send test webhook from dupe site
   - Verify data appears in dashboard
   - Check signature verification works

## Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run typecheck    # TypeScript type checking
npm run lint         # Run ESLint

# Viewing
http://localhost:5173              # Dashboard
http://localhost:5173/api/docs     # API docs (if enabled)
```

## Project Structure Quick Reference

```
social-desk/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Supabase client
│   └── utils/          # Utilities
├── supabase/
│   └── functions/      # Edge Functions
├── dist/               # Production build
└── docs/               # Documentation
```

## Need Help?

- **API Issues**: Check `API_DOCUMENTATION.md`
- **Integration Help**: See `WEBHOOK_EXAMPLE.js`
- **Building Dupe Sites**: Read `DUPE_SITES_GUIDE.md`
- **Overview**: Review `PROJECT_OVERVIEW.md`

## Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Dev server started (`npm run dev`)
- [ ] Dashboard loads at `http://localhost:5173`
- [ ] Mock data displays (4 stat cards visible)
- [ ] Charts render correctly
- [ ] Calendar shows activity
- [ ] Clock updates in real-time
- [ ] API endpoints respond (test with Postman)
- [ ] Production build works (`npm run build`)

---

**🎉 Congratulations!** You now have a fully functional analytics dashboard.

Next step: Build the dupe sites and integrate them with Social Desk.
