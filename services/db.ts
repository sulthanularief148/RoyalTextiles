import Dexie, { Table } from 'dexie';
import { Product, Sale, Customer, ShopSettings, ProductType } from '../types';

class TextileDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  customers!: Table<Customer>;
  settings!: Table<ShopSettings>;

  constructor() {
    super('BusyTextileDB');
    (this as any).version(1).stores({
      products: '++id, name, sku, type, material',
      sales: '++id, invoiceNo, date, customerId',
      customers: '++id, name, phone, email',
      settings: '++id'
    });
  }
}

export const db = new TextileDatabase();

// Seed function to populate data if empty
export const seedDatabase = async () => {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      {
        name: 'Royal Blue Silk',
        type: ProductType.FABRIC,
        material: 'Silk',
        color: 'Royal Blue',
        variant: 'Raw Silk',
        unit: 'Meters',
        hsnCode: '5007',
        taxRate: 5,
        price: 450.00,
        stock: 120,
        minStockLevel: 50,
        sku: 'SLK-BLU-001',
        imageUrl: 'https://picsum.photos/200/200?random=1'
      },
      {
        name: 'Cotton Floral Print',
        type: ProductType.FABRIC,
        material: 'Cotton',
        color: 'Multicolor',
        variant: '60s Count',
        unit: 'Meters',
        hsnCode: '5208',
        taxRate: 5,
        price: 120.00,
        stock: 500,
        minStockLevel: 100,
        sku: 'CTN-FLR-002',
        imageUrl: 'https://picsum.photos/200/200?random=2'
      },
      {
        name: 'Gold Buttons',
        type: ProductType.ACCESSORY,
        material: 'Metal',
        color: 'Gold',
        variant: '18mm',
        unit: 'Box',
        hsnCode: '9606',
        taxRate: 12,
        price: 250.00,
        stock: 20,
        minStockLevel: 5,
        sku: 'BTN-GLD-10',
        imageUrl: 'https://picsum.photos/200/200?random=4'
      }
    ]);

    await db.customers.add({
      name: 'Cash Customer',
      phone: '0000000000',
      email: 'walkin@store.com',
      loyaltyPoints: 0,
      totalSpend: 0,
      tier: 'Bronze',
      joinDate: new Date()
    });

    await db.settings.add({
      shopName: 'BusyTextile & Fabrics',
      addressLine1: '12, Market Road',
      addressLine2: 'Textile Market Area',
      city: 'Mumbai',
      pincode: '400002',
      phone: '+91 98765 43210',
      gstin: '27AAAAA0000A1Z5',
      termsAndConditions: 'No returns on cut fabrics. Exchange within 7 days.'
    });
  }
};