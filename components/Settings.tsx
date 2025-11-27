import React, { useEffect, useState } from 'react';
import { Save, Building } from 'lucide-react';
import { db } from '../services/db';
import { ShopSettings } from '../types';

interface SettingsProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ showToast }) => {
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    phone: '',
    gstin: '',
    termsAndConditions: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await db.settings.toArray();
    if (data.length > 0) {
      setSettings(data[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = await db.settings.count();
      if (count === 0) {
        await db.settings.add(settings);
      } else {
        const firstId = (await db.settings.toArray())[0].id;
        if (firstId) await db.settings.update(firstId, settings);
      }
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="text-blue-600" /> Shop Configuration
        </h2>
        <p className="text-gray-500">Configure your GSTIN, address, and invoice preferences.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input 
              required
              type="text" 
              value={settings.shopName}
              onChange={(e) => setSettings({...settings, shopName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. BusyTextile Fabrics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
            <input 
              type="text" 
              value={settings.gstin}
              onChange={(e) => setSettings({...settings, gstin: e.target.value.toUpperCase()})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input 
              type="text" 
              value={settings.addressLine1}
              onChange={(e) => setSettings({...settings, addressLine1: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input 
              type="text" 
              value={settings.addressLine2}
              onChange={(e) => setSettings({...settings, addressLine2: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              type="text" 
              value={settings.city}
              onChange={(e) => setSettings({...settings, city: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input 
              type="text" 
              value={settings.pincode}
              onChange={(e) => setSettings({...settings, pincode: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Footer / Terms</label>
            <textarea 
              rows={3}
              value={settings.termsAndConditions}
              onChange={(e) => setSettings({...settings, termsAndConditions: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Goods once sold will not be taken back."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Save size={20} />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;