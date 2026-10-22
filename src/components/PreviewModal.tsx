import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Check, 
  Layers, 
  AlertCircle, 
  Clock, 
  Send, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';
import { ParsedGoalPlan, ScheduleBlock, DomainCategory } from '../types/schedule';
import { arrangeGoalsWithAI } from '../services/gemini';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ParsedGoalPlan | null;
  rawText: string;
  onApplyPlan: (blocks: ScheduleBlock[], mode: 'replace' | 'merge') => void;
  apiKey?: string;
  geminiModel?: string;
  domains: DomainCategory[];
  existingBlocks: ScheduleBlock[];
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  plan,
  rawText,
  onApplyPlan,
  apiKey,
  geminiModel,
  domains,
  existingBlocks,
}) => {
  const [currentPlan, setCurrentPlan] = useState<ParsedGoalPlan | null>(plan);
  const [tweakPrompt, setTweakPrompt] = useState('');
  const [tweaking, setTweaking] = useState(false);

  // Update when prop changes
  React.useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  if (!isOpen || !currentPlan) return null;

  const domainMap = new Map(domains.map((d) => [d.id, d]));

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweakPrompt.trim() || tweaking) return;

    setTweaking(true);
    try {
      const updatedPlan = await arrangeGoalsWithAI(
        rawText,
        apiKey,
        geminiModel,
        tweakPrompt,
        currentPlan.blocks
      );
      setCurrentPlan(updatedPlan);
      setTweakPrompt('');
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setTweaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Arrangement Preview
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {currentPlan.blocks.length} blocks generated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review proposed timetable and customize before applying
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Summary & Reasoning Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>{currentPlan.summary}</span>
            </div>
            {currentPlan.reasoning && (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentPlan.reasoning}
              </p>
            )}
          </div>

          {/* Domain Breakdown Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Domain Allocations:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {currentPlan.detectedDomains.map((d) => {
                const domainDef = domainMap.get(d.id);
                const color = domainDef?.color || '#6366f1';
                return (
                  <div
                    key={d.id}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border"
                    style={{
                      borderColor: `${color}40`,
                      backgroundColor: `${color}10`,
                      color: color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span>{d.name}:</span>
                    <span className="font-bold">{d.estimatedHours}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict warnings (if any) */}
          {currentPlan.conflicts && currentPlan.conflicts.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Scheduling Notes & Clashes Detected:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] opacity-90">
                {currentPlan.conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated Blocks Grid / List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Arranged Time Blocks ({currentPlan.blocks.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {currentPlan.blocks.map((block) => {
                const domain = domainMap.get(block.domainId);
                const color = domain?.color || '#6366f1';
                return (
                  <div
                    key={block.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                        <span className="truncate pr-2">{block.title}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          {domain?.name || block.domainId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {block.day} • {block.startTime} - {block.endTime}
                        </span>
                      </div>
                    </div>
                    {block.notes && (
                      <p className="text-[10px] text-slate-400 truncate mt-1">
                        {block.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversational Tweak Input (User Requirement) */}
          <form onSubmit={handleRefine} className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Want adjustments? Ask to tweak the routine:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tweakPrompt}
                onChange={(e) => setTweakPrompt(e.target.value)}
                placeholder="e.g., 'Make study sessions 1 hour earlier', 'Add 30 min lunch breaks'..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                disabled={tweaking || !tweakPrompt.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-40 transition flex items-center space-x-1.5 flex-shrink-0"
              >
                {tweaking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Tweak</span>
              </button>
            </div>
          </form>

        </div>

        {/* Footer with Apply Options */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Discard
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onApplyPlan(currentPlan.blocks, 'merge')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition shadow-sm"
              title="Add these blocks to your existing schedule"
            >
              Merge with Current
            </button>

            <button
              type="button"
              onClick={() => onApplyPlan(currentPlan.blocks, 'replace')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-95"
              title="Replace entire weekly timetable with this arranged routine"
            >
              <Check className="w-4 h-4" />
              <span>Replace Entire Schedule</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
