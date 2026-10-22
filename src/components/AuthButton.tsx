import React from 'react';
import { LogIn, LogOut, Cloud, CloudOff, Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthButton: React.FC = () => {
  const { user, loading, firebaseReady, signIn, signOut } = useAuth();

  if (!firebaseReady) {
    return (
      <div
        title="Firebase not configured. Add your Firebase config to enable cloud sync."
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 cursor-help"
      >
        <CloudOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sync: Not configured</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        {/* Sync indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Synced</span>
        </div>

        {/* User avatar + sign out */}
        <div className="flex items-center space-x-1.5 group relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-7 h-7 rounded-full border-2 border-indigo-200 dark:border-indigo-800 cursor-pointer"
              title={`Signed in as ${user.displayName || user.email}`}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}

          {/* Hover dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-[11px] text-slate-400 truncate mb-2">{user.email}</p>
            <button
              onClick={signOut}
              className="w-full flex items-center space-x-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  return (
    <button
      onClick={signIn}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-sm shadow-indigo-600/20 transition active:scale-95"
      title="Sign in with Google to sync your schedule across all devices"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Sign in to Sync</span>
      <span className="sm:hidden">Sign in</span>
    </button>
  );
};
