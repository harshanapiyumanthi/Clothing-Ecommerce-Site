import { useState, useEffect } from 'react';
import { FiSearch, FiSliders, FiEye, FiCheck, FiX, FiInfo, FiSliders as FiTailorIcon, FiImage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const STATUS_OPTS = ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Ready', 'Shipped'];

const CustomOrderManager = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Manage Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [quoteInput, setQuoteInput] = useState('');
  const [deliveryInput, setDeliveryInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Selected Image zoom state
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await adminApi.getCustomOrders();
      setCustomOrders(data);
    } catch (err) {
      toast.error('Failed to load tailor orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setStatusInput(order.status);
    setQuoteInput(order.quotedPrice || '');
    setDeliveryInput(order.estimatedDelivery || '');
    setAdminNoteInput(order.adminNote || '');
    setShowModal(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateCustomOrder(selectedOrder.id, {
        status: statusInput,
        quotedPrice: parseFloat(quoteInput) || 0,
        estimatedDelivery: deliveryInput,
        adminNote: adminNoteInput
      });
      toast.success('Bespoke order updated successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update bespoke order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/55';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/55';
      case 'Ready': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/55';
      case 'Shipped': return 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-900/55';
      case 'Rejected': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/55';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Filters
  const filteredOrders = customOrders.filter(ord => {
    const matchesSearch = ord.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.fabric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Controls & Filter tabs */}
      <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] space-y-4">
        
        {/* Search */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search custom requests by customer, description, fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-[var(--border-color)] rounded-lg focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
          {['All', ...STATUS_OPTS].map((status) => {
            const count = status === 'All'
              ? customOrders.length
              : customOrders.filter(o => o.status === status).length;
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-gold text-white border-gold shadow-sm scale-105'
                    : 'border-[var(--border-color)] hover:bg-gray-150 text-gray-500'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Grid of Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-xl text-center text-gray-500 col-span-full">
            No customization requests found matching options.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-5 relative">
              
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3 mb-4">
                  <div>
                    <h4 className="font-bold text-base">{order.user.name}</h4>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Fabric, Specs Details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-gray-900/35 border border-[var(--border-color)] p-3 rounded-lg mb-4">
                  <div><span className="text-gray-500 block uppercase font-semibold">Fabric:</span><span className="font-medium text-sm">{order.fabric}</span></div>
                  <div><span className="text-gray-500 block uppercase font-semibold">Size / Color:</span><span className="font-medium text-sm">{order.size} / {order.color}</span></div>
                  <div><span className="text-gray-500 block uppercase font-semibold">Customer Budget:</span><span className="font-bold text-sm text-gold font-sans">${order.budget}</span></div>
                  <div>
                    <span className="text-gray-500 block uppercase font-semibold">Quoted Price:</span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-sans">
                      {order.quotedPrice ? `$${order.quotedPrice}` : 'Not quoted yet'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 mb-4 text-sm">
                  <span className="text-xs text-gray-500 font-semibold uppercase block">Design details</span>
                  <p className="opacity-80 italic">"{order.description}"</p>
                </div>

                {/* Reference Images */}
                {order.referenceImages?.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-xs text-gray-500 font-semibold uppercase block">Reference Images</span>
                    <div className="flex gap-2">
                      {order.referenceImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setZoomedImage(img.url)}
                          className="h-14 w-11 rounded border overflow-hidden bg-gray-150 cursor-zoom-in hover:brightness-95 transition-all shadow-sm flex-shrink-0"
                        >
                          <img src={img.url} alt="ref" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Note Summary */}
                {order.adminNote && (
                  <div className="bg-gold/5 border border-gold/25 p-3 rounded-lg text-xs mt-3">
                    <span className="text-gold font-bold uppercase tracking-wider block mb-1">Admin Response Note</span>
                    <p className="italic opacity-85">"{order.adminNote}"</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="border-t border-[var(--border-color)] pt-4 mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(order)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[var(--border-color)] hover:border-gold hover:text-gold rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FiSliders size={12} /> Respond & Quote
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Quote / Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-[var(--card-bg)] w-full max-w-md rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden my-8 flex flex-col">
            
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-bold uppercase tracking-wider">Respond to Custom Tailoring</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gold p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-5">
              
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Order Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                >
                  {STATUS_OPTS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Price Quote */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Price Quote ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                    <FiDollarSign />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full pl-8 pr-4 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-sans"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Customer's budget proposal was: <strong>${selectedOrder.budget}</strong></p>
              </div>

              {/* Delivery Estimation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Estimated Delivery Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                    <FiCalendar />
                  </span>
                  <input
                    type="date"
                    required
                    value={deliveryInput}
                    onChange={(e) => setDeliveryInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                  />
                </div>
              </div>

              {/* Admin Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Instructions / Notes to Customer</label>
                <textarea
                  rows="3"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Detail tailoring status, color confirmation, shipping details..."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-transparent border border-[var(--border-color)] rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold text-white rounded-lg text-sm hover:bg-black font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-gold/25"
                >
                  Submit Quote
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Zooms references image lightbox */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <img src={zoomedImage} alt="ref zoom" className="max-w-full max-h-[85vh] object-contain rounded border border-gray-800 shadow-2xl" />
        </div>
      )}

    </div>
  );
};

export default CustomOrderManager;
