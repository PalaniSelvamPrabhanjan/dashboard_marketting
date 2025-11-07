import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from 'date-fns';

interface ActivityDay {
  date: string;
  platform: string;
  event_count: number;
  color_code: string;
}

interface CalendarWidgetProps {
  activities: ActivityDay[];
}

export function CalendarWidget({ activities }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasActivity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activities.some(activity => activity.date === dateStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Activity Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 mb-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}

        {daysInMonth.map(day => {
          const isCurrentDay = isToday(day);
          const hasEvent = hasActivity(day);

          return (
            <div
              key={day.toString()}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                isCurrentDay
                  ? 'bg-blue-500 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {hasEvent && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-pink-500"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <span>Activity Day</span>
        </div>
      </div>
    </div>
  );
}
