import { AbstractStorage } from './storage';

export class LocalStorageService extends AbstractStorage<string, string> {
  getItem(key: string): string | null;
  getItem(key: string, defaultValue: string): string;
  getItem(key: string, defaultValue?: string): string | null {
    return localStorage.getItem(key) ?? defaultValue ?? null;
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
