import { DayOfWeek, DAYS_OF_WEEK, DomainId, ParsedGoalPlan, ScheduleBlock } from '../types/schedule';

interface TimeMatch {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

// Convert "9am", "9:30am", "14:00", "2pm" to "HH:mm"
function normalizeTime(raw: string): string | null {
  const clean = raw.trim().toLowerCase();
  
  // Format: 14:30 or 09:15
  const match24 = clean.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const h = match24[1].padStart(2, '0');
    return `${h}:${match24[2]}`;
  }

  // Format: 9:30am / 2:15pm
  const match12 = clean.match(/^(\d{1,2})(?::([0-5][0-9]))?\s*(am|pm)$/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2] ? match12[2] : '00';
    const isPm = match12[3] === 'pm';
    
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  // Simple number like "9" or "10"
  const matchNum = clean.match(/^(\d{1,2})$/);
  if (matchNum) {
    let h = parseInt(matchNum[1], 10);
    if (h >= 1 && h <= 7) h += 12; // Assume afternoon if 1-7
    return `${String(h).padStart(2, '0')}:00`;
  }

  return null;
}

// Extract time ranges like "9am to 12pm", "07:00 - 8:30am", "1pm to 3:30pm"
function extractTimeRange(text: string): TimeMatch | null {
  // Regex for ranges
  const rangeRegex = /(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|–|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const match = text.match(rangeRegex);
  if (match) {
    let rawStart = match[1];
    let rawEnd = match[2];

    // If start has no am/pm but end does, borrow it (e.g. 10 to 12pm -> 10am to 12pm or 2 to 4pm -> 2pm to 4pm)
    const endHasAm = /am/i.test(rawEnd);
    const endHasPm = /pm/i.test(rawEnd);
    if (!/am|pm/i.test(rawStart)) {
      if (endHasAm) rawStart += 'am';
      else if (endHasPm) {
        // if start hour is larger than end hour (e.g. 11 to 2pm), start is am
        const startNum = parseInt(rawStart, 10);
        const endNum = parseInt(rawEnd, 10);
        if (startNum > endNum && startNum <= 12) {
          rawStart += 'am';
        } else {
          rawStart += 'pm';
        }
      }
    }

    const start = normalizeTime(rawStart);
    const end = normalizeTime(rawEnd);

    if (start && end && start < end) {
      return { start, end };
    }
  }

  // Check for duration (e.g., "2 hours on Monday afternoon")
  const durationMatch = text.match(/(\d+)\s*(?:hours|hr|hrs)/i);
  if (durationMatch) {
    const hours = parseInt(durationMatch[1], 10) || 1;
    if (/morning/i.test(text)) {
      return { start: '09:00', end: `${String(9 + hours).padStart(2, '0')}:00` };
    } else if (/afternoon/i.test(text)) {
      return { start: '14:00', end: `${String(14 + hours).padStart(2, '0')}:00` };
    } else if (/evening/i.test(text)) {
      return { start: '19:00', end: `${String(19 + hours).padStart(2, '0')}:00` };
    }
  }

  return null;
}

// Identify which days of the week are mentioned in text
function extractDays(text: string): DayOfWeek[] {
  const lower = text.toLowerCase();
  const days: DayOfWeek[] = [];

  if (lower.includes('everyday') || lower.includes('daily') || lower.includes('every day')) {
    return [...DAYS_OF_WEEK];
  }
  if (lower.includes('weekday') || lower.includes('weekdays') || lower.includes('mon-fri') || lower.includes('mon to fri')) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }
  if (lower.includes('weekend') || lower.includes('weekends') || lower.includes('sat-sun') || lower.includes('sat and sun')) {
    return ['Saturday', 'Sunday'];
  }

  const dayPatterns: { day: DayOfWeek; regex: RegExp }[] = [
    { day: 'Monday', regex: /\b(mon|monday|mondays)\b/i },
    { day: 'Tuesday', regex: /\b(tue|tues|tuesday|tuesdays)\b/i },
    { day: 'Wednesday', regex: /\b(wed|wednesday|wednesdays)\b/i },
    { day: 'Thursday', regex: /\b(thu|thur|thurs|thursday|thursdays)\b/i },
    { day: 'Friday', regex: /\b(fri|friday|fridays)\b/i },
    { day: 'Saturday', regex: /\b(sat|saturday|saturdays)\b/i },
    { day: 'Sunday', regex: /\b(sun|sunday|sundays)\b/i },
  ];

  for (const { day, regex } of dayPatterns) {
    if (regex.test(lower)) {
      days.push(day);
    }
  }

  return days;
}

// Categorize into domain based on keywords
function detectDomain(text: string): DomainId {
  const lower = text.toLowerCase();

  // Academic
  if (/\b(study|lecture|class|classes|lab|exam|university|school|homework|math|science|physics|chemistry|history|paper|seminar|course|reading)\b/i.test(lower)) {
    return 'academic';
  }
  // Fitness
  if (/\b(gym|workout|lift|weights|cardio|running|jog|run|jogging|fitness|yoga|pilates|stretching|swimming|cycle|cycling|hiit|exercise)\b/i.test(lower)) {
    return 'fitness';
  }
  // Secular / Daily living
  if (/\b(grocery|groceries|clean|cleaning|laundry|chores|meal prep|cook|cooking|commute|transit|breakfast|lunch|dinner|errands|dishes|apartment|reset)\b/i.test(lower)) {
    return 'secular';
  }
  // Work
  if (/\b(work|job|code|coding|development|meeting|standup|sprint|office|project|client|shift|venture|freelance)\b/i.test(lower)) {
    return 'work';
  }
  // Sleep
  if (/\b(sleep|bed|nap|rest|night)\b/i.test(lower)) {
    return 'sleep';
  }
  // Personal
  return 'personal';
}

function cleanTitle(text: string): string {
  // Remove day names, time ranges, and prefixes like "- Academic:" or "•"
  return text
    .replace(/^[-•*#\s\d.)]+/, '')
    .replace(/^(academic|fitness|secular|work|personal|goals?|schedule):\s*/i, '')
    .replace(/(?:from\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:to|-|–)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?/ig, '')
    .replace(/\b(on|at|every)\s+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays|weekends)\b/ig, '')
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:,?\s*(?:and|&)?\s*)?/ig, '')
    .trim()
    .replace(/^[:\s,-]+|[:\s,-]+$/g, '')
    .slice(0, 50) || 'Scheduled Activity';
}

/**
 * Intelligent Offline Parser for weekly routine text.
 * Requires zero API keys and works 100% locally.
 */
export function parseGoalsOffline(text: string): ParsedGoalPlan {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const blocks: ScheduleBlock[] = [];
  const conflicts: string[] = [];
  let currentDomain: DomainId = 'secular';

  lines.forEach((line, idx) => {
    // Check if line is a domain header
    if (/^#*\s*(academic|study|university)/i.test(line)) {
      currentDomain = 'academic';
      return;
    }
    if (/^#*\s*(fitness|gym|health|workout)/i.test(line)) {
      currentDomain = 'fitness';
      return;
    }
    if (/^#*\s*(secular|daily life|routine|chores|home)/i.test(line)) {
      currentDomain = 'secular';
      return;
    }
    if (/^#*\s*(work|projects?|career|office)/i.test(line)) {
      currentDomain = 'work';
      return;
    }
    if (/^#*\s*(personal|leisure|mindfulness|hobbies)/i.test(line)) {
      currentDomain = 'personal';
      return;
    }

    // Extract sub-clauses if bullet contains multiple activities (e.g. split by semicolon or periods)
    const sentences = line.split(/[;.]\s+/).filter(s => s.trim().length > 3);

    sentences.forEach((sentence) => {
      const timeRange = extractTimeRange(sentence);
      const days = extractDays(sentence);
      const domain = detectDomain(sentence) || currentDomain;
      const title = cleanTitle(sentence);

      if (timeRange && days.length > 0) {
        days.forEach(day => {
          // Check for conflicts on this day
          const overlap = blocks.find(b => b.day === day && (
            (timeRange.start >= b.startTime && timeRange.start < b.endTime) ||
            (timeRange.end > b.startTime && timeRange.end <= b.endTime) ||
            (timeRange.start <= b.startTime && timeRange.end >= b.endTime)
          ));

          if (overlap) {
            conflicts.push(`Potential overlap on ${day}: "${title}" (${timeRange.start}-${timeRange.end}) clashes with "${overlap.title}" (${overlap.startTime}-${overlap.endTime})`);
          }

          blocks.push({
            id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            domainId: domain,
            day,
            startTime: timeRange.start,
            endTime: timeRange.end,
            notes: sentence,
            isAiGenerated: true,
          });
        });
      }
    });
  });

  // Calculate estimated hours per domain
  const domainHoursMap: Record<string, number> = {};
  blocks.forEach(b => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const duration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    domainHoursMap[b.domainId] = (domainHoursMap[b.domainId] || 0) + Math.max(0, duration);
  });

  const domainNames: Record<string, string> = {
    academic: 'Academic & Learning',
    fitness: 'Fitness & Health',
    secular: 'Secular & Daily Life',
    work: 'Work & Projects',
    personal: 'Personal & Mindfulness',
    sleep: 'Rest & Sleep',
  };

  const detectedDomains = Object.entries(domainHoursMap).map(([id, hours]) => ({
    id,
    name: domainNames[id] || id,
    estimatedHours: Math.round(hours * 10) / 10,
  }));

  return {
    summary: `Extracted ${blocks.length} weekly routine blocks across ${detectedDomains.length} domains.`,
    reasoning: 'Extracted using local heuristic NLP parser. Days, time blocks, and domain categorizations were identified and slotted onto the 7-day grid.',
    detectedDomains,
    blocks,
    conflicts,
  };
}
