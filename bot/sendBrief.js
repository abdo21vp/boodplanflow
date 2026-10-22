// PlanFlow - Serverless Daily Brief Sender
// Triggered via GitHub Actions Cron every morning at 6:30 AM Cairo time (03:30 UTC)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8710334517:AAHt0a-U0vJDXQcbUlaJK1fTxhGlVR1ThJQ';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '5391126215';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const SCHEDULE = {
  Saturday: [
    { time: '09:00 - 10:00', title: 'Islamic Jurisprudence (Online)', domain: 'Academic 🎓', room: 'Online' },
    { time: '14:00 - 16:00', title: 'Social Skills (Online)', domain: 'Academic 🎓', room: 'Online' },
  ],
  Sunday: [
    { time: 'All Day', title: 'Free / Weekly Review & Prep', domain: 'Personal 🌿', room: 'Home' },
  ],
  Monday: [
    { time: '07:00 - 08:30', title: 'Morning Gym Workout', domain: 'Fitness 🏋️', room: 'Gym' },
    { time: '09:40 - 11:20', title: 'Structured Programming Lab', domain: 'Academic 🎓', room: 'معمل 3 / 2' },
    { time: '12:00 - 14:00', title: 'Physics Lecture', domain: 'Academic 🎓', room: 'معمل 4' },
    { time: '14:00 - 16:00', title: 'Physics Tutorial', domain: 'Academic 🎓', room: 'معمل 4' },
  ],
  Tuesday: [
    { time: '08:00 - 10:00', title: 'English I', domain: 'Academic 🎓', room: 'معمل 4' },
    { time: '10:00 - 12:00', title: 'Computing Fundamentals Lecture', domain: 'Academic 🎓', room: 'معمل 4' },
    { time: '12:00 - 13:40', title: 'Computing Fundamentals Lab', domain: 'Academic 🎓', room: 'معمل 1 / 2' },
    { time: '19:30 - 21:00', title: 'Masjid Mashoura Meeting', domain: 'Masjid 🕌', room: 'Masjid' },
  ],
  Wednesday: [
    { time: '08:00 - 10:00', title: 'Discrete Mathematics Lecture', domain: 'Academic 🎓', room: 'معمل 4' },
    { time: '10:00 - 12:00', title: 'Discrete Mathematics Tutorial', domain: 'Academic 🎓', room: 'معمل 4' },
    { time: '12:00 - 14:00', title: 'Structured Programming Lecture', domain: 'Academic 🎓', room: 'مدرج 2' },
  ],
  Thursday: [
    { time: '13:00 - 17:00', title: 'Co-Working Space Study Session', domain: 'Study ☕', room: 'Co-Working Space' },
    { time: '19:30 - 21:30', title: 'Boys Masjid Gathering (After Isha)', domain: 'Masjid 🕌', room: 'Masjid' },
  ],
  Friday: [
    { time: '09:00 - 12:00', title: 'Sharii Study with the Boys (Till Dhuhr)', domain: 'Islamic 📚', room: 'Halqa' },
    { time: '16:00 - 17:30', title: 'Post-Asr Gym Workout', domain: 'Fitness 🏋️', room: 'Gym' },
    { time: '17:30 - 21:00', title: 'Fiqh Lesson (Maghrib to 9 PM)', domain: 'Islamic 📖', room: 'Halqa' },
  ]
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function sendDailyBrief() {
  const now = new Date();
  // Adjust to Cairo Time (UTC+3)
  const cairoTime = new Date(now.getTime() + (3 * 3600000));
  const dayName = DAYS[cairoTime.getUTCDay()];
  const dateStr = cairoTime.toISOString().split('T')[0];

  const events = SCHEDULE[dayName] || [];

  let text = `🌅 *Good morning Abdelrahman!* 👋\n`;
  text += `Here is your PlanFlow routine for today (*${dayName}*, ${dateStr}):\n\n`;

  if (events.length === 0) {
    text += `🎉 *No scheduled commitments today!*\nTake time for rest, revision, or flexibility.\n`;
  } else {
    events.forEach((ev, idx) => {
      text += `*${idx + 1}. ${ev.title}*\n`;
      text += `   ⏰ \`${ev.time}\`\n`;
      text += `   📍 ${ev.room}  •  ${ev.domain}\n\n`;
    });
  }

  text += `_Have a productive and blessed day!_ 🚀\n`;
  text += `_To check tomorrow anytime, send /tomorrow_`;

  console.log(`Sending brief for ${dayName} (${events.length} events) to chat ${CHAT_ID}...`);

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  });

  const data = await res.json();
  if (data.ok) {
    console.log('✅ Daily brief successfully delivered to Telegram!');
  } else {
    console.error('❌ Failed to deliver brief:', data);
    process.exit(1);
  }
}

sendDailyBrief().catch((err) => {
  console.error('Fatal error sending daily brief:', err);
  process.exit(1);
});
