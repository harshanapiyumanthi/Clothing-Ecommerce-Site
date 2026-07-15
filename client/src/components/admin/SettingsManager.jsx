import { useState } from 'react';
import { FiSave, FiLock, FiGlobe, FiDatabase, FiCloud, FiDollarSign, FiInstagram, FiFacebook, FiTwitter, FiLink, FiClock, FiCreditCard, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SettingsManager = () => {
  // General
  const [storeName, setStoreName] = useState('Elegance Fashion');
  const [storeEmail, setStoreEmail] = useState('support@elegancefashion.lk');
  const [storePhone, setStorePhone] = useState('+94 11 234 5678');
  const [storeAddress, setStoreAddress] = useState('123 Atelier Lane, Colombo 03, Sri Lanka');
  const [currency, setCurrency] = useState('LKR');
  const [taxRate, setTaxRate] = useState('0');
  
  // Social Media
  const [instagram, setInstagram] = useState('https://instagram.com/elegancefashionlk');
  const [facebook, setFacebook] = useState('https://facebook.com/elegancefashionlk');
  const [tiktok, setTiktok] = useState('');
  const [whatsapp, setWhatsapp] = useState('+94712345678');

  // Business Hours
  const [hoursWeekday, setHoursWeekday] = useState('9:00 AM – 7:00 PM');
  const [hoursSaturday, setHoursSaturday] = useState('9:00 AM – 5:00 PM');
  const [hoursSunday, setHoursSunday] = useState('Closed');

  // Payment Gateways
  const [payments, setPayments] = useState({
    card: true, cod: true, mintpay: false, flex: false
  });

  // Delivery
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('8000');
  const [standardDelivery, setStandardDelivery] = useState('350');
  const [expressDelivery, setExpressDelivery] = useState('700');

  // API credentials
  const [stripePubKey, setStripePubKey] = useState('pk_test_51Nx...4b92');
  const [stripeSecretKey, setStripeSecretKey] = useState('sk_test_51Nx...8e31');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('elegance-fashion');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('ml_default');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_settings', JSON.stringify({
      storeName, storeEmail, storePhone, storeAddress, currency, taxRate,
      instagram, facebook, tiktok, whatsapp,
      hoursWeekday, hoursSaturday, hoursSunday,
      payments, freeShippingThreshold, standardDelivery, expressDelivery,
      stripePubKey, cloudinaryCloudName, cloudinaryPreset
    }));
    toast.success('All settings saved successfully!');
  };

  const SectionHeader = ({ icon, title, color = 'text-gold', bg = 'bg-gold/10' }) => (
    <div className={`flex items-center gap-2 border-b border-[var(--border-color)] pb-3`}>
      <span className={`p-1.5 ${bg} ${color} rounded`}>{icon}</span>
      <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm";

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all business configuration from one place.</p>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gold hover:bg-black text-white font-semibold rounded-lg text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-gold/25">
          <FiSave /> Save All Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* General Store Details */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiGlobe size={18} />} title="General Settings" />
          <Field label="Business Name">
            <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Support Email">
            <input type="email" required value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone Number">
            <input type="tel" value={storePhone} onChange={e => setStorePhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Business Address">
            <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Currency">
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass + ' cursor-pointer bg-[var(--card-bg)]'}>
                <option value="LKR">LKR (Rs.)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </Field>
            <Field label="Tax Rate (%)">
              <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} className={inputClass + ' font-sans'} />
            </Field>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiInstagram size={18} />} title="Social Media Links" color="text-pink-500" bg="bg-pink-500/10" />
          <Field label="Instagram URL">
            <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-pink-400"><FiInstagram size={14} /></span>
              <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className={inputClass + ' pl-9'} /></div>
          </Field>
          <Field label="Facebook URL">
            <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-blue-500"><FiFacebook size={14} /></span>
              <input type="url" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/..." className={inputClass + ' pl-9'} /></div>
          </Field>
          <Field label="TikTok URL">
            <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><FiLink size={14} /></span>
              <input type="url" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="https://tiktok.com/@..." className={inputClass + ' pl-9'} /></div>
          </Field>
          <Field label="WhatsApp Number">
            <div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-emerald-500"><FiTwitter size={14} /></span>
              <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+94712345678" className={inputClass + ' pl-9'} /></div>
          </Field>
        </div>

        {/* Business Hours */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiClock size={18} />} title="Business Hours" color="text-blue-500" bg="bg-blue-500/10" />
          <Field label="Monday – Friday">
            <input type="text" value={hoursWeekday} onChange={e => setHoursWeekday(e.target.value)} placeholder="9:00 AM – 7:00 PM" className={inputClass} />
          </Field>
          <Field label="Saturday">
            <input type="text" value={hoursSaturday} onChange={e => setHoursSaturday(e.target.value)} placeholder="9:00 AM – 5:00 PM" className={inputClass} />
          </Field>
          <Field label="Sunday">
            <input type="text" value={hoursSunday} onChange={e => setHoursSunday(e.target.value)} placeholder="Closed" className={inputClass} />
          </Field>
        </div>

        {/* Delivery Settings */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiTruck size={18} />} title="Delivery Settings" color="text-emerald-500" bg="bg-emerald-500/10" />
          <Field label="Free Shipping Threshold (Rs.)">
            <input type="number" min="0" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value)} className={inputClass + ' font-sans'} />
          </Field>
          <Field label="Standard Delivery Fee (Rs.)">
            <input type="number" min="0" value={standardDelivery} onChange={e => setStandardDelivery(e.target.value)} className={inputClass + ' font-sans'} />
          </Field>
          <Field label="Express Delivery Fee (Rs.)">
            <input type="number" min="0" value={expressDelivery} onChange={e => setExpressDelivery(e.target.value)} className={inputClass + ' font-sans'} />
          </Field>
        </div>

        {/* Payment Gateways */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiCreditCard size={18} />} title="Payment Gateways" color="text-purple-500" bg="bg-purple-500/10" />
          <p className="text-xs text-gray-500">Toggle which payment methods are available at checkout.</p>
          <div className="space-y-3">
            {[
              { key: 'card', label: 'Credit / Debit Card (Stripe)', badge: 'Recommended' },
              { key: 'cod', label: 'Cash on Delivery', badge: '' },
              { key: 'mintpay', label: 'Mintpay (Buy Now Pay Later)', badge: 'Sri Lanka' },
              { key: 'flex', label: 'FLEX Installments', badge: '' },
            ].map(pg => (
              <label key={pg.key} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                <div>
                  <span className="text-sm font-semibold">{pg.label}</span>
                  {pg.badge && <span className="ml-2 px-1.5 py-0.5 bg-gold/15 text-gold text-[9px] font-bold uppercase rounded">{pg.badge}</span>}
                </div>
                <input type="checkbox" checked={payments[pg.key]} onChange={e => setPayments(p => ({...p, [pg.key]: e.target.checked}))} className="w-4 h-4 accent-gold cursor-pointer" />
              </label>
            ))}
          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiLock size={18} />} title="API Credentials" color="text-red-500" bg="bg-red-500/10" />
          <Field label="Stripe Publishable Key">
            <input type="text" value={stripePubKey} onChange={e => setStripePubKey(e.target.value)} placeholder="pk_test_..." className={inputClass + ' font-mono text-xs'} />
          </Field>
          <Field label="Stripe Secret Key (Masked)">
            <input type="password" value={stripeSecretKey} onChange={e => setStripeSecretKey(e.target.value)} placeholder="sk_test_..." className={inputClass + ' font-mono text-xs'} />
          </Field>
          <Field label="Cloudinary Cloud Name">
            <input type="text" value={cloudinaryCloudName} onChange={e => setCloudinaryCloudName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Cloudinary Upload Preset">
            <input type="text" value={cloudinaryPreset} onChange={e => setCloudinaryPreset(e.target.value)} className={inputClass} />
          </Field>
        </div>

        {/* Data Administration */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <SectionHeader icon={<FiDatabase size={18} />} title="Data Administration" color="text-gray-500" bg="bg-gray-100 dark:bg-gray-800" />
          <p className="text-xs text-gray-500 leading-relaxed">Manage database cache, clear local settings, or export a data snapshot of store listings. These actions cannot be undone.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { localStorage.removeItem('admin_settings'); toast.success('Settings reset to defaults'); }} className="px-3 py-2 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              Reset Settings
            </button>
            <button type="button" onClick={() => { localStorage.removeItem('admin_content'); toast.success('Content reset to defaults'); }} className="px-3 py-2 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              Reset Content
            </button>
          </div>
        </div>

      </div>

      <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-end">
        <button type="submit" className="px-6 py-2.5 bg-gold hover:bg-black text-white font-semibold rounded-lg text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-gold/25">
          <FiSave /> Save All Settings
        </button>
      </div>

    </form>
  );
};

export default SettingsManager;
