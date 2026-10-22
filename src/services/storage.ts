import { DomainCategory, ScheduleBlock, AppSettings, WeeklyGoal, DailyHabit, DayCounter } from '../types/schedule';
import { DEFAULT_DOMAINS, DEFAULT_BLOCKS } from '../data/defaultSchedule';

const STORAGE_KEYS = {
  BLOCKS: 'planflow_schedule_blocks',
  DOMAINS: 'planflow_domains',
  SETTINGS: 'planflow_settings',
  GOALS: 'planflow_weekly_goals',
  HABITS: 'planflow_daily_habits',
  COUNTERS: 'planflow_day_counters',
};

export const DEFAULT_SETTINGS: AppSettings = {
  startHour: 6,
  endHour: 23,
  timeStepMinutes: 30,
  darkMode: false,
  geminiModel: 'gemini-1.5-flash',
};

export const DEFAULT_GOALS: WeeklyGoal[] = [
  { id: 'g1', title: 'Al-Azhar CS & Studies', domainId: 'academic', targetHours: 20 },
  { id: 'g2', title: 'Gym & Fitness Sessions', domainId: 'fitness', targetHours: 4 },
  { id: 'g3', title: 'Daily Living & Routine', domainId: 'secular', targetHours: 8 },
  { id: 'g4', title: 'Deep Work & Coding', domainId: 'work', targetHours: 10 },
  { id: 'g5', title: 'Masjid, Sharii & Quran', domainId: 'personal', targetHours: 8 },
];

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export const DEFAULT_HABITS: DailyHabit[] = [
  { id: 'h1', title: 'Morning Adhkar & Fajr', category: 'Spiritual', completedDays: {}, streak: 5 },
  { id: 'h2', title: 'Read 10 pages of a book', category: 'Learning', completedDays: {}, streak: 3 },
  { id: 'h3', title: 'Drink 3L of water', category: 'Health', completedDays: {}, streak: 7 },
  { id: 'h4', title: 'Solve 1 Coding Problem', category: 'CS & Career', completedDays: {}, streak: 4 },
];

export const DEFAULT_COUNTERS: DayCounter[] = [
  {
    id: 'c1',
    title: 'No phone in bed before sleep',
    type: 'streak',
    currentStreak: 14,
    emoji: '🔥',
    startDate: '2026-10-07',
  },
  {
    id: 'c2',
    title: 'Days till Midterm Exams',
    type: 'countdown',
    targetDate: '2026-11-15',
    emoji: '⏳',
  },
  {
    id: 'c3',
    title: 'Gym consistency streak',
    type: 'streak',
    currentStreak: 8,
    emoji: '💪',
    startDate: '2026-10-13',
  },
];

export function loadScheduleBlocks(): ScheduleBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load blocks from localStorage', e);
  }
  return DEFAULT_BLOCKS;
}

export function saveScheduleBlocks(blocks: ScheduleBlock[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  } catch (e) {
    console.error('Failed to save blocks to localStorage', e);
  }
}

export function loadDomains(): DomainCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOMAINS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load domains from localStorage', e);
  }
  return DEFAULT_DOMAINS;
}

export function saveDomains(domains: DomainCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOMAINS, JSON.stringify(domains));
  } catch (e) {
    console.error('Failed to save domains to localStorage', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadWeeklyGoals(): WeeklyGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load goals from localStorage', e);
  }
  return DEFAULT_GOALS;
}

export function saveWeeklyGoals(goals: WeeklyGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals to localStorage', e);
  }
}

export function loadDailyHabits(): DailyHabit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load habits from localStorage', e);
  }
  return DEFAULT_HABITS;
}

export function saveDailyHabits(habits: DailyHabit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits to localStorage', e);
  }
}

export function loadDayCounters(): DayCounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load counters from localStorage', e);
  }
  return DEFAULT_COUNTERS;
}

export function saveDayCounters(counters: DayCounter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  } catch (e) {
    console.error('Failed to save counters to localStorage', e);
  }
}
