import { Product, ProductType, Sale, Customer } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Blue Silk',
    type: ProductType.FABRIC,
    material: 'Silk',
    color: 'Royal Blue',
    variant: '1m',
    price: 45.00,
    stock: 120,
    sku: 'SLK-BLU-001',
    imageUrl: 'https://picsum.photos/200/200?random=1',
    unit: 'Meters',
    hsnCode: '5007',
    taxRate: 5,
    minStockLevel: 20
  },
  {
    id: '2',
    name: 'Cotton Floral Print',
    type: ProductType.FABRIC,
    material: 'Cotton',
    color: 'Multicolor',
    variant: '1m',
    price: 12.50,
    stock: 500,
    sku: 'CTN-FLR-002',
    imageUrl: 'https://picsum.photos/200/200?random=2',
    unit: 'Meters',
    hsnCode: '5208',
    taxRate: 5,
    minStockLevel: 50
  },
  {
    id: '3',
    name: 'Wool Yarn Ball',
    type: ProductType.YARN,
    material: 'Wool',
    color: 'Grey',
    variant: '100g',
    price: 8.00,
    stock: 45,
    sku: 'WL-GRY-100',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    unit: 'Kg',
    hsnCode: '5109',
    taxRate: 5,
    minStockLevel: 10
  },
  {
    id: '4',
    name: 'Gold Buttons',
    type: ProductType.ACCESSORY,
    material: 'Metal',
    color: 'Gold',
    variant: 'Pack of 10',
    price: 5.00,
    stock: 200,
    sku: 'BTN-GLD-10',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    unit: 'Box',
    hsnCode: '9606',
    taxRate: 12,
    minStockLevel: 20
  },
  {
    id: '5',
    name: 'Denim Heavy Wash',
    type: ProductType.FABRIC,
    material: 'Denim',
    color: 'Indigo',
    variant: '1m',
    price: 22.00,
    stock: 80,
    sku: 'DNM-IND-001',
    imageUrl: 'https://picsum.photos/200/200?random=5',
    unit: 'Meters',
    hsnCode: '5209',
    taxRate: 12,
    minStockLevel: 15
  }
];

export const MOCK_SALES: Sale[] = [
  {
    id: 1001,
    invoiceNo: 'S-1001',
    date: new Date(Date.now() - 86400000).toISOString(),
    total: 150.00,
    paymentMethod: 'Card',
    items: [],
    subtotal: 142.86, // Approx derived
    totalTax: 7.14,
    discount: 0
  },
  {
    id: 1002,
    invoiceNo: 'S-1002',
    date: new Date(Date.now() - 172800000).toISOString(),
    total: 85.50,
    paymentMethod: 'Cash',
    items: [],
    subtotal: 81.43,
    totalTax: 4.07,
    discount: 0
  },
  {
    id: 1003,
    invoiceNo: 'S-1003',
    date: new Date().toISOString(),
    total: 210.00,
    paymentMethod: 'UPI',
    items: [],
    subtotal: 200.00,
    totalTax: 10.00,
    discount: 0
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'C1',
    name: 'Alice Johnson',
    phone: '555-0101',
    email: 'alice@example.com',
    loyaltyPoints: 450,
    totalSpend: 1200.50,
    tier: 'Gold',
    joinDate: new Date('2023-01-15')
  },
  {
    id: 'C2',
    name: 'Bob Smith',
    phone: '555-0102',
    email: 'bob@example.com',
    loyaltyPoints: 120,
    totalSpend: 350.00,
    tier: 'Silver',
    joinDate: new Date('2023-06-20')
  },
  {
    id: 'C3',
    name: 'Carol White',
    phone: '555-0103',
    email: 'carol@example.com',
    loyaltyPoints: 40,
    totalSpend: 85.00,
    tier: 'Bronze',
    joinDate: new Date('2023-11-05')
  }
];