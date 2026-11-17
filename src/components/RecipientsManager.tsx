import React, { useState } from 'react';
import { Check, CheckCircle2, Pencil, Phone, Plus, Trash2, UserCheck, X } from 'lucide-react';
import { COUNTRY_CODES } from '../data/produce';
import { WhatsAppRecipient } from '../types';
import { normalizePhoneNumber } from '../utils/whatsapp';

interface RecipientsManagerProps {
  recipients: WhatsAppRecipient[];
  activeRecipientId: string | null;
  onAddRecipient: (label: string, phoneInput: string, countryCode: string) => boolean;
  onUpdateRecipient: (
    id: string,
    label: string,
    phoneInput: string,
    countryCode: string,
  ) => boolean;
  onSelectRecipient: (id: string) => void;
  onDeleteRecipient: (id: string) => void;
}

export const RecipientsManager: React.FC<RecipientsManagerProps> = ({
  recipients,
  activeRecipientId,
  onAddRecipient,
  onUpdateRecipient,
  onSelectRecipient,
  onDeleteRecipient,
}) => {
  const [label, setLabel] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('964');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('964');
  const [editError, setEditError] = useState('');

  const preview = phoneInput.trim()
    ? normalizePhoneNumber(phoneInput, countryCode)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = normalizePhoneNumber(phoneInput, countryCode);
    if (!check.valid) {
      setError(check.error ?? 'يرجى كتابة رقم واتساب صحيح');
      return;
    }

    const ok = onAddRecipient(label.trim() || 'مستلم المسواك', phoneInput, countryCode);
    if (ok) {
      setLabel('');
      setPhoneInput('');
      setError('');
    }
  };

  const startEdit = (r: WhatsAppRecipient) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditPhone(r.phoneInput);
    setEditCountry(r.countryCode);
    setEditError('');
  };

  const handleEditSave = (id: string) => {
    const check = normalizePhoneNumber(editPhone, editCountry);
    if (!check.valid) {
      setEditError(check.error ?? 'رقم غير صالح');
      return;
    }
    const ok = onUpdateRecipient(id, editLabel.trim() || 'مستلم المسواك', editPhone, editCountry);
    if (ok) {
      setEditingId(null);
      setEditError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e3e7de] bg-white p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#162119]">تعيين رقم الواتساب المستلم</h2>
          <p className="mt-1 text-sm text-[#5a655d]">
            أضف أرقام الواتساب التي ترسل إليها المسواك (مثل البقال، الزوج، السوبرماركت) واختر الرقم المعتمد حالياً.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label htmlFor="recipient-label" className="block text-xs font-semibold text-[#3f4d43] mb-1.5">
                اسم المستلم / المحل
              </label>
              <input
                id="recipient-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="مثال: أبو علي - البقال"
                className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="recipient-country" className="block text-xs font-semibold text-[#3f4d43] mb-1.5">
                الدولة
              </label>
              <select
                id="recipient-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] focus:border-emerald-700 focus:bg-white focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code || 'custom'} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="recipient-phone" className="block text-xs font-semibold text-[#3f4d43] mb-1.5">
                رقم الواتساب
              </label>
              <input
                id="recipient-phone"
                type="tel"
                dir="ltr"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0770 123 4567"
                className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] tabular-nums focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {preview && preview.valid && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>الصيغة الدولية المعتمدة للواتساب: </span>
              <span className="font-bold tabular-nums" dir="ltr">
                {preview.displayFormatted}
              </span>
            </p>
          )}

          {error && (
            <p role="alert" className="text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>حفظ وتعيين هذا الرقم</span>
          </button>
        </form>
      </div>

      {/* Saved Recipients List */}
      <div className="rounded-2xl border border-[#e3e7de] bg-white p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-[#162119]">
          الأرقام المحفوظة
          <span className="mr-1.5 text-xs font-medium text-[#5a655d] tabular-nums">
            ({recipients.length})
          </span>
        </h3>

        {recipients.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#5a655d]">
            لا توجد أرقام محفوظة بعد. أضف رقم الواتساب بالأعلى للبدء.
          </div>
        ) : (
          <ul className="divide-y divide-[#eff2ea]" data-testid="recipients-list">
            {recipients.map((recipient) => {
              const isActive = recipient.id === activeRecipientId;
              const isEditing = recipient.id === editingId;

              if (isEditing) {
                return (
                  <li key={recipient.id} className="py-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        aria-label="تعديل اسم المستلم"
                        className="sm:col-span-4 min-h-[40px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119]"
                      />
                      <select
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        aria-label="تعديل الدولة"
                        className="sm:col-span-4 min-h-[40px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-2.5 text-xs text-[#162119]"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code || 'custom'} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        dir="ltr"
                        value={editPhone}
                        onChange={(e) => {
                          setEditPhone(e.target.value);
                          if (editError) setEditError('');
                        }}
                        aria-label="تعديل رقم الواتساب"
                        className="sm:col-span-4 min-h-[40px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] tabular-nums"
                      />
                    </div>
                    {editError && (
                      <p role="alert" className="text-xs font-semibold text-red-700">
                        {editError}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSave(recipient.id)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>حفظ التعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#dde2d6] bg-white px-3.5 text-xs font-semibold text-[#5a655d] hover:bg-[#f4f6f0]"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={recipient.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#f4f6f0] text-[#5a655d]'
                      }`}
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#162119] truncate">
                        {recipient.label}
                      </p>
                      <p className="text-xs text-[#5a655d] tabular-nums" dir="ltr">
                        +{recipient.normalizedDigits}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="inline-flex min-h-[38px] items-center gap-1.5 px-2.5 text-xs font-bold text-emerald-800">
                        <UserCheck className="h-4 w-4" aria-hidden="true" />
                        <span>المعتمد حالياً</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectRecipient(recipient.id)}
                        className="min-h-[40px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-xs font-semibold text-[#162119] hover:border-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        تعيين كمستلم
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => startEdit(recipient)}
                      aria-label={`تعديل رقم ${recipient.label}`}
                      className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#5a655d] hover:bg-[#f4f6f0] hover:text-[#162119]"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecipient(recipient.id)}
                      aria-label={`حذف رقم ${recipient.label}`}
                      className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#78857c] hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
