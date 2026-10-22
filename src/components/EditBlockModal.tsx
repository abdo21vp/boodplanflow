import React, { useState, useEffect } from 'react';
import { X, Clock, Trash2, Calendar, FileText, Check } from 'lucide-react';
import { DayOfWeek, DAYS_OF_WEEK, DomainCategory, ScheduleBlock } from '../types/schedule';

interface EditBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  block?: ScheduleBlock | null;
  defaultDay?: DayOfWeek;
  defaultStartTime?: string;
  domains: DomainCategory[];
  onSave: (block: ScheduleBlock) => void;
  onDelete?: (blockId: string) => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({
  isOpen,
  onClose,
  block,
  defaultDay = 'Monday',
  defaultStartTime = '09:00',
  domains,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [domainId, setDomainId] = useState('academic');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setDomainId(block.domainId);
      setDay(block.day);
      setStartTime(block.startTime);
      setEndTime(block.endTime);
      setNotes(block.notes || '');
    } else {
      setTitle('');
      setDomainId(domains[0]?.id || 'academic');
      setDay(defaultDay);
      setStartTime(defaultStartTime);
      // Default end time 1 hour later
      const [h, m] = defaultStartTime.split(':').map(Number);
      const endH = Math.min(23, h + 1);
      setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      setNotes('');
    }
  }, [block, defaultDay, defaultStartTime, domains]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: ScheduleBlock = {
      id: block?.id || `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      domainId,
      day,
      startTime,
      endTime,
      notes: notes.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  const setDuration = (durationMinutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const endH = Math.min(23, Math.floor(totalMin / 60));
    const endM = totalMin % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {block ? 'Edit Schedule Event' : 'New Schedule Event'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure routine details, timing, and domain category
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Computer Systems Lecture, Morning Gym, Grocery Shopping"
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Domain Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Domain Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {domains.map((dom) => {
                const isSelected = domainId === dom.id;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setDomainId(dom.id)}
                    className={`flex items-center space-x-2 p-2 rounded-xl text-left border text-xs font-medium transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dom.color }}
                    />
                    <span className="truncate">{dom.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <span className="font-medium mr-1">Quick duration:</span>
            {[30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes & Location (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Room 304, bring gym towel, read chapter 4 beforehand"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {block && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(block.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Event</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
