import React from 'react';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { OrderHistoryEntry } from '../types';
import { formatProduceQuantity } from '../utils/whatsapp';

interface HistoryViewProps {
  history: OrderHistoryEntry[];
  onReloadOrder: (entry: OrderHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onReloadOrder,
  onDeleteEntry,
  onClearHistory,
}) => {
  return (
    <div className="rounded-2xl border border-[#e3e7de] bg-white p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#eff2ea] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#162119]">سجل طلبات المسواك السابقة</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#5a655d]">
            أعد تحميل أي قائمة مسواك سابقة إلى السلة بضغطة واحدة.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs font-semibold text-red-700 hover:text-red-800 whitespace-nowrap"
          >
            مسح السجل
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f6f0] text-[#78857c]">
            <Clock className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-[#162119]">السجل فارغ حالياً</p>
          <p className="text-xs text-[#5a655d]">
            عند إرسال أي قائمة مسواك عبر واتساب ستُحفظ هنا للرجوع إليها لاحقاً.
          </p>
        </div>
      ) : (
        <ul className="space-y-3.5" data-testid="history-list">
          {history.map((entry) => {
            const dateLabel = new Date(entry.createdAt).toLocaleDateString('ar-IQ', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-[#e3e7de] bg-[#f8f9f6] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#162119]">
                      إلى: {entry.recipientLabel}
                    </p>
                    <p className="text-xs text-[#5a655d]">
                      <span>{dateLabel}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">{entry.items.length} أصناف</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReloadOrder(entry)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>إعادة الطلب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label={`حذف الطلب المرسل إلى ${entry.recipientLabel}`}
                      className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#78857c] hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#2c3a30] leading-relaxed">
                  {entry.items
                    .map((i) => `${i.name} (${formatProduceQuantity(i.quantity, i.unit)})`)
                    .join(' · ')}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
