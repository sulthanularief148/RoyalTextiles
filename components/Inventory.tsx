import React, { useState, useEffect } from 'react';
import { Product, ProductType, UnitOfMeasure } from '../types';
import { db } from '../services/db';
import { Search, Plus, Filter, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const Inventory: React.FC = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const initialProductState: Product = {
    name: '',
    type: ProductType.FABRIC,
    material: '',
    color: '',
    variant: '',
    unit: 'Meters',
    hsnCode: '',
    taxRate: 5,
    price: 0,
    stock: 0,
    minStockLevel: 10,
    sku: '',
    imageUrl: ''
  };
  const [formData, setFormData] = useState<Product>(initialProductState);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.material.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData(initialProductState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await db.products.update(formData.id, formData);
      } else {
        await db.products.add(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-500">Track stock, manage HSN codes, and monitor reorder levels.</p>
        </div>
        <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name, SKU, or material..."
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
                <th className="p-4">Product</th>
                <th className="p-4">SKU / HSN</th>
                <th className="p-4">Type</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Price / Tax</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.color} • {product.material} • {product.variant}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-mono text-gray-700">{product.sku}</div>
                    <div className="text-xs text-gray-500">HSN: {product.hsnCode}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.type === ProductType.FABRIC ? 'bg-purple-100 text-purple-700' :
                      product.type === ProductType.YARN ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${product.stock <= product.minStockLevel ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock} {product.unit}
                      </span>
                      {product.stock <= product.minStockLevel && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                     <div className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</div>
                     <div className="text-xs text-gray-500">GST: {product.taxRate}%</div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="label-text">Product Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div>
                <label className="label-text">Type</label>
                <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProductType})}>
                  {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="label-text">SKU (Stock Keeping Unit)</label>
                <input required type="text" className="input-field" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>

              <div>
                <label className="label-text">Material</label>
                <input type="text" className="input-field" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} placeholder="e.g. Cotton, Silk" />
              </div>

              <div>
                <label className="label-text">Color</label>
                <input type="text" className="input-field" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              </div>

              <div>
                <label className="label-text">Variant/Description</label>
                <input type="text" className="input-field" value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})} placeholder="e.g. 60s Count" />
              </div>

              <div>
                <label className="label-text">Unit of Measure</label>
                <select className="input-field" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as UnitOfMeasure})}>
                  <option value="Meters">Meters</option>
                  <option value="Kg">Kg</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Box">Box</option>
                  <option value="Roll">Roll</option>
                </select>
              </div>

              <div>
                <label className="label-text">Price (Selling)</label>
                <input required type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>

              <div>
                <label className="label-text">Tax Rate (GST %)</label>
                <select className="input-field" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: parseInt(e.target.value)})}>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>

              <div>
                <label className="label-text">HSN Code</label>
                <input required type="text" className="input-field" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} placeholder="e.g. 5208" />
              </div>

              <div>
                <label className="label-text">Current Stock</label>
                <input required type="number" step="0.01" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})} />
              </div>

               <div>
                <label className="label-text">Reorder Level</label>
                <input type="number" className="input-field" value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseFloat(e.target.value)})} />
              </div>

              <div className="col-span-2 mt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save size={20} />
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .label-text {
          @apply block text-sm font-medium text-gray-700 mb-1;
        }
        .input-field {
          @apply w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all;
        }
      `}</style>
    </div>
  );
};

export default Inventory;