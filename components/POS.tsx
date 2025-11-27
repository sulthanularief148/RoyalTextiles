import React, { useState, useEffect } from 'react';
import { Product, CartItem, ProductType, Customer, ShopSettings } from '../types';
import { db } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Trash2, PlusCircle, MinusCircle, CreditCard, Banknote, User, X, Gift, Crown, Printer, MessageCircle, CheckCircle, ArrowRight, Mail, Smartphone, Send } from 'lucide-react';

interface POSProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const POS: React.FC<POSProps> = ({ showToast }) => {
  const products = useLiveQuery(() => db.products.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const settings = useLiveQuery(() => db.settings.toArray());
  
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Loyalty State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Billing State
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    if (settings && settings.length > 0) {
      setShopSettings(settings[0]);
    }
  }, [settings]);

  // Constants
  const POINTS_PER_DOLLAR = 0.1;
  const REDEMPTION_RATE = 0.10;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? updateCartItemCalc({ ...item, quantity: item.quantity + 1 }) : item);
      }
      // Initialize full CartItem with calculated fields to satisfy type requirements
      const newItem: CartItem = { 
        ...product, 
        quantity: 1, 
        itemTotal: 0, 
        itemTax: 0 
      };
      return [...prev, updateCartItemCalc(newItem)];
    });
  };

  const updateCartItemCalc = (item: CartItem): CartItem => {
    const total = item.price * item.quantity;
    // GST Calculation: Price is usually inclusive, but for this B2B/Retail software, let's assume Price is Exclusive of Tax for easier calculation demonstration, or Inclusive based on settings. 
    // Here we assume Price is EXCLUSIVE of Tax.
    const taxAmount = (total * item.taxRate) / 100;
    return {
      ...item,
      itemTotal: total,
      itemTax: taxAmount
    };
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? updateCartItemCalc({ ...item, quantity: newQty }) : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const totalTax = cart.reduce((acc, item) => acc + item.itemTax, 0);
  const grossTotal = subtotal + totalTax;
  
  const maxRedeemableValue = selectedCustomer ? selectedCustomer.loyaltyPoints * REDEMPTION_RATE : 0;
  const redemptionValue = redeemPoints && selectedCustomer ? Math.min(maxRedeemableValue, grossTotal) : 0;
  const pointsUsed = redemptionValue / REDEMPTION_RATE;
  
  const finalTotal = grossTotal - redemptionValue;
  const pointsToEarn = Math.floor(finalTotal * POINTS_PER_DOLLAR);

  const handlePayment = async (method: 'Cash' | 'Card') => {
    if (cart.length === 0) return;

    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = {
      invoiceNo,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone, // Store phone for receipt
      items: [...cart],
      subtotal,
      totalTax,
      discount: redemptionValue,
      total: finalTotal,
      pointsEarned: pointsToEarn,
      pointsUsed: pointsUsed,
      paymentMethod: method
    };

    // Save to DB
    await db.sales.add(order);
    
    // Update Stock
    for (const item of cart) {
      if (item.id) {
        const product = await db.products.get(item.id);
        if (product) {
          await db.products.update(item.id, { stock: product.stock - item.quantity });
        }
      }
    }

    // Update Customer Points
    if (selectedCustomer && selectedCustomer.id) {
        const newPoints = selectedCustomer.loyaltyPoints - pointsUsed + pointsToEarn;
        await db.customers.update(selectedCustomer.id, { 
            loyaltyPoints: newPoints,
            totalSpend: selectedCustomer.totalSpend + finalTotal
        });
    }

    setCompletedOrder({ ...order, customer: selectedCustomer, date: new Date() });
    setShowReceipt(true);
    
    setCart([]);
    setSelectedCustomer(null);
    setRedeemPoints(false);
  };

  const handleWhatsAppShare = () => {
    if (!completedOrder) return;
    
    let phone = completedOrder.customerPhone || completedOrder.customer?.phone || '';
    // Basic clean up of phone number
    phone = phone.replace(/\D/g, '');
    
    if (!phone) {
      const input = prompt("Enter customer mobile number (with country code, e.g., 919999999999):");
      if (!input) return;
      phone = input.replace(/\D/g, '');
    }

    const shopName = shopSettings?.shopName || "BusyTextile";
    
    let message = `*INVOICE: ${shopName}*\n`;
    message += `Inv No: ${completedOrder.invoiceNo}\n`;
    message += `Date: ${new Date(completedOrder.date).toLocaleDateString()}\n`;
    message += `------------------------\n`;
    
    completedOrder.items.forEach((item: CartItem) => {
      message += `${item.name} x ${item.quantity} : ${item.itemTotal.toFixed(2)}\n`;
    });
    
    message += `------------------------\n`;
    message += `*Grand Total: $${completedOrder.total.toFixed(2)}*\n`;
    
    if (completedOrder.pointsEarned > 0) {
        message += `Loyalty Points Earned: ${completedOrder.pointsEarned}\n`;
    }
    
    message += `\nThank you for shopping with us!`;

    // Encode and open
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast('WhatsApp opened', 'success');
  };

  const filteredProducts = products?.filter(p => 
    (selectedCategory === 'All' || p.type === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm)
  ) || [];

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 relative flex-col md:flex-row">
      {/* Product Grid - Left Side */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <header>
          <h2 className="text-2xl font-bold text-gray-800">Point of Sale</h2>
          <p className="text-sm text-gray-500">Select items to add to the bill</p>
        </header>

        <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
          {['All', ...Object.values(ProductType)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group flex flex-col h-full"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden w-full relative">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full bg-slate-200" />}
                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 rounded-tl-lg">
                    {product.stock} {product.unit}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 truncate w-full">{product.name}</h3>
              <div className="flex justify-between items-center mt-auto pt-2 w-full">
                <span className="text-sm text-gray-500">{product.variant}</span>
                <span className="font-bold text-blue-600">${product.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart - Right Side */}
      <div className="w-full md:w-96 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
        {/* Customer Section */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 relative z-20">
          {!selectedCustomer ? (
            <div>
               {!isCustomerSearchOpen ? (
                 <button 
                   onClick={() => setIsCustomerSearchOpen(true)}
                   className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                 >
                   <span className="flex items-center gap-2"><User size={18} /> Add Customer for Loyalty</span>
                   <PlusCircle size={16} />
                 </button>
               ) : (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <Search size={16} className="text-gray-400" />
                     <input 
                        autoFocus
                        type="text" 
                        placeholder="Search name or phone..." 
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                     />
                     <button onClick={() => { setIsCustomerSearchOpen(false); setCustomerSearchTerm(''); }}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
                   </div>
                   {customerSearchTerm && (
                     <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-100 rounded-b-lg z-10 max-h-48 overflow-y-auto">
                        {filteredCustomers.length === 0 ? (
                          <div className="p-3 text-xs text-gray-400 text-center">No customers found</div>
                        ) : (
                          filteredCustomers.map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => { setSelectedCustomer(c); setIsCustomerSearchOpen(false); setCustomerSearchTerm(''); }}
                              className="w-full text-left p-3 hover:bg-blue-50 text-sm flex justify-between items-center"
                            >
                               <div>
                                 <div className="font-medium text-gray-800">{c.name}</div>
                                 <div className="text-xs text-gray-500">{c.phone}</div>
                               </div>
                               <span className="text-xs font-bold text-purple-600">{c.loyaltyPoints} pts</span>
                            </button>
                          ))
                        )}
                     </div>
                   )}
                 </div>
               )}
            </div>
          ) : (
             <div className="flex flex-col gap-2">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                       <Crown size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{selectedCustomer.name}</h4>
                      <p className="text-xs text-purple-600 font-medium">{selectedCustomer.loyaltyPoints} Points Available</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setRedeemPoints(false); }} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
               </div>
               
               {selectedCustomer.loyaltyPoints > 0 && cart.length > 0 && (
                 <label className="flex items-center gap-2 p-2 bg-white border border-purple-100 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500" 
                    />
                    <span className="text-xs font-medium text-gray-700 flex-1">Redeem Points</span>
                    {redeemPoints && <span className="text-xs font-bold text-green-600">-${redemptionValue.toFixed(2)}</span>}
                 </label>
               )}
             </div>
          )}
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                 <Banknote className="opacity-20" size={24}/>
              </div>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                 <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                   <div className="flex gap-2 text-[10px] text-gray-500 mb-1">
                       <span>{item.variant}</span>
                       <span className="bg-gray-100 px-1 rounded">GST {item.taxRate}%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <button onClick={() => item.id && updateQuantity(item.id, -1)} className="text-gray-400 hover:text-blue-600"><MinusCircle size={18} /></button>
                       <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                       <button onClick={() => item.id && updateQuantity(item.id, 1)} className="text-gray-400 hover:text-blue-600"><PlusCircle size={18} /></button>
                     </div>
                     <div className="text-right">
                        <span className="font-medium text-gray-900 block">${item.itemTotal.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 block">+ ${item.itemTax.toFixed(2)} Tax</span>
                     </div>
                   </div>
                 </div>
                 <button onClick={() => item.id && removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 self-start">
                    <Trash2 size={16} />
                 </button>
              </div>
            ))
          )}
        </div>

        {/* Totals Section */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal (Excl. Tax)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total GST</span>
              <span>${totalTax.toFixed(2)}</span>
            </div>
            {redeemPoints && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1"><Gift size={12}/> Loyalty Discount ({pointsUsed.toFixed(0)} pts)</span>
                <span>-${redemptionValue.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span>${Math.max(0, finalTotal).toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
                disabled={cart.length === 0}
                onClick={() => handlePayment('Cash')}
                className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
             >
               <Banknote size={18} />
               Cash
             </button>
             <button 
                disabled={cart.length === 0}
                onClick={() => handlePayment('Card')}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-200 disabled:opacity-50 transition-colors"
             >
               <CreditCard size={18} />
               Pay Now
             </button>
          </div>
        </div>
      </div>

      {/* Real-time Receipt Modal */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 print:shadow-none print:w-full print:max-w-none">
            {/* Screen-only Success Header */}
            <div className="bg-green-600 p-6 text-white text-center no-print">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold">Payment Successful</h3>
              <p className="opacity-90">Total Paid: ${completedOrder.total.toFixed(2)}</p>
            </div>
            
            <div className="p-6 space-y-6 print:p-0">
              {/* Receipt Preview */}
              <div id="printable-area" className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm font-mono space-y-2 relative print:border-none print:bg-white print:p-0">
                
                <div className="text-center mb-6 pb-4 border-b border-dashed border-gray-400">
                  <h4 className="font-bold text-xl text-gray-900 uppercase">{shopSettings?.shopName || 'BusyTextile Shop'}</h4>
                  <p className="text-xs text-gray-600 mt-1">{shopSettings?.addressLine1}</p>
                  <p className="text-xs text-gray-600">{shopSettings?.addressLine2}, {shopSettings?.city} - {shopSettings?.pincode}</p>
                  <p className="text-xs text-gray-600">Ph: {shopSettings?.phone}</p>
                  {shopSettings?.gstin && <p className="text-xs font-bold mt-1">GSTIN: {shopSettings.gstin}</p>}
                  <p className="text-xs font-bold mt-2 border-t border-gray-300 inline-block px-2 pt-1">TAX INVOICE</p>
                </div>
                
                <div className="flex justify-between text-gray-600 text-xs mb-4">
                  <div>
                      <p>Inv: {completedOrder.invoiceNo}</p>
                      <p>Date: {new Date(completedOrder.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                      {completedOrder.customerName && <p>Bill To: {completedOrder.customerName}</p>}
                      <p>Mode: {completedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Table Header */}
                <div className="flex text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                    <span className="flex-[2]">Item</span>
                    <span className="w-10 text-center">Qty</span>
                    <span className="w-12 text-center">Rate</span>
                    <span className="w-12 text-right">Amt</span>
                </div>

                <div className="space-y-2 pb-4 border-b border-dashed border-gray-400">
                  {completedOrder.items.map((item: CartItem) => (
                    <div key={item.id}>
                        <div className="flex justify-between items-start text-xs">
                            <span className="flex-[2] font-semibold">{item.name} <br/><span className="font-normal text-[10px] text-gray-500">HSN:{item.hsnCode} | GST:{item.taxRate}%</span></span>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <span className="w-12 text-center">{item.price}</span>
                            <span className="w-12 text-right">{item.itemTotal.toFixed(2)}</span>
                        </div>
                    </div>
                  ))}
                </div>

                {/* Tax Breakdown */}
                <div className="py-2 border-b border-dashed border-gray-400 text-[10px] text-gray-500">
                    <div className="flex justify-between font-bold text-gray-600 mb-1">
                        <span>Taxable Amt</span>
                        <span>CGST</span>
                        <span>SGST</span>
                        <span>Total Tax</span>
                    </div>
                     <div className="flex justify-between">
                        <span>${completedOrder.subtotal.toFixed(2)}</span>
                        <span>${(completedOrder.totalTax / 2).toFixed(2)}</span>
                        <span>${(completedOrder.totalTax / 2).toFixed(2)}</span>
                        <span>${completedOrder.totalTax.toFixed(2)}</span>
                    </div>
                </div>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${completedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Tax</span>
                    <span>${completedOrder.totalTax.toFixed(2)}</span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount</span>
                      <span>-${completedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 mt-2 border-t border-gray-400">
                    <span>Grand Total</span>
                    <span>${completedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-8 text-[10px] text-gray-500">
                    <p>{shopSettings?.termsAndConditions}</p>
                    <p className="mt-1">*** Thank You, Visit Again ***</p>
                </div>
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="space-y-3 no-print">
                 <button 
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#128C7E] shadow-sm transition-colors"
                 >
                   <MessageCircle size={20} />
                   Send via WhatsApp
                 </button>

                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Printer size={18} />
                      Print
                    </button>
                    <button 
                      onClick={() => setShowReceipt(false)}
                      className="flex items-center justify-center gap-2 py-3 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700"
                    >
                        New Sale
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;