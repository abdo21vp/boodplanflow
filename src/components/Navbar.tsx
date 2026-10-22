import React, { useState, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Download, 
  Printer, 
  FileJson, 
  Upload, 
  Sun, 
  Moon, 
  Settings, 
  Calendar as CalendarIcon,
  ChevronDown,
  Send,
  Target,
  Menu,
  X
} from 'lucide-react';
import { ScheduleBlock, DomainCategory } from '../types/schedule';
import { generateIcsCalendar, downloadFile } from '../services/icsExport';
import { AuthButton } from './AuthButton';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAiModal: () => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenTelegramModal: () => void;
  blocks: ScheduleBlock[];
  domains: DomainCategory[];
  onImportJson: (blocks: ScheduleBlock[]) => void;
  currentView: 'timetable' | 'goals';
  onChangeView: (view: 'timetable' | 'goals') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenAiModal,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenTelegramModal,
  blocks,
  domains,
  onImportJson,
  currentView,
  onChangeView,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportIcs = () => {
    const icsData = generateIcsCalendar(blocks, domains, 'My Schedule');
    downloadFile('schedule.ics', icsData, 'text/calendar;charset=utf-8');
    setExportOpen(false);
    setMobileMenuOpen(false);
  };

  const handleExportJson = () => {
    const data = JSON.stringify(blocks, null, 2);
    downloadFile('schedule_backup.json', data, 'application/json');
    setExportOpen(false);
    setMobileMenuOpen(false);
  };

  const handlePrint = () => {
    setExportOpen(false);
    setMobileMenuOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          onImportJson(imported);
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setExportOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm">
            P
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
            PlanFlow
          </span>
        </div>

        {/* View Switcher: Timetable vs Goals & Habits (Linear style) */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium">
          <button
            onClick={() => onChangeView('timetable')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
              currentView === 'timetable'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="text-xs">Schedule</span>
          </button>

          <button
            onClick={() => onChangeView('goals')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
              currentView === 'goals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="text-xs">Goals</span>
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-2">
          
          {/* Auto-Schedule Intake */}
          <button
            onClick={onOpenAiModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Auto-Schedule</span>
          </button>

          {/* Add Block */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 text-xs">
                <button onClick={handleExportIcs} className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Calendar (.ics)</span>
                </button>
                <button onClick={handlePrint} className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print / PDF</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button onClick={handleExportJson} className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                  <FileJson className="w-3.5 h-3.5 text-slate-400" />
                  <span>Backup JSON</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Restore JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Telegram Assistant */}
          <button
            onClick={onOpenTelegramModal}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Telegram Assistant"
          >
            <Send className="w-4 h-4" />
          </button>

          {/* Cloud Sync / Auth */}
          <AuthButton />

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Controls */}
        <div className="flex md:hidden items-center space-x-1">
          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2.5 text-xs shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Sync:</span>
            <AuthButton />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onOpenAiModal(); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Auto-Schedule</span>
            </button>

            <button
              onClick={() => { onOpenTelegramModal(); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
            <button onClick={handleExportIcs} className="w-full text-left py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center space-x-2">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Export to Calendar (.ics)</span>
            </button>
            <button onClick={handlePrint} className="w-full text-left py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center space-x-2">
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print or PDF</span>
            </button>
            <button onClick={handleExportJson} className="w-full text-left py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center space-x-2">
              <FileJson className="w-3.5 h-3.5 text-slate-400" />
              <span>Backup Routine (JSON)</span>
            </button>
            <button onClick={() => { onToggleDarkMode(); setMobileMenuOpen(false); }} className="w-full text-left py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center space-x-2">
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
            <button onClick={() => { onOpenSettingsModal(); setMobileMenuOpen(false); }} className="w-full text-left py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center space-x-2">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
    </header>
  );
};
