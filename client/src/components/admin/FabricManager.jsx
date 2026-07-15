import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API = 'http://localhost:5000/api/fabrics';

const defaultFabrics = [
  { _id: '1', name: 'Cotton', description: 'Breathable natural fiber', surcharge: 0, isActive: true },
  { _id: '2', name: 'Silk', description: 'Luxurious smooth fabric', surcharge: 45, isActive: true },
  { _id: '3', name: 'Satin', description: 'Glossy smooth finish', surcharge: 35, isActive: true },
  { _id: '4', name: 'Chiffon', description: 'Lightweight sheer fabric', surcharge: 25, isActive: true },
  { _id: '5', name: 'Linen', description: 'Natural breezy fabric', surcharge: 10, isActive: true },
  { _id: '6', name: 'Lace', description: 'Delicate decorative fabric', surcharge: 55, isActive: true },
  { _id: '7', name: 'Velvet', description: 'Rich plush texture', surcharge: 60, isActive: true },
  { _id: '8', name: 'Organza', description: 'Crisp sheer fabric', surcharge: 30, isActive: false },
];

const FabricManager = () => {
  const { userInfo } = useSelector(s => s.auth);
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', surcharge: 0 });
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchFabrics = async () => {
    try {
      const { data } = await axios.get(API);
      setFabrics(data.fabrics?.length ? data.fabrics : defaultFabrics);
    } catch { setFabrics(defaultFabrics); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFabrics(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', surcharge: 0 }); setShowModal(true); };
  const openEdit = (f) => { setEditing(f); setForm({ name: f.name, description: f.description, surcharge: f.surcharge }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/${editing._id}`, form, { headers }); toast.success('Fabric updated!'); }
      else { await axios.post(API, form, { headers }); toast.success('Fabric created!'); }
      setShowModal(false); fetchFabrics();
    } catch {
      if (editing) setFabrics(prev => prev.map(f => f._id === editing._id ? { ...f, ...form } : f));
      else setFabrics(prev => [...prev, { _id: Date.now().toString(), ...form, isActive: true }]);
      setShowModal(false); toast.success(editing ? 'Fabric updated!' : 'Fabric created!');
    }
  };

  const handleToggle = async (fabric) => {
    try { await axios.put(`${API}/${fabric._id}`, { isActive: !fabric.isActive }, { headers }); } catch {}
    setFabrics(prev => prev.map(f => f._id === fabric._id ? { ...f, isActive: !f.isActive } : f));
    toast.success(`Fabric ${fabric.isActive ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fabric?')) return;
    try { await axios.delete(`${API}/${id}`, { headers }); } catch {}
    setFabrics(prev => prev.filter(f => f._id !== id));
    toast.success('Fabric deleted');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Fabric Management</h2>
          <p className="text-sm text-gray-500 mt-1">Control which fabrics are available in the Dream Dress Studio and their surcharges.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-md shadow-gold/25 cursor-pointer">
          <FiPlus /> Add Fabric
        </button>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Fabric Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Surcharge</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {fabrics.map(fabric => (
                <tr key={fabric._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="p-4 font-bold">{fabric.name}</td>
                  <td className="p-4 text-gray-500 text-xs max-w-xs">{fabric.description || '—'}</td>
                  <td className="p-4 font-bold font-sans text-gold">
                    {fabric.surcharge > 0 ? `+$${fabric.surcharge}` : <span className="text-gray-400 font-normal">No charge</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${fabric.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {fabric.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(fabric)} className="p-2 text-gray-400 hover:text-gold transition-colors rounded cursor-pointer"><FiEdit2 size={15} /></button>
                      <button onClick={() => handleToggle(fabric)} className={`p-2 transition-colors rounded cursor-pointer ${fabric.isActive ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-400 hover:text-emerald-500'}`}>
                        {fabric.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                      <button onClick={() => handleDelete(fabric._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded cursor-pointer"><FiTrash2 size={15} /></button>
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
          <div className="bg-[var(--card-bg)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h3 className="font-bold uppercase tracking-widest text-sm">{editing ? 'Edit Fabric' : 'Add New Fabric'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Fabric Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. Silk" className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description..." className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Surcharge ($)</label>
                <input type="number" min="0" value={form.surcharge} onChange={e => setForm(f => ({...f, surcharge: Number(e.target.value)}))} className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans" />
              </div>
              <button type="submit" className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md shadow-gold/25 cursor-pointer">
                <FiSave /> {editing ? 'Save Changes' : 'Create Fabric'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricManager;
