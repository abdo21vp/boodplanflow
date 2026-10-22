import React from 'react';
import { X, Send, Bot, CheckCircle2, MessageSquare, ExternalLink, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const botUsername = 'bood_flow_bot';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>Telegram Daily Assistant</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive daily lectures & due work directly on phone
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Bot Card */}
          <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  @{botUsername}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live & Online</span>
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Your personal assistant is active. Message it on Telegram to check your daily Al-Azhar CS schedule, classrooms, gym workouts, and halqat anytime.
            </p>

            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Open in Telegram (@{botUsername})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Supported Commands */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Commands you can send the bot:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>/today</span>
                </div>
                <span className="text-slate-500 text-[11px]">Today's lectures, rooms & gym</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-violet-600 dark:text-violet-400 font-semibold">
                  <Bell className="w-3.5 h-3.5" />
                  <span>/tomorrow</span>
                </div>
                <span className="text-slate-500 text-[11px]">Preview tomorrow's agenda</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>/week</span>
                </div>
                <span className="text-slate-500 text-[11px]">Master 7-day routine overview</span>
              </div>
            </div>
          </div>

          {/* User Account Status */}
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>
              {user ? (
                <>Connected to account: <strong className="text-slate-700 dark:text-slate-200">{user.email}</strong></>
              ) : (
                <>Sign in with Google on the website to link your schedule automatically.</>
              )}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
