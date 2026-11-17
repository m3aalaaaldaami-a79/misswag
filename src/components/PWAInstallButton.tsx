import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  X,
  CheckCircle2,
  WifiOff,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled || justInstalled) {
    return null;
  }

  const inIframe =
    typeof window !== 'undefined' && window.self !== window.top;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setJustInstalled(true);
        return;
      }
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    if (!appUrl) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>تثبيت التطبيق</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#e3e7de] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="pwa-install-title" className="text-lg font-bold text-[#162119]">
                    تنصيب تطبيق «مسواك» على أندرويد
                  </h2>
                  <p className="text-xs text-[#5a655d]">
                    يعمل كتطبيق مستقل على الشاشة الرئيسية وحتى بدون إنترنت
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="إغلاق نافذة التثبيت"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5a655d] hover:bg-[#f1f4ed]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-[#2c3a30]">
              {inIframe && appUrl && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2.5">
                  <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                    للتنصيب المباشر على هاتفك الأندرويد، افتح التطبيق في متصفح Chrome خارج هذه النافذة:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>فتح للتثبيت المباشر</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                          <span>تم نسخ الرابط</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>نسخ رابط التطبيق</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isIOS ? (
                <ol className="space-y-2.5 rounded-xl bg-[#f8f9f6] p-4 border border-[#e3e7de]">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">1.</span>
                    <span>
                      اضغط على زر <strong>المشاركة</strong>{' '}
                      <Share className="inline h-4 w-4 text-emerald-700" aria-hidden="true" /> في
                      أسفل متصفح Safari.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">2.</span>
                    <span>
                      مرر للأسفل واختر <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">3.</span>
                    <span>
                      اضغط <strong>إضافة</strong> ليظهر تطبيق «مسواك» بين تطبيقاتك.
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2.5 rounded-xl bg-[#f8f9f6] p-4 border border-[#e3e7de]">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">1.</span>
                    <span>
                      افتح رابط التطبيق في متصفح <strong>Chrome</strong> على هاتف الأندرويد.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">2.</span>
                    <span>
                      اضغط على زر <strong>«تثبيت التطبيق»</strong> أو قائمة النقاط الثلاث{' '}
                      <strong>(⋮)</strong> أعلى المتصفح.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 tabular-nums">3.</span>
                    <span>
                      اختر <strong>تثبيت التطبيق (Install app)</strong> ليتم تنصيبه بأيقونة «مسواك» على الشاشة الرئيسية.
                    </span>
                  </li>
                </ol>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 rounded-xl px-3.5 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>تُحفظ قائمتك وأرقام الواتساب محلياً على هاتفك دائماً.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-[#162119] py-2.5 text-sm font-semibold text-white hover:bg-[#243428] transition-colors"
            >
              فهمت، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>وضع عدم الاتصال — يتم حفظ مسواكك على الجهاز</span>
    </div>
  );
};
