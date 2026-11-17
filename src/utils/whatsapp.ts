import { CartItem, ProduceCategory, ProduceItem, ProduceUnit } from '../types';

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toWesternDigits(input: string): string {
  return input
    .split('')
    .map((ch) => {
      const arabicIdx = ARABIC_INDIC_DIGITS.indexOf(ch);
      if (arabicIdx !== -1) return String(arabicIdx);
      const easternIdx = EASTERN_ARABIC_DIGITS.indexOf(ch);
      if (easternIdx !== -1) return String(easternIdx);
      return ch;
    })
    .join('');
}

export interface NormalizedPhoneResult {
  valid: boolean;
  e164Digits: string;
  displayFormatted: string;
  error?: string;
}

export function normalizePhoneNumber(
  rawPhone: string,
  defaultCountryCode: string = '964',
): NormalizedPhoneResult {
  const western = toWesternDigits(rawPhone).trim();
  if (!western) {
    return {
      valid: false,
      e164Digits: '',
      displayFormatted: '',
      error: 'يرجى إدخال رقم الواتساب أولاً',
    };
  }

  // Keep track of whether user explicitly entered international prefix (+ or 00)
  const hasExplicitPlus = western.startsWith('+');
  let digits = western.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (!hasExplicitPlus && digits.startsWith('0') && defaultCountryCode) {
    const localPart = digits.slice(1);
    if (localPart.length < 7) {
      return {
        valid: false,
        e164Digits: '',
        displayFormatted: '',
        error: 'رقم الهاتف غير مكتمل — تأكد من كتابة الرقم بشكل صحيح',
      };
    }
    digits = `${defaultCountryCode}${localPart}`;
  } else if (
    !hasExplicitPlus &&
    defaultCountryCode &&
    !digits.startsWith(defaultCountryCode) &&
    digits.length <= 10
  ) {
    if (digits.length < 7) {
      return {
        valid: false,
        e164Digits: '',
        displayFormatted: '',
        error: 'رقم الهاتف غير مكتمل — تأكد من كتابة الرقم بشكل صحيح',
      };
    }
    digits = `${defaultCountryCode}${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      e164Digits: '',
      displayFormatted: '',
      error: 'رقم الهاتف غير مكتمل — تأكد من كتابة الرقم بشكل صحيح مع رمز الدولة',
    };
  }

  return {
    valid: true,
    e164Digits: digits,
    displayFormatted: `+${digits}`,
  };
}

export function formatProduceQuantity(quantity: number, unit: ProduceUnit): string {
  const rounded = Math.round(quantity * 100) / 100;
  if (rounded === 0.25) return `ربع ${unit}`;
  if (rounded === 0.5) return `نص ${unit}`;
  if (rounded === 0.75) return `ثلاثة أرباع ${unit}`;
  return `${rounded} ${unit}`;
}

export function getCategoryLabel(category: ProduceCategory): string {
  switch (category) {
    case 'vegetables':
      return 'الخضروات';
    case 'fruits':
      return 'الفواكه';
    case 'herbs':
      return 'الورقيات والخضرة';
  }
}

export interface BuildWhatsAppMessageOptions {
  items: CartItem[];
  recipientLabel?: string;
  generalNote?: string;
  groupByCategory?: boolean;
}

export function buildWhatsAppMessage({
  items,
  recipientLabel,
  generalNote,
  groupByCategory = true,
}: BuildWhatsAppMessageOptions): string {
  if (items.length === 0) {
    return '';
  }

  const lines: string[] = [];
  const greeting = recipientLabel?.trim()
    ? `السلام عليكم ${recipientLabel.trim()}،`
    : 'السلام عليكم،';

  lines.push(greeting);
  lines.push('هذا *مسواك الفواكه والخضروات* المطلوب:');
  lines.push('');

  if (groupByCategory) {
    const order: ProduceCategory[] = ['vegetables', 'herbs', 'fruits'];
    for (const cat of order) {
      const catItems = items.filter((item) => item.category === cat);
      if (catItems.length === 0) continue;
      lines.push(`*${getCategoryLabel(cat)}:*`);
      for (const item of catItems) {
        const qtyText = formatProduceQuantity(item.quantity, item.unit);
        const noteText = item.note?.trim() ? ` (${item.note.trim()})` : '';
        lines.push(`• ${item.name} — ${qtyText}${noteText}`);
      }
      lines.push('');
    }
  } else {
    for (const item of items) {
      const qtyText = formatProduceQuantity(item.quantity, item.unit);
      const noteText = item.note?.trim() ? ` (${item.note.trim()})` : '';
      lines.push(`• ${item.name} — ${qtyText}${noteText}`);
    }
    lines.push('');
  }

  if (generalNote?.trim()) {
    lines.push(`*ملاحظة:* ${generalNote.trim()}`);
    lines.push('');
  }

  lines.push(`المجموع: ${items.length} أصناف`);
  return lines.join('\n').trim();
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const cleanDigits = toWesternDigits(phoneDigits).replace(/\D/g, '');
  if (!cleanDigits) {
    throw new Error('رقم الواتساب مطلوب');
  }
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

export function filterProduceCatalog(
  catalog: ProduceItem[],
  options: {
    query: string;
    category: 'all' | 'favorites' | ProduceCategory;
    favoriteIds: string[];
  },
): ProduceItem[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  return catalog.filter((item) => {
    if (options.category === 'favorites') {
      if (!options.favoriteIds.includes(item.id)) return false;
    } else if (options.category !== 'all' && item.category !== options.category) {
      return false;
    }

    if (!normalizedQuery) return true;

    const inName = item.name.toLowerCase().includes(normalizedQuery);
    const inAliases = (item.aliases ?? []).some((alias) =>
      alias.toLowerCase().includes(normalizedQuery),
    );
    return inName || inAliases;
  });
}

export function mergeBundleIntoCart(
  currentCart: CartItem[],
  catalog: ProduceItem[],
  bundleItems: Array<{ produceId: string; quantity: number }>,
): CartItem[] {
  const next = [...currentCart];
  for (const entry of bundleItems) {
    const product = catalog.find((p) => p.id === entry.produceId);
    if (!product) continue;
    const existingIdx = next.findIndex((c) => c.id === product.id);
    if (existingIdx === -1) {
      next.push({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: entry.quantity,
        unit: product.defaultUnit,
        emoji: product.emoji,
      });
    } else {
      next[existingIdx] = {
        ...next[existingIdx],
        quantity: Math.round((next[existingIdx].quantity + entry.quantity) * 100) / 100,
      };
    }
  }
  return next;
}
