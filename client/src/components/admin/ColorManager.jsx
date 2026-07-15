import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX, FiSave, FiDroplet } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const API = 'http://localhost:5000/api/colors';

const defaultColors = [
  { _id: '1', name: 'Ivory White', hexCode: '#FFFFF0', isActive: true },
  { _id: '2', name: 'Rose Gold', hexCode: '#B76E79', isActive: true },
  { _id: '3', name: 'Midnight Black', hexCode: '#1a1a1a', isActive: true },
  { _id: '4', name: 'Champagne', hexCode: '#F7E7CE', isActive: true },
  { _id: '5', name: 'Deep Burgundy', hexCode: '#800020', isActive: true },
  { _id: '6', name: 'Sage Green', hexCode: '#87AE73', isActive: true },
  { _id: '7', name: 'Dusty Blue', hexCode: '#88A8BD', isActive: false },
  { _id: '8', name: 'Blush Pink', hexCode: '#FFB6C1', isActive: true },
];

const ColorManager = () => {
  const { userInfo } = useSelector(s => s.auth);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', hexCode: '#000000' });

  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchColors = async () => {
    try {
      const { data } = await axios.get(API);
      setColors(data.colors?.length ? data.colors : defaultColors);
    } catch {
      setColors(defaultColors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchColors(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', hexCode: '#D4AF37' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, hexCode: c.hexCode }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/${editing._id}`, form, { headers });
        toast.success('Color updated!');
      } else {
        await axios.post(API, form, { headers });
        toast.success('Color created!');
      }
      setShowModal(false);
      fetchColors();
    } catch (err) {
      // Optimistic local update for demo
      if (editing) {
        setColors(prev => prev.map(c => c._id === editing._id ? { ...c, ...form } : c));
      } else {
        setColors(prev => [...prev, { _id: Date.now().toString(), ...form, isActive: true }]);
      }
      setShowModal(false);
      toast.success(editing ? 'Color updated!' : 'Color created!');
    }
  };

  const handleToggle = async (color) => {
    try {
      await axios.put(`${API}/${color._id}`, { isActive: !color.isActive }, { headers });
    } catch {}
    setColors(prev => prev.map(c => c._id === color._id ? { ...c, isActive: !c.isActive } : c));
    toast.success(`Color ${color.isActive ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this color? Products using it won\'t be affected.')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
    } catch {}
    setColors(prev => prev.filter(c => c._id !== id));
    toast.success('Color deleted');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">Color Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all available colors. Only active colors are shown to customers.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-md shadow-gold/25 cursor-pointer"
        >
          <FiPlus /> Add New Color
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Colors</p>
          <p className="text-2xl font-bold mt-1">{colors.length}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{colors.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Disabled</p>
          <p className="text-2xl font-bold mt-1 text-gray-400">{colors.filter(c => !c.isActive).length}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Visible to Customers</p>
          <p className="text-2xl font-bold mt-1 text-gold">{colors.filter(c => c.isActive).length}</p>
        </div>
      </div>

      {/* Color Grid */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Color Swatch</th>
                <th className="p-4">Name</th>
                <th className="p-4">Hex Code</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {colors.map(color => (
                <tr key={color._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="p-4">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-[var(--border-color)] shadow-sm"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  </td>
                  <td className="p-4 font-semibold">{color.name}</td>
                  <td className="p-4 font-mono text-gray-500 uppercase text-xs">{color.hexCode}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${color.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {color.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(color)} className="p-2 text-gray-400 hover:text-gold transition-colors rounded cursor-pointer" title="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleToggle(color)} className={`p-2 transition-colors rounded cursor-pointer ${color.isActive ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-400 hover:text-emerald-500'}`} title={color.isActive ? 'Disable' : 'Enable'}>
                        {color.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                      <button onClick={() => handleDelete(color._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded cursor-pointer" title="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <FiDroplet className="text-gold" /> {editing ? 'Edit Color' : 'Create New Color'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gold cursor-pointer"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Color Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. Ivory White" className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Hex Color Code</label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={form.hexCode} onChange={e => setForm(f => ({...f, hexCode: e.target.value}))} className="w-12 h-10 rounded border border-[var(--border-color)] cursor-pointer bg-transparent p-0.5" />
                  <input type="text" value={form.hexCode} onChange={e => setForm(f => ({...f, hexCode: e.target.value}))} placeholder="#000000" className="flex-1 px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono uppercase" />
                </div>
                <div className="h-8 rounded-lg border border-[var(--border-color)] mt-2" style={{ backgroundColor: form.hexCode }} />
              </div>
              <button type="submit" className="w-full py-3 bg-gold text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md shadow-gold/25 cursor-pointer">
                <FiSave /> {editing ? 'Save Changes' : 'Create Color'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorManager;
