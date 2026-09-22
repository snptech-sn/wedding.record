import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2, Sparkles, Download } from 'lucide-react';
import { WeddingLogo } from './WeddingLogo';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  canPromptDirectly: boolean;
  onDirectInstall?: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  canPromptDirectly,
  onDirectInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                បន្ថែមទៅអេក្រង់ដើម (Add to Home Screen)
              </h3>
              <p className="text-xs text-rose-100/90">
                ប្រើប្រាស់ដូចកម្មវិធី App ពិតប្រាកដជាមួយ Logo មង្គលការ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Visual Logo Preview as App Icon */}
          <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-rose-200/80 dark:border-rose-800/80 flex items-center justify-center shrink-0 p-1">
              <WeddingLogo className="w-14 h-14" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  កត់ត្រា (Wedding Record)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                  PWA App
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                ពេលបន្ថែមទៅ Home Screen រូបសញ្ញា Logo នេះនឹងបង្ហាញជា Icon លើអេក្រង់ទូរស័ព្ទរបស់អ្នក!
              </p>
            </div>
          </div>

          {/* Direct Install CTA button if available (Chrome / Edge / Android) */}
          {canPromptDirectly && onDirectInstall && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onDirectInstall();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ដំឡើងភ្លាមៗ (Install App Now)</span>
              </button>
              <div className="text-center text-[11px] text-slate-400">
                ឬអនុវត្តតាមការណែនាំខាងក្រោម
              </div>
            </div>
          )}

          {/* Instructions for iOS Safari */}
          {isIOS ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ជំហានដំឡើងលើ iPhone / iPad (Safari)</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    ចុចលើប៊ូតុងចែករំលែក{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                      <Share className="w-3 h-3" /> Share
                    </span>{' '}
                    នៅរបារខាងក្រោមនៃ Safari។
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    អូសចុះក្រោម រួចជ្រើសរើស{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      <PlusSquare className="w-3 h-3 text-rose-500" /> បន្ថែមទៅអេក្រង់ដើម (Add to Home Screen)
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    ចុចប៊ូតុង <strong className="text-rose-600 dark:text-rose-400 font-semibold">«បន្ថែម (Add)»</strong> នៅជ្រុងខាងស្តាំខាងលើជាការស្រេច!
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Instructions for Android / Chrome / Edge */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ជំហានដំឡើងលើ Android (Chrome / Browser)</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    ចុចលើសញ្ញាចុចបី <strong className="text-slate-800 dark:text-slate-200">⋮ (Menu)</strong> នៅជ្រុងខាងស្តាំខាងលើនៃកម្មវិធី Browser។
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    ជ្រើសរើស <strong className="text-slate-900 dark:text-white font-semibold">«ដំឡើងកម្មវិធី (Install App)»</strong> ឬ <strong className="text-slate-900 dark:text-white font-semibold">«បន្ថែមទៅអេក្រង់ដើម (Add to Home screen)»</strong>។
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    ចុច <strong className="text-rose-600 dark:text-rose-400 font-semibold">«ដំឡើង (Install)»</strong> នោះ Icon Logo នឹងបង្ហាញលើអេក្រង់ដើមទូរស័ព្ទភ្លាមៗ!
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Benefits */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>បើកប្រើលឿនទាន់ចិត្ត</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>បង្ហាញពេញអេក្រង់ទូរស័ព្ទ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Icon Logo មង្គលការស្អាត</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>គាំទ្រទាំងពេលគ្មាន Internet</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            យល់ព្រម & បិទ
          </button>
        </div>

      </div>
    </div>
  );
};
