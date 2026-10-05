import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  PenTool,
  Gamepad2,
  Layers,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Search,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { EnvironmentSelector } from './EnvironmentSelector';
import { AssessmentView } from './AssessmentView';
import { TheoryView } from './TheoryView';
import { PracticalView } from './PracticalView';
import { GamesView } from './GamesView';
import { WordGloss } from './WordGloss';
import { saveVault, isVaultInitialized } from './cryptoVault';
import { INITIAL_VAULT_DATA } from './defaultData';
import type { VaultData, StudyEnvironment, UncertaintyItem } from './types';

export const LanguageHubApp: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [vaultData, setVaultData] = useState<VaultData>(INITIAL_VAULT_DATA);
  const [activeTab, setActiveTab] = useState<'assessment' | 'theory' | 'practical' | 'games' | 'ledger'>('assessment');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [vocabFilter, setVocabFilter] = useState('');
  const [uncertaintyFilter, setUncertaintyFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [uncertaintySearch, setUncertaintySearch] = useState('');

  // Lock on first render if vault is initialized
  useEffect(() => {
    if (!isVaultInitialized()) {
      setIsLocked(true);
    }
  }, []);

  const handleUnlocked = (data: VaultData, pass: string) => {
    setVaultData(data);
    setMasterPassword(pass);
    setIsLocked(false);
  };

  const handleLock = () => {
    setMasterPassword('');
    setIsLocked(true);
  };

  const updateVault = (updated: VaultData) => {
    setVaultData(updated);
    if (masterPassword) {
      saveVault(masterPassword, updated).catch((err) => {
        console.error('Failed to auto-save encrypted vault:', err);
      });
    }
  };

  const activeEnvironment: StudyEnvironment =
    vaultData.environments.find((e) => e.id === vaultData.activeEnvironmentId) ||
    vaultData.environments[0] ||
    INITIAL_VAULT_DATA.environments[0];

  const handleUpdateActiveEnvironment = (updatedEnv: StudyEnvironment) => {
    const updatedEnvironments = vaultData.environments.map((env) =>
      env.id === updatedEnv.id ? updatedEnv : env
    );
    updateVault({
      ...vaultData,
      environments: updatedEnvironments,
    });
  };

  const handleSelectEnvironment = (envId: string) => {
    updateVault({
      ...vaultData,
      activeEnvironmentId: envId,
    });
  };

  const handleCreateEnvironment = (newEnv: StudyEnvironment) => {
    updateVault({
      ...vaultData,
      environments: [...vaultData.environments, newEnv],
      activeEnvironmentId: newEnv.id,
    });
  };

  const handleDeleteEnvironment = (envId: string) => {
    const remaining = vaultData.environments.filter((e) => e.id !== envId);
    if (remaining.length === 0) return;
    updateVault({
      ...vaultData,
      environments: remaining,
      activeEnvironmentId: remaining[0].id,
    });
  };

  const handleDeleteVocab = (vocabId: string) => {
    const updated = activeEnvironment.vocabulary.filter((v) => v.id !== vocabId);
    handleUpdateActiveEnvironment({
      ...activeEnvironment,
      vocabulary: updated,
    });
  };

  const filteredVocabulary = activeEnvironment.vocabulary.filter(
    (v) =>
      v.lemma.toLowerCase().includes(vocabFilter.toLowerCase()) ||
      v.meaning.toLowerCase().includes(vocabFilter.toLowerCase()) ||
      v.bridge.toLowerCase().includes(vocabFilter.toLowerCase())
  );

  const handleToggleUncertaintyResolved = (id: string) => {
    const updatedQueue = (activeEnvironment.uncertaintyQueue || []).map((item) =>
      item.id === id ? { ...item, resolved: !item.resolved } : item
    );
    handleUpdateActiveEnvironment({
      ...activeEnvironment,
      uncertaintyQueue: updatedQueue,
    });
  };

  const handleDeleteUncertainty = (id: string) => {
    const updatedQueue = (activeEnvironment.uncertaintyQueue || []).filter((item) => item.id !== id);
    handleUpdateActiveEnvironment({
      ...activeEnvironment,
      uncertaintyQueue: updatedQueue,
    });
  };

  const handleExportUncertaintyAnki = () => {
    const queue = activeEnvironment.uncertaintyQueue || [];
    if (queue.length === 0) return;
    const tsvRows = queue.map(
      (item) =>
        `[${item.section}] ${item.prompt}\tHint: ${item.suggestionHint} | Solution: ${item.solution} [${item.category || ''}]`
    );
    const blob = new Blob([tsvRows.join('\n')], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEnvironment.profile.targetLanguage.toLowerCase()}_uncertainty_revision.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUncertaintyQueue = (activeEnvironment.uncertaintyQueue || []).filter((item) => {
    if (uncertaintyFilter === 'unresolved' && item.resolved) return false;
    if (uncertaintyFilter === 'resolved' && !item.resolved) return false;
    if (uncertaintySearch.trim()) {
      const q = uncertaintySearch.toLowerCase();
      return (
        item.prompt.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.solution.toLowerCase().includes(q) ||
        item.suggestionHint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalUncertain = (activeEnvironment.uncertaintyQueue || []).length;
  const unresolvedUncertain = (activeEnvironment.uncertaintyQueue || []).filter((i) => !i.resolved).length;
  const resolvedUncertain = totalUncertain - unresolvedUncertain;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col font-sans transition-colors duration-300">
      {/* Cryptographic Auth Modal */}
      <AuthModal
        isOpen={isLocked || isSettingsOpen}
        onUnlocked={handleUnlocked}
        onClose={() => setIsSettingsOpen(false)}
        currentVaultData={vaultData}
        masterPassword={masterPassword}
        onUpdateVault={(updated) => {
          updateVault(updated);
          setIsSettingsOpen(false);
        }}
      />

      {/* Top Application Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-color)] sticky top-0 z-40">
        <div className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/tools"
              className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--heading-color)] hover:bg-[var(--accent-color)] hover:text-black transition-all"
              title="Return to Tools Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tools</span>
            </a>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-[var(--heading-color)]">
                  Language Study Hub
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  <ShieldCheck className="w-3 h-3" /> Encrypted Vault
                </span>
              </div>
              <p className="text-[11px] opacity-60 font-mono hidden sm:block">
                Concept Adjacency & Contrastive Second-Language Acquisition
              </p>
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'assessment'
                  ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                  : 'opacity-70 hover:opacity-100 text-[var(--text-color)]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Diagnostic & Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'theory'
                  ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                  : 'opacity-70 hover:opacity-100 text-[var(--text-color)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Theory & Phonetics</span>
            </button>
            <button
              onClick={() => setActiveTab('practical')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'practical'
                  ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                  : 'opacity-70 hover:opacity-100 text-[var(--text-color)]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Practical Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'games'
                  ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                  : 'opacity-70 hover:opacity-100 text-[var(--text-color)]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gameroom</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-[var(--accent-color)] text-black font-bold shadow'
                  : 'opacity-70 hover:opacity-100 text-[var(--text-color)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Vocabulary ({activeEnvironment.vocabulary.length})</span>
            </button>
          </nav>
        </div>

        {/* Environment Bar */}
        <EnvironmentSelector
          vaultData={vaultData}
          activeEnvironment={activeEnvironment}
          onSelectEnvironment={handleSelectEnvironment}
          onCreateEnvironment={handleCreateEnvironment}
          onDeleteEnvironment={handleDeleteEnvironment}
          onLockVault={handleLock}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </header>

      {/* Main Study Surface */}
      <WordGloss environment={activeEnvironment} apiKey={vaultData.apiKey} provider={vaultData.provider} />
      <main className="flex-1 w-full max-w-[95%] xl:max-w-[85%] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {activeTab === 'assessment' && (
          <AssessmentView
            environment={activeEnvironment}
            onUpdateEnvironment={handleUpdateActiveEnvironment}
            apiKey={vaultData.apiKey}
            provider={vaultData.provider}
          />
        )}

        {activeTab === 'theory' && (
          <TheoryView
            environment={activeEnvironment}
            onUpdateEnvironment={handleUpdateActiveEnvironment}
            apiKey={vaultData.apiKey}
            provider={vaultData.provider}
          />
        )}

        {activeTab === 'practical' && (
          <PracticalView
            environment={activeEnvironment}
            onUpdateEnvironment={handleUpdateActiveEnvironment}
            apiKey={vaultData.apiKey}
            provider={vaultData.provider}
          />
        )}

        {activeTab === 'games' && (
          <GamesView
            environment={activeEnvironment}
            onUpdateEnvironment={handleUpdateActiveEnvironment}
          />
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Uncertainty & Revision Queue */}
            <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-serif font-bold text-[var(--heading-color)]">
                      Uncertainty & Revision Queue
                    </h3>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    Items flagged via "I don't know" across Diagnostic Assessment, Writing Studio, Speaking Lab, Reading Studio, Games, and Theory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportUncertaintyAnki}
                    disabled={totalUncertain === 0}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-mono flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                    title="Export all flagged items as Anki TSV"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Queue to Anki (.tsv)
                  </button>
                </div>
              </div>

              {/* Status and Filters Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUncertaintyFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      uncertaintyFilter === 'all'
                        ? 'bg-[var(--accent-color)] text-black font-bold'
                        : 'bg-[var(--bg-color)] border border-[var(--border-color)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    All ({totalUncertain})
                  </button>
                  <button
                    onClick={() => setUncertaintyFilter('unresolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      uncertaintyFilter === 'unresolved'
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-[var(--bg-color)] border border-[var(--border-color)] opacity-70 hover:opacity-100 text-amber-400'
                    }`}
                  >
                    Pending ({unresolvedUncertain})
                  </button>
                  <button
                    onClick={() => setUncertaintyFilter('resolved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      uncertaintyFilter === 'resolved'
                        ? 'bg-green-500 text-black font-bold'
                        : 'bg-[var(--bg-color)] border border-[var(--border-color)] opacity-70 hover:opacity-100 text-green-400'
                    }`}
                  >
                    Resolved ({resolvedUncertain})
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    value={uncertaintySearch}
                    onChange={(e) => setUncertaintySearch(e.target.value)}
                    placeholder="Search queue..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-mono focus:outline-none focus:border-[var(--accent-color)] w-full sm:w-56"
                  />
                </div>
              </div>

              {filteredUncertaintyQueue.length === 0 ? (
                <div className="text-center py-10 opacity-60 text-xs font-mono border border-dashed border-[var(--border-color)] rounded-xl">
                  {totalUncertain === 0
                    ? 'No items in the uncertainty queue yet. When you select "I don\'t know" in exercises or tests, they will be logged here for later revision.'
                    : 'No items matching current filter.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUncertaintyQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                        item.resolved
                          ? 'bg-[var(--bg-color)]/50 border-[var(--border-color)] opacity-60'
                          : 'bg-[var(--bg-color)] border-[var(--border-color)] hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/30">
                            {item.section}
                          </span>
                          {item.category && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono opacity-60 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                              {item.category}
                            </span>
                          )}
                          <span className="text-[10px] font-mono opacity-40">
                            Logged: {item.dateLogged}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleUncertaintyResolved(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              item.resolved
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-[var(--bg-secondary)] text-[var(--heading-color)] border border-[var(--border-color)] hover:border-green-400'
                            }`}
                            title={item.resolved ? 'Mark as Unresolved' : 'Mark as Mastered / Resolved'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {item.resolved ? 'Mastered' : 'Mark Resolved'}
                          </button>
                          <button
                            onClick={() => handleDeleteUncertainty(item.id)}
                            className="p-1.5 rounded-lg text-red-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete from Queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Prompt / Context */}
                      <div className="font-serif text-sm font-semibold text-[var(--heading-color)]">
                        {item.prompt}
                      </div>

                      {/* Progressive Disclosure Artifacts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <span className="block font-mono text-[10px] uppercase font-bold text-amber-400 mb-1">
                            Pedagogical Suggestion / Hint:
                          </span>
                          <p>{item.suggestionHint}</p>
                        </div>
                        <div lang="da" className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 font-mono">
                          <span className="block text-[10px] uppercase font-bold text-green-400 mb-1">
                            Verified Solution:
                          </span>
                          <p>{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[var(--heading-color)]">
                    Active Vocabulary Ledger
                  </h3>
                  <p className="text-xs opacity-75 mt-0.5">
                    {activeEnvironment.vocabulary.length} tracked lemmas with IPA, stød tags, and FSRS review intervals.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    value={vocabFilter}
                    onChange={(e) => setVocabFilter(e.target.value)}
                    placeholder="Search vocabulary..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              </div>

              {filteredVocabulary.length === 0 ? (
                <div className="text-center py-10 opacity-60 text-xs font-mono">
                  No vocabulary matching filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredVocabulary.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span lang="da" className="text-sm font-bold text-[var(--heading-color)]">{v.lemma}</span>
                          <span className="text-[var(--accent-color)]">{v.ipa}</span>
                          {v.hasStod && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Stød
                            </span>
                          )}
                          {v.hasSoftD && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              Soft d
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] opacity-80 mt-1 font-sans">
                          {v.meaning} — <span className="opacity-60 italic">Bridge: {v.bridge}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="opacity-60">Due: {v.srs.dueDate}</span>
                        <button
                          onClick={() => handleDeleteVocab(v.id)}
                          className="p-1 rounded text-red-400 opacity-60 hover:opacity-100"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Log Matrix */}
            <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h3 className="text-xl font-serif font-bold text-[var(--heading-color)] mb-1">
                Persistent Error Log
              </h3>
              <p className="text-xs opacity-75 mb-6">
                Monitors recurring syntactic and interference mistakes to automatically feed the daily production challenges.
              </p>

              {activeEnvironment.errorLog.length === 0 ? (
                <div className="text-center py-6 opacity-60 text-xs font-mono">
                  No recorded errors yet. Good work!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeEnvironment.errorLog.map((err) => (
                    <div
                      key={err.id}
                      className="p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-red-400 line-through">{err.error}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                            {err.category}
                          </span>
                          <span className="opacity-60 text-[10px]">Seen {err.count}x</span>
                        </div>
                      </div>
                      <div className="font-mono text-green-400 font-bold">
                        → {err.correction}
                      </div>
                      <p className="text-[11px] opacity-75 font-sans">{err.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
