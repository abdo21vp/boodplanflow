export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export type DomainId = 'academic' | 'fitness' | 'secular' | 'work' | 'personal' | 'sleep' | string;

export interface DomainCategory {
  id: DomainId;
  name: string;
  color: string;          // Hex color (e.g. #4f46e5)
  bgColor: string;        // Light mode background class/hex
  darkBgColor: string;    // Dark mode background class/hex
  borderColor: string;    // Border color class/hex
  textColor: string;      // Text color
  icon: string;           // Icon name
  description: string;
  visible: boolean;       // Layer toggle (like Google Calendar)
}

export interface ScheduleBlock {
  id: string;
  title: string;
  domainId: DomainId;
  day: DayOfWeek;
  startTime: string;      // "HH:mm" in 24h format (e.g. "09:00")
  endTime: string;        // "HH:mm" in 24h format (e.g. "10:30")
  notes?: string;
  location?: string;
  isAiGenerated?: boolean;
}

export interface ScheduleProfile {
  id: string;
  name: string;
  description: string;
  blocks: ScheduleBlock[];
}

export interface AppSettings {
  startHour: number;      // e.g. 6 (06:00)
  endHour: number;        // e.g. 23 (23:00)
  timeStepMinutes: number;// 30
  darkMode: boolean;
  geminiApiKey?: string;
  geminiModel?: string;
}

export interface ParsedGoalPlan {
  summary: string;
  reasoning: string;
  detectedDomains: { id: string; name: string; estimatedHours: number }[];
  blocks: ScheduleBlock[];
  conflicts: string[];
}

// ─── GOALS SYSTEM & VISUAL CHARTS ──────────────────────────────────────────

export interface WeeklyGoal {
  id: string;
  title: string;
  domainId: DomainId;
  targetHours: number;
}

// ─── DAILY HABITS & CHECKMARKS ─────────────────────────────────────────────

export interface DailyHabit {
  id: string;
  title: string;
  category: string;
  completedDays: Record<string, boolean>; // key is ISO date 'YYYY-MM-DD'
  streak: number;
}

// ─── HABIT STREAKS & EVENT COUNTDOWNS ──────────────────────────────────────

export interface DayCounter {
  id: string;
  title: string;
  type: 'streak' | 'countdown';
  // For streak:
  startDate?: string;       // 'YYYY-MM-DD'
  currentStreak?: number;
  // For countdown:
  targetDate?: string;      // 'YYYY-MM-DD'
  emoji?: string;
}
