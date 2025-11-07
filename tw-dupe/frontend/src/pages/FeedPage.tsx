import { useState, useEffect } from 'react';
import { Twitter, Heart, MessageCircle, Repeat2, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TweetCard } from '../components/TweetCard';
import { TweetComposer } from '../components/TweetComposer';

const API_BASE = import.meta.env.VITE_TW_API_URL || 'https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1';

interface Tweet {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  views_count: number;
  comments_count: number;
  retweets_count: number;
  tw_users: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export function FeedPage() {
  const { user, token, logout } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTweets = async () => {
    try {
      const response = await fetch(`${API_BASE}/tw-posts?page=1&limit=20`);
      if (!response.ok) throw new Error('Failed to load tweets');
      const data = await response.json();
      setTweets(data.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTweets();
  }, []);

  const handleTweetCreated = () => {
    loadTweets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Twitter size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">tw-dupe</h1>
                <p className="text-sm text-gray-500">@{user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white">
          <TweetComposer onTweetCreated={handleTweetCreated} />
        </div>

        <div className="divide-y divide-gray-200">
          {loading && (
            <div className="bg-white p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading tweets...</p>
            </div>
          )}

          {error && (
            <div className="bg-white p-4">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && tweets.length === 0 && (
            <div className="bg-white p-8 text-center">
              <p className="text-gray-500">No tweets yet. Be the first to tweet!</p>
            </div>
          )}

          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} onUpdate={loadTweets} />
          ))}
        </div>
      </div>
    </div>
  );
}
