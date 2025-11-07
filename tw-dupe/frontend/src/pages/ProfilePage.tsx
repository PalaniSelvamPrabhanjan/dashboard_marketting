import { Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Twitter size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Page</h2>
        <p className="text-gray-600 mb-6">This feature is coming soon!</p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          Back to Feed
        </Link>
      </div>
    </div>
  );
}
