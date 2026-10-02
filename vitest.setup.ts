class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Node >=22 exposes an experimental `localStorage`/`sessionStorage` global that
// returns undefined unless started with --localstorage-file, which shadows
// jsdom's implementation under Vitest. Install an in-memory fallback.
function installStorage(name: 'localStorage' | 'sessionStorage'): void {
  const target = globalThis as Record<string, unknown>;
  if (typeof target[name] !== 'undefined') return;
  const storage = new MemoryStorage();
  Object.defineProperty(target, name, {
    value: storage,
    configurable: true,
    writable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

installStorage('localStorage');
installStorage('sessionStorage');
