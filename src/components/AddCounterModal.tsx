import React, { useState } from 'react';
import { X, Flame, Clock, Check } from 'lucide-react';
import { DayCounter } from '../types/schedule';
import { getTodayDateString } from '../services/storage';

interface AddCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (counter: DayCounter) => void;
}

export const AddCounterModal: React.FC<AddCounterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'streak' | 'countdown'>('streak');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [emoji, setEmoji] = useState('🔥');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'streak') {
      onSave({
        id: `c-${Date.now()}`,
        title: title.trim(),
        type: 'streak',
        currentStreak: Number(currentStreak),
        startDate: getTodayDateString(),
        emoji: emoji || '🔥',
      });
    } else {
      if (!targetDate) return;
      onSave({
        id: `c-${Date.now()}`,
        title: title.trim(),
        type: 'countdown',
        targetDate,
        emoji: emoji || '⏳',
      });
    }

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {type === 'streak' ? (
              <Flame className="w-5 h-5 text-amber-500" />
            ) : (
              <Clock className="w-5 h-5 text-indigo-500" />
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add Day Counter
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Type Selector Tabs */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Counter Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setType('streak'); setEmoji('🔥'); }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 border transition ${
                  type === 'streak'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🔥 Streak (Habit)</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('countdown'); setEmoji('⏳'); }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 border transition ${
                  type === 'countdown'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>⏳ Countdown (Event)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'streak' ? 'e.g., No phone in bed, Gym consistency' : 'e.g., Days till Midterm Exams'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Type-specific inputs */}
          {type === 'streak' ? (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Starting Streak (Days)
              </label>
              <input
                type="number"
                min="0"
                value={currentStreak}
                onChange={(e) => setCurrentStreak(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Emoji Icon
            </label>
            <div className="flex items-center space-x-2">
              {['🔥', '⏳', '💪', '📚', '🌙', '💻', '⭐'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition ${
                    emoji === e ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Counter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
