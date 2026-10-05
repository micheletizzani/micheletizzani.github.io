import type { VaultData } from './types';

const VAULT_STORAGE_KEY = 'mt_language_vault_v1';
const SALT_STORAGE_KEY = 'mt_language_salt_v1';
const PBKDF2_ITERATIONS = 100000;

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function isVaultInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(VAULT_STORAGE_KEY) && !!localStorage.getItem(SALT_STORAGE_KEY);
}

export function resetVault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VAULT_STORAGE_KEY);
  localStorage.removeItem(SALT_STORAGE_KEY);
}

export async function initializeVault(password: string, initialData: VaultData): Promise<void> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(initialData));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  localStorage.setItem(SALT_STORAGE_KEY, bufferToBase64(salt.buffer));
  localStorage.setItem(
    VAULT_STORAGE_KEY,
    JSON.stringify({
      iv: bufferToBase64(iv.buffer),
      data: bufferToBase64(ciphertext),
    })
  );
}

export async function unlockVault(password: string): Promise<VaultData> {
  const saltB64 = localStorage.getItem(SALT_STORAGE_KEY);
  const payloadStr = localStorage.getItem(VAULT_STORAGE_KEY);

  if (!saltB64 || !payloadStr) {
    throw new Error('Vault has not been initialized.');
  }

  const { iv: ivB64, data: dataB64 } = JSON.parse(payloadStr);
  const salt = new Uint8Array(base64ToBuffer(saltB64));
  const iv = new Uint8Array(base64ToBuffer(ivB64));
  const ciphertext = base64ToBuffer(dataB64);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as VaultData;
  } catch {
    throw new Error('Incorrect password or cryptographic verification failed.');
  }
}

export async function saveVault(password: string, data: VaultData): Promise<void> {
  const saltB64 = localStorage.getItem(SALT_STORAGE_KEY);
  if (!saltB64) {
    throw new Error('Vault salt not found. Re-initialization required.');
  }

  const salt = new Uint8Array(base64ToBuffer(saltB64));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  localStorage.setItem(
    VAULT_STORAGE_KEY,
    JSON.stringify({
      iv: bufferToBase64(iv.buffer),
      data: bufferToBase64(ciphertext),
    })
  );
}

export function exportEncryptedVault(): string {
  const salt = localStorage.getItem(SALT_STORAGE_KEY) || '';
  const vault = localStorage.getItem(VAULT_STORAGE_KEY) || '';
  return JSON.stringify({ salt, vault, exportedAt: new Date().toISOString() }, null, 2);
}

export function importEncryptedVault(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.salt && parsed.vault) {
      localStorage.setItem(SALT_STORAGE_KEY, parsed.salt);
      localStorage.setItem(VAULT_STORAGE_KEY, parsed.vault);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resetVaultStorage(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY);
  localStorage.removeItem(SALT_STORAGE_KEY);
}
