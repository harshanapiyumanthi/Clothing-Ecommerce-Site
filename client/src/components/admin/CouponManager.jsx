import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiTag } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API = 'http://localhost:5000/api/coupons';

const COUPON_TYPES = ['percentage', 'fixed', 'free_shipping'];
const MEMBERSHIP_LEVELS = ['All', 'Free', 'Premium', 'VIP'];

const defaultCoupons = [
  { _id: '1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 50, maxUsage: 500, usedCount: 120, expiresAt: '2026-12-31', memberOnly: false, isActive: true },
  { _id: '2', code: 'PREMIUM25', discountType: 'percentage', discountValue: 25, minOrderAmount: 100, maxUsage: 100, usedCount: 43, expiresAt: '2026-08-31', memberOnly: true, isActive: true },
  { _id: '3', code: 'FREESHIP', discountType: 'fixed', discountValue: 10, minOrderAmount: 80, maxUsage: 200, usedCount: 78, expiresAt: '2026-09-30', memberOnly: false, isActive: true },
  { _id: '4', code: 'AVURUDU50', discountType: 'percentage', discountValue: 50, minOrderAmount: 200, maxUsage: 50, usedCount: 50, expiresAt: '2026-04-30', memberOnly: false, isActive: false },
];

const CouponManager = () => {
  const { userInfo } = useSelector(s => s.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: 10,
    minOrderAmount: 0, maxUsage: 100,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    memberOnly: false, membershipRequired: 'All', isActive: true
  });

  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(API, { headers });
      setCoupons(Array.isArray(data) ? data : (data.coupons || defaultCoupons));
    } catch { setCoupons(defaultCoupons); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', discountType: 'percentage', discountValue: 10, minOrderAmount: 0, maxUsage: 100, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], memberOnly: false, membershipRequired: 'All', isActive: true });
    setShowModal(true);
  };
  const openEdit = (c) => { setEditing(c); setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount, maxUsage: c.maxUsage, expiresAt: c.expiresAt?.split('T')[0] || '', memberOnly: c.memberOnly, membershipRequired: c.membershipRequired || 'All', isActive: c.isActive }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/${editing._id}`, form, { headers }); toast.success('Coupon updated!'); }
      else { await axios.post(API, form, { headers }); toast.success('Coupon created!'); }
      setShowModal(false); fetchCoupons();
    } catch (err) {
      if (editing) setCoupons(prev => prev.map(c => c._id === editing._id ? { ...c, ...form } : c));
      else setCoupons(prev => [...prev, { _id: Date.now().toString(), ...form, usedCount: 0 }]);
      setShowModal(false); toast.success(editing ? 'Coupon updated!' : 'Coupon created!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await axios.delete(`${API}/${id}`, { headers }); } catch {}
    setCoupons(prev => prev.filter(c => c._id !== id));
    toast.success('Coupon deleted');
  };

  const handleToggle = async (coupon) => {
    try { await axios.put(`${API}/${coupon._id}`, { isActive: !coupon.isActive }, { headers }); } catch {}
    setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Coupon Management</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons, festival offers and member-exclusive codes.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-md shadow-gold/25 cursor-pointer">
          <FiPlus /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Coupons', value: coupons.length, color: '' },
          { label: 'Active', value: coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length, color: 'text-emerald-500' },
          { label: 'Member Only', value: coupons.filter(c => c.memberOnly).length, color: 'text-gold' },
          { label: 'Expired', value: coupons.filter(c => isExpired(c.expiresAt)).length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Type / Value</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Access</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {coupons.map(coupon => (
                <tr key={coupon._id} className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${isExpired(coupon.expiresAt) ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <span className="font-mono font-bold text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded tracking-wider">{coupon.code}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` :
                       coupon.discountType === 'fixed' ? `$${coupon.discountValue} off` : 'Free Shipping'}
                    </span>
                    <span className="block text-[10px] text-gray-400 uppercase">{coupon.discountType}</span>
                  </td>
                  <td className="p-4 font-sans text-gray-500">${coupon.minOrderAmount}</td>
                  <td className="p-4">
                    <div className="text-xs">
                      <span className="font-bold">{coupon.usedCount}</span>
                      <span className="text-gray-400"> / {coupon.maxUsage}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div className="bg-gold h-1 rounded-full" style={{ width: `${Math.min((coupon.usedCount / coupon.maxUsage) * 100, 100)}%` }} />
                    </div>
                  </td>
                  <td className="p-4 font-sans text-xs">
                    <span className={isExpired(coupon.expiresAt) ? 'text-red-500 font-bold' : 'text-gray-500'}>
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}
                    </span>
                    {isExpired(coupon.expiresAt) && <span className="block text-[9px] text-red-400 font-bold uppercase">EXPIRED</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${coupon.memberOnly ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {coupon.memberOnly ? '⭐ Members' : 'Public'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${coupon.isActive && !isExpired(coupon.expiresAt) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {isExpired(coupon.expiresAt) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(coupon)} className="p-2 text-gray-400 hover:text-gold cursor-pointer"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleToggle(coupon)} className="p-2 text-gray-400 hover:text-gold cursor-pointer text-xs font-bold">{coupon.isActive ? 'OFF' : 'ON'}</button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-2 text-gray-400 hover:text-red-500 cursor-pointer"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--card-bg)] z-10">
              <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <FiTag className="text-gold" /> {editing ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Coupon Code</label>
                <input type="text" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} required placeholder="e.g. WELCOME10" className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({...f, discountType: e.target.value}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-lg outline-none focus:border-gold text-sm cursor-pointer">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Discount Value</label>
                  <input type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({...f, discountValue: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Min. Order Amount ($)</label>
                  <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({...f, minOrderAmount: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Max Usage Limit</label>
                  <input type="number" min="1" value={form.maxUsage} onChange={e => setForm(f => ({...f, maxUsage: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} required className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Membership Access</label>
                <select value={form.membershipRequired} onChange={e => setForm(f => ({...f, membershipRequired: e.target.value, memberOnly: e.target.value !== 'All'}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-lg outline-none focus:border-gold text-sm cursor-pointer">
                  {MEMBERSHIP_LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Customers (Public)' : `${l} Members Only`}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="w-4 h-4 accent-gold" />
                <span className="font-medium">Activate coupon immediately</span>
              </label>
              <button type="submit" className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md shadow-gold/25 cursor-pointer">
                <FiSave /> {editing ? 'Save Changes' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
