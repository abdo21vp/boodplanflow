import { ParsedGoalPlan, ScheduleBlock } from '../types/schedule';
import { parseGoalsOffline } from './offlineParser';

const SYSTEM_INSTRUCTION = `You are PlanFlow AI, an elite schedule architect and personal routine strategist.
Your task is to take user weekly goals, commitments, or routines and organize them into an optimal, balanced 7-day master weekly timetable (Monday through Sunday).

Domain Categorization Rules:
You MUST classify each activity into one of the following domain IDs:
1. "academic": Classes, lectures, study blocks, exam prep, academic reading, homework, labs, research.
2. "fitness": Gym, strength training, cardio, running, sports, yoga, stretching, active recovery.
3. "secular": Daily life routines, household chores, grocery shopping, cooking, meal prep, transit/commute, administrative tasks, morning/evening routine.
4. "work": Professional work, coding/software engineering, meetings, client projects, career development.
5. "personal": Hobbies, relaxation, leisure, social gatherings with friends, meditation, reading for pleasure.
6. "sleep": Sleep and wind-down cycles.

Time Block Guidelines:
- Days must be one of: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday".
- Times must be in 24-hour "HH:mm" format (e.g., "07:00", "09:30", "14:00", "18:00").
- Stagger time blocks realistically: ensure there are sensible transitions and avoid unnecessary conflicts.
- If the user specifies frequency without exact days (e.g. "gym 3 times a week"), intelligently pick non-consecutive optimal days (e.g. Mon, Wed, Fri morning).

You MUST respond strictly with valid JSON conforming to this schema (no extra markdown explanation outside the JSON):
{
  "summary": "Short 1-2 sentence overview of the arranged schedule",
  "reasoning": "Brief explanation of how the routine was balanced across academic, fitness, secular, and work domains",
  "detectedDomains": [
    { "id": "academic", "name": "Academic & Learning", "estimatedHours": 18.5 }
  ],
  "blocks": [
    {
      "title": "Data Structures Lecture",
      "domainId": "academic",
      "day": "Monday",
      "startTime": "10:00",
      "endTime": "12:00",
      "notes": "Lecture hall B"
    }
  ],
  "conflicts": [
    "Any potential time constraint or unavoidable overlap noted"
  ]
}`;

export async function arrangeGoalsWithAI(
  text: string,
  apiKey?: string,
  model = 'gemini-1.5-flash',
  refinementPrompt?: string,
  existingBlocks?: ScheduleBlock[]
): Promise<ParsedGoalPlan> {
  // If no API key provided, fall back to offline parser
  if (!apiKey || apiKey.trim() === '') {
    console.info('No Gemini API key provided. Using built-in Offline Smart Heuristic Parser.');
    return parseGoalsOffline(text);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    let promptContent = `User Weekly Routine & Goals:\n"""\n${text}\n"""\n`;
    if (refinementPrompt) {
      promptContent += `\nRequested Adjustment / Refinement:\n"""\n${refinementPrompt}\n"""\n`;
    }
    if (existingBlocks && existingBlocks.length > 0) {
      promptContent += `\nCurrent Schedule Blocks:\n${JSON.stringify(existingBlocks.slice(0, 30))}\n`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: promptContent }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`Gemini API error (${response.status}): ${errBody}. Falling back to offline parser.`);
      const fallback = parseGoalsOffline(text);
      fallback.reasoning = `Gemini API returned status ${response.status}. Automatically fell back to the built-in offline parser.`;
      return fallback;
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJson) {
      console.warn('Empty Gemini response. Falling back to offline parser.');
      return parseGoalsOffline(text);
    }

    const parsed: ParsedGoalPlan = JSON.parse(rawJson);
    
    // Assign stable unique IDs
    parsed.blocks = (parsed.blocks || []).map((b, i) => ({
      ...b,
      id: b.id || `ai-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      isAiGenerated: true,
    }));

    return parsed;
  } catch (err: any) {
    console.error('Failed to call Gemini API:', err);
    const fallback = parseGoalsOffline(text);
    fallback.reasoning = `AI generation encountered an issue (${err.message || 'network'}). Gracefully fell back to offline parser.`;
    return fallback;
  }
}
