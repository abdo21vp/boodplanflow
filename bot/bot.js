// PlanFlow Telegram Schedule Bot
// Token: 8710334517:AAHt0a-U0vJDXQcbUlaJK1fTxhGlVR1ThJQ

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8710334517:AAHt0a-U0vJDXQcbUlaJK1fTxhGlVR1ThJQ';
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

async function sendMessage(chatId, text, parseMode = 'Markdown') {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

function formatDaySchedule(dayName) {
  const events = SCHEDULE[dayName] || [];
  if (events.length === 0) {
    return `🎉 *${dayName}*\nNo scheduled commitments for today. Enjoy your day!`;
  }

  let text = `📅 *Schedule for ${dayName}*\n\n`;
  events.forEach((ev, idx) => {
    text += `*${idx + 1}. ${ev.title}*\n`;
    text += `   ⏰ \`${ev.time}\`\n`;
    text += `   📍 ${ev.room}  •  ${ev.domain}\n\n`;
  });

  return text;
}

function formatFullWeek() {
  let text = `🗓️ *Your Full Master Routine*\n\n`;
  DAYS.forEach(day => {
    const events = SCHEDULE[day];
    if (events && events.length > 0) {
      text += `*${day}:*\n`;
      events.forEach(ev => {
        text += `  • \`${ev.time}\` ${ev.title} (${ev.room})\n`;
      });
      text += `\n`;
    }
  });
  return text;
}

// Long-polling listener
let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;

        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const msg = update.message.text.trim().toLowerCase();
          const senderName = update.message.from.first_name || 'Bood';

          console.log(`Received command from ${senderName} (${chatId}): ${msg}`);

          const now = new Date();
          // Adjust to Cairo Time (UTC+3)
          const cairoTime = new Date(now.getTime() + (3 * 3600000));
          const currentDayName = DAYS[cairoTime.getUTCDay()];
          const tomorrowDayName = DAYS[(cairoTime.getUTCDay() + 1) % 7];

          if (msg === '/start' || msg === 'hi' || msg === 'hello') {
            const welcome = `Salam *${senderName}*! 👋\n\nI am your personal *PlanFlow Schedule Bot*.\n\nHere are the commands you can use:\n👉 /today - View today's schedule & lectures\n👉 /tomorrow - Preview tomorrow's schedule\n👉 /week - See your full weekly routine\n\n_I will also send your daily morning briefing!_`;
            await sendMessage(chatId, welcome);
            // Send today immediately
            await sendMessage(chatId, formatDaySchedule(currentDayName));
          } else if (msg === '/today') {
            await sendMessage(chatId, formatDaySchedule(currentDayName));
          } else if (msg === '/tomorrow') {
            await sendMessage(chatId, formatDaySchedule(tomorrowDayName));
          } else if (msg === '/week') {
            await sendMessage(chatId, formatFullWeek());
          } else {
            await sendMessage(chatId, `Unknown command. Type /today, /tomorrow, or /week!`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Polling error:', err);
  }

  // Continue polling
  setTimeout(pollUpdates, 1000);
}

console.log('🤖 PlanFlow Telegram Bot is running...');
pollUpdates();
