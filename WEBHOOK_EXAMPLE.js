/**
 * Example implementation of webhook integration for dupe sites
 * This file demonstrates how to aggregate stats and send them to Social Desk
 *
 * Framework: Node.js + Express + PostgreSQL
 * Can be adapted for other frameworks and databases
 */

const crypto = require('crypto');
const cron = require('node-cron');

// ============================================
// Configuration
// ============================================

const config = {
  platformId: process.env.PLATFORM_ID || 'fb-dupe',
  socialDeskUrl: process.env.SOCIAL_DESK_INGEST_URL,
  webhookSecret: process.env.SOCIAL_DESK_WEBHOOK_SECRET,
  anonKey: process.env.SOCIAL_DESK_ANON_KEY,
  cronSchedule: process.env.STATS_CRON_SCHEDULE || '0 * * * *', // Every hour
  enabled: process.env.WEBHOOK_ENABLED !== 'false',
};

// ============================================
// Database Queries (PostgreSQL example)
// ============================================

/**
 * Get aggregated statistics for a time period
 * @param {Date} startDate - Period start
 * @param {Date} endDate - Period end
 * @returns {Promise<Object>} Aggregated stats
 */
async function getAggregatedStats(startDate, endDate) {
  const db = require('./db'); // Your database connection

  // Get total counts
  const statsQuery = `
    SELECT
      COUNT(DISTINCT posts.id) as total_posts,
      COALESCE(SUM(posts.likes_count), 0) as total_likes,
      COALESCE(SUM(posts.views_count), 0) as total_views,
      COALESCE(SUM(posts.comments_count), 0) as total_comments
    FROM posts
    WHERE posts.created_at >= $1 AND posts.created_at < $2
  `;

  const statsResult = await db.query(statsQuery, [startDate, endDate]);

  // Get top performing posts
  const topPostsQuery = `
    SELECT
      id as post_id,
      views_count as views,
      likes_count as likes,
      comments_count as comments
    FROM posts
    WHERE created_at >= $1 AND created_at < $2
    ORDER BY views_count DESC
    LIMIT 10
  `;

  const topPostsResult = await db.query(topPostsQuery, [startDate, endDate]);

  return {
    totals: {
      total_posts: parseInt(statsResult.rows[0].total_posts),
      total_likes: parseInt(statsResult.rows[0].total_likes),
      total_views: parseInt(statsResult.rows[0].total_views),
      total_comments: parseInt(statsResult.rows[0].total_comments),
    },
    top_posts: topPostsResult.rows.map(post => ({
      post_id: post.post_id,
      views: parseInt(post.views),
      likes: parseInt(post.likes),
      comments: parseInt(post.comments),
    })),
  };
}

// ============================================
// HMAC Signature Generation
// ============================================

/**
 * Generate HMAC-SHA256 signature for payload
 * @param {Object} payload - Request payload
 * @param {string} secret - Webhook secret
 * @returns {string} Signature in format: sha256=<hex>
 */
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const signature = hmac.digest('hex');
  return `sha256=${signature}`;
}

// ============================================
// Webhook Sender
// ============================================

/**
 * Send aggregated stats to Social Desk
 * @param {Object} stats - Aggregated statistics
 * @returns {Promise<boolean>} Success status
 */
async function sendStatsToSocialDesk(stats) {
  const payload = {
    platform: config.platformId,
    period_start: stats.periodStart.toISOString(),
    period_end: stats.periodEnd.toISOString(),
    totals: stats.totals,
    top_k_posts: stats.top_posts,
  };

  const signature = generateSignature(payload, config.webhookSecret);

  try {
    const response = await fetch(config.socialDeskUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'Authorization': `Bearer ${config.anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send stats: ${response.status} - ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log('Stats sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending stats to Social Desk:', error);
    return false;
  }
}

// ============================================
// Main Stats Aggregation Function
// ============================================

/**
 * Aggregate stats for the last hour and send to Social Desk
 */
async function aggregateAndSendStats() {
  if (!config.enabled) {
    console.log('Webhook sending is disabled');
    return;
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  console.log(`Aggregating stats from ${oneHourAgo.toISOString()} to ${now.toISOString()}`);

  try {
    const stats = await getAggregatedStats(oneHourAgo, now);

    const payload = {
      periodStart: oneHourAgo,
      periodEnd: now,
      totals: stats.totals,
      top_posts: stats.top_posts,
    };

    console.log('Aggregated stats:', {
      posts: stats.totals.total_posts,
      likes: stats.totals.total_likes,
      views: stats.totals.total_views,
      comments: stats.totals.total_comments,
      topPosts: stats.top_posts.length,
    });

    const success = await sendStatsToSocialDesk(payload);

    if (success) {
      console.log('✓ Stats successfully sent to Social Desk');
    } else {
      console.error('✗ Failed to send stats to Social Desk');
    }
  } catch (error) {
    console.error('Error in aggregateAndSendStats:', error);
  }
}

// ============================================
// Cron Job Setup
// ============================================

/**
 * Initialize the webhook scheduler
 */
function initializeWebhookScheduler() {
  if (!config.enabled) {
    console.log('Webhook scheduler is disabled');
    return;
  }

  console.log(`Webhook scheduler initialized with cron: ${config.cronSchedule}`);
  console.log(`Platform: ${config.platformId}`);
  console.log(`Target URL: ${config.socialDeskUrl}`);

  // Schedule the job
  cron.schedule(config.cronSchedule, () => {
    console.log('Webhook cron job triggered');
    aggregateAndSendStats();
  });

  // Send initial stats on startup (optional)
  console.log('Sending initial stats...');
  setTimeout(() => {
    aggregateAndSendStats();
  }, 5000); // Wait 5 seconds after startup
}

// ============================================
// Express Endpoint (Optional - for manual triggering)
// ============================================

/**
 * Express route handler for manual webhook triggering
 * Add this to your Express app:
 *
 * app.post('/api/v1/webhook/send-stats', requireAuth, requireAdmin, webhookHandler);
 */
async function webhookHandler(req, res) {
  console.log('Manual webhook trigger requested');

  try {
    await aggregateAndSendStats();
    res.json({ success: true, message: 'Stats sent to Social Desk' });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).json({ error: 'Failed to send stats' });
  }
}

// ============================================
// Testing Utilities
// ============================================

/**
 * Test the webhook with sample data (for development)
 */
async function testWebhook() {
  console.log('Testing webhook with sample data...');

  const testPayload = {
    periodStart: new Date(Date.now() - 60 * 60 * 1000),
    periodEnd: new Date(),
    totals: {
      total_posts: 50,
      total_likes: 2500,
      total_views: 45000,
      total_comments: 320,
    },
    top_posts: [
      { post_id: 'test-post-1', views: 5000, likes: 250, comments: 35 },
      { post_id: 'test-post-2', views: 4200, likes: 210, comments: 28 },
    ],
  };

  const success = await sendStatsToSocialDesk(testPayload);
  console.log(`Test webhook result: ${success ? 'SUCCESS' : 'FAILED'}`);
}

/**
 * Verify webhook configuration
 */
function verifyConfiguration() {
  const issues = [];

  if (!config.socialDeskUrl) {
    issues.push('SOCIAL_DESK_INGEST_URL is not set');
  }

  if (!config.webhookSecret) {
    issues.push('SOCIAL_DESK_WEBHOOK_SECRET is not set');
  }

  if (!config.anonKey) {
    issues.push('SOCIAL_DESK_ANON_KEY is not set');
  }

  if (!config.platformId) {
    issues.push('PLATFORM_ID is not set');
  }

  if (issues.length > 0) {
    console.error('Webhook configuration issues:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    return false;
  }

  console.log('Webhook configuration verified ✓');
  return true;
}

// ============================================
// Exports
// ============================================

module.exports = {
  initializeWebhookScheduler,
  aggregateAndSendStats,
  webhookHandler,
  testWebhook,
  verifyConfiguration,
  generateSignature,
};

// ============================================
// Usage Example
// ============================================

/*
// In your main server file (e.g., server.js or index.js):

const webhook = require('./webhook');

// Verify configuration on startup
if (webhook.verifyConfiguration()) {
  // Initialize the scheduler
  webhook.initializeWebhookScheduler();
}

// Optional: Add manual trigger endpoint
app.post('/api/v1/webhook/send-stats',
  requireAuth,
  requireAdmin,
  webhook.webhookHandler
);

// Optional: Test webhook in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    webhook.testWebhook();
  }, 10000); // Test after 10 seconds
}
*/

// ============================================
// Alternative Implementation (FastAPI/Python)
// ============================================

/*
# Python example using FastAPI and APScheduler

import os
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, List
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import func

# Configuration
PLATFORM_ID = os.getenv('PLATFORM_ID', 'fb-dupe')
SOCIAL_DESK_URL = os.getenv('SOCIAL_DESK_INGEST_URL')
WEBHOOK_SECRET = os.getenv('SOCIAL_DESK_WEBHOOK_SECRET')
ANON_KEY = os.getenv('SOCIAL_DESK_ANON_KEY')

def generate_signature(payload: dict, secret: str) -> str:
    """Generate HMAC-SHA256 signature"""
    message = json.dumps(payload).encode('utf-8')
    signature = hmac.new(
        secret.encode('utf-8'),
        message,
        hashlib.sha256
    ).hexdigest()
    return f'sha256={signature}'

async def aggregate_stats(start_date: datetime, end_date: datetime) -> dict:
    """Aggregate statistics from database"""
    # Query your database (SQLAlchemy example)
    from models import Post
    from database import session

    stats = session.query(
        func.count(Post.id).label('total_posts'),
        func.coalesce(func.sum(Post.likes_count), 0).label('total_likes'),
        func.coalesce(func.sum(Post.views_count), 0).label('total_views'),
        func.coalesce(func.sum(Post.comments_count), 0).label('total_comments')
    ).filter(
        Post.created_at >= start_date,
        Post.created_at < end_date
    ).first()

    top_posts = session.query(Post).filter(
        Post.created_at >= start_date,
        Post.created_at < end_date
    ).order_by(Post.views_count.desc()).limit(10).all()

    return {
        'totals': {
            'total_posts': stats.total_posts,
            'total_likes': stats.total_likes,
            'total_views': stats.total_views,
            'total_comments': stats.total_comments
        },
        'top_posts': [
            {
                'post_id': str(post.id),
                'views': post.views_count,
                'likes': post.likes_count,
                'comments': post.comments_count
            }
            for post in top_posts
        ]
    }

async def send_stats_to_social_desk():
    """Send aggregated stats to Social Desk"""
    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)

    stats = await aggregate_stats(one_hour_ago, now)

    payload = {
        'platform': PLATFORM_ID,
        'period_start': one_hour_ago.isoformat() + 'Z',
        'period_end': now.isoformat() + 'Z',
        'totals': stats['totals'],
        'top_k_posts': stats['top_posts']
    }

    signature = generate_signature(payload, WEBHOOK_SECRET)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SOCIAL_DESK_URL,
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'X-Signature': signature,
                'Authorization': f'Bearer {ANON_KEY}'
            }
        )

        if response.status_code == 200:
            print('Stats sent successfully')
        else:
            print(f'Failed to send stats: {response.status_code}')

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    send_stats_to_social_desk,
    'cron',
    hour='*',  # Every hour
    minute=0
)
scheduler.start()
*/
