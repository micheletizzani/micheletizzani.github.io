import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Lock,
  Settings,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import type { StudyEnvironment, VaultData } from './types';

interface EnvironmentSelectorProps {
  vaultData: VaultData;
  activeEnvironment: StudyEnvironment;
  onSelectEnvironment: (envId: string) => void;
  onCreateEnvironment: (newEnv: StudyEnvironment) => void;
  onDeleteEnvironment: (envId: string) => void;
  onLockVault: () => void;
  onOpenSettings: () => void;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  vaultData,
  activeEnvironment,
  onSelectEnvironment,
  onCreateEnvironment,
  onDeleteEnvironment,
  onLockVault,
  onOpenSettings,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for new environment
  const [title, setTitle] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('Italian');
  const [bridgeLanguages, setBridgeLanguages] = useState('English');
  const [targetLevel, setTargetLevel] = useState('CEFR B1 (DU3 Module 4)');
  const [dailyMinutes, setDailyMinutes] = useState(25);
  const [targetDate, setTargetDate] = useState('2026-11-10');

  // Compute days left
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(activeEnvironment.profile.targetDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetLanguage.trim()) return;

    const newEnv: StudyEnvironment = {
      id: `env_${Date.now()}`,
      title: title.trim(),
      profile: {
        targetLanguage: targetLanguage.trim(),
        nativeLanguage: nativeLanguage.trim(),
        bridgeLanguages: bridgeLanguages.split(',').map((s) => s.trim()).filter(Boolean),
        currentLevel: 'A0 Beginner',
        targetLevel: targetLevel.trim(),
        dailyMinutes: Number(dailyMinutes) || 20,
        targetDate: targetDate || '2026-12-31',
        startDate: new Date().toISOString().slice(0, 10),
        totalStudyHours: 0,
      },
      vocabulary: [],
      errorLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateEnvironment(newEnv);
    setIsCreateModalOpen(false);
    setTitle('');
    setTargetLanguage('');
  };

  return (
    <div className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Environment Selector Dropdown */}
      <div className="relative flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 flex items-center justify-center text-[var(--accent-color)]">
          <Globe className="w-4 h-4" />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-left font-serif font-bold text-base md:text-lg text-[var(--heading-color)] hover:text-[var(--accent-color)] transition-colors"
          >
            <span>{activeEnvironment.title}</span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider opacity-60 border-b border-[var(--border-color)]">
                Active Study Notebooks
              </div>
              {vaultData.environments.map((env) => (
                <div
                  key={env.id}
                  className={`flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[var(--bg-secondary)] ${
                    env.id === activeEnvironment.id ? 'text-[var(--accent-color)] font-bold' : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectEnvironment(env.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex-1 text-left truncate"
                  >
                    {env.title}
                  </button>
                  {vaultData.environments.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete notebook "${env.title}"?`)) {
                          onDeleteEnvironment(env.id);
                        }
                      }}
                      className="text-red-400 opacity-60 hover:opacity-100 p-1"
                      title="Delete notebook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <div className="pt-1 mt-1 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New Language Notebook
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Badges */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] opacity-80">
            Target: <b className="text-[var(--heading-color)]">{activeEnvironment.profile.targetLanguage}</b>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] opacity-80">
            L1: <b className="text-[var(--heading-color)]">{activeEnvironment.profile.nativeLanguage}</b>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] opacity-80">
            Bridge: <b className="text-[var(--heading-color)]">{activeEnvironment.profile.bridgeLanguages.join(', ')}</b>
          </span>
        </div>
      </div>

      {/* Right Stats & Action Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 text-xs opacity-75 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            {activeEnvironment.profile.dailyMinutes}m/day
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            {daysLeft} days to target
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-color)] opacity-80 hover:opacity-100 transition-all"
          title="Vault & API Key Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onLockVault}
          className="px-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-red-400 text-xs font-mono font-medium text-[var(--text-color)] opacity-80 hover:opacity-100 hover:text-red-400 transition-all flex items-center gap-1.5"
          title="Lock Vault"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock Vault</span>
        </button>
      </div>

      {/* Create New Environment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-color)]">
            <h3 className="text-lg font-serif font-bold text-[var(--heading-color)] mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--accent-color)]" />
              New Language Study Environment
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                  Notebook Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spanish (Academic & Research)"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                    Target Language
                  </label>
                  <input
                    type="text"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    placeholder="e.g. Spanish"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                    Native (L1)
                  </label>
                  <input
                    type="text"
                    value={nativeLanguage}
                    onChange={(e) => setNativeLanguage(e.target.value)}
                    placeholder="e.g. Italian"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                  Bridge Languages (L2 / L3)
                </label>
                <input
                  type="text"
                  value={bridgeLanguages}
                  onChange={(e) => setBridgeLanguages(e.target.value)}
                  placeholder="e.g. English, French"
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                    Target Level
                  </label>
                  <input
                    type="text"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    placeholder="e.g. CEFR B1"
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                    Daily Minutes
                  </label>
                  <input
                    type="number"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    min={5}
                    max={180}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider mb-1 opacity-80">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[var(--accent-color)]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs hover:opacity-95"
                >
                  Create Environment
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs opacity-75 hover:opacity-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
