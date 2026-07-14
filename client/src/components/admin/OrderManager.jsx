import { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiEye, FiCheck, FiSliders, FiX, FiPrinter, FiTruck, FiDollarSign } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Detail Modal / Drawer State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersData = await adminApi.getOrders();
      setOrders(ordersData);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setTrackingNum(order.trackingNumber || '');
    setShowDrawer(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      await adminApi.saveOrderStatus(selectedOrder.id, editStatus, trackingNum);
      toast.success('Order updated successfully');
      setShowDrawer(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/55';
      case 'Processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/55';
      case 'Shipping': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/55';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/55';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const printInvoice = () => {
    if (!selectedOrder) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${selectedOrder.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
            .invoice-title { font-size: 22px; font-weight: bold; color: #D4AF37; }
            .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .details h3 { margin-bottom: 10px; font-size: 14px; text-transform: uppercase; color: #777; }
            .table { w-full; border-collapse: collapse; margin-top: 20px; width: 100%; }
            .table th, .table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            .table th { background-color: #f9f9f9; }
            .totals { margin-top: 30px; text-align: right; }
            .totals table { margin-left: auto; width: 250px; }
            .totals td { padding: 8px 12px; }
            .totals .grand-total { font-weight: bold; font-size: 18px; color: #D4AF37; border-top: 2px solid #D4AF37; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ELEGANCE FASHION</div>
              <div>Invoice for your luxury garment purchase</div>
            </div>
            <div class="invoice-title">INVOICE #${selectedOrder.id}</div>
          </div>
          <div class="details">
            <div>
              <h3>Billed To:</h3>
              <strong>${selectedOrder.user.name}</strong><br>
              ${selectedOrder.user.email}<br>
              ${selectedOrder.shippingAddress?.address || 'N/A'}<br>
              ${selectedOrder.shippingAddress?.city || ''}, ${selectedOrder.shippingAddress?.postalCode || ''}<br>
              ${selectedOrder.shippingAddress?.country || ''}
            </div>
            <div>
              <h3>Order Info:</h3>
              <strong>Order Date:</strong> ${new Date(selectedOrder.createdAt).toLocaleDateString()}<br>
              <strong>Payment Method:</strong> ${selectedOrder.paymentMethod}<br>
              <strong>Payment Status:</strong> ${selectedOrder.isPaid ? 'PAID' : 'PENDING'}<br>
              <strong>Delivery Status:</strong> ${selectedOrder.orderStatus}
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.orderItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>$${item.price}</td>
                  <td>$${item.qty * item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>$${selectedOrder.itemsPrice}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td>$${selectedOrder.shippingPrice}</td>
              </tr>
              ${selectedOrder.discount ? `
                <tr>
                  <td>Discount:</td>
                  <td>-$${selectedOrder.discount}</td>
                </tr>
              ` : ''}
              <tr class="grand-total">
                <td>Total paid:</td>
                <td>$${selectedOrder.totalPrice}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || ord.orderStatus === statusFilter;

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
      
      {/* Controls & Filter Tabs */}
      <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] space-y-4">
        
        {/* Search */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-[var(--border-color)] rounded-lg focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
          {['All', ...STATUS_OPTIONS].map((status) => {
            const count = status === 'All' 
              ? orders.length 
              : orders.filter(o => o.orderStatus === status).length;
            
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

      {/* Orders Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items count</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No orders matching selection.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    
                    {/* Order ID */}
                    <td className="p-4 font-bold text-gold font-sans">
                      #{order.id}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-semibold">{order.user.name}</div>
                      <div className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{order.user.email}</div>
                    </td>

                    {/* Items Count */}
                    <td className="p-4 font-medium">
                      {order.orderItems.reduce((acc, i) => acc + i.qty, 0)} items
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold font-sans">
                      ${order.totalPrice}
                    </td>

                    {/* Payment status badge */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider flex items-center gap-1.5 w-fit ${
                        order.isPaid 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/55'
                      }`}>
                        <FiDollarSign size={10} />
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    {/* Shipping Status badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 font-sans">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleOpenDrawer(order)}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[var(--border-color)] hover:border-gold hover:text-gold rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FiEye size={12} /> Manage
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Order Detail Drawer */}
      {showDrawer && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end p-4 sm:p-0 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] w-full max-w-lg h-full border-l border-[var(--border-color)] shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-up sm:animate-none">
            
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wider">Order #{selectedOrder.id}</h3>
                <p className="text-xs text-gray-500 font-sans">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={printInvoice}
                  className="p-2 text-gray-500 hover:text-gold rounded-full transition-colors cursor-pointer"
                  title="Print Invoice"
                >
                  <FiPrinter size={18} />
                </button>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="text-gray-500 hover:text-gold p-1 cursor-pointer"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Customer Information</h4>
                <div className="bg-gray-50 dark:bg-gray-900/35 border border-[var(--border-color)] p-4 rounded-lg space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span><strong>{selectedOrder.user.name}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email:</span><strong>{selectedOrder.user.email}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Payment Type:</span><strong>{selectedOrder.paymentMethod}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Shipping Address:</span>
                    <strong className="text-right">
                      {selectedOrder.shippingAddress?.address || 'N/A'},<br />
                      {selectedOrder.shippingAddress?.city || ''}, {selectedOrder.shippingAddress?.postalCode || ''},<br />
                      {selectedOrder.shippingAddress?.country || ''}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Order Items</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-12 w-9 object-cover rounded bg-gray-150" />
                        ) : (
                          <div className="h-12 w-9 rounded bg-gold/10 text-gold flex items-center justify-center font-bold">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h5 className="text-sm font-semibold truncate max-w-[180px]">{item.name}</h5>
                          <p className="text-xs text-gray-500 font-sans">${item.price} x {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm font-sans">${item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial calculations */}
              <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span className="font-sans font-medium">${selectedOrder.itemsPrice}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping:</span><span className="font-sans font-medium">${selectedOrder.shippingPrice}</span></div>
                {selectedOrder.discount ? (
                  <div className="flex justify-between text-red-500"><span>Discount:</span><span className="font-sans font-medium">-${selectedOrder.discount}</span></div>
                ) : null}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[var(--border-color)]">
                  <span>Grand Total:</span>
                  <span className="text-gold font-sans">${selectedOrder.totalPrice}</span>
                </div>
              </div>

              {/* Status Update Form Form */}
              <form onSubmit={handleUpdateOrder} className="border-t border-[var(--border-color)] pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1">
                  <FiTruck /> Logistics Status
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNum}
                    onChange={(e) => setTrackingNum(e.target.value)}
                    placeholder="e.g. TRK-98127391"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold text-white font-semibold rounded-lg text-xs uppercase tracking-wider hover:bg-black transition-colors cursor-pointer shadow-md shadow-gold/25"
                >
                  Save Status Updates
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManager;
