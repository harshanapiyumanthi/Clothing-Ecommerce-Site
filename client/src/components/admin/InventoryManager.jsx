import { useState, useEffect } from 'react';
import { FiAlertCircle, FiPackage, FiSearch, FiEdit2, FiX, FiSave } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out
  const [editModal, setEditModal] = useState(null);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await adminApi.getProducts();
        setProducts(data);
      } catch { toast.error('Failed to load inventory'); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'out') return matchesSearch && p.stock === 0;
    if (filter === 'low') return matchesSearch && p.stock > 0 && p.stock <= 10;
    return matchesSearch;
  });

  const lowCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);

  const openEdit = (p) => { setEditModal(p); setNewStock(p.stock); };

  const saveStock = async () => {
    if (newStock < 0) return toast.error('Stock cannot be negative');
    try {
      await adminApi.updateProduct(editModal.id, { stock: newStock });
    } catch {}
    setProducts(prev => prev.map(p => p.id === editModal.id ? { ...p, stock: newStock } : p));
    toast.success(`Stock updated for ${editModal.name}`);
    setEditModal(null);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' };
    if (stock <= 10) return { label: `Low (${stock})`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' };
    return { label: `${stock} units`, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' };
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-widest">Inventory Management</h2>
        <p className="text-sm text-gray-500 mt-1">Track stock levels, update quantities and manage low stock alerts.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Products</p>
          <p className="text-2xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('low')}>
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1"><FiAlertCircle size={10} /> Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{lowCount}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-red-200 dark:border-red-900/40 p-4 rounded-xl cursor-pointer" onClick={() => setFilter('out')}>
          <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{outCount}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Stock Value</p>
          <p className="text-2xl font-bold mt-1 text-gold">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><FiSearch size={16} /></span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg focus:border-gold outline-none" />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['low', '⚠️ Low Stock'], ['out', '🚫 Out of Stock']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${filter === val ? 'bg-gold text-white border-gold' : 'border-[var(--border-color)] text-gray-500 hover:border-gold'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Units Sold</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4 text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.map(product => {
                const status = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold font-bold shrink-0">
                            <FiPackage size={16} />
                          </div>
                        )}
                        <span className="font-semibold truncate max-w-[180px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs capitalize">{product.category || '—'}</td>
                    <td className="p-4 font-bold font-sans">${product.price}</td>
                    <td className="p-4 font-sans text-gray-500">{product.sold || 0} sold</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-gold rounded cursor-pointer" title="Update Stock">
                        <FiEdit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-sm rounded-2xl shadow-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <h3 className="font-bold uppercase tracking-widest text-sm">Update Stock</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm font-semibold text-center">{editModal.name}</p>
              <p className="text-xs text-gray-500 text-center">Current: {editModal.stock} units</p>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">New Stock Quantity</label>
                <input type="number" min="0" value={newStock} onChange={e => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans text-center text-2xl font-bold" />
              </div>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map(n => (
                  <button key={n} onClick={() => setNewStock(n)} className="flex-1 py-2 text-xs border border-[var(--border-color)] rounded hover:border-gold hover:text-gold cursor-pointer font-bold">+{n}</button>
                ))}
              </div>
              <button onClick={saveStock} className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <FiSave /> Save Stock Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
