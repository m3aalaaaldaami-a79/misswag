export type ProduceCategory = 'vegetables' | 'fruits' | 'herbs';

export type ProduceUnit = 'كيلو' | 'باقة' | 'حبة' | 'صندوق' | 'كيس';

export interface ProduceItem {
  id: string;
  name: string;
  category: ProduceCategory;
  defaultUnit: ProduceUnit;
  step: number;
  emoji: string;
  aliases?: string[];
  isCustom?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  category: ProduceCategory;
  quantity: number;
  unit: ProduceUnit;
  emoji: string;
  note?: string;
}

export interface WhatsAppRecipient {
  id: string;
  label: string;
  phoneInput: string;
  countryCode: string;
  normalizedDigits: string;
}

export interface OrderHistoryEntry {
  id: string;
  createdAt: string;
  recipientLabel: string;
  recipientDigits: string;
  items: CartItem[];
  generalNote?: string;
}

export type ActiveTab = 'catalog' | 'basket' | 'recipients' | 'history';
