import React, { useState, useEffect, useRef } from 'react';
import { 
  DayOfWeek, 
  DomainCategory, 
  ParsedGoalPlan, 
  ScheduleBlock, 
  AppSettings,
  WeeklyGoal,
  DailyHabit,
  DayCounter
} from './types/schedule';
import { 
  loadScheduleBlocks, 
  saveScheduleBlocks, 
  loadDomains, 
  saveDomains, 
  loadSettings, 
  saveSettings,
  loadWeeklyGoals,
  saveWeeklyGoals,
  loadDailyHabits,
  saveDailyHabits,
  loadDayCounters,
  saveDayCounters
} from './services/storage';
import { DEFAULT_BLOCKS, DEFAULT_DOMAINS } from './data/defaultSchedule';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Timetable } from './components/Timetable';
import { TextUploadModal } from './components/TextUploadModal';
import { PreviewModal } from './components/PreviewModal';
import { EditBlockModal } from './components/EditBlockModal';
import { SettingsModal } from './components/SettingsModal';
import { TelegramModal } from './components/TelegramModal';
import { GoalsView } from './components/GoalsView';
import { AddGoalModal } from './components/AddGoalModal';
import { AddHabitModal } from './components/AddHabitModal';
import { AddCounterModal } from './components/AddCounterModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { saveScheduleToCloud, subscribeToSchedule, isFirebaseConfigured } from './services/firebase';

export const AppInner: React.FC = () => {
  const { user } = useAuth();
  const cloudSyncEnabled = isFirebaseConfigured();
  const isSyncingFromCloud = useRef(false);
  // Core State
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(loadScheduleBlocks);
  const [domains, setDomains] = useState<DomainCategory[]>(loadDomains);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // View State: 'timetable' | 'goals'
  const [currentView, setCurrentView] = useState<'timetable' | 'goals'>('timetable');

  // Goals, Habits & Counters State
  const [goals, setGoals] = useState<WeeklyGoal[]>(loadWeeklyGoals);
  const [habits, setHabits] = useState<DailyHabit[]>(loadDailyHabits);
  const [counters, setCounters] = useState<DayCounter[]>(loadDayCounters);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddCounterOpen, setIsAddCounterOpen] = useState(false);

  // Active edit/create state
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [newSlotDefault, setNewSlotDefault] = useState<{ day: DayOfWeek; time: string }>({
    day: 'Monday',
    time: '09:00',
  });

  // AI Plan Preview state
  const [currentPlan, setCurrentPlan] = useState<ParsedGoalPlan | null>(null);
  const [currentRawText, setCurrentRawText] = useState('');

  // ─── Cloud Sync: Subscribe to Firebase when user is logged in ───────────────
  useEffect(() => {
    if (!cloudSyncEnabled || !user) return;

    const unsubscribe = subscribeToSchedule(user.uid, (data) => {
      if (!data) return;
      isSyncingFromCloud.current = true;
      if (data.blocks && Array.isArray(data.blocks)) setBlocks(data.blocks);
      if (data.domains && Array.isArray(data.domains)) setDomains(data.domains);
      if (data.goals && Array.isArray(data.goals)) setGoals(data.goals);
      if (data.habits && Array.isArray(data.habits)) setHabits(data.habits);
      if (data.counters && Array.isArray(data.counters)) setCounters(data.counters);
      setTimeout(() => { isSyncingFromCloud.current = false; }, 300);
    });

    return unsubscribe;
  }, [user, cloudSyncEnabled]);

  // ─── Cloud Sync: Push to Firebase on every change ───────────────────────────
  useEffect(() => {
    if (!cloudSyncEnabled || !user || isSyncingFromCloud.current) return;
    saveScheduleToCloud(user.uid, { blocks, domains, goals, habits, counters }).catch(console.error);
  }, [blocks, domains, goals, habits, counters, user, cloudSyncEnabled]);

  // Persist blocks when changed (localStorage fallback)
  useEffect(() => {
    saveScheduleBlocks(blocks);
  }, [blocks]);

  // Persist domains when changed
  useEffect(() => {
    saveDomains(domains);
  }, [domains]);

  // Persist goals, habits & counters
  useEffect(() => {
    saveWeeklyGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveDailyHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveDayCounters(counters);
  }, [counters]);

  // Persist settings and apply dark mode class
  useEffect(() => {
    saveSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Domain toggles (Least effort possible sorting & filtering)
  const handleToggleDomain = (domainId: string) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, visible: !d.visible } : d))
    );
  };

  const handleSetAllDomains = (visible: boolean) => {
    setDomains((prev) => prev.map((d) => ({ ...d, visible })));
  };

  const handleIsolateDomain = (domainId: string) => {
    setDomains((prev) =>
      prev.map((d) => ({ ...d, visible: d.id === domainId }))
    );
  };

  // Block CRUD handlers
  const handleSaveBlock = (savedBlock: ScheduleBlock) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === savedBlock.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedBlock;
        return copy;
      }
      return [...prev, savedBlock];
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleOpenEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setIsEditModalOpen(true);
  };

  const handleOpenAddAtSlot = (day: DayOfWeek, time: string) => {
    setEditingBlock(null);
    setNewSlotDefault({ day, time });
    setIsEditModalOpen(true);
  };

  const handleOpenAddEvent = () => {
    setEditingBlock(null);
    setNewSlotDefault({ day: 'Monday', time: '09:00' });
    setIsEditModalOpen(true);
  };

  // AI Plan Generation & Apply
  const handlePlanReady = (plan: ParsedGoalPlan, rawText: string) => {
    setCurrentPlan(plan);
    setCurrentRawText(rawText);
    setIsAiModalOpen(false);
    setIsPreviewModalOpen(true);
  };

  const handleApplyPlan = (newBlocks: ScheduleBlock[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setBlocks(newBlocks);
    } else {
      // Merge
      setBlocks((prev) => [...prev, ...newBlocks]);
    }

    // Ensure all domains in the generated plan are visible
    setDomains((prev) =>
      prev.map((d) => {
        const hasBlock = newBlocks.some((b) => b.domainId === d.id);
        return hasBlock ? { ...d, visible: true } : d;
      })
    );

    setIsPreviewModalOpen(false);
  };

  // Reset to default sample routine
  const handleResetData = () => {
    setBlocks(DEFAULT_BLOCKS);
    setDomains(DEFAULT_DOMAINS);
  };

  // JSON Import
  const handleImportJson = (importedBlocks: ScheduleBlock[]) => {
    setBlocks(importedBlocks);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={settings.darkMode}
        onToggleDarkMode={() =>
          setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
        }
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAddModal={handleOpenAddEvent}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        blocks={blocks}
        domains={domains}
        onImportJson={handleImportJson}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        {currentView === 'timetable' ? (
          <div className="flex flex-col lg:flex-row gap-5 flex-1">
            {/* Left Sidebar: Collapsible Domain Layers & Weekly Stats */}
            <Sidebar
              domains={domains}
              blocks={blocks}
              onToggleDomain={handleToggleDomain}
              onSetAllDomains={handleSetAllDomains}
              onIsolateDomain={handleIsolateDomain}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              onOpenAddModal={handleOpenAddEvent}
            />

            {/* Right Content: 7-Day Timetable Grid */}
            <Timetable
              blocks={blocks}
              domains={domains}
              startHour={settings.startHour}
              endHour={settings.endHour}
              onEditBlock={handleOpenEditBlock}
              onDeleteBlock={handleDeleteBlock}
              onSlotClick={handleOpenAddAtSlot}
            />
          </div>
        ) : (
          <GoalsView
            goals={goals}
            habits={habits}
            counters={counters}
            blocks={blocks}
            domains={domains}
            onUpdateGoals={setGoals}
            onUpdateHabits={setHabits}
            onUpdateCounters={setCounters}
            onOpenAddGoal={() => setIsAddGoalOpen(true)}
            onOpenAddHabit={() => setIsAddHabitOpen(true)}
            onOpenAddCounter={() => setIsAddCounterOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <TextUploadModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onPlanReady={handlePlanReady}
        apiKey={settings.geminiApiKey}
        geminiModel={settings.geminiModel}
        existingBlocks={blocks}
      />

      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        plan={currentPlan}
        rawText={currentRawText}
        onApplyPlan={handleApplyPlan}
        apiKey={settings.geminiApiKey}
        geminiModel={settings.geminiModel}
        domains={domains}
        existingBlocks={blocks}
      />

      <EditBlockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        block={editingBlock}
        defaultDay={newSlotDefault.day}
        defaultStartTime={newSlotDefault.time}
        domains={domains}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetData={handleResetData}
      />

      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        domains={domains}
        onSave={(newGoal) => setGoals((prev) => [...prev, newGoal])}
      />

      <AddHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onSave={(newHabit) => setHabits((prev) => [...prev, newHabit])}
      />

      <AddCounterModal
        isOpen={isAddCounterOpen}
        onClose={() => setIsAddCounterOpen(false)}
        onSave={(newCounter) => setCounters((prev) => [...prev, newCounter])}
      />

    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
