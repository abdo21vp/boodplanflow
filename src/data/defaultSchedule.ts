import { DomainCategory, ScheduleBlock } from '../types/schedule';

export const DEFAULT_DOMAINS: DomainCategory[] = [
  {
    id: 'academic',
    name: 'Academic & Learning',
    color: '#4f46e5', // indigo-600
    bgColor: '#eef2ff',
    darkBgColor: '#1e1b4b',
    borderColor: '#6366f1',
    textColor: '#4338ca',
    icon: 'GraduationCap',
    description: 'Classes, university lectures, research, study sessions, reading',
    visible: true,
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    color: '#059669', // emerald-600
    bgColor: '#ecfdf5',
    darkBgColor: '#064e3b',
    borderColor: '#10b981',
    textColor: '#047857',
    icon: 'Dumbbell',
    description: 'Gym, cardio, yoga, meal prep, active recovery',
    visible: true,
  },
  {
    id: 'secular',
    name: 'Secular & Daily Life',
    color: '#d97706', // amber-600
    bgColor: '#fffbeb',
    darkBgColor: '#451a03',
    borderColor: '#f59e0b',
    textColor: '#b45309',
    icon: 'Clock',
    description: 'Chores, groceries, transit/commute, administrative, cooking',
    visible: true,
  },
  {
    id: 'work',
    name: 'Work & Projects',
    color: '#7c3aed', // violet-600
    bgColor: '#f5f3ff',
    darkBgColor: '#2e1065',
    borderColor: '#8b5cf6',
    textColor: '#6d28d9',
    icon: 'Briefcase',
    description: 'Deep work sessions, meetings, development, client calls',
    visible: true,
  },
  {
    id: 'personal',
    name: 'Personal & Mindfulness',
    color: '#0891b2', // cyan-600
    bgColor: '#ecfeff',
    darkBgColor: '#083344',
    borderColor: '#06b6d4',
    textColor: '#0e7490',
    icon: 'Sparkles',
    description: 'Relaxation, hobbies, social, meditation, downtime',
    visible: true,
  },
  {
    id: 'sleep',
    name: 'Rest & Sleep',
    color: '#475569', // slate-600
    bgColor: '#f8fafc',
    darkBgColor: '#0f172a',
    borderColor: '#64748b',
    textColor: '#334155',
    icon: 'Moon',
    description: 'Sleep cycles, wind-down routine',
    visible: false, // hidden by default to keep grid clean, can be toggled on!
  }
];

export const DEFAULT_BLOCKS: ScheduleBlock[] = [
  // Fitness
  { id: 'b1', title: 'Morning Gym & Cardio', domainId: 'fitness', day: 'Monday', startTime: '07:00', endTime: '08:30', notes: 'Upper body hypertrophy + 15m stairmaster' },
  { id: 'b2', title: 'Strength Training', domainId: 'fitness', day: 'Wednesday', startTime: '07:00', endTime: '08:30', notes: 'Leg day & core workout' },
  { id: 'b3', title: 'Cardio & Mobility', domainId: 'fitness', day: 'Friday', startTime: '07:00', endTime: '08:30', notes: '5km outdoor run + stretching' },
  { id: 'b4', title: 'Weekend Hiking / Active Rest', domainId: 'fitness', day: 'Saturday', startTime: '09:00', endTime: '11:00', notes: 'Trail walk or light cycling' },

  // Secular / Daily Life
  { id: 'b5', title: 'Morning Routine & Breakfast', domainId: 'secular', day: 'Monday', startTime: '08:30', endTime: '09:15', notes: 'Healthy breakfast and hydration' },
  { id: 'b6', title: 'Morning Routine & Breakfast', domainId: 'secular', day: 'Wednesday', startTime: '08:30', endTime: '09:15' },
  { id: 'b7', title: 'Morning Routine & Breakfast', domainId: 'secular', day: 'Friday', startTime: '08:30', endTime: '09:15' },
  { id: 'b8', title: 'Weekly Grocery & Meal Prep', domainId: 'secular', day: 'Sunday', startTime: '11:00', endTime: '13:00', notes: 'Supermarket shopping and batch cook proteins' },
  { id: 'b9', title: 'Apartment Reset & Laundry', domainId: 'secular', day: 'Sunday', startTime: '16:00', endTime: '17:30', notes: 'Tidy up, wash sheets, organize desk' },

  // Academic
  { id: 'b10', title: 'Data Structures Lecture', domainId: 'academic', day: 'Monday', startTime: '10:00', endTime: '12:00', notes: 'Room Hall B - Graph algorithms' },
  { id: 'b11', title: 'Deep Study & Problem Sets', domainId: 'academic', day: 'Monday', startTime: '14:00', endTime: '16:30', notes: 'Library floor 3 - Focus blocks' },
  { id: 'b12', title: 'Computer Systems Lab', domainId: 'academic', day: 'Tuesday', startTime: '13:00', endTime: '15:30', notes: 'Lab 402 - Kernel memory management' },
  { id: 'b13', title: 'Academic Reading & Notes', domainId: 'academic', day: 'Wednesday', startTime: '10:00', endTime: '12:30', notes: 'Summarize weekly literature papers' },
  { id: 'b14', title: 'Algorithms Seminar', domainId: 'academic', day: 'Thursday', startTime: '10:00', endTime: '12:00', notes: 'Discussion & presentations' },
  { id: 'b15', title: 'Exam Review & Practice', domainId: 'academic', day: 'Friday', startTime: '14:00', endTime: '16:00', notes: 'Past papers timed review' },

  // Work & Projects
  { id: 'b16', title: 'Deep Work: Project Architecture', domainId: 'work', day: 'Tuesday', startTime: '09:00', endTime: '12:00', notes: 'Build core scheduling engine and state' },
  { id: 'b17', title: 'Project Development Sprint', domainId: 'work', day: 'Thursday', startTime: '14:00', endTime: '17:00', notes: 'Feature implementation and tests' },
  { id: 'b18', title: 'Side Venture / Portfolio', domainId: 'work', day: 'Saturday', startTime: '13:00', endTime: '16:00', notes: 'Coding personal open source projects' },

  // Personal / Mindfulness
  { id: 'b19', title: 'Reading & Wind-Down', domainId: 'personal', day: 'Monday', startTime: '20:30', endTime: '22:00', notes: 'Non-fiction book + herbal tea' },
  { id: 'b20', title: 'Social Dinner & Friends', domainId: 'personal', day: 'Friday', startTime: '18:30', endTime: '21:30', notes: 'Dinner with campus friends' },
  { id: 'b21', title: 'Hobbies, Music & Leisure', domainId: 'personal', day: 'Saturday', startTime: '17:00', endTime: '19:30', notes: 'Acoustic guitar practice' },
  { id: 'b22', title: 'Weekly Review & Goal Planning', domainId: 'personal', day: 'Sunday', startTime: '19:00', endTime: '20:30', notes: 'Review wins, set upcoming week targets' },
];

export const SAMPLE_GOAL_PROMPTS = [
  {
    title: '🎓 Balanced Student (Academic + Gym + Life)',
    text: `Here is my ideal weekly schedule:
- Academic: I have University lectures on Mon & Wed 10am to 12pm, and Tuesday Lab from 1pm to 3:30pm. I need 2 hours of quiet deep study on Monday and Thursday afternoons (2pm-4pm).
- Fitness: Workout at the gym 3 mornings a week (Mon, Wed, Fri from 7:00am to 8:30am). Saturday morning 9am to 10:30am light jog or outdoor run.
- Secular / Daily Living: Grocery shopping and meal prep on Sunday 11am to 1pm. Apartment cleaning Sunday 4pm to 5:30pm. Daily breakfast/prep 8:30am to 9:15am.
- Personal: Friday night dinner with friends from 6:30pm to 9pm. Sunday evening weekly plan 7pm to 8pm.`,
  },
  {
    title: '💼 Software Engineer & Continuous Learner',
    text: `My target weekly routine:
- Work: Deep coding blocks Monday through Friday 9:00am to 12:30pm. Team standups and meetings Mon/Wed/Thu 2:00pm to 4:00pm.
- Academic / Learning: AI & Systems paper reading Tuesday and Thursday 7:30pm to 9:00pm. Open source weekend sprint Saturday 10:00am to 1:00pm.
- Fitness: Weightlifting Tuesday and Thursday mornings 7:00am to 8:15am. Long bicycle ride Sunday morning 8:00am to 10:30am.
- Secular: Meal prep on Sunday 2:00pm to 4:00pm. House chores Wednesday 6:00pm to 7:00pm.`,
  },
  {
    title: '⚡ High Performance Sprint (Focused & Rigorous)',
    text: `Weekly goals:
- Academic: 3 hours of intensive mathematics study every weekday from 9am to 12pm. Research paper review Monday and Wednesday 3pm to 5pm.
- Fitness: 1 hour athletic training 5 days a week (Mon-Fri 7am to 8am).
- Work: Startup engineering Tuesday and Thursday 1pm to 5pm.
- Secular: Sunday morning meal prep 10am to 12pm. Quick daily dinner cooking 6:30pm to 7:30pm weekdays.
- Personal: Saturday afternoon off for nature walk and reading 2pm to 6pm.`
  }
];
