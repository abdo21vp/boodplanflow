import React, { useState } from 'react';
import { DayOfWeek, DAYS_OF_WEEK, DomainCategory, ScheduleBlock } from '../types/schedule';
import { TimeBlock } from './TimeBlock';
import { Plus, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

interface TimetableProps {
  blocks: ScheduleBlock[];
  domains: DomainCategory[];
  startHour: number;
  endHour: number;
  onEditBlock: (block: ScheduleBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onSlotClick: (day: DayOfWeek, time: string) => void;
}

const PIXELS_PER_HOUR = 64; // height of 1 hour in pixels

interface LayoutBlock {
  block: ScheduleBlock;
  colIndex: number;
  totalCols: number;
  hasConflict: boolean;
}

// Compute overlap layout for a day's blocks
function layoutDayBlocks(blocks: ScheduleBlock[]): LayoutBlock[] {
  if (blocks.length === 0) return [];

  const sorted = [...blocks].sort((a, b) => {
    if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
    return b.endTime.localeCompare(a.endTime);
  });

  const clusters: ScheduleBlock[][] = [];
  let currentCluster: ScheduleBlock[] = [];
  let clusterEnd = '';

  sorted.forEach((block) => {
    if (currentCluster.length === 0) {
      currentCluster.push(block);
      clusterEnd = block.endTime;
    } else if (block.startTime < clusterEnd) {
      currentCluster.push(block);
      if (block.endTime > clusterEnd) clusterEnd = block.endTime;
    } else {
      clusters.push(currentCluster);
      currentCluster = [block];
      clusterEnd = block.endTime;
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result: LayoutBlock[] = [];

  clusters.forEach((cluster) => {
    const hasClusterConflict = cluster.length > 1;
    const colEndTimes: string[] = [];
    const clusterAssignments: { block: ScheduleBlock; colIndex: number }[] = [];

    cluster.forEach((b) => {
      let placedCol = -1;
      for (let i = 0; i < colEndTimes.length; i++) {
        if (colEndTimes[i] <= b.startTime) {
          placedCol = i;
          colEndTimes[i] = b.endTime;
          break;
        }
      }
      if (placedCol === -1) {
        placedCol = colEndTimes.length;
        colEndTimes.push(b.endTime);
      }
      clusterAssignments.push({ block: b, colIndex: placedCol });
    });

    const totalCols = colEndTimes.length;
    clusterAssignments.forEach(({ block, colIndex }) => {
      result.push({
        block,
        colIndex,
        totalCols,
        hasConflict: hasClusterConflict,
      });
    });
  });

  return result;
}

function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay();
  const map: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return map[dayIndex] || 'Monday';
}

export const Timetable: React.FC<TimetableProps> = ({
  blocks,
  domains,
  startHour,
  endHour,
  onEditBlock,
  onDeleteBlock,
  onSlotClick,
}) => {
  const visibleDomainIds = new Set(
    domains.filter((d) => d.visible).map((d) => d.id)
  );
  const domainMap = new Map(domains.map((d) => [d.id, d]));

  // Mobile navigation state
  const [activeDay, setActiveDay] = useState<DayOfWeek>(getTodayDayOfWeek);
  const [mobileView, setMobileView] = useState<'day' | 'week'>('day');

  // Filter blocks by visible domains
  const visibleBlocks = blocks.filter((b) => visibleDomainIds.has(b.domainId));

  // Generate hours array: [6, 7, 8, ... 23]
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  // Pre-calculate layouts per day
  const blocksByDay: Record<DayOfWeek, LayoutBlock[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  DAYS_OF_WEEK.forEach((day) => {
    const dayBlocks = visibleBlocks.filter((b) => b.day === day);
    blocksByDay[day] = layoutDayBlocks(dayBlocks);
  });

  // Cycle day in mobile
  const handlePrevDay = () => {
    const idx = DAYS_OF_WEEK.indexOf(activeDay);
    const prevIdx = (idx - 1 + 7) % 7;
    setActiveDay(DAYS_OF_WEEK[prevIdx]);
  };

  const handleNextDay = () => {
    const idx = DAYS_OF_WEEK.indexOf(activeDay);
    const nextIdx = (idx + 1) % 7;
    setActiveDay(DAYS_OF_WEEK[nextIdx]);
  };

  const activeDayBlocks = visibleBlocks
    .filter((b) => b.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="timetable-container flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-w-0">
      
      {/* ─── MOBILE CONTROLS BAR (Day Selector & View Toggle) ──────────────── */}
      <div className="lg:hidden p-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 space-y-2.5">
        
        {/* Top Toggle: Day View vs Week View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMobileView('day')}
              className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg transition ${
                mobileView === 'day'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setMobileView('week')}
              className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg transition ${
                mobileView === 'week'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>7-Day Grid</span>
            </button>
          </div>

          {/* Quick Add on Mobile */}
          <button
            onClick={() => onSlotClick(activeDay, '09:00')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Day Strip (Horizontal Selector) */}
        {mobileView === 'day' && (
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = activeDay === day;
              const count = blocksByDay[day].length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105 font-bold'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider">{day.slice(0, 3)}</span>
                  <span
                    className={`text-[9px] mt-0.5 px-1 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : count > 0
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MOBILE SINGLE-DAY AGENDA VIEW ─────────────────────────────────── */}
      {mobileView === 'day' ? (
        <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
          
          {/* Day Navigation Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeDay}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeDayBlocks.length} scheduled event{activeDayBlocks.length === 1 ? '' : 's'}
              </p>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Event Cards */}
          {activeDayBlocks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No events scheduled for {activeDay}
              </p>
              <p className="text-xs text-slate-400">
                Enjoy your free time or add a new block!
              </p>
              <button
                onClick={() => onSlotClick(activeDay, '10:00')}
                className="mt-2 inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event on {activeDay}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDayBlocks.map((block) => {
                const domain = domainMap.get(block.domainId);
                const color = domain?.color || '#6366f1';

                return (
                  <div
                    key={block.id}
                    onClick={() => onEditBlock(block)}
                    className="p-3.5 rounded-2xl border bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    style={{
                      borderColor: `${color}40`,
                      borderLeftWidth: '5px',
                      borderLeftColor: color,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {block.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center space-x-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{block.startTime} - {block.endTime}</span>
                          </span>

                          {block.location && (
                            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{block.location}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {domain?.name || block.domainId}
                      </span>
                    </div>

                    {block.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {block.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : null}

      {/* ─── DESKTOP (OR MOBILE 7-DAY) FULL TIMETABLE GRID ─────────────────── */}
      <div className={`overflow-x-auto flex-1 ${mobileView === 'day' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="min-w-[760px] flex-1 flex flex-col">
          
          {/* Header row: Day Names */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur z-20">
            <div className="p-3 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-r border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
              GMT/Local
            </div>
            {DAYS_OF_WEEK.map((day) => {
              const dayLayout = blocksByDay[day];
              const eventCount = dayLayout.length;
              return (
                <div
                  key={day}
                  className="p-3 text-center border-r last:border-r-0 border-slate-200/60 dark:border-slate-800"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    {day.slice(0, 3)}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    {eventCount === 1 ? '1 event' : `${eventCount} events`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] relative">
            
            {/* Time labels column */}
            <div className="border-r border-slate-200/60 dark:border-slate-800 select-none bg-slate-50/50 dark:bg-slate-950/20">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${PIXELS_PER_HOUR}px` }}
                  className="relative text-right pr-2.5 pt-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40"
                >
                  <span>{String(hour).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="relative border-r last:border-r-0 border-slate-200/60 dark:border-slate-800"
                style={{ height: `${hours.length * PIXELS_PER_HOUR}px` }}
              >
                {/* Horizontal hour lines and click targets */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onSlotClick(day, `${String(hour).padStart(2, '0')}:00`)}
                    style={{ height: `${PIXELS_PER_HOUR}px` }}
                    className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer group relative"
                    title={`Click to add event on ${day} at ${String(hour).padStart(2, '0')}:00`}
                  >
                    <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-100/80 dark:border-slate-800/20 pointer-events-none" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="p-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium flex items-center space-x-1">
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Rendered Time Blocks for this day */}
                {blocksByDay[day].map(({ block, colIndex, totalCols, hasConflict }) => (
                  <TimeBlock
                    key={block.id}
                    block={block}
                    domain={domainMap.get(block.domainId)}
                    startHour={startHour}
                    pixelsPerHour={PIXELS_PER_HOUR}
                    colIndex={colIndex}
                    totalCols={totalCols}
                    hasConflict={hasConflict}
                    onEdit={onEditBlock}
                    onDelete={onDeleteBlock}
                  />
                ))}
              </div>
            ))}

          </div>

        </div>
      </div>

    </div>
  );
};
