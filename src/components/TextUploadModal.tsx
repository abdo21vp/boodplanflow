import React, { useState, useRef } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  UploadCloud, 
  FileText, 
  Zap, 
  Loader2, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { SAMPLE_GOAL_PROMPTS } from '../data/defaultSchedule';
import { ParsedGoalPlan, ScheduleBlock } from '../types/schedule';
import { arrangeGoalsWithAI } from '../services/gemini';

interface TextUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanReady: (plan: ParsedGoalPlan, rawText: string) => void;
  apiKey?: string;
  geminiModel?: string;
  existingBlocks: ScheduleBlock[];
}

export const TextUploadModal: React.FC<TextUploadModalProps> = ({
  isOpen,
  onClose,
  onPlanReady,
  apiKey,
  geminiModel,
  existingBlocks,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!text.trim()) {
      setErrorMessage('Please paste or write your goals before arranging.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const plan = await arrangeGoalsWithAI(text, apiKey, geminiModel, undefined, existingBlocks);
      onPlanReady(plan, text);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to arrange goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const loadSample = (sampleText: string) => {
    setText(sampleText);
    setErrorMessage(null);
  };

  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Auto-Schedule Routine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hasApiKey 
                  ? 'Gemini LLM reasoning + domain auto-classifier' 
                  : 'Fast heuristic parser (offline & instant)'}
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Engine indicator pill */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              {hasApiKey ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    LLM Mode Active
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Smart Heuristic Engine Active
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Academic • Fitness • Secular • Work
            </span>
          </div>

          {/* Text Area with Dropzone capability */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`relative rounded-xl border transition-all ${
              dragOver 
                ? 'border-slate-900 dark:border-white bg-slate-100/50 dark:bg-slate-800/50' 
                : 'border-slate-200 dark:border-slate-800 focus-within:border-slate-900 dark:focus-within:border-white'
            }`}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your weekly goals, timetable, or routine here...&#10;&#10;e.g.:&#10;- Gym workout 3 days a week (Mon/Wed/Fri 7am to 8:30am)&#10;- Computer Science lectures Tuesday and Thursday 10am to 12pm&#10;- Apartment cleaning and grocery shopping Sunday morning 10am to 1pm&#10;- Deep work code sessions Monday-Friday 2pm to 5pm"
              rows={8}
              className="w-full p-3.5 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none font-sans"
            />

            {/* Bottom upload prompt row */}
            <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/60 rounded-b-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Drag & drop a .txt or .md notes file</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-slate-900 dark:text-white hover:underline flex items-center space-x-1"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Browse File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".txt,.md,.text"
                className="hidden"
              />
            </div>
          </div>

          {/* Sample Goal Prompts for 1-Click Testing */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Try an example routine:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_GOAL_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSample(sample.text)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition group"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-1">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    Click to load routine
                  </div>
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm disabled:opacity-40 transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Arranging Timetable...</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-4 h-4" />
                <span>Arrange into Schedule</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
