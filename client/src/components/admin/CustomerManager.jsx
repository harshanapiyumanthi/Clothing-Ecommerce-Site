import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, FiShoppingBag, FiX, FiInfo } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const customersData = await adminApi.getCustomers();
      const ordersData = await adminApi.getOrders();
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (err) {
      toast.error('Failed to load customers directory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (customer) => {
    setSelectedCustomer(customer);
    setShowDrawer(true);
  };

  // Find orders belonging to the customer
  const getCustomerOrders = (customerEmail) => {
    return orders.filter(o => o.user.email.toLowerCase() === customerEmail.toLowerCase());
  };

  const getCustomerTotalSpent = (customerEmail) => {
    const custOrders = getCustomerOrders(customerEmail);
    return custOrders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
  };

  // Filter Logic
  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search Header */}
      <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search customers by name, email, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-[var(--border-color)] rounded-lg focus:border-gold outline-none transition-colors"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Membership</th>
                <th className="p-4 font-sans">Orders</th>
                <th className="p-4 font-sans">Total Spent</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const custOrders = getCustomerOrders(cust.email);
                  const totalSpent = getCustomerTotalSpent(cust.email);
                  
                  return (
                    <tr key={cust.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      
                      {/* Name / Initials */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gold/10 text-gold border border-gold/20 flex items-center justify-center font-bold">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{cust.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-medium opacity-85 text-sm">{cust.email}</td>

                      {/* Membership */}
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-full tracking-wider ${
                          cust.membershipTier === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                          cust.membershipTier === 'Premium' ? 'bg-gold/15 text-gold border border-gold/30' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800'
                        }`}>
                          {cust.membershipTier || 'Free'}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="p-4 font-bold font-sans">
                        {custOrders.length}
                      </td>

                      {/* Total Spent */}
                      <td className="p-4 font-bold font-sans text-gold">
                        ${totalSpent.toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleOpenDrawer(cust)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[var(--border-color)] hover:border-gold hover:text-gold rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FiInfo size={12} /> View History
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Order History Drawer */}
      {showDrawer && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end p-4 sm:p-0 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] w-full max-w-lg h-full border-l border-[var(--border-color)] shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-up sm:animate-none">
            
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gold text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">Customer Account</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="text-gray-500 hover:text-gold p-1 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Profile Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Contact Details</h4>
                <div className="bg-gray-50 dark:bg-gray-900/35 border border-[var(--border-color)] p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiMail size={16} className="text-gold" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiPhone size={16} className="text-gold" />
                    <span>{selectedCustomer.phone || 'No phone number provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FiCalendar size={16} className="text-gold" />
                    <span>Joined on {new Date(selectedCustomer.joinDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Summary Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Total Orders */}
                <div className="bg-gray-50 dark:bg-gray-900/10 border border-[var(--border-color)] p-4 rounded-lg">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Orders</span>
                  <div className="flex items-center gap-2 mt-1">
                    <FiShoppingBag className="text-gold" size={18} />
                    <span className="text-lg font-bold font-sans">{getCustomerOrders(selectedCustomer.email).length}</span>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="bg-gray-50 dark:bg-gray-900/10 border border-[var(--border-color)] p-4 rounded-lg">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Spent</span>
                  <div className="flex items-center gap-2 mt-1">
                    <FiDollarSign className="text-emerald-500" size={18} />
                    <span className="text-lg font-bold font-sans text-emerald-600 dark:text-emerald-400">${getCustomerTotalSpent(selectedCustomer.email).toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Purchase History</h4>
                
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {getCustomerOrders(selectedCustomer.email).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No order logs found for this customer.</p>
                  ) : (
                    getCustomerOrders(selectedCustomer.email).map((order) => (
                      <div key={order.id} className="border border-[var(--border-color)] p-4 rounded-lg flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-all text-sm">
                        <div>
                          <div className="font-semibold text-gold font-sans">#{order.id}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs mt-1 text-gray-500 truncate max-w-[200px]">
                            {order.orderItems.map(i => `${i.name} (x${i.qty})`).join(', ')}
                          </div>
                        </div>
                        <div className="text-right space-y-1.5">
                          <div className="font-bold font-sans">${order.totalPrice}</div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border tracking-wider ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/55'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/55'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Admin Notes</h4>
                <textarea
                  defaultValue={localStorage.getItem(`admin_note_${selectedCustomer?.id}`) || ''}
                  onChange={e => localStorage.setItem(`admin_note_${selectedCustomer?.id}`, e.target.value)}
                  rows={3}
                  placeholder="Add private notes about this customer..."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm resize-none"
                />
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-200 dark:border-red-900/30 pt-4">
                <button
                  type="button"
                  onClick={() => { if (window.confirm('Suspend this account? The customer will not be able to login.')) { toast.success(`${selectedCustomer?.name}'s account suspended`); setShowDrawer(false); } }}
                  className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200 dark:border-red-900/30 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors cursor-pointer"
                >
                  🚫 Suspend Account
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManager;
