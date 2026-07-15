import { useState, useEffect } from 'react';
import { FiSearch, FiLayers, FiHeart, FiPlus, FiTrash2, FiBox, FiCheck } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const isAccessory = (p) => {
  if (!p) return false;
  if (typeof p.category === 'string') {
    return p.category.toLowerCase() === 'accessories';
  }
  if (p.category && typeof p.category === 'object') {
    return p.category.name?.toLowerCase() === 'accessories';
  }
  return false;
};

const RecommendationManager = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodData = await adminApi.getProducts();
      const recData = await adminApi.getRecommendations();
      setProducts(prodData);
      setRecommendations(recData);
      if (prodData.length > 0) {
        // Set first clothing item as default selected
        const clothingItem = prodData.find(p => !isAccessory(p));
        setSelectedProductId(clothingItem?.id || prodData[0].id);
      }
    } catch (err) {
      toast.error('Failed to load recommendations data');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === selectedProductId);
  };

  const getAssignedRecommendations = () => {
    const rec = recommendations.find(r => r.productId === selectedProductId);
    if (!rec) return [];
    return products.filter(p => rec.assignedProducts.includes(p.id));
  };

  const getAvailableAccessories = () => {
    // Only return products belonging to 'Accessories' category that aren't already assigned
    const assignedIds = recommendations.find(r => r.productId === selectedProductId)?.assignedProducts || [];
    return products.filter(p => 
      isAccessory(p) && 
      !assignedIds.includes(p.id) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAssignAccessory = async (accessoryId) => {
    try {
      const currentRec = recommendations.find(r => r.productId === selectedProductId);
      const currentAssigned = currentRec ? [...currentRec.assignedProducts] : [];
      
      if (!currentAssigned.includes(accessoryId)) {
        const updatedAssigned = [...currentAssigned, accessoryId];
        const newRecs = await adminApi.saveRecommendation(selectedProductId, updatedAssigned);
        setRecommendations(newRecs);
        toast.success('Accessory assigned to product recommendations');
      }
    } catch (err) {
      toast.error('Failed to assign accessory');
    }
  };

  const handleUnassignAccessory = async (accessoryId) => {
    try {
      const currentRec = recommendations.find(r => r.productId === selectedProductId);
      if (currentRec) {
        const updatedAssigned = currentRec.assignedProducts.filter(id => id !== accessoryId);
        const newRecs = await adminApi.saveRecommendation(selectedProductId, updatedAssigned);
        setRecommendations(newRecs);
        toast.success('Accessory removed from product recommendations');
      }
    } catch (err) {
      toast.error('Failed to remove accessory');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  const selectedProduct = getSelectedProduct();
  const assignedAccessories = getAssignedRecommendations();
  const availableAccessories = getAvailableAccessories();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Selector Section */}
      <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-sm mb-2">Select Primary Item</h3>
          <p className="text-xs text-gray-500">Choose a garment or primary item to configure its paired accessory recommendations (shoes, jewelry, bags, etc.).</p>
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
        >
          {products.filter(p => !isAccessory(p)).map(prod => (
            <option key={prod.id} value={prod.id}>{prod.name} ({typeof prod.category === 'object' ? prod.category.name : prod.category})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Assigned Accessories Panel */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-gold/10 text-gold rounded"><FiHeart size={16} /></span>
              <h3 className="font-bold uppercase tracking-wider text-sm">Recommended Accessories</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">These items are recommended together with the chosen primary product.</p>
            
            {assignedAccessories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No recommended accessories paired yet. Choose items from the directory to assign.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedAccessories.map((acc) => (
                  <div key={acc.id} className="border border-[var(--border-color)] p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex gap-3">
                      {acc.images?.[0]?.url ? (
                        <img src={acc.images[0].url} alt={acc.name} className="h-16 w-12 object-cover rounded bg-gray-150 border border-[var(--border-color)]" />
                      ) : (
                        <div className="h-16 w-12 rounded bg-gold/10 text-gold flex items-center justify-center font-bold">
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold truncate max-w-[120px]">{acc.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{acc.brand || 'Atelier'}</p>
                        <p className="text-sm font-bold text-gold font-sans mt-1.5">${acc.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnassignAccessory(acc.id)}
                      className="mt-4 w-full py-1.5 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FiTrash2 size={12} /> Remove Paired
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Directory of Available Accessories */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded"><FiBox size={16} /></span>
                <h3 className="font-bold uppercase tracking-wider text-sm">Accessories Catalogue</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">Select items from your accessory inventory (bags, footwear, jewelry) to pair with the primary garments.</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FiSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Filter accessories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--border-color)] bg-transparent rounded-lg text-xs outline-none focus:border-gold"
            />
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {availableAccessories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No matching accessories available to pair.
              </div>
            ) : (
              availableAccessories.map((acc) => (
                <div key={acc.id} className="border border-[var(--border-color)] p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <div className="flex items-center gap-3 text-sm">
                    {acc.images?.[0]?.url ? (
                      <img src={acc.images[0].url} alt={acc.name} className="h-10 w-8 object-cover rounded bg-gray-150 border border-[var(--border-color)]" />
                    ) : (
                      <div className="h-10 w-8 rounded bg-gold/10 text-gold flex items-center justify-center font-bold">
                        {acc.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold truncate max-w-[180px]">{acc.name}</h4>
                      <p className="text-xs text-gold font-bold font-sans">${acc.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssignAccessory(acc.id)}
                    className="px-3 py-1.5 bg-gold text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FiPlus size={10} /> Pair Up
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default RecommendationManager;
