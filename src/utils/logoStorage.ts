// Utilities for custom logo upload and persistence across the website and print views

const LOGO_STORAGE_KEY = 'wedding_system_custom_logo_data_v1';
const LOGO_CHANGE_EVENT = 'wedding_logo_changed';

export function getStoredCustomLogo(): string | null {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveStoredCustomLogo(dataUrl: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
    window.dispatchEvent(new CustomEvent(LOGO_CHANGE_EVENT, { detail: dataUrl }));
  } catch (err) {
    console.error('Failed to save custom logo to localStorage:', err);
  }
}

export function clearStoredCustomLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(LOGO_CHANGE_EVENT, { detail: null }));
  } catch (err) {
    console.error('Failed to clear custom logo from localStorage:', err);
  }
}

export function subscribeToLogoChanges(callback: (logoUrl: string | null) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<string | null>;
    callback(customEvent.detail);
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === LOGO_STORAGE_KEY) {
      callback(e.newValue);
    }
  };

  window.addEventListener(LOGO_CHANGE_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(LOGO_CHANGE_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
