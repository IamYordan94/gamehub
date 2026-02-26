import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodayDateStr } from '../utils/dailySeed';
import { getLetterMixCompletedFor } from '../utils/storage';

const LEVELS = ['easy', 'medium', 'hard'] as const;

const FIRST_PUZZLE_DATE = '2025-01-01';

export default function LetterMixCalendar() {
  const todayStr = getTodayDateStr();
  const todayDate = new Date(todayStr + 'T00:00:00'); // local midnight, for initial month/year
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateAvailable = (day: number): boolean => {
    const dateStr = getDateStr(day);
    return dateStr >= FIRST_PUZZLE_DATE && dateStr <= todayStr;
  };

  const getDateStr = (day: number): string => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const hasCompletedPuzzle = (day: number): boolean => {
    if (!isDateAvailable(day)) return false;
    const dateStr = getDateStr(day);
    return LEVELS.some(level => {
      const completed = getLetterMixCompletedFor(dateStr, level);
      return completed !== undefined;
    });
  };

  const days = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getDateStr(day);
    const available = isDateAvailable(day);
    const completed = hasCompletedPuzzle(day);
    const isToday = dateStr === todayStr;

    days.push(
      <div key={day} className="aspect-square">
        {available ? (
          <Link
            to={`/lettermix/play/${dateStr}/easy`}
            className={`w-full h-full flex items-center justify-center rounded-lg border transition-colors ${
              isToday
                ? 'border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] font-bold'
                : completed
                ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20'
                : 'border-[#1e3a5f] bg-[#0f172a] text-[#e2e8f0] hover:bg-[#1e3a5f]'
            }`}
          >
            {day}
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64748b]">
            {day}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#22d3ee]">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:bg-[#1e3a5f]"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[#e2e8f0] font-medium min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg border border-[#1e3a5f] text-[#94a3b8] hover:bg-[#1e3a5f]"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="text-sm text-[#94a3b8] space-y-1">
        <p>Click a date to play that day's puzzle.</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#22d3ee] bg-[#22d3ee]/20"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#10b981] bg-[#10b981]/10"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#1e3a5f] bg-[#0f172a]"></div>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-[#1e3a5f] bg-[#0f172a]/50 p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-[#64748b] py-2">
              {day}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    </div>
  );
}
