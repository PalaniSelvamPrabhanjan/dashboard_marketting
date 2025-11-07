import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

interface TweetCardProps {
  tweet: Tweet;
  onUpdate: () => void;
}

export function TweetCard({ tweet, onUpdate }: TweetCardProps) {
  const { token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likes_count);

  useEffect(() => {
    trackView();
  }, []);

  const trackView = async () => {
    try {
      await fetch(`${API_BASE}/tw-engagement/${tweet.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await fetch(`${API_BASE}/tw-engagement/${tweet.id}/like`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await fetch(`${API_BASE}/tw-engagement/${tweet.id}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white p-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {tweet.tw_users.username[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">{tweet.tw_users.username}</span>
            <span className="text-gray-500 text-sm">@{tweet.tw_users.username}</span>
            <span className="text-gray-500 text-sm">· {formatDate(tweet.created_at)}</span>
          </div>

          <p className="text-gray-900 mb-3 whitespace-pre-wrap break-words">{tweet.content}</p>

          <div className="flex items-center gap-6 text-gray-500">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 hover:text-pink-500 transition-colors group"
            >
              <Heart
                size={18}
                className={`${isLiked ? 'fill-pink-500 text-pink-500' : 'group-hover:fill-pink-100'}`}
              />
              <span className="text-sm">{formatNumber(likesCount)}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
              <MessageCircle size={18} className="group-hover:fill-blue-100" />
              <span className="text-sm">{formatNumber(tweet.comments_count)}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
              <Repeat2 size={18} />
              <span className="text-sm">{formatNumber(tweet.retweets_count)}</span>
            </button>

            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span className="text-sm">{formatNumber(tweet.views_count)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
