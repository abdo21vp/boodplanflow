import React from 'react';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  Plus, 
  Trash2, 
  RotateCcw
} from 'lucide-react';
import { 
  WeeklyGoal, 
  DailyHabit, 
  DayCounter, 
  ScheduleBlock, 
  DomainCategory 
} from '../types/schedule';
import { getTodayDateString } from '../services/storage';

interface GoalsViewProps {
  goals: WeeklyGoal[];
  habits: DailyHabit[];
  counters: DayCounter[];
  blocks: ScheduleBlock[];
  domains: DomainCategory[];
  onUpdateGoals: (goals: WeeklyGoal[]) => void;
  onUpdateHabits: (habits: DailyHabit[]) => void;
  onUpdateCounters: (counters: DayCounter[]) => void;
  onOpenAddGoal: () => void;
  onOpenAddHabit: () => void;
  onOpenAddCounter: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  habits,
  counters,
  blocks,
  domains,
  onUpdateGoals,
  onUpdateHabits,
  onUpdateCounters,
  onOpenAddGoal,
  onOpenAddHabit,
  onOpenAddCounter,
}) => {
  const todayStr = getTodayDateString();
  const domainMap = new Map(domains.map((d) => [d.id, d]));

  // Calculate actual hours scheduled per domain
  const domainScheduledHours: Record<string, number> = {};
  blocks.forEach((b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const duration = Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
    domainScheduledHours[b.domainId] = (domainScheduledHours[b.domainId] || 0) + duration;
  });

  const handleToggleHabit = (habitId: string) => {
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const isCurrentlyDone = Boolean(h.completedDays[todayStr]);
      const nextDone = !isCurrentlyDone;
      const nextDays = { ...h.completedDays, [todayStr]: nextDone };
      const nextStreak = nextDone ? h.streak + 1 : Math.max(0, h.streak - 1);
      return {
        ...h,
        completedDays: nextDays,
        streak: nextStreak,
      };
    });
    onUpdateHabits(updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    onUpdateHabits(habits.filter((h) => h.id !== habitId));
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdateGoals(goals.filter((g) => g.id !== goalId));
  };

  const handleIncrementStreak = (counterId: string) => {
    onUpdateCounters(
      counters.map((c) =>
        c.id === counterId ? { ...c, currentStreak: (c.currentStreak || 0) + 1 } : c
      )
    );
  };

  const handleResetStreak = (counterId: string) => {
    if (confirm('Reset this streak to 0?')) {
      onUpdateCounters(
        counters.map((c) => (c.id === counterId ? { ...c, currentStreak: 0 } : c))
      );
    }
  };

  const handleDeleteCounter = (counterId: string) => {
    onUpdateCounters(counters.filter((c) => c.id !== counterId));
  };

  const calculateDaysRemaining = (targetDateStr?: string) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  let totalTargetHours = 0;
  let totalCompletedHours = 0;
  goals.forEach((g) => {
    totalTargetHours += g.targetHours;
    const actual = domainScheduledHours[g.domainId] || 0;
    totalCompletedHours += Math.min(g.targetHours, actual);
  });
  const overallPercentage = totalTargetHours > 0 ? Math.round((totalCompletedHours / totalTargetHours) * 100) : 0;

  return (
    <div className="flex-1 space-y-5 max-w-7xl mx-auto w-full pb-10">
      
      {/* ─── SECTION 1: GOALS & TARGET HOURS ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Goals & Target Hours</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {overallPercentage}% completed
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenAddGoal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target</span>
          </button>
        </div>

        {/* Overall Completion Bar (Clean minimal style) */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Weekly Target Fulfillment
            </span>
            <span className="text-slate-900 dark:text-white font-mono font-semibold">
              {totalCompletedHours.toFixed(1)} / {totalTargetHours}h ({overallPercentage}%)
            </span>
          </div>

          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Goals Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {goals.map((goal) => {
            const domain = domainMap.get(goal.domainId);
            const color = domain?.color || '#475569';
            const actualHours = domainScheduledHours[goal.domainId] || 0;
            const percent = goal.targetHours > 0 ? Math.min(100, Math.round((actualHours / goal.targetHours) * 100)) : 0;
            const isCompleted = actualHours >= goal.targetHours;

            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percent / 100) * circumference;

            return (
              <div
                key={goal.id}
                className="group relative p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {goal.title}
                    </h4>
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500 font-mono">
                    {actualHours.toFixed(1)}h / {goal.targetHours}h
                  </div>

                  <div className="mt-1.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      {isCompleted ? '✓ Reached' : `${(goal.targetHours - actualHours).toFixed(1)}h left`}
                    </span>
                  </div>
                </div>

                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90 transform">
                    <circle
                      cx="24"
                      cy="24"
                      r={radius}
                      className="stroke-slate-100 dark:stroke-slate-700/60"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r={radius}
                      stroke={color}
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold font-mono text-slate-700 dark:text-slate-200">
                    {percent}%
                  </span>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 transition"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 2: DUAL DAY COUNTERS ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Streaks & Countdowns
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenAddCounter}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Counter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {counters.map((counter) => {
            const isStreak = counter.type === 'streak';
            const daysLeft = !isStreak ? calculateDaysRemaining(counter.targetDate) : 0;

            return (
              <div
                key={counter.id}
                className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{counter.emoji || (isStreak ? '🔥' : '⏳')}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                      {isStreak ? 'Streak' : 'Countdown'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-2.5">
                    {counter.title}
                  </h4>
                </div>

                <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                      {isStreak ? counter.currentStreak || 0 : Math.max(0, daysLeft)}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      {isStreak ? 'days' : 'days left'}
                    </span>
                  </div>

                  {isStreak ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleIncrementStreak(counter.id)}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleResetStreak(counter.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Reset"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {counter.targetDate}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteCounter(counter.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 3: DAILY HABITS ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Daily Habits
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenAddHabit}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {habits.map((habit) => {
            const isDoneToday = Boolean(habit.completedDays[todayStr]);

            return (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`group p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isDoneToday
                    ? 'border-emerald-300/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div className="flex-shrink-0">
                    {isDoneToday ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-xs font-medium block truncate ${
                        isDoneToday
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {habit.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {habit.streak > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {habit.streak}d
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHabit(habit.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
