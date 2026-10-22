# PlanFlow — AI Weekly Schedule & Routine Architect

A modern, high-precision web application designed for master 7-day recurring routines. Upload or paste text describing your weekly goals, classes, gym routine, and daily habits, and PlanFlow automatically parses, balances, and arranges them onto a 7-day timetable with domain sorting (Academic, Fitness, Secular, Work, Personal, Sleep).

---

## 🌟 Key Features

### 1. Upload Goals & Auto-Arrangement
- **Free-Form Text or File Input**: Paste conversational commitments or drop `.txt`/`.md` files.
- **Dual Processing Engines**:
  - **Gemini AI Engine**: Extracts commitments, understands nuanced constraints (e.g. *"Gym 3 mornings a week"*, *"2 hours of study weekday afternoons"*), and resolves scheduling clashes.
  - **Smart Offline Parser**: Works 100% locally and privately in the browser with **zero setup or API key needed**.
- **Interactive Preview & Refine Modal**:
  - Review proposed schedule blocks and domain hour allocations.
  - Conversational tweak input (e.g., *"Make study sessions 1 hour earlier"*).
  - Choice to **Replace Entire Schedule** or **Merge with Existing Routine**.

### 2. Effortless Domain Sorting & Layering ("Least Effort Possible")
- **Predefined Life Domains**:
  - 🎓 **Academic**: Lectures, study sessions, homework, research.
  - 🏃 **Fitness**: Gym, cardio, mobility, outdoor sports.
  - 🏛️ **Secular / Daily Life**: Groceries, cleaning, laundry, cooking, commute.
  - 💼 **Work / Projects**: Deep work, meetings, development sprints.
  - 🌿 **Personal / Mindfulness**: Downtime, hobbies, music, reading.
- **Google Calendar-Style Collapsible Layers**:
  - One-click checkbox toggles in the sidebar to show/hide any domain on the grid.
  - **"Solo" Eye Button**: Instantly isolate a single domain to see only fitness or only academic commitments.
  - Real-time weekly hours tally per domain.

### 3. Visual 7-Day Timetable
- **Side-by-Side Overlap Display**: Overlapping events automatically render in adjacent columns with clash warnings, just like Google Calendar.
- **Interactive Controls**: Click any slot to add events; click any card to edit title, time, notes, or delete.
- **Configurable Time Range**: Set daily start (e.g., 06:00 AM) and end hours in Settings.

### 4. 168-Hour Balance & Exports
- **Weekly Analytics**: Live progress bar showing total committed hours out of the 168 hours in a week, plus free flex time.
- **Export to iCalendar (.ics)**: Compatible with Google Calendar, Apple Calendar, and Outlook.
- **Print / PDF Layout**: Clean, distraction-free stylesheet for physical prints or desktop wallpapers.
- **JSON Backup & Restore**: Save and load complete schedule states with one click.
- **Dark & Light Mode**: Seamless theme toggle with modern minimalist aesthetics.

---

## 🚀 Getting Started

The development server is running locally at:
👉 **`http://localhost:5173`**

### Running Manually

```bash
# Navigate to the project directory
cd "C:\Users\user\.gemini\antigravity\scratch\weekly-schedule-planner"

# Start the dev server
npm run dev

# Or build for production
npm run build
npm run preview
```

---

## ⚙️ Configuration (Optional Gemini API Key)

1. Open the app in your browser at `http://localhost:5173`.
2. Click the **Gear (Settings)** icon in the top right.
3. Paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Save settings. If no key is entered, PlanFlow automatically uses its built-in offline smart parser.
