export const VAULT_STORAGE_KEY = "ghostgate_vault";

export type VaultEncryptionEntry = {
  id: string;
  type: "encryption";
  createdAt: number;
  encryptedBase64: string;
};

export type VaultIdentityEntry = {
  id: string;
  type: "identity";
  createdAt: number;
  name: string;
  email: string;
  location: string;
};

export type VaultEntry = VaultEncryptionEntry | VaultIdentityEntry;

export function loadVault(): VaultEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveVault(entries: VaultEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function wipeVaultStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(VAULT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
