import { useState, useEffect } from 'react';
import { FiTrendingUp, FiDownload, FiPrinter, FiCalendar, FiDollarSign, FiShoppingBag, FiLayers, FiUsers } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const ReportsManager = () => {
  const [reportType, setReportType] = useState('sales'); // sales, inventory, customer
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const o = await adminApi.getOrders();
        const p = await adminApi.getProducts();
        const c = await adminApi.getCustomers();
        setOrders(o);
        setProducts(p);
        setCustomers(c);
      } catch (err) {
        toast.error('Failed to load reporting data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter orders by date range
  const getFilteredOrders = () => {
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // 1. Sales Report calculations
  const filteredOrders = getFilteredOrders();
  const totalSales = filteredOrders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;
  const itemsSold = filteredOrders.reduce((acc, o) => acc + o.orderItems.reduce((sum, item) => sum + item.qty, 0), 0);

  // 2. Inventory Report calculations
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  // 3. Customer Report calculations
  const activeCustomers = customers.filter(c => {
    const customerOrders = orders.filter(o => o.user.email === c.email && o.isPaid);
    return customerOrders.length > 0;
  });

  // Client-Side CSV Export function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'sales') {
      csvContent += "Order ID,Customer Name,Date,Payment Method,Is Paid,Total Price\r\n";
      filteredOrders.forEach(o => {
        csvContent += `"${o.id}","${o.user.name}","${new Date(o.createdAt).toLocaleDateString()}","${o.paymentMethod}","${o.isPaid ? 'Yes' : 'No'}","${o.totalPrice}"\r\n`;
      });
    } else if (reportType === 'inventory') {
      csvContent += "Product ID,Product Name,Brand,Category,Price,Stock Status,Stock Count\r\n";
      products.forEach(p => {
        const status = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock';
        csvContent += `"${p.id}","${p.name}","${p.brand || ''}","${p.category}","${p.price}","${status}","${p.stock}"\r\n`;
      });
    } else {
      csvContent += "Customer ID,Name,Email,Phone,Joined Date,Orders Count,Total Spent\r\n";
      customers.forEach(c => {
        const custOrders = orders.filter(o => o.user.email === c.email);
        const totalSpent = custOrders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
        csvContent += `"${c.id}","${c.name}","${c.email}","${c.phone || ''}","${c.joinDate}","${custOrders.length}","${totalSpent}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `elegance_${reportType}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded successfully');
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    let reportTitle = "";
    let tableHtml = "";

    if (reportType === 'sales') {
      reportTitle = "SALES PERFORMANCE REPORT";
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Paid</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(o => `
              <tr>
                <td>#${o.id}</td>
                <td>${o.user.name}</td>
                <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                <td>${o.isPaid ? 'YES' : 'NO'}</td>
                <td>$${o.totalPrice}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="metrics">
          <div class="metric-box">Total Sales: $${totalSales}</div>
          <div class="metric-box">Total Orders: ${totalOrdersCount}</div>
          <div class="metric-box">Average Value: $${avgOrderValue}</div>
        </div>
      `;
    } else if (reportType === 'inventory') {
      reportTitle = "INVENTORY & STOCK STATUS REPORT";
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${p.price}</td>
                <td style="color: ${p.stock === 0 ? 'red' : p.stock <= 5 ? 'orange' : 'inherit'}">${p.stock} units</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="metrics">
          <div class="metric-box">Total Value: $${totalInventoryValue}</div>
          <div class="metric-box">Low Stock: ${lowStockCount} items</div>
          <div class="metric-box">Out of Stock: ${outOfStockCount} items</div>
        </div>
      `;
    } else {
      reportTitle = "CUSTOMER ACTIVITY SUMMARY REPORT";
      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(c => {
              const custOrders = orders.filter(o => o.user.email === c.email);
              const spent = custOrders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
              return `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.email}</td>
                  <td>${new Date(c.joinDate).toLocaleDateString()}</td>
                  <td>${custOrders.length}</td>
                  <td>$${spent}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 20px; font-weight: bold; letter-spacing: 2px; }
            .report-title { font-size: 18px; font-weight: bold; color: #D4AF37; }
            .date-range { font-size: 12px; color: #777; margin-bottom: 20px; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .report-table th, .report-table td { border-bottom: 1px solid #eee; padding: 10px; text-align: left; font-size: 13px; }
            .report-table th { background-color: #f7f7f7; color: #555; }
            .metrics { display: flex; gap: 20px; margin-top: 30px; }
            .metric-box { flex: 1; border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ELEGANCE FASHION</div>
            <div class="report-title">${reportTitle}</div>
          </div>
          <div class="date-range">Report Period: ${startDate} to ${endDate}</div>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Parameter Selection panel */}
      <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Report Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
            >
              <option value="sales">Sales & Revenue</option>
              <option value="inventory">Inventory & Stock</option>
              <option value="customer">Customer Activity</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[var(--border-color)] hover:border-gold hover:text-gold rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiDownload /> Download Excel/CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-gold text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer shadow-md shadow-gold/25"
          >
            <FiPrinter /> Print PDF Report
          </button>
        </div>

      </div>

      {/* Sales metrics Cards */}
      {reportType === 'sales' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Revenue Period</span>
            <div className="mt-2 text-2xl font-bold font-sans text-gold">${totalSales.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Orders count</span>
            <div className="mt-2 text-2xl font-bold font-sans">{totalOrdersCount} orders</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Average Order</span>
            <div className="mt-2 text-2xl font-bold font-sans">${avgOrderValue}</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Garments Sold</span>
            <div className="mt-2 text-2xl font-bold font-sans">{itemsSold} items</div>
          </div>
        </div>
      )}

      {/* Stock metrics Cards */}
      {reportType === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Total Products</span>
            <div className="mt-2 text-2xl font-bold font-sans">{products.length} catalog items</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Stock Valuation</span>
            <div className="mt-2 text-2xl font-bold font-sans text-gold">${totalInventoryValue.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Low/Out of stock</span>
            <div className="mt-2 text-2xl font-bold font-sans text-red-500">{lowStockCount} items</div>
          </div>
        </div>
      )}

      {/* Customers metrics Cards */}
      {reportType === 'customer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Total Registered Profiles</span>
            <div className="mt-2 text-2xl font-bold font-sans">{customers.length} users</div>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-bold uppercase block tracking-wider">Active Customers in Period</span>
            <div className="mt-2 text-2xl font-bold font-sans text-gold">{activeCustomers.length} active users</div>
          </div>
        </div>
      )}

      {/* Details Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {reportType === 'sales' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Paid Status</th>
                  <th className="p-4">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No orders found in date range.</td>
                  </tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                      <td className="p-4 font-bold text-gold font-sans">#{o.id}</td>
                      <td className="p-4 font-semibold">{o.user.name}</td>
                      <td className="p-4 text-gray-500 font-sans">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{o.paymentMethod}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider ${o.isPaid ? 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 border-rose-250 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                          {o.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4 font-bold font-sans">${o.totalPrice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === 'inventory' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold">
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="p-4 font-semibold text-gray-400 font-sans">{p.id}</td>
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4 text-gray-500">{p.brand}</td>
                    <td className="p-4 font-medium">{p.category}</td>
                    <td className="p-4 font-bold font-sans">${p.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider ${p.stock === 0 ? 'bg-red-100 border-red-250 text-red-800 dark:bg-red-950/40 dark:text-red-400' : p.stock <= 5 ? 'bg-amber-100 border-amber-250 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                        {p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `Low Stock (${p.stock})` : `${p.stock} Units`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customer' && (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Orders count</th>
                  <th className="p-4 text-emerald-600 dark:text-emerald-400">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {customers.map(c => {
                  const custOrders = orders.filter(o => o.user.email === c.email);
                  const totalSpent = custOrders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                      <td className="p-4 font-bold">{c.name}</td>
                      <td className="p-4 font-medium opacity-85">{c.email}</td>
                      <td className="p-4 text-gray-500">{c.phone || 'N/A'}</td>
                      <td className="p-4 text-gray-500 font-sans">{new Date(c.joinDate).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{custOrders.length} orders</td>
                      <td className="p-4 font-bold font-sans text-emerald-600 dark:text-emerald-400">${totalSpent.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default ReportsManager;
