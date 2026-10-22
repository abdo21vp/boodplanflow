import React from 'react';
import { ScheduleBlock, DomainCategory } from '../types/schedule';
import { AlertCircle, Clock } from 'lucide-react';

interface TimeBlockProps {
  block: ScheduleBlock;
  domain?: DomainCategory;
  startHour: number;
  pixelsPerHour: number;
  colIndex: number;
  totalCols: number;
  hasConflict: boolean;
  onEdit: (block: ScheduleBlock) => void;
  onDelete: (blockId: string) => void;
}

export const TimeBlock: React.FC<TimeBlockProps> = ({
  block,
  domain,
  startHour,
  pixelsPerHour,
  colIndex,
  totalCols,
  hasConflict,
  onEdit,
  onDelete,
}) => {
  const [startH, startM] = block.startTime.split(':').map(Number);
  const [endH, endM] = block.endTime.split(':').map(Number);

  const startDecimal = startH + startM / 60;
  const endDecimal = endH + endM / 60;
  const durationHours = Math.max(0.25, endDecimal - startDecimal);

  const topPx = (startDecimal - startHour) * pixelsPerHour;
  const heightPx = durationHours * pixelsPerHour;

  const widthPct = 100 / totalCols;
  const leftPct = colIndex * widthPct;

  const fallbackColor = '#6366f1';
  const domainColor = domain?.color || fallbackColor;

  return (
    <div
      onClick={() => onEdit(block)}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
      }}
      className="absolute p-1 z-10 transition-all duration-150 group cursor-pointer"
    >
      <div
        className="h-full w-full rounded-xl p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-200 border group-hover:shadow-md group-hover:scale-[1.01]"
        style={{
          backgroundColor: domain ? `${domain.color}15` : '#eef2ff',
          borderColor: domainColor,
          borderLeftWidth: '4px',
        }}
      >
        {/* Top: Title & Conflict Badges */}
        <div className="min-w-0">
          <div className="flex items-center justify-between space-x-1">
            <h5
              className="text-xs font-semibold truncate leading-tight tracking-tight"
              style={{ color: domainColor }}
              title={block.title}
            >
              {block.title}
            </h5>

            {hasConflict && (
              <span
                title="Overlaps with another block"
                className="p-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400"
              >
                <AlertCircle className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Time range */}
          <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
            <span className="truncate">
              {block.startTime} - {block.endTime}
            </span>
          </div>

          {/* Notes (if height permits) */}
          {heightPx > 50 && block.notes && (
            <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-1 opacity-80">
              {block.notes}
            </p>
          )}
        </div>

        {/* Hover Action bar (visible on card hover) */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end space-x-1 transition-opacity pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Delete this block"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
