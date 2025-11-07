import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <ClockIcon size={20} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Current Time</h3>
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold text-gray-800 mb-2">
          {format(time, 'HH:mm:ss')}
        </p>
        <p className="text-sm text-gray-500">
          {format(time, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}
