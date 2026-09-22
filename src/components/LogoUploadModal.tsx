import React, { useState, useRef } from 'react';
import { Upload, X, Check, RotateCcw, Image as ImageIcon, Eye, Sparkles, ShieldAlert, Lock } from 'lucide-react';
import { WeddingLogo } from './WeddingLogo';
import { getStoredCustomLogo, saveStoredCustomLogo, clearStoredCustomLogo } from '../utils/logoStorage';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  canChangeLogo?: boolean;
  onSuccessToast?: (msg: string) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
  canChangeLogo = false,
  onSuccessToast,
}) => {
  const hasPermission = Boolean(isAdmin || canChangeLogo);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => getStoredCustomLogo());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!hasPermission) {
      alert('⚠️ តម្រូវឲ្យមានការអនុញ្ញាតពី Admin ទើបអាចប្តូរ Logo បាន!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសប្រភេទឯកសារជារូបភាព (PNG, JPG, WebP, SVG)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!hasPermission) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (hasPermission) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!hasPermission) {
      alert('⚠️ លោកអ្នកមិនមានសិទ្ធិពី Admin ក្នុងការផ្លាស់ប្តូរ Logo ទេ!');
      return;
    }
    if (previewUrl) {
      saveStoredCustomLogo(previewUrl);
      onSuccessToast?.('🎉 បានកំណត់ Logo ផ្ទាល់ខ្លួនរបស់អ្នកដោយជោគជ័យ!');
    }
    onClose();
  };

  const handleResetDefault = () => {
    if (!hasPermission) {
      alert('⚠️ លោកអ្នកមិនមានសិទ្ធិពី Admin ក្នុងការផ្លាស់ប្តូរ Logo ទេ!');
      return;
    }
    clearStoredCustomLogo();
    setPreviewUrl(null);
    onSuccessToast?.('បានកំណត់ប្រើប្រាស់ Logo ដើមឡើងវិញ');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                ប្តូររូបសញ្ញា Logo ផ្ទាល់ខ្លួន (Custom Logo)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                ប្រើប្រាស់នៅលើ Website និងទម្រង់បោះពុម្ពសៀវភៅចំណងដៃ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Permission Warning if not allowed */}
          {!hasPermission ? (
            <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-rose-800 dark:text-rose-300 text-sm">សិទ្ធិត្រូវបានការពារ (Admin Permission Required)</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">
                  លោកអ្នកមិនមានការអនុញ្ញាតពី Admin ក្នុងការប្តូរ Logo របស់ប្រព័ន្ធឡើយ។ មានតែគណនី <strong>Admin</strong> ឬគណនីដែលទទួលបានការអនុញ្ញាតពី Admin តាមរយៈ Admin Panel ប៉ុណ្ណោះទើបអាចប្តូរ Logo បាន។
                </p>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone (Only if permitted) */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                ចុចទីនេះ ឬអូសទម្លាក់រូបភាព Logo របស់អ្នកមកទីនេះ
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                គាំទ្រឯកសារ: PNG, JPG, JPEG, WebP, SVG (ទំហំរហូតដល់ 10MB)
              </p>
            </div>
          )}

          {/* Live Previews */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>ការបង្ហាញជាក់ស្តែង (Preview)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Header Preview */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-2">
                  លើ Header Website
                </span>
                <div className="flex items-center justify-center h-16">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain rounded-full shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <WeddingLogo className="w-12 h-12" />
                  )}
                </div>
              </div>

              {/* Print View Preview */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-2">
                  ពេលបោះពុម្ព (Print)
                </span>
                <div className="flex items-center justify-center h-16">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo print preview"
                      className="w-14 h-14 object-contain shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <WeddingLogo className="w-14 h-14" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ចំណាំ៖</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
              Logo នេះនឹងត្រូវបានប្រើប្រាស់លើ Website, សៀវភៅបោះពុម្ព, និងពេលទាញយកបន្ថែមទៅអេក្រង់ដើម (Add to Home Screen)។
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          {hasPermission ? (
            <>
              <button
                type="button"
                onClick={handleResetDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ប្រើ Logo ដើមឡើងវិញ</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!previewUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-rose-200 dark:shadow-none cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុក Logo</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                យល់ព្រម & បិទផ្ទាំងនេះ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
