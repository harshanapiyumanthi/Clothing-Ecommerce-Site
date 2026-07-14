import { useState } from 'react';
import { FiSave, FiLock, FiGlobe, FiDatabase, FiCloud, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SettingsManager = () => {
  const [storeName, setStoreName] = useState('Elegance Couture');
  const [storeEmail, setStoreEmail] = useState('contact@elegancecouture.com');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('8');
  
  // API settings
  const [stripePubKey, setStripePubKey] = useState('pk_test_51Nx...4b92');
  const [stripeSecretKey, setStripeSecretKey] = useState('sk_test_51Nx...8e31');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('elegance-fashion');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('ml_default');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_settings', JSON.stringify({
      storeName, storeEmail, currency, taxRate,
      stripePubKey, stripeSecretKey, cloudinaryCloudName, cloudinaryPreset
    }));
    toast.success('Configuration saved successfully');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
      
      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Store Details */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <span className="p-1.5 bg-gold/10 text-gold rounded"><FiGlobe size={18} /></span>
            <h3 className="font-bold uppercase tracking-wider text-sm">General Settings</h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Store Front Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Support Email</label>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="LKR">LKR (Rs.)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Sales Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans"
                />
              </div>
            </div>

          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded"><FiLock size={18} /></span>
            <h3 className="font-bold uppercase tracking-wider text-sm">Payment Gateway Credentials</h3>
          </div>

          <div className="space-y-3">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <FiDollarSign /> Stripe Publishable Key
              </label>
              <input
                type="text"
                value={stripePubKey}
                onChange={(e) => setStripePubKey(e.target.value)}
                placeholder="pk_test_..."
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <FiLock /> Stripe Secret Key
              </label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                placeholder="sk_test_..."
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono"
              />
            </div>

          </div>
        </div>

        {/* Cloud Media storage */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded"><FiCloud size={18} /></span>
            <h3 className="font-bold uppercase tracking-wider text-sm">Cloudinary Storage</h3>
          </div>

          <div className="space-y-3">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cloud Name</label>
              <input
                type="text"
                value={cloudinaryCloudName}
                onChange={(e) => setCloudinaryCloudName(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Upload Preset</label>
              <input
                type="text"
                value={cloudinaryPreset}
                onChange={(e) => setCloudinaryPreset(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
              />
            </div>

          </div>
        </div>

        {/* System & Data Backup */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <span className="p-1.5 bg-purple-500/10 text-purple-500 rounded"><FiDatabase size={18} /></span>
            <h3 className="font-bold uppercase tracking-wider text-sm">Data Administration</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-gray-500">Manage database cache, empty temporary mock logs, or export local snapshots of store listings.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Database & Reset
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Save Button floating panel */}
      <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 bg-gold hover:bg-black text-white font-semibold rounded-lg text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-gold/25"
        >
          <FiSave /> Save Store Configuration
        </button>
      </div>

    </form>
  );
};

export default SettingsManager;
