/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo, useState } from 'react';
import { Clock, Phone, ShoppingBasket, Store } from 'lucide-react';
import { BasketPanel } from './components/BasketPanel';
import { HistoryView } from './components/HistoryView';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { ProduceCatalog } from './components/ProduceCatalog';
import { RecipientsManager } from './components/RecipientsManager';
import { INITIAL_PRODUCE_CATALOG, QuickBundle } from './data/produce';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  ActiveTab,
  CartItem,
  OrderHistoryEntry,
  ProduceCategory,
  ProduceItem,
  ProduceUnit,
  WhatsAppRecipient,
} from './types';
import {
  filterProduceCatalog,
  mergeBundleIntoCart,
  normalizePhoneNumber,
} from './utils/whatsapp';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'favorites' | ProduceCategory
  >('all');

  const [customCatalog, setCustomCatalog] = useLocalStorage<ProduceItem[]>(
    'miswak_custom_produce_v1',
    [],
  );
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('miswak_cart_v1', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(
    'miswak_favorites_v1',
    ['tomato', 'cucumber', 'potato', 'red-apple', 'banana'],
  );
  const [recipients, setRecipients] = useLocalStorage<WhatsAppRecipient[]>(
    'miswak_recipients_v1',
    [],
  );
  const [activeRecipientId, setActiveRecipientId] = useLocalStorage<string | null>(
    'miswak_active_recipient_v1',
    null,
  );
  const [generalNote, setGeneralNote] = useLocalStorage<string>('miswak_general_note_v1', '');
  const [history, setHistory] = useLocalStorage<OrderHistoryEntry[]>('miswak_history_v1', []);

  const fullCatalog = useMemo(
    () => [...customCatalog, ...INITIAL_PRODUCE_CATALOG],
    [customCatalog],
  );

  const filteredCatalog = useMemo(
    () =>
      filterProduceCatalog(fullCatalog, {
        query: searchQuery,
        category: selectedCategory,
        favoriteIds,
      }),
    [fullCatalog, searchQuery, selectedCategory, favoriteIds],
  );

  const handleAddOrUpdateItem = (
    item: ProduceItem,
    delta: number,
    explicitUnit?: ProduceUnit,
  ) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) {
        if (delta <= 0) return prev;
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: Math.round(delta * 100) / 100,
            unit: explicitUnit ?? item.defaultUnit,
            emoji: item.emoji,
          },
        ];
      }
      const nextQty = Math.round((existing.quantity + delta) * 100) / 100;
      if (nextQty <= 0) {
        return prev.filter((c) => c.id !== item.id);
      }
      return prev.map((c) =>
        c.id === item.id
          ? {
              ...c,
              quantity: nextQty,
              unit: explicitUnit ?? c.unit,
            }
          : c,
      );
    });
  };

  const handleUpdateBasketQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = Math.round((item.quantity + delta) * 100) / 100;
          return nextQty <= 0 ? null : { ...item, quantity: nextQty };
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const handleChangeUnit = (id: string, unit: ProduceUnit) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unit } : item)),
    );
  };

  const handleUpdateItemNote = (id: string, note: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item)),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleAddCustomProduce = (
    name: string,
    category: ProduceCategory,
    unit: ProduceUnit,
  ) => {
    const emoji = category === 'fruits' ? '🍑' : category === 'herbs' ? '🌿' : '🥬';
    const newItem: ProduceItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      defaultUnit: unit,
      step: unit === 'كيلو' ? 0.5 : 1,
      emoji,
      isCustom: true,
    };
    setCustomCatalog((prev) => [newItem, ...prev]);
    handleAddOrUpdateItem(newItem, newItem.step, unit);
  };

  const handleAddRecipient = (
    label: string,
    phoneInput: string,
    countryCode: string,
  ): boolean => {
    const check = normalizePhoneNumber(phoneInput, countryCode);
    if (!check.valid) return false;

    const existing = recipients.find((r) => r.normalizedDigits === check.e164Digits);
    if (existing) {
      setRecipients((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...r, label } : r)),
      );
      setActiveRecipientId(existing.id);
      return true;
    }

    const newRecipient: WhatsAppRecipient = {
      id: `rec-${Date.now()}`,
      label,
      phoneInput,
      countryCode,
      normalizedDigits: check.e164Digits,
    };
    setRecipients((prev) => [newRecipient, ...prev]);
    setActiveRecipientId(newRecipient.id);
    return true;
  };

  const handleUpdateRecipient = (
    id: string,
    label: string,
    phoneInput: string,
    countryCode: string,
  ): boolean => {
    const check = normalizePhoneNumber(phoneInput, countryCode);
    if (!check.valid) return false;
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              label,
              phoneInput,
              countryCode,
              normalizedDigits: check.e164Digits,
            }
          : r,
      ),
    );
    return true;
  };

  const handleApplyBundle = (bundle: QuickBundle) => {
    setCartItems((prev) => mergeBundleIntoCart(prev, fullCatalog, bundle.items));
  };

  const handleDeleteRecipient = (id: string) => {
    setRecipients((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (activeRecipientId === id) {
        setActiveRecipientId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleRecordOrderSent = (recipient: WhatsAppRecipient) => {
    if (cartItems.length === 0) return;
    const entry: OrderHistoryEntry = {
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      recipientLabel: recipient.label,
      recipientDigits: recipient.normalizedDigits,
      items: cartItems,
      generalNote: generalNote.trim() || undefined,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 25));
  };

  const handleReloadOrder = (entry: OrderHistoryEntry) => {
    setCartItems(entry.items);
    setGeneralNote(entry.generalNote ?? '');
    setActiveTab('catalog');
  };

  const basketPanelNode = (
    <BasketPanel
      cartItems={cartItems}
      recipients={recipients}
      activeRecipientId={activeRecipientId}
      generalNote={generalNote}
      onGeneralNoteChange={setGeneralNote}
      onUpdateQuantity={handleUpdateBasketQuantity}
      onChangeUnit={handleChangeUnit}
      onUpdateItemNote={handleUpdateItemNote}
      onRemoveItem={handleRemoveItem}
      onClearCart={() => setCartItems([])}
      onSelectRecipient={setActiveRecipientId}
      onQuickSaveRecipient={handleAddRecipient}
      onOpenRecipientsTab={() => setActiveTab('recipients')}
      onRecordOrderSent={handleRecordOrderSent}
    />
  );

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#162119]">
      {/* Sticky Top Header (3-zone contract, <=56px) */}
      <header className="sticky top-0 z-30 border-b border-[#e3e7de] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[52px] lg:h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('catalog');
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <img
              src="/icon.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#162119]">
              مسواك
            </span>
          </a>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden lg:flex items-center gap-7 text-sm font-semibold"
          >
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'catalog'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-[#526056] hover:text-[#162119]'
              }`}
            >
              سوق الفواكه والخضروات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recipients')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'recipients'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-[#526056] hover:text-[#162119]'
              }`}
            >
              أرقام الواتساب
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-[#526056] hover:text-[#162119]'
              }`}
            >
              الطلبات السابقة
            </button>
          </nav>

          {/* Zone 3: Primary Action (PWA Install) */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Column */}
          <div className="lg:col-span-8">
            {activeTab === 'catalog' && (
              <ProduceCatalog
                catalog={fullCatalog}
                filteredCatalog={filteredCatalog}
                cartItems={cartItems}
                favoriteIds={favoriteIds}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddOrUpdateItem={handleAddOrUpdateItem}
                onChangeUnit={handleChangeUnit}
                onToggleFavorite={handleToggleFavorite}
                onAddCustomProduce={handleAddCustomProduce}
                onApplyBundle={handleApplyBundle}
              />
            )}

            {activeTab === 'basket' && (
              <div className="lg:hidden">{basketPanelNode}</div>
            )}

            {activeTab === 'recipients' && (
              <RecipientsManager
                recipients={recipients}
                activeRecipientId={activeRecipientId}
                onAddRecipient={handleAddRecipient}
                onUpdateRecipient={handleUpdateRecipient}
                onSelectRecipient={setActiveRecipientId}
                onDeleteRecipient={handleDeleteRecipient}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onReloadOrder={handleReloadOrder}
                onDeleteEntry={(id) =>
                  setHistory((prev) => prev.filter((entry) => entry.id !== id))
                }
                onClearHistory={() => setHistory([])}
              />
            )}
          </div>

          {/* Persistent Desktop Basket & WhatsApp Send Column */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20">
            {basketPanelNode}
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Tab Bar (56px, <=15% total sticky with header) */}
      <nav
        aria-label="التنقل السفلي"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#e3e7de] bg-white/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-semibold transition-colors ${
              activeTab === 'catalog' ? 'text-emerald-700' : 'text-[#5a655d]'
            }`}
          >
            <Store className="h-5 w-5" aria-hidden="true" />
            <span>السوق</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('basket')}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-semibold transition-colors ${
              activeTab === 'basket' ? 'text-emerald-700' : 'text-[#5a655d]'
            }`}
          >
            <div className="relative">
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              {cartItems.length > 0 && (
                <span
                  data-testid="mobile-basket-count"
                  className="absolute -top-1.5 -left-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white tabular-nums"
                >
                  {cartItems.length}
                </span>
              )}
            </div>
            <span>القائمة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recipients')}
            className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-semibold transition-colors ${
              activeTab === 'recipients' ? 'text-emerald-700' : 'text-[#5a655d]'
            }`}
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            <span>الأرقام</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-semibold transition-colors ${
              activeTab === 'history' ? 'text-emerald-700' : 'text-[#5a655d]'
            }`}
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
            <span>السجل</span>
          </button>
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
