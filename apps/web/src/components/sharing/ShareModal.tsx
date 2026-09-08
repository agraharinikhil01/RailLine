import React, { useState } from 'react';
import { X, Copy, Check, Share2, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainNumber: string;
  trainName: string;
  shareUrl?: string;
  isLoading?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  trainNumber,
  trainName,
  shareUrl,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = shareUrl
    ? `${window.location.origin}${shareUrl}`
    : window.location.href;

  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-floating border border-slate-200 overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Share Live Journey</h3>
            <p className="text-xs text-slate-500">
              {trainNumber} — {trainName}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Anyone with this private link can view the live running status, map movement, and destination ETA in real time without needing an account.
        </p>

        {/* Link Field */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="text"
            readOnly
            value={fullUrl}
            className="flex-1 bg-transparent text-xs font-mono text-slate-700 focus:outline-none px-1 select-all truncate"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            disabled={isLoading}
            className="shrink-0 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Non-sequential token • No private account details exposed</span>
        </div>
      </div>
    </div>
  );
};
