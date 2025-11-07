import { useState, useEffect } from 'react';

interface DashboardSummary {
  totals: {
    likes: number;
    views: number;
    comments: number;
    posts: number;
  };
  growth: {
    likes: number;
    views: number;
    comments: number;
    posts: number;
  };
  charts: {
    likes: number[];
    views: number[];
    comments: number[];
    posts: number[];
  };
}

interface Activity {
  date: string;
  platform: string;
  event_count: number;
  color_code: string;
}

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

        const [summaryRes, calendarRes] = await Promise.all([
          fetch(`${supabaseUrl}/functions/v1/dashboard-summary`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }),
          fetch(`${supabaseUrl}/functions/v1/dashboard-calendar`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }),
        ]);

        if (!summaryRes.ok || !calendarRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const summaryData = await summaryRes.json();
        const calendarData = await calendarRes.json();

        setSummary(summaryData);
        setActivities(calendarData.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { summary, activities, loading, error };
}
