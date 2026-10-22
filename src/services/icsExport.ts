import { ScheduleBlock, DomainCategory } from '../types/schedule';

const DAY_TO_ICS_CODE: Record<string, string> = {
  Monday: 'MO',
  Tuesday: 'TU',
  Wednesday: 'WE',
  Thursday: 'TH',
  Friday: 'FR',
  Saturday: 'SA',
  Sunday: 'SU',
};

const DAY_INDEX: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Format Date to iCal UTC format: YYYYMMDDTHHmmssZ
function formatIcsDateTime(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

// Format local date to iCal local floating format: YYYYMMDDTHHmmss
function formatIcsLocal(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

export function generateIcsCalendar(
  blocks: ScheduleBlock[],
  domains: DomainCategory[],
  calendarName = 'Weekly Master Routine'
): string {
  const domainMap = new Map<string, string>(domains.map(d => [d.id, d.name]));

  // Find the date of the next/current Monday
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = (1 - currentDay + 7) % 7;
  const baseMonday = new Date(now);
  baseMonday.setDate(now.getDate() + distanceToMonday);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanFlow//Weekly Schedule Architect//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
  ];

  blocks.forEach((block) => {
    const dayCode = DAY_TO_ICS_CODE[block.day];
    if (!dayCode) return;

    // Calculate base date for this day of week
    const targetDayOffset = (DAY_INDEX[block.day] - 1 + 7) % 7;
    const eventDate = new Date(baseMonday);
    eventDate.setDate(baseMonday.getDate() + targetDayOffset);

    const [startH, startM] = block.startTime.split(':').map(Number);
    const [endH, endM] = block.endTime.split(':').map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endH, endM, 0, 0);

    const domainName = domainMap.get(block.domainId) || block.domainId;
    const createdStamp = formatIcsDateTime(new Date());
    const uid = `${block.id}-${block.day.toLowerCase()}@planflow.app`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${createdStamp}`,
      `SUMMARY:${block.title.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(block.notes || `Domain: ${domainName}`).replace(/\n/g, '\\n')}`,
      `CATEGORIES:${domainName}`,
      `DTSTART:${formatIcsLocal(startDate)}`,
      `DTEND:${formatIcsLocal(endDate)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
