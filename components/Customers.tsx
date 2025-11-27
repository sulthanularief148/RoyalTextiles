import React, { useState } from 'react';
import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../services/mockData';
import { Search, Plus, Filter, User, Phone, Award, Crown, Send, X, Mail, MessageSquare } from 'lucide-react';

interface CustomersProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const Customers: React.FC<CustomersProps> = ({ showToast }) => {
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Marketing Modal State
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [selectedCustomerForMarketing, setSelectedCustomerForMarketing] = useState<Customer | null>(null);
  const [marketingMessage, setMarketingMessage] = useState('');
  const [marketingType, setMarketingType] = useState<'sms' | 'email'>('sms');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-orange-50 text-orange-800 border-orange-100';
    }
  };

  const openMarketingModal = (customer: Customer) => {
    setSelectedCustomerForMarketing(customer);
    setMarketingMessage(`Hello ${customer.name}, we have a special offer just for you! Visit us today for 20% off on all Silk items.`);
    setShowMarketingModal(true);
  };

  const handleSendCampaign = () => {
    if (!selectedCustomerForMarketing) return;
    
    // Simulate API call
    setTimeout(() => {
      showToast(
        `${marketingType === 'sms' ? 'SMS' : 'Email'} campaign sent to ${selectedCustomerForMarketing.name}`, 
        'success'
      );
      setShowMarketingModal(false);
      setMarketingMessage('');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Customers & Loyalty</h2>
          <p className="text-gray-500">Manage customer profiles and loyalty points.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-600">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Loyalty Tier</th>
                <th className="p-4">Points Balance</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} />
                      <span className="text-sm font-mono">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(customer.tier)}`}>
                       <Crown size={12} />
                       {customer.tier}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Award size={16} className="text-purple-500" />
                      <span className="font-bold text-gray-900">{customer.loyaltyPoints} pts</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900 font-medium">
                    ${customer.totalSpend.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openMarketingModal(customer)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-1 text-xs font-medium ml-auto transition-colors"
                    >
                      <Send size={14} />
                      Send Offer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marketing Modal */}
      {showMarketingModal && selectedCustomerForMarketing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Send Campaign</h3>
              <button onClick={() => setShowMarketingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setMarketingType('sms')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    marketingType === 'sms' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare size={18} /> SMS
                </button>
                <button 
                  onClick={() => setMarketingType('email')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    marketingType === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Mail size={18} /> Email
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${selectedCustomerForMarketing.name} (${marketingType === 'sms' ? selectedCustomerForMarketing.phone : selectedCustomerForMarketing.email})`}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows={4}
                  value={marketingMessage}
                  onChange={(e) => setMarketingMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
                <p className="text-xs text-right text-gray-400 mt-1">{marketingMessage.length} characters</p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSendCampaign}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Send size={18} />
                  Send Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;