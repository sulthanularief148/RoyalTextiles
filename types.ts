export enum ProductType {
  FABRIC = 'Fabric',
  YARN = 'Yarn',
  ACCESSORY = 'Accessory',
  READY_MADE = 'Ready Made'
}

export type UnitOfMeasure = 'Meters' | 'Kg' | 'Pcs' | 'Box' | 'Roll';

export interface Product {
  id?: string; // Optional for new items before DB insertion
  name: string;
  type: ProductType;
  material: string;
  color: string;
  variant: string; 
  unit: UnitOfMeasure;
  hsnCode: string; // GST Requirement
  taxRate: number; // 5, 12, 18, 28
  price: number;
  costPrice?: number; // For profit calculation
  stock: number;
  minStockLevel: number; // Reorder alert
  sku: string;
  supplier?: string;
  description?: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
  itemTotal: number;
  itemTax: number;
}

export interface Sale {
  id?: number; // Auto-increment in Dexie
  invoiceNo: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  totalTax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  customerId?: string;
  customerName?: string;
  pointsEarned?: number;
  pointsUsed?: number;
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  gstin?: string; // B2B customers
  loyaltyPoints: number;
  totalSpend: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  joinDate: Date;
}

export interface ShopSettings {
  id?: number;
  shopName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  phone: string;
  gstin: string;
  termsAndConditions: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  POS = 'POS',
  CUSTOMERS = 'CUSTOMERS',
  SETTINGS = 'SETTINGS',
  AI_ASSISTANT = 'AI_ASSISTANT'
}