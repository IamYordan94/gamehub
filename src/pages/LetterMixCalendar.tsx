import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodayDateStr } from '../utils/dailySeed';
import { getLetterMixCompletedFor } from '../utils/storage';

const LEVELS = ['easy', 'medium', 'hard'] as const;
const FIRST_PUZZLE_DATE = '2025-01-01';

export default function LetterMixCalendar() {
  const todayStr = getTodayDateStr();
  const todayDate = new Date(todayStr + 'T00:00:00');
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [selectedLevel, setSelectedLevel] = useState<(typeof LEVELS)[number]>('easy');

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const isCurrentMonth =
    currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear();

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return; // Can't go past today's month
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDateStr = (day: number): string => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isDateAvailable = (day: number): boolean => {
    const dateStr = getDateStr(day);
    return dateStr >= FIRST_PUZZLE_DATE && dateStr <= todayStr;
  };

  const hasCompletedPuzzle = (day: number): boolean => {
    if (!isDateAvailable(day)) return false;
    const dateStr = getDateStr(day);
    return LEVELS.some(level => getLetterMixCompletedFor(dateStr, level) !== undefined);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getDateStr(day);
    const available = isDateAvailable(day);
    const completed = hasCompletedPuzzle(day);
    const isToday = dateStr === todayStr;

    days.push(
      <div key={day} className="aspect-square">
        {available ? (
          <Link
            to={`/lettermix/play/${dateStr}/${selectedLevel}`}
            className={`w-full h-full flex items-center justify-center rounded-lg border text-sm transition-colors ${
              isToday
                ? 'border-[#60a5fa] bg-[#60a5fa]/20 text-[#60a5fa] font-bold'
                : completed
                ? 'border-[#34d399] bg-[#34d399]/10 text-[#34d399] hover:bg-[#34d399]/20'
                : 'border-[#2a2a38] bg-[#1a1a24] text-[#e8e9ed] hover:bg-[#2a2a38]'
            }`}
          >
            {day}
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#64748b] text-sm">
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
            disabled={isCurrentMonth}
            className="p-2 rounded-lg border border-[#2a2a38] text-[#9ca3af] hover:bg-[#2a2a38] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#64748b] font-medium uppercase tracking-wider">Open as:</span>
        <div className="flex gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                lvl === selectedLevel
                  ? 'bg-[#60a5fa] text-[#0f0f1a]'
                  : 'border border-[#3a3a48] text-[#9ca3af] hover:border-[#60a5fa]/50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-[#94a3b8] space-y-1">
        <p>Click a date to play that day&apos;s puzzle.</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#60a5fa] bg-[#60a5fa]/20" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#10b981] bg-[#10b981]/10" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#2a2a38] bg-[#1a1a24]" />
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24]/50 p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-[#64748b] py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    </div>
  );
}
