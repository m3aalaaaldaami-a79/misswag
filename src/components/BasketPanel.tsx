import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Share2,
  ShoppingBasket,
  Trash2,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { COUNTRY_CODES, PRODUCE_UNITS } from '../data/produce';
import { CartItem, ProduceUnit, WhatsAppRecipient } from '../types';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatProduceQuantity,
  normalizePhoneNumber,
} from '../utils/whatsapp';

interface BasketPanelProps {
  cartItems: CartItem[];
  recipients: WhatsAppRecipient[];
  activeRecipientId: string | null;
  generalNote: string;
  onGeneralNoteChange: (note: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onChangeUnit: (id: string, unit: ProduceUnit) => void;
  onUpdateItemNote: (id: string, note: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSelectRecipient: (id: string) => void;
  onQuickSaveRecipient: (label: string, phoneInput: string, countryCode: string) => boolean;
  onOpenRecipientsTab: () => void;
  onRecordOrderSent: (recipient: WhatsAppRecipient) => void;
}

export const BasketPanel: React.FC<BasketPanelProps> = ({
  cartItems,
  recipients,
  activeRecipientId,
  generalNote,
  onGeneralNoteChange,
  onUpdateQuantity,
  onChangeUnit,
  onUpdateItemNote,
  onRemoveItem,
  onClearCart,
  onSelectRecipient,
  onQuickSaveRecipient,
  onOpenRecipientsTab,
  onRecordOrderSent,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickLabel, setQuickLabel] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickCountry, setQuickCountry] = useState('964');
  const [quickError, setQuickError] = useState('');
  const [sendWarning, setSendWarning] = useState('');
  const [sentFeedback, setSentFeedback] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const activeRecipient = useMemo(
    () => recipients.find((r) => r.id === activeRecipientId) ?? null,
    [recipients, activeRecipientId],
  );

  const message = useMemo(
    () =>
      buildWhatsAppMessage({
        items: cartItems,
        recipientLabel: activeRecipient?.label,
        generalNote,
      }),
    [cartItems, activeRecipient?.label, generalNote],
  );

  const whatsappUrl = useMemo(() => {
    if (!activeRecipient || cartItems.length === 0) return '';
    return buildWhatsAppUrl(activeRecipient.normalizedDigits, message);
  }, [activeRecipient, cartItems.length, message]);

  const handleCopy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    if (!message || !canShare) return;
    try {
      await navigator.share({
        title: 'قائمة مسواك الفواكه والخضروات',
        text: message,
      });
    } catch {
      // User cancelled share sheet
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = normalizePhoneNumber(quickPhone, quickCountry);
    if (!check.valid) {
      setQuickError(check.error ?? 'رقم غير صالح');
      return;
    }
    const ok = onQuickSaveRecipient(quickLabel.trim() || 'رقم المسواك', quickPhone, quickCountry);
    if (ok) {
      setQuickLabel('');
      setQuickPhone('');
      setQuickError('');
      setSendWarning('');
      setShowQuickForm(false);
    }
  };

  return (
    <aside
      aria-label="قائمة المسواك وإرسال واتساب"
      className="rounded-2xl border border-[#e3e7de] bg-white p-4 sm:p-5 space-y-5"
    >
      {/* Recipient Selection Box */}
      <div className="rounded-xl border border-[#e3e7de] bg-[#f8f9f6] p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span className="text-xs font-bold text-[#162119]">رقم الواتساب المستلم</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickForm((v) => !v)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
            >
              {showQuickForm ? 'إلغاء' : '+ تعيين رقم'}
            </button>
            {recipients.length > 0 && (
              <button
                type="button"
                onClick={onOpenRecipientsTab}
                className="text-xs font-medium text-[#5a655d] hover:text-[#162119] whitespace-nowrap"
              >
                إدارة الأرقام
              </button>
            )}
          </div>
        </div>

        {recipients.length > 0 && !showQuickForm ? (
          <div className="space-y-2">
            <label htmlFor="active-recipient-select" className="sr-only">
              اختر رقم الواتساب المستلم
            </label>
            <select
              id="active-recipient-select"
              value={activeRecipient?.id ?? ''}
              onChange={(e) => {
                onSelectRecipient(e.target.value);
                setSendWarning('');
              }}
              className="w-full min-h-[42px] rounded-xl border border-[#dde2d6] bg-white px-3 text-sm font-semibold text-[#162119] focus:border-emerald-700 focus:outline-none"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {`${r.label} — \u2066+${r.normalizedDigits}\u2069`}
                </option>
              ))}
            </select>
            {activeRecipient && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-800">
                <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>سيتم الإرسال إلى: </span>
                <span className="font-semibold tabular-nums" dir="ltr">
                  +{activeRecipient.normalizedDigits}
                </span>
              </p>
            )}
          </div>
        ) : !showQuickForm ? (
          <div className="space-y-2">
            <p className="text-xs text-[#5a655d]">
              لم تقم بتعيين رقم واتساب بعد. أدخل الرقم الذي تريد إرسال المسواك إليه:
            </p>
            <button
              type="button"
              onClick={() => setShowQuickForm(true)}
              className="w-full min-h-[42px] rounded-xl border border-emerald-700 bg-white px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              تعيين رقم الواتساب الآن
            </button>
          </div>
        ) : null}

        {showQuickForm && (
          <form onSubmit={handleQuickSubmit} className="space-y-2.5 pt-1">
            <input
              type="text"
              value={quickLabel}
              onChange={(e) => setQuickLabel(e.target.value)}
              placeholder="الاسم (مثال: أبو علي البقال، البيت)"
              aria-label="اسم المستلم"
              className="w-full min-h-[42px] rounded-xl border border-[#dde2d6] bg-white px-3 text-sm text-[#162119] focus:border-emerald-700 focus:outline-none"
            />
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <select
                  aria-label="رمز الدولة"
                  value={quickCountry}
                  onChange={(e) => setQuickCountry(e.target.value)}
                  className="w-full min-h-[42px] rounded-xl border border-[#dde2d6] bg-white px-2 text-xs text-[#162119] focus:border-emerald-700 focus:outline-none"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code || 'custom'} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-7">
                <input
                  type="tel"
                  dir="ltr"
                  value={quickPhone}
                  onChange={(e) => {
                    setQuickPhone(e.target.value);
                    if (quickError) setQuickError('');
                  }}
                  placeholder="0770 123 4567"
                  aria-label="رقم الواتساب"
                  className="w-full min-h-[42px] rounded-xl border border-[#dde2d6] bg-white px-3 text-sm text-[#162119] tabular-nums focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>
            {quickError && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {quickError}
              </p>
            )}
            <button
              type="submit"
              className="w-full min-h-[42px] rounded-xl bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              حفظ رقم الواتساب
            </button>
          </form>
        )}
      </div>

      {/* Basket Header */}
      <div className="flex items-center justify-between border-b border-[#ebefe6] pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          <h2 className="text-base font-bold text-[#162119]">
            قائمة المسواك
            <span className="mr-1.5 text-xs font-medium text-[#5a655d] tabular-nums">
              ({cartItems.length} أصناف)
            </span>
          </h2>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs font-medium text-red-700 hover:text-red-800 whitespace-nowrap"
          >
            تفريغ القائمة
          </button>
        )}
      </div>

      {/* Basket Items */}
      {cartItems.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f6f0] text-[#78857c]">
            <ShoppingBasket className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#162119]">قائمة المسواك فارغة</p>
          <p className="text-xs text-[#5a655d]">
            اختر الفواكه والخضروات المطلوبة لتجهيز رسالة الواتساب.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-[#eff2ea] max-h-[340px] overflow-y-auto pl-1" data-testid="basket-list">
            {cartItems.map((item) => (
              <li key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#162119] truncate">{item.name}</p>
                      <p className="text-xs text-[#5a655d] tabular-nums">
                        {formatProduceQuantity(item.quantity, item.unit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      aria-label={`وحدة ${item.name} في السلة`}
                      value={item.unit}
                      onChange={(e) => onChangeUnit(item.id, e.target.value as ProduceUnit)}
                      className="min-h-[36px] rounded-lg border border-[#e3e7de] bg-[#f8f9f6] px-1.5 text-[11px] font-medium text-[#162119]"
                    >
                      {PRODUCE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.unit === 'كيلو' ? -0.5 : -1)}
                      aria-label={`إنقاص ${item.name} في السلة`}
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[#e3e7de] bg-white text-[#162119] hover:bg-[#f4f6f0]"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.unit === 'كيلو' ? 0.5 : 1)}
                      aria-label={`زيادة ${item.name} في السلة`}
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[#e3e7de] bg-white text-[#162119] hover:bg-[#f4f6f0]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`حذف ${item.name}`}
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#78857c] hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={item.note ?? ''}
                  onChange={(e) => onUpdateItemNote(item.id, e.target.value)}
                  placeholder="ملاحظة للصنف (اختياري: مثال قاسي، حجم صغير...)"
                  aria-label={`ملاحظة لـ ${item.name}`}
                  className="w-full rounded-lg border border-[#ebefe6] bg-[#fafbf9] px-2.5 py-1.5 text-xs text-[#162119] placeholder:text-[#8d9a91] focus:border-emerald-700 focus:bg-white focus:outline-none"
                />
              </li>
            ))}
          </ul>

          {/* General Note */}
          <div>
            <label htmlFor="general-order-note" className="block text-xs font-semibold text-[#3f4d43] mb-1.5">
              ملاحظة عامة للطلب (اختياري)
            </label>
            <input
              id="general-order-note"
              type="text"
              value={generalNote}
              onChange={(e) => onGeneralNoteChange(e.target.value)}
              placeholder="مثال: التوصيل العصر، أو اختيار الطازج فقط"
              className="w-full min-h-[42px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-xs sm:text-sm text-[#162119] placeholder:text-[#8d9a91] focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>

          {sendWarning && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-900"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span>{sendWarning}</span>
            </div>
          )}

          {sentFeedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-900"
            >
              <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>تم فتح واتساب وحفظ الطلب في السجل</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-2">
            {activeRecipient && whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setSendWarning('');
                  setSentFeedback(true);
                  onRecordOrderSent(activeRecipient);
                  setTimeout(() => setSentFeedback(false), 3500);
                }}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
              >
                <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>إرسال إلى واتساب ({activeRecipient.label})</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowQuickForm(true);
                  setSendWarning('يرجى تعيين رقم الواتساب المستلم أولاً قبل الإرسال.');
                }}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
              >
                <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>عيّن رقم الواتساب للإرسال</span>
              </button>
            )}

            <div className={`grid gap-2 ${canShare ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#dde2d6] bg-white px-2.5 py-2 text-xs font-semibold text-[#162119] hover:bg-[#f4f6f0] transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#5a655d]" aria-hidden="true" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>

              {canShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#dde2d6] bg-white px-2.5 py-2 text-xs font-semibold text-[#162119] hover:bg-[#f4f6f0] transition-colors whitespace-nowrap"
                >
                  <Share2 className="h-4 w-4 text-[#5a655d]" aria-hidden="true" />
                  <span>مشاركة</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                aria-expanded={showPreview}
                className="flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-2.5 py-2 text-xs font-semibold text-[#3f4d43] hover:bg-[#eff2ea] transition-colors whitespace-nowrap"
              >
                <span>معاينة الرسالة</span>
                {showPreview ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible WhatsApp Message Preview */}
          {showPreview && (
            <div className="rounded-xl border border-[#e3e7de] bg-[#f4f7f1] p-3">
              <p className="text-[11px] font-bold text-[#4a574e] mb-1.5">
                نص رسالة الواتساب:
              </p>
              <pre
                className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#162119] max-h-40 overflow-y-auto"
                data-testid="whatsapp-preview"
              >
                {message}
              </pre>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
