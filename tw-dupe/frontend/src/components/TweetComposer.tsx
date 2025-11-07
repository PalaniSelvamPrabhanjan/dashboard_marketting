import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_TW_API_URL || 'https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1';

interface TweetComposerProps {
  onTweetCreated: () => void;
}

export function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 280) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/tw-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post tweet');
      }

      setContent('');
      onTweetCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full px-3 py-2 text-lg border-0 focus:ring-0 resize-none"
        rows={3}
      />

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isOverLimit ? 'text-red-500' : charCount > 260 ? 'text-yellow-500' : 'text-gray-500'
            }`}
          >
            {charCount}/280
          </span>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim() || isOverLimit}
          className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Tweet'}
        </button>
      </div>
    </form>
  );
}
