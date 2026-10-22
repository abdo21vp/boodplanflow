import React, { useState } from 'react';
import { 
  GraduationCap, 
  Dumbbell, 
  Clock, 
  Briefcase, 
  Sparkles, 
  Moon, 
  ChevronDown, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  Layers, 
  PieChart,
  Eye,
  Plus,
  SlidersHorizontal
} from 'lucide-react';
import { DomainCategory, ScheduleBlock } from '../types/schedule';

interface SidebarProps {
  domains: DomainCategory[];
  blocks: ScheduleBlock[];
  onToggleDomain: (domainId: string) => void;
  onSetAllDomains: (visible: boolean) => void;
  onIsolateDomain: (domainId: string) => void;
  onOpenAiModal: () => void;
  onOpenAddModal: () => void;
}

// Icon mapper
const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Dumbbell,
  Clock,
  Briefcase,
  Sparkles,
  Moon,
};

export const Sidebar: React.FC<SidebarProps> = ({
  domains,
  blocks,
  onToggleDomain,
  onSetAllDomains,
  onIsolateDomain,
  onOpenAiModal,
  onOpenAddModal,
}) => {
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(true);

  // Compute hours per domain
  const domainHours: Record<string, number> = {};
  let totalScheduledHours = 0;

  blocks.forEach((b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const duration = Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
    domainHours[b.domainId] = (domainHours[b.domainId] || 0) + duration;
    totalScheduledHours += duration;
  });

  const totalWeekHours = 168; // 24 * 7
  const remainingHours = Math.max(0, totalWeekHours - totalScheduledHours);

  const allVisible = domains.every(d => d.visible);
  const noneVisible = domains.every(d => !d.visible);

  return (
    <aside className="no-print w-full lg:w-72 flex-shrink-0 flex flex-col space-y-4 order-last lg:order-first">
      
      {/* 1. DOMAIN LAYERS (Google Calendar Style Layer Toggles) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setLayersExpanded(!layersExpanded)}
            className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Domain Layers</span>
            {layersExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Quick All / None Toggle */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onSetAllDomains(true)}
              disabled={allVisible}
              className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-slate-500 transition px-1.5 py-0.5 rounded"
              title="Show all domains on timetable"
            >
              All
            </button>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <button
              onClick={() => onSetAllDomains(false)}
              disabled={noneVisible}
              className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-slate-500 transition px-1.5 py-0.5 rounded"
              title="Hide all domains"
            >
              None
            </button>
          </div>
        </div>

        {/* Collapsible Domain List */}
        {layersExpanded && (
          <div className="mt-3 space-y-1.5">
            {domains.map((domain) => {
              const IconComponent = ICON_MAP[domain.icon] || Clock;
              const hours = domainHours[domain.id] || 0;
              const formattedHours = hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);

              return (
                <div
                  key={domain.id}
                  className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-150 ${
                    domain.visible
                      ? 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                      : 'opacity-50 hover:opacity-80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  {/* Left: Checkbox & Name */}
                  <label className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={domain.visible}
                      onChange={() => onToggleDomain(domain.id)}
                      className="sr-only"
                    />
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: domain.visible ? domain.color : 'transparent',
                        border: domain.visible ? 'none' : `1.5px solid ${domain.color}`,
                      }}
                    >
                      {domain.visible && (
                        <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {domain.name}
                      </span>
                    </div>
                  </label>

                  {/* Right: Hours badge + Isolate "Solo" action */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {formattedHours}h
                    </span>
                    
                    {/* Solo/Isolate button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIsolateDomain(domain.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title={`Isolate ${domain.name} (hide others)`}
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. WEEKLY BALANCE & ANALYTICS (168-Hour Distribution) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
            className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <PieChart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Weekly 168h Balance</span>
            {analyticsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(totalScheduledHours)}h / 168h
          </span>
        </div>

        {analyticsExpanded && (
          <div className="mt-3 space-y-3">
            {/* Multi-segment Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              {domains.map((domain) => {
                const hours = domainHours[domain.id] || 0;
                if (hours <= 0) return null;
                const pct = (hours / totalWeekHours) * 100;
                return (
                  <div
                    key={domain.id}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: domain.color,
                    }}
                    title={`${domain.name}: ${hours.toFixed(1)} hrs (${Math.round(pct)}%)`}
                    className="h-full transition-all duration-300 hover:brightness-110"
                  />
                );
              })}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Scheduled</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {totalScheduledHours.toFixed(1)} hrs
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {Math.round((totalScheduledHours / 168) * 100)}% of week
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Discretionary</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {remainingHours.toFixed(1)} hrs
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                  free / flex time
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. QUICK TEXT IMPORT CARD */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Auto-Schedule
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Paste raw text or upload notes to generate or adjust routine blocks.
            </p>
            <button
              onClick={onOpenAiModal}
              className="mt-2.5 inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:underline transition"
            >
              <span>Open Importer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};
