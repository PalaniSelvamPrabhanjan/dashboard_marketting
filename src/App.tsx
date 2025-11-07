import { useState } from 'react';
import { Heart, Eye, MessageCircle, FileText } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { OverviewChart } from './components/OverviewChart';
import { CalendarWidget } from './components/CalendarWidget';
import { Clock } from './components/Clock';
import { useDashboardData } from './hooks/useDashboardData';

function App() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const { summary, activities, loading, error } = useDashboardData();

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      likes: Math.floor(Math.random() * 50000 + 20000),
      views: Math.floor(Math.random() * 500000 + 100000),
      comments: Math.floor(Math.random() * 10000 + 5000),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your social platforms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Likes"
            value={summary?.totals.likes || 0}
            growth={summary?.growth.likes || 0}
            icon={<Heart size={24} className="text-white" />}
            chartData={summary?.charts.likes || []}
            color="from-pink-500 to-pink-600"
          />
          <StatCard
            title="Total Views"
            value={summary?.totals.views || 0}
            growth={summary?.growth.views || 0}
            icon={<Eye size={24} className="text-white" />}
            chartData={summary?.charts.views || []}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Comments"
            value={summary?.totals.comments || 0}
            growth={summary?.growth.comments || 0}
            icon={<MessageCircle size={24} className="text-white" />}
            chartData={summary?.charts.comments || []}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Total Posts"
            value={summary?.totals.posts || 0}
            growth={summary?.growth.posts || 0}
            icon={<FileText size={24} className="text-white" />}
            chartData={summary?.charts.posts || []}
            color="from-green-500 to-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <OverviewChart data={generateMonthlyData()} />
          </div>
          <div className="space-y-6">
            <CalendarWidget activities={activities} />
            <Clock />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
