import React, { useState, useRef } from 'react';
import { Upload, X, Check, RotateCcw, Image as ImageIcon, Eye, Sparkles, ShieldAlert, Lock } from 'lucide-react';
import { WeddingLogo } from './WeddingLogo';
import { getStoredCustomLogo, saveStoredCustomLogo, clearStoredCustomLogo } from '../utils/logoStorage';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onSuccessToast?: (msg: string) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
  onSuccessToast,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => getStoredCustomLogo());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!isAdmin) {
      alert('⚠️ តម្រូវឲ្យមានសិទ្ធិជា Admin ជាន់ខ្ពស់ទើបអាចប្តូរ Logo បាន!');
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
    if (!isAdmin) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAdmin) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!isAdmin) return;
    if (previewUrl) {
      saveStoredCustomLogo(previewUrl);
      onSuccessToast?.('🎉 បានកំណត់ Logo ផ្ទាល់ខ្លួនរបស់អ្នកដោយជោគជ័យ!');
    }
    onClose();
  };

  const handleResetDefault = () => {
    if (!isAdmin) return;
    clearStoredCustomLogo();
    setPreviewUrl(null);
    onSuccessToast?.('បានកំណត់ប្រើប្រាស់ Logo ដើមឡើងវិញ');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ប្តូររូបសញ្ញា Logo ផ្ទាល់ខ្លួន (Custom Logo)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
        <div className="p-6 space-y-5">
          {/* Admin Permission Warning */}
          {!isAdmin && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">សិទ្ធិត្រូវបានកំណត់ (Admin Only)</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  តម្រូវឲ្យតែ <strong>Admin ជាន់ខ្ពស់</strong> ទើបមានសិទ្ធិផ្លាស់ប្តូររូបភាព Logo របស់ប្រព័ន្ធបាន។ គណនីរបស់អ្នកអាចត្រឹមតែមើលរូបភាពបច្ចុប្បន្នប៉ុណ្ណោះ។
                </p>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          {isAdmin && (
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
              <span>ចំណាំងាយស្រួល៖</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
              លោកអ្នកអាចជ្រើសរើសរូបភាព <span className="font-semibold">ChatGPT Image...png</span> ដែលបានទាញយករួច មកដាក់ទីនេះភ្លាមៗ នោះប្រព័ន្ធនឹងរក្សាទុក និងបង្ហាញគ្រប់ទំព័រជានិច្ច!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          {isAdmin ? (
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
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                បិទផ្ទាំងនេះ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
