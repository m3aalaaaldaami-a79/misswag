import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  filterProduceCatalog,
  formatProduceQuantity,
  mergeBundleIntoCart,
  normalizePhoneNumber,
  toWesternDigits,
} from './whatsapp';
import { INITIAL_PRODUCE_CATALOG, QUICK_BUNDLES } from '../data/produce';
import { CartItem } from '../types';

test('toWesternDigits converts Arabic-Indic and Eastern Arabic numerals', () => {
  assert.equal(toWesternDigits('٠٧٧٠١٢٣٤٥٦٧'), '07701234567');
  assert.equal(toWesternDigits('۰۷۸۰۹۸۷۶۵۴۳'), '07809876543');
});

test('normalizePhoneNumber normalizes local Iraqi numbers with default +964', () => {
  const res = normalizePhoneNumber('0770 123 4567', '964');
  assert.equal(res.valid, true);
  assert.equal(res.e164Digits, '9647701234567');
  assert.equal(res.displayFormatted, '+9647701234567');
});

test('normalizePhoneNumber converts Arabic numerals and handles + or 00 international prefixes', () => {
  const resArabic = normalizePhoneNumber('٠٧٧٠١٢٣٤٥٦٧', '964');
  assert.equal(resArabic.valid, true);
  assert.equal(resArabic.e164Digits, '9647701234567');

  const resIntl = normalizePhoneNumber('+966 50 123 4567', '964');
  assert.equal(resIntl.valid, true);
  assert.equal(resIntl.e164Digits, '966501234567');

  const resDoubleZero = normalizePhoneNumber('00971501234567', '964');
  assert.equal(resDoubleZero.valid, true);
  assert.equal(resDoubleZero.e164Digits, '971501234567');
});

test('normalizePhoneNumber rejects empty or short numbers', () => {
  assert.equal(normalizePhoneNumber('', '964').valid, false);
  assert.equal(normalizePhoneNumber('12345', '964').valid, false);
});

test('formatProduceQuantity formats fractional and whole quantities naturally', () => {
  assert.equal(formatProduceQuantity(0.5, 'كيلو'), 'نص كيلو');
  assert.equal(formatProduceQuantity(0.25, 'كيلو'), 'ربع كيلو');
  assert.equal(formatProduceQuantity(2, 'كيلو'), '2 كيلو');
  assert.equal(formatProduceQuantity(3, 'باقة'), '3 باقة');
});

test('buildWhatsAppMessage formats grouped Arabic list with notes and builds valid wa.me URL', () => {
  const items: CartItem[] = [
    {
      id: 'tomato',
      name: 'طماطة',
      category: 'vegetables',
      quantity: 2,
      unit: 'كيلو',
      emoji: '🍅',
      note: 'قوية للسلطة',
    },
    {
      id: 'red-apple',
      name: 'تفاح أحمر',
      category: 'fruits',
      quantity: 1.5,
      unit: 'كيلو',
      emoji: '🍎',
    },
  ];

  const msg = buildWhatsAppMessage({
    items,
    recipientLabel: 'أبو علي',
    generalNote: 'التوصيل العصر',
  });

  assert.match(msg, /السلام عليكم أبو علي/);
  assert.match(msg, /\*الخضروات:\*/);
  assert.match(msg, /• طماطة — 2 كيلو \(قوية للسلطة\)/);
  assert.match(msg, /\*الفواكه:\*/);
  assert.match(msg, /• تفاح أحمر — 1\.5 كيلو/);
  assert.match(msg, /\*ملاحظة:\* التوصيل العصر/);
  assert.match(msg, /المجموع: 2 أصناف/);

  const url = buildWhatsAppUrl('9647701234567', msg);
  assert.ok(url.startsWith('https://wa.me/9647701234567?text='));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg);
});

test('filterProduceCatalog searches by name, aliases, category, and favorites', () => {
  const byAlias = filterProduceCatalog(INITIAL_PRODUCE_CATALOG, {
    query: 'بطاطس',
    category: 'all',
    favoriteIds: [],
  });
  assert.equal(byAlias.length, 1);
  assert.equal(byAlias[0].id, 'potato');

  const byFavorites = filterProduceCatalog(INITIAL_PRODUCE_CATALOG, {
    query: '',
    category: 'favorites',
    favoriteIds: ['tomato', 'banana'],
  });
  assert.equal(byFavorites.length, 2);
});

test('mergeBundleIntoCart merges bundle items cleanly and accumulates existing quantities', () => {
  const salad = QUICK_BUNDLES.find((b) => b.id === 'salad')!;
  const first = mergeBundleIntoCart([], INITIAL_PRODUCE_CATALOG, salad.items);
  assert.equal(first.length, salad.items.length);
  const tomatoFirst = first.find((i) => i.id === 'tomato')!;
  assert.equal(tomatoFirst.quantity, 1);

  const second = mergeBundleIntoCart(first, INITIAL_PRODUCE_CATALOG, salad.items);
  const tomatoSecond = second.find((i) => i.id === 'tomato')!;
  assert.equal(tomatoSecond.quantity, 2);
});
