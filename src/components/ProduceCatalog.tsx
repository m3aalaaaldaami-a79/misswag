import React, { useState } from 'react';
import {
  Minus,
  Plus,
  Search,
  Star,
  PlusCircle,
  X,
  Leaf,
} from 'lucide-react';
import { PRODUCE_UNITS, QUICK_BUNDLES, QuickBundle } from '../data/produce';
import { CartItem, ProduceCategory, ProduceItem, ProduceUnit } from '../types';
import { formatProduceQuantity, getCategoryLabel } from '../utils/whatsapp';

interface ProduceCatalogProps {
  catalog: ProduceItem[];
  filteredCatalog: ProduceItem[];
  cartItems: CartItem[];
  favoriteIds: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: 'all' | 'favorites' | ProduceCategory;
  onSelectCategory: (cat: 'all' | 'favorites' | ProduceCategory) => void;
  onAddOrUpdateItem: (item: ProduceItem, delta: number, unit?: ProduceUnit) => void;
  onChangeUnit: (itemId: string, unit: ProduceUnit) => void;
  onToggleFavorite: (itemId: string) => void;
  onAddCustomProduce: (name: string, category: ProduceCategory, unit: ProduceUnit) => void;
  onApplyBundle: (bundle: QuickBundle) => void;
}

const CATEGORY_TABS: Array<{ id: 'all' | 'favorites' | ProduceCategory; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'vegetables', label: 'خضروات' },
  { id: 'fruits', label: 'فواكه' },
  { id: 'herbs', label: 'ورقيات' },
  { id: 'favorites', label: 'المفضلة' },
];

export const ProduceCatalog: React.FC<ProduceCatalogProps> = ({
  filteredCatalog,
  cartItems,
  favoriteIds,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onAddOrUpdateItem,
  onChangeUnit,
  onToggleFavorite,
  onAddCustomProduce,
  onApplyBundle,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ProduceCategory>('vegetables');
  const [customUnit, setCustomUnit] = useState<ProduceUnit>('كيلو');
  const [customError, setCustomError] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [vegImgFailed, setVegImgFailed] = useState(false);
  const [fruitImgFailed, setFruitImgFailed] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError('اكتب اسم الفاكهة أو الخضار أولاً');
      return;
    }
    onAddCustomProduce(trimmed, customCategory, customUnit);
    setCustomName('');
    setCustomError('');
    setShowCustomForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Compact Hero Showcase */}
      <section className="relative overflow-hidden rounded-2xl border border-[#e3e7de] bg-[#162119]">
        {!heroImgFailed ? (
          <img
            src="/src/assets/images/hero_fresh_produce_1794906360916.jpg"
            alt="تشكيلة طازجة من الفواكه والخضروات في سلة المسواك"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="h-44 sm:h-52 w-full object-cover opacity-80"
          />
        ) : (
          <div className="h-44 sm:h-52 w-full bg-gradient-to-l from-emerald-900 to-[#162119]" />
        )}
        <div className="absolute inset-0 bg-[#101a13]/70 sm:bg-transparent sm:bg-gradient-to-l sm:from-[#101a13]/92 sm:via-[#101a13]/75 sm:to-[#101a13]/25" />
        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-7">
          <h1
            className="font-display text-xl sm:text-2xl font-bold text-white max-w-lg leading-snug"
            style={{ textWrap: 'balance' }}
          >
            جهّز مسواك الفواكه والخضروات وأرسله للواتساب بضغطة واحدة
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/90 max-w-md">
            اختر الأصناف والكميات المطلوبة، عيّن رقم الواتساب، وأرسل القائمة مرتبة فوراً.
          </p>
        </div>
      </section>

      {/* Quick Visual Category Shortcuts */}
      <section className="grid grid-cols-2 gap-3.5" aria-label="اختصارات الأقسام">
        <button
          type="button"
          onClick={() => onSelectCategory(selectedCategory === 'vegetables' ? 'all' : 'vegetables')}
          className={`group relative overflow-hidden rounded-2xl border text-right transition-colors ${
            selectedCategory === 'vegetables'
              ? 'border-emerald-700 ring-2 ring-emerald-700/20'
              : 'border-[#e3e7de] hover:border-emerald-600/50'
          }`}
        >
          {!vegImgFailed ? (
            <img
              src="/src/assets/images/category_vegetables_1794906361890.jpg"
              alt="قسم الخضروات الطازجة"
              referrerPolicy="no-referrer"
              onError={() => setVegImgFailed(true)}
              className="h-24 sm:h-28 w-full object-cover"
            />
          ) : (
            <div className="h-24 sm:h-28 w-full bg-emerald-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute bottom-3 right-3.5 left-3.5 flex items-end justify-between">
            <div>
              <span className="block text-sm sm:text-base font-bold text-white">الخضروات</span>
              <span className="text-[11px] text-white/80">طماطة · خيار · بتيتة</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectCategory(selectedCategory === 'fruits' ? 'all' : 'fruits')}
          className={`group relative overflow-hidden rounded-2xl border text-right transition-colors ${
            selectedCategory === 'fruits'
              ? 'border-emerald-700 ring-2 ring-emerald-700/20'
              : 'border-[#e3e7de] hover:border-emerald-600/50'
          }`}
        >
          {!fruitImgFailed ? (
            <img
              src="/src/assets/images/category_fruits_1794906361568.jpg"
              alt="قسم الفواكه الموسمية"
              referrerPolicy="no-referrer"
              onError={() => setFruitImgFailed(true)}
              className="h-24 sm:h-28 w-full object-cover"
            />
          ) : (
            <div className="h-24 sm:h-28 w-full bg-emerald-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute bottom-3 right-3.5 left-3.5 flex items-end justify-between">
            <div>
              <span className="block text-sm sm:text-base font-bold text-white">الفواكه</span>
              <span className="text-[11px] text-white/80">تفاح · برتقال · موز</span>
            </div>
          </div>
        </button>
      </section>

      {/* Search + Category Filter Toolbar */}
      <section className="space-y-3" aria-label="البحث والتصفية">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="produce-search" className="sr-only">
              ابحث في الفواكه والخضروات
            </label>
            <Search
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a655d]"
              aria-hidden="true"
            />
            <input
              id="produce-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن صنف... مثل: طماطة، خيار، تفاح"
              className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-white pr-10 pl-9 py-2 text-sm text-[#162119] placeholder:text-[#78857c] focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="مسح البحث"
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#5a655d] hover:bg-[#f1f4ed]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomForm((prev) => !prev)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#dde2d6] bg-white px-4 py-2 text-sm font-semibold text-[#162119] hover:border-emerald-700 hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span>إضافة صنف خاص</span>
          </button>
        </div>

        {/* Custom Item Drawer/Form */}
        {showCustomForm && (
          <form
            onSubmit={handleCustomSubmit}
            className="rounded-2xl border border-[#dde2d6] bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#162119]">إضافة فاكهة أو خضار غير موجودة</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomError('');
                }}
                aria-label="إغلاق نموذج الصنف الخاص"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a655d] hover:bg-[#f1f4ed]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5">
                <label htmlFor="custom-produce-name" className="sr-only">
                  اسم الصنف
                </label>
                <input
                  id="custom-produce-name"
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (customError) setCustomError('');
                  }}
                  placeholder="اسم الصنف (مثال: كمثرى، تين)"
                  className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] focus:border-emerald-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="custom-produce-cat" className="sr-only">
                  القسم
                </label>
                <select
                  id="custom-produce-cat"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as ProduceCategory)}
                  className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] focus:border-emerald-700 focus:bg-white focus:outline-none"
                >
                  <option value="vegetables">خضروات</option>
                  <option value="fruits">فواكه</option>
                  <option value="herbs">ورقيات</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="custom-produce-unit" className="sr-only">
                  الوحدة
                </label>
                <select
                  id="custom-produce-unit"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as ProduceUnit)}
                  className="w-full min-h-[44px] rounded-xl border border-[#dde2d6] bg-[#f8f9f6] px-3 text-sm text-[#162119] focus:border-emerald-700 focus:bg-white focus:outline-none"
                >
                  {PRODUCE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap"
                >
                  أضف للسلة
                </button>
              </div>
            </div>
            {customError && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {customError}
              </p>
            )}
          </form>
        )}

        {/* Segmented Filter Tabs */}
        <div
          role="tablist"
          aria-label="تصنيف الأصناف"
          className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[#ebefe6] p-1"
        >
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectCategory(tab.id)}
                className={`min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#162119] shadow-xs'
                    : 'text-[#526056] hover:text-[#162119]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick 1-Tap Produce Bundles */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-semibold text-[#5a655d]">إضافة باقة جاهزة:</span>
          {QUICK_BUNDLES.map((bundle) => (
            <button
              key={bundle.id}
              type="button"
              onClick={() => onApplyBundle(bundle)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#dde2d6] bg-white px-3 py-1 text-xs font-semibold text-[#162119] hover:border-emerald-700 hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              <span>{bundle.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Produce Grid */}
      {filteredCatalog.length === 0 ? (
        <div className="rounded-2xl border border-[#e3e7de] bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f4ed] text-[#5a655d]">
            <Leaf className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-base font-bold text-[#162119]">
            {selectedCategory === 'favorites'
              ? 'لا توجد أصناف في المفضلة بعد'
              : 'لم يتم العثور على هذا الصنف'}
          </h3>
          <p className="mt-1 text-sm text-[#5a655d]">
            {selectedCategory === 'favorites'
              ? 'اضغط على أيقونة النجمة بجانب أي فاكهة أو خضار لإضافتها للمفضلة.'
              : 'يمكنك إضافته مباشرة باستخدام زر «إضافة صنف خاص» بالأعلى.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onAddCustomProduce(searchQuery.trim(), 'vegetables', 'كيلو');
                onSearchChange('');
              }}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>إضافة «{searchQuery.trim()}» لقائمة المسواك</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5"
          data-testid="produce-grid"
        >
          {filteredCatalog.map((item) => {
            const inCart = cartItems.find((c) => c.id === item.id);
            const isFavorite = favoriteIds.includes(item.id);
            const activeUnit = inCart?.unit ?? item.defaultUnit;

            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-3.5 sm:p-4 transition-colors ${
                  inCart
                    ? 'border-emerald-700 bg-emerald-50/35'
                    : 'border-[#e3e7de] bg-white hover:border-[#cdd4c5]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f6f0] text-2xl"
                    >
                      {item.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-[#162119] truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#5a655d]">
                        <span>{getCategoryLabel(item.category)}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{activeUnit}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label={isFavorite ? `إزالة ${item.name} من المفضلة` : `إضافة ${item.name} للمفضلة`}
                    aria-pressed={isFavorite}
                    className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl transition-colors ${
                      isFavorite
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-[#87948b] hover:bg-[#f4f6f0] hover:text-[#162119]'
                    }`}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* Controls row */}
                <div className="mt-4 flex items-center justify-between gap-1.5">
                  <label htmlFor={`unit-${item.id}`} className="sr-only">
                    وحدة {item.name}
                  </label>
                  <select
                    id={`unit-${item.id}`}
                    value={activeUnit}
                    onChange={(e) => {
                      const nextUnit = e.target.value as ProduceUnit;
                      if (inCart) {
                        onChangeUnit(item.id, nextUnit);
                      } else {
                        onAddOrUpdateItem(item, item.step, nextUnit);
                      }
                    }}
                    className="min-h-[40px] w-[72px] shrink-0 rounded-xl border border-[#e3e7de] bg-[#f8f9f6] px-2 text-xs font-medium text-[#162119] focus:border-emerald-700 focus:outline-none"
                  >
                    {PRODUCE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>

                  {inCart ? (
                    <div className="flex items-center gap-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onAddOrUpdateItem(item, -item.step)}
                        aria-label={`إنقاص كمية ${item.name}`}
                        className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl border border-[#dde2d6] bg-white text-[#162119] hover:bg-[#f4f6f0] active:scale-[0.97]"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-[44px] px-0.5 text-center text-xs font-bold text-emerald-800 tabular-nums whitespace-nowrap">
                        {formatProduceQuantity(inCart.quantity, inCart.unit)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddOrUpdateItem(item, item.step)}
                        aria-label={`زيادة كمية ${item.name}`}
                        className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.97]"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddOrUpdateItem(item, item.step, activeUnit)}
                      aria-label={`إضافة ${item.name} إلى المسواك`}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#162119] px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>إضافة</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
