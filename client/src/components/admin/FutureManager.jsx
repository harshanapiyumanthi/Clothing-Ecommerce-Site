import React, { useState, useEffect } from 'react';
import { adminApi } from '../../utils/adminApi';
import { 
  FiCpu, FiMapPin, FiTruck, FiUsers, FiGlobe, 
  FiPlus, FiSave, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';

const FutureManager = () => {
  const [activeSubTab, setActiveSubTab] = useState('ai');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // States
  const [aiAdvice, setAiAdvice] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [zones, setZones] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [translations, setTranslations] = useState([]);

  // Form states
  const [newZone, setNewZone] = useState({ name: '', countries: '', baseCost: 0, taxRate: 0, dutyRate: 0, deliveryEstimate: '5-7 Days' });
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockQty, setStockQty] = useState(0);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'ai') {
        const res = await adminApi.getFutureAiStylistAdvice();
        setAiAdvice(res);
      } else if (activeSubTab === 'warehouses') {
        const whRes = await adminApi.getFutureWarehouses();
        setWarehouses(whRes.warehouses || []);
        const supRes = await adminApi.getFutureSuppliers();
        setSuppliers(supRes.suppliers || []);
      } else if (activeSubTab === 'shipping') {
        const res = await adminApi.getFutureShippingZones();
        setZones(res.zones || []);
      } else if (activeSubTab === 'marketplace') {
        const res = await adminApi.getFutureMarketplaceVendors();
        setVendors(res.vendors || []);
      } else if (activeSubTab === 'localizations') {
        const res = await adminApi.getFutureTranslations();
        setTranslations(res.translations || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    const payload = {
      ...newZone,
      countries: newZone.countries.split(',').map(c => c.trim())
    };
    const res = await adminApi.saveFutureShippingZone(payload);
    if (res.success) {
      showNotification('Shipping Zone saved successfully!');
      fetchData();
      setNewZone({ name: '', countries: '', baseCost: 0, taxRate: 0, dutyRate: 0, deliveryEstimate: '5-7 Days' });
    }
  };

  const handleWarehouseStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse || !selectedProduct) return;
    const res = await adminApi.updateFutureWarehouseStock(selectedWarehouse, selectedProduct, stockQty);
    showNotification('Warehouse stock updated successfully!');
    fetchData();
  };

  const handleVendorStatus = async (vendorId, status) => {
    const res = await adminApi.updateFutureMarketplaceVendor(vendorId, { status });
    if (res.success) {
      showNotification('Vendor status updated successfully!');
      fetchData();
    }
  };

  const handleTranslationChange = async (transId, values) => {
    const res = await adminApi.updateFutureTranslation(transId, values);
    if (res.success) {
      showNotification('Translation updated successfully!');
      fetchData();
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FiCpu className="text-teal-400" /> Future Expansion & AI Readiness
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure next-gen features: AI fashion modeling, multi-warehouse, international shipping, and global marketplace.
          </p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm animate-pulse">
            <FiCheckCircle /> {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
            activeSubTab === 'ai' 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FiCpu /> AI Stylist
        </button>
        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
            activeSubTab === 'warehouses' 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FiMapPin /> Fulfillment & Supply
        </button>
        <button
          onClick={() => setActiveSubTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
            activeSubTab === 'shipping' 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FiTruck /> Global Logistics
        </button>
        <button
          onClick={() => setActiveSubTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
            activeSubTab === 'marketplace' 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FiUsers /> Designer Portal
        </button>
        <button
          onClick={() => setActiveSubTab('localizations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
            activeSubTab === 'localizations' 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FiGlobe /> Localizations & Rates
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
        </div>
      ) : (
        <div>
          {/* AI Tab */}
          {activeSubTab === 'ai' && aiAdvice && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiCpu className="text-teal-400" /> Aggregated Customer Context (For LLM prompt)
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400 font-medium">Favorite Colors: </span>
                    <span className="text-slate-200">{aiAdvice.userPreferences.colors.join(', ') || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Sizes Map: </span>
                    <span className="text-slate-200">{aiAdvice.userPreferences.sizes.join(', ') || 'M, L'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Preferred Styles: </span>
                    <span className="text-slate-200">{aiAdvice.userPreferences.styles.join(', ') || 'Elegant evening'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Purchased Items: </span>
                    <span className="text-slate-200">{aiAdvice.purchasedHistory.join(', ') || 'Silk Evening Gown'}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-950 rounded-lg font-mono text-xs text-teal-400">
                  <span className="text-slate-500">// System Prompt for AI integration:</span>
                  <br />
                  "Act as a fashion consultant. Generate dynamic outfits for user preferences: colors [{aiAdvice.userPreferences.colors.join(', ')}], sizes [{aiAdvice.userPreferences.sizes.join(', ')}]."
                </div>
              </div>

              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Simulated Personal Stylist Output</h3>
                <div className="space-y-4">
                  {Object.entries(aiAdvice.stylistAdvice || {}).map(([occasion, recommendation]) => (
                    <div key={occasion} className="bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                      <h4 className="text-sm font-semibold text-teal-300">{occasion} Wear</h4>
                      <p className="text-slate-300 text-xs mt-1">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warehouses Tab */}
          {activeSubTab === 'warehouses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Stock Locations (Multi-Warehouse)</h3>
                  <div className="space-y-4">
                    {warehouses.map(wh => (
                      <div key={wh._id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{wh.name}</h4>
                          <p className="text-slate-400 text-xs">{wh.location}</p>
                          <p className="text-slate-500 text-xs mt-1">Capacity: {wh.capacity} items</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          wh.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {wh.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Supplier Profiles</h3>
                  <div className="space-y-4">
                    {suppliers.map(sup => (
                      <div key={sup._id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">{sup.name}</h4>
                            <p className="text-slate-400 text-xs">Category: {sup.suppliedCategories.join(', ')}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400">
                            {sup.contractStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                          <p>Contact: {sup.contactPerson} ({sup.phone})</p>
                          <p>Email: {sup.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeSubTab === 'shipping' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-white">Active International Shipping Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map(zone => (
                    <div key={zone._id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-white">{zone.name}</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{zone.courierPartner}</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-3">Countries: {zone.countries.join(', ')}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-850 pt-2 text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px]">Base cost</p>
                          <p className="font-semibold">Rs.{zone.baseCost}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px]">Tax Rate</p>
                          <p className="font-semibold">{zone.taxRate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px]">Delivery</p>
                          <p className="font-semibold">{zone.deliveryEstimate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">Add Shipping Zone</h3>
                <form onSubmit={handleAddZone} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Zone Name</label>
                    <input
                      type="text"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      placeholder="e.g. North America"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Countries (comma separated)</label>
                    <input
                      type="text"
                      value={newZone.countries}
                      onChange={(e) => setNewZone({ ...newZone, countries: e.target.value })}
                      placeholder="e.g. USA, Canada"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Base Cost (Rs.)</label>
                      <input
                        type="number"
                        value={newZone.baseCost}
                        onChange={(e) => setNewZone({ ...newZone, baseCost: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={newZone.taxRate}
                        onChange={(e) => setNewZone({ ...newZone, taxRate: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <FiPlus /> Save Zone
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeSubTab === 'marketplace' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Designer Marketplace Hub</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-350">
                  <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-850">
                    <tr>
                      <th className="px-4 py-3">Store Name</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Commission Rate</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(vendor => (
                      <tr key={vendor._id} className="border-b border-slate-850 hover:bg-slate-900/20">
                        <td className="px-4 py-3 font-medium text-white">{vendor.name}</td>
                        <td className="px-4 py-3">{vendor.owner?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{vendor.commissionRate}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            vendor.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {vendor.status !== 'Approved' ? (
                            <button
                              onClick={() => handleVendorStatus(vendor._id, 'Approved')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs px-3 py-1 rounded transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVendorStatus(vendor._id, 'Suspended')}
                              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs px-3 py-1 rounded border border-rose-500/30 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Localizations Tab */}
          {activeSubTab === 'localizations' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Static Translation Dictionary (Sinhala & Tamil)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {translations.map(tr => (
                  <div key={tr._id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-teal-400 text-xs">{tr.key}</span>
                      <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded-full">{tr.category}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">English</span>
                        <input
                          type="text"
                          defaultValue={tr.values.en}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white"
                          disabled
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sinhala</span>
                        <input
                          type="text"
                          defaultValue={tr.values.si}
                          onBlur={(e) => handleTranslationChange(tr._id, { si: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tamil</span>
                        <input
                          type="text"
                          defaultValue={tr.values.ta}
                          onBlur={(e) => handleTranslationChange(tr._id, { ta: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-white focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FutureManager;
