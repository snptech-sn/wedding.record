import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallGuideModal } from './PWAInstallGuideModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'menuItem' | 'compact';
  className?: string;
  onInstalledSuccess?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
  onInstalledSuccess,
}) => {
  const { isInstallable, isInstalled, isIOS, install, canPromptDirectly } = usePWAInstall();
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // If already installed as standalone PWA, hide or show installed status
  if (isInstalled) {
    if (variant === 'menuItem') {
      return (
        <div className="px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl">
          <Smartphone className="w-4 h-4" />
          <span>បានដំឡើងលើអេក្រង់ដើមរួចរាល់ (Installed)</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (canPromptDirectly) {
      const outcome = await install();
      if (outcome) {
        onInstalledSuccess?.();
      }
    } else {
      setGuideModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleClick}
          title="បន្ថែមទៅអេក្រង់ដើមទូរស័ព្ទ / កុំព្យូទ័រ (Add to Home Screen)"
          className={`inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 hover:bg-rose-100/90 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/60 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98 shrink-0 ${className}`}
        >
          <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="hidden xl:inline">បន្ថែមទៅ Home Screen</span>
          <span className="inline xl:hidden">App</span>
        </button>
      ) : variant === 'menuItem' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/50 hover:bg-rose-100/80 dark:hover:bg-rose-900/60 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-rose-600" />
            <span>បន្ថែមទៅអេក្រង់ដើម (Add to Home Screen)</span>
          </div>
          <Download className="w-3.5 h-3.5 text-rose-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          title="ដំឡើង App លើ Home Screen"
          className={`p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4" />
        </button>
      )}

      {/* Guide modal for iOS Safari and manual browser steps */}
      <PWAInstallGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        isIOS={isIOS}
        canPromptDirectly={canPromptDirectly}
        onDirectInstall={install}
      />
    </>
  );
};
