import React, { useState } from "react";
import { Lock, Unlock, Key, ShieldCheck, AlertCircle, Eye, EyeOff, Download, Upload, RefreshCw, X } from "lucide-react";
import {
  isVaultInitialized,
  initializeVault,
  unlockVault,
  exportEncryptedVault,
  importEncryptedVault,
  resetVault,
  changeVaultPassword,
} from "./cryptoVault";
import { INITIAL_VAULT_DATA } from "./defaultData";
import type { VaultData } from "./types";

interface AuthModalProps {
  isOpen: boolean;
  onUnlocked: (data: VaultData, masterPass: string) => void;
  onClose?: () => void;
  currentVaultData?: VaultData | null;
  masterPassword?: string;
  onUpdateVault?: (data: VaultData) => void;
  managementMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onUnlocked,
  currentVaultData,
  masterPassword,
  onUpdateVault,
  onClose,
  managementMode = false,
}) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(() => isVaultInitialized());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"unlock" | "settings" | "password" | "backup">(managementMode ? "settings" : "unlock");
  const [backupJson, setBackupJson] = useState("");
  const [backupSuccess, setBackupSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmNextPassword, setConfirmNextPassword] = useState("");

  React.useEffect(() => {
    if (isOpen) setActiveTab(managementMode ? "settings" : "unlock");
  }, [isOpen, managementMode]);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await unlockVault(password);
      onUnlocked(data, password);
      setPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Incorrect password.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setBackupSuccess("");
    if (nextPassword.length < 6) {
      setErrorMessage("New master password must be at least 6 characters.");
      return;
    }
    if (nextPassword !== confirmNextPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await changeVaultPassword(currentPassword || masterPassword || "", nextPassword);
      onUnlocked(data, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmNextPassword("");
      setBackupSuccess("Password changed. Your vault was re-encrypted with a new salt.");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not verify the current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetVault = () => {
    if (confirm("Are you sure you want to reset this local browser vault? Existing encrypted items will be cleared.")) {
      resetVault();
      setIsInitialized(false);
      setPassword("");
      setConfirmPassword("");
      setErrorMessage("");
    }
  };

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Master password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const initialData: VaultData = {
        ...INITIAL_VAULT_DATA,
        apiKey: apiKey.trim(),
        provider,
        lastUnlocked: new Date().toISOString(),
      };

      await initializeVault(password, initialData);
      setIsInitialized(true);
      onUnlocked(initialData, password);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize encrypted vault.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVaultData || !onUpdateVault) return;

    const updated: VaultData = {
      ...currentVaultData,
      apiKey: apiKey.trim(),
      provider,
    };
    onUpdateVault(updated);
    setBackupSuccess("API settings updated and encrypted in local vault.");
  };

  const handleExportBackup = () => {
    const exported = exportEncryptedVault();
    const blob = new Blob([exported], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `language-hub-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupSuccess("Encrypted vault exported to downloads.");
  };

  const handleImportBackup = () => {
    setErrorMessage("");
    if (!backupJson.trim()) {
      setErrorMessage("Please paste the encrypted JSON backup string.");
      return;
    }
    const success = importEncryptedVault(backupJson);
    if (success) {
      setIsInitialized(true);
      setBackupSuccess("Vault imported successfully. Enter your password to unlock.");
      setActiveTab("unlock");
    } else {
      setErrorMessage("Invalid vault backup format.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-color)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 flex items-center justify-center text-[var(--accent-color)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[var(--heading-color)]">Cryptographic Access Gate</h2>
              <p className="text-xs text-[var(--text-color)] opacity-70">PBKDF2 + 256-bit AES-GCM Client Vault</p>
            </div>
          </div>
          {currentVaultData && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("settings")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  activeTab === "settings"
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)]/15 text-[var(--heading-color)]"
                    : "border-[var(--border-color)] opacity-70 hover:opacity-100"
                }`}
              >
                API Key
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  activeTab === "password"
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)]/15 text-[var(--heading-color)]"
                    : "border-[var(--border-color)] opacity-70 hover:opacity-100"
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setActiveTab("backup")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  activeTab === "backup"
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)]/15 text-[var(--heading-color)]"
                    : "border-[var(--border-color)] opacity-70 hover:opacity-100"
                }`}
              >
                Backup
              </button>
            </div>
          )}
          {managementMode && onClose && (
            <button onClick={onClose} className="ml-2 p-1 opacity-60 hover:opacity-100" aria-label="Close settings">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {backupSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{backupSuccess}</span>
            </div>
          )}

          {!isInitialized ? (
            /* First-time Setup */
            <form onSubmit={handleInitialize} className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-1">
                <p className="font-semibold text-[var(--heading-color)]">Welcome to Language Learning Hub</p>
                <p className="opacity-75">
                  Set a master password to encrypt your learning data, custom notebooks, and API tokens directly in your browser. No server ever sees
                  your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Master Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-color)] opacity-50 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat master password"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80 flex justify-between">
                  <span>Google AI Studio / Groq API Key (Optional)</span>
                  <span className="opacity-60 lowercase">free tier supported</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... or gsk_... (Stored encrypted)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
                />
                <p className="mt-1 text-[11px] opacity-60">Leave blank to use pre-loaded linguistic data and heuristic fallback.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Create Encrypted Workspace
                </button>
              </div>
            </form>
          ) : activeTab === "settings" && currentVaultData ? (
            /* Settings Mode: Manage API Key */
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">AI Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider("gemini")}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      provider === "gemini"
                        ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--heading-color)]"
                        : "border-[var(--border-color)] opacity-70"
                    }`}
                  >
                    Google AI Studio (Gemini)
                    <span className="block text-[10px] opacity-60 mt-0.5">Gemini 2.5 Flash (Free Tier)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider("groq")}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      provider === "groq"
                        ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--heading-color)]"
                        : "border-[var(--border-color)] opacity-70"
                    }`}
                  >
                    Groq Cloud
                    <span className="block text-[10px] opacity-60 mt-0.5">Llama 3.3 70B (Fast Inference)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">API Key</label>
                <input
                  type="password"
                  value={apiKey || currentVaultData.apiKey || ""}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs hover:opacity-95 transition-all"
                >
                  Save API Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unlock")}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs opacity-75 hover:opacity-100"
                >
                  Back
                </button>
              </div>
            </form>
          ) : activeTab === "backup" ? (
            /* Backup / Restore */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-1">
                <p className="font-semibold text-[var(--heading-color)]">Encrypted Data Portability</p>
                <p className="opacity-75">Export your encrypted learning state to keep a safe backup across devices.</p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" /> Download Encrypted Vault JSON
              </button>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Restore from JSON Backup</label>
                <textarea
                  rows={3}
                  value={backupJson}
                  onChange={(e) => setBackupJson(e.target.value)}
                  placeholder="Paste encrypted JSON vault here..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                />
                <button
                  type="button"
                  onClick={handleImportBackup}
                  className="mt-2 w-full py-2 px-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)] text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" /> Restore Vault
                </button>
              </div>

              {currentVaultData && (
                <button type="button" onClick={() => setActiveTab("unlock")} className="w-full py-2 text-xs opacity-60 hover:opacity-100">
                  Back to Hub
                </button>
              )}
            </div>
          ) : activeTab === "password" && currentVaultData ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-1">
                <p className="font-semibold text-[var(--heading-color)]">Change master password</p>
                <p className="opacity-75">
                  Your existing password is verified first; the vault is then encrypted again using a new random salt. Export a backup before making
                  this change.
                </p>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Current Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to preserve encrypted data"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={nextPassword}
                  onChange={(e) => setNextPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmNextPassword}
                  onChange={(e) => setConfirmNextPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs opacity-70 hover:opacity-100">
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-xs hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Re-encrypting…" : "Change & Re-encrypt"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs opacity-75 hover:opacity-100"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            /* Regular Unlock Gate */
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-80">Master Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to unlock vault..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--accent-color)] pr-10"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-color)] opacity-50 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent-color)] text-black font-semibold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                  Unlock Learning Hub
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] opacity-60 pt-2 border-t border-[var(--border-color)]">
                <button type="button" onClick={handleResetVault} className="hover:text-red-400 underline cursor-pointer">
                  Reset Local Vault
                </button>
                <button type="button" onClick={() => setActiveTab("backup")} className="hover:text-[var(--accent-color)] underline cursor-pointer">
                  Import / Restore Backup
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
