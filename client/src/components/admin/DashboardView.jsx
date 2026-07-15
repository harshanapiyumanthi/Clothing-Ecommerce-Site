import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiShoppingCart, FiUsers, FiBox, FiDollarSign, FiArrowUpRight, FiAlertCircle, FiStar, FiRefreshCw, FiPackage, FiXCircle, FiCheck } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';

const DashboardView = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthlySalesData = [
    { month: 'Jan', sales: 4000 }, { month: 'Feb', sales: 4500 }, { month: 'Mar', sales: 6200 },
    { month: 'Apr', sales: 5800 }, { month: 'May', sales: 8000 }, { month: 'Jun', sales: 9500 },
    { month: 'Jul', sales: 12400 }
  ];

  const categoryData = [
    { name: 'Women', percentage: 45, color: '#D4AF37' },
    { name: 'Office Kit', percentage: 25, color: '#1e293b' },
    { name: 'Accessories', percentage: 15, color: '#3b82f6' },
    { name: 'Casual', percentage: 10, color: '#10b981' },
    { name: 'Teen', percentage: 5, color: '#f59e0b' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          adminApi.getStats(), adminApi.getOrders(), adminApi.getProducts()
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 6));
        setLowStockProducts(productsData.filter(p => p.stock <= 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // SVG chart coords
  const svgWidth = 600, svgHeight = 220, padding = 30;
  const chartWidth = svgWidth - padding * 2, chartHeight = svgHeight - padding * 2;
  const salesValues = monthlySalesData.map(d => d.sales);
  const maxSales = Math.max(...salesValues) * 1.1, minSales = Math.min(...salesValues) * 0.9;
  const getX = (i) => padding + (i * (chartWidth / (monthlySalesData.length - 1)));
  const getY = (v) => svgHeight - padding - ((v - minSales) / (maxSales - minSales)) * chartHeight;
  const points = monthlySalesData.map((d, i) => `${getX(i)},${getY(d.sales)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(points.length - 1)},${svgHeight - padding} L ${getX(0)},${svgHeight - padding} Z`;

  const getStatusColor = (status) => {
    const map = {
      'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200',
      'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200',
      'Shipping': 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200',
      'Delivered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200',
      'Cancelled': 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  // Simulated stats derived from actual data
  const completedOrders = recentOrders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrders = recentOrders.filter(o => o.orderStatus === 'Cancelled').length;
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = recentOrders.filter(o => o.createdAt?.startsWith(today) && o.isPaid).reduce((s, o) => s + o.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] dark:from-[#050505] dark:to-[#111] text-white p-5 rounded-xl flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDEgMiAwYTEgMSAwIDAgMS0yIDB6IiBmaWxsPSIjRDRBRjM3IiBvcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-gold font-bold">Business Overview</p>
          <h1 className="text-xl font-bold mt-1">Welcome back, Admin 👋</h1>
          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="relative text-right hidden sm:block">
          <p className="text-xs text-gray-400">Today's Revenue</p>
          <p className="text-2xl font-bold text-gold">${todayRevenue || '0'}</p>
        </div>
      </div>

      {/* KPI Cards — Row 1: Revenue */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={18} />, color: 'text-gold', bg: 'bg-gold/10', trend: '+12.4%', up: true },
          { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingCart size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+8.2%', up: true },
          { label: 'Customers', value: stats.totalCustomers, icon: <FiUsers size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+15.1%', up: true },
          { label: 'Products', value: stats.totalProducts, icon: <FiBox size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: `${lowStockProducts.length} low stock`, up: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-current opacity-5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" style={{ color: kpi.color.replace('text-', '') }} />
            <div className="flex justify-between items-start">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold mt-1.5 font-sans">{kpi.value}</h3></div>
              <div className={`p-2.5 ${kpi.bg} ${kpi.color} rounded-lg`}>{kpi.icon}</div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${kpi.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {kpi.up ? <FiTrendingUp size={12} /> : <FiAlertCircle size={12} />}
              <span>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards — Row 2: Orders breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Pending', value: stats.pendingOrders, icon: <FiShoppingCart size={14} />, color: 'text-amber-500' },
          { label: 'Confirmed', value: Math.round(stats.totalOrders * 0.3), icon: <FiCheck size={14} />, color: 'text-blue-500' },
          { label: 'Delivered', value: completedOrders + Math.round(stats.totalOrders * 0.5), icon: <FiPackage size={14} />, color: 'text-emerald-500' },
          { label: 'Cancelled', value: cancelledOrders + Math.round(stats.totalOrders * 0.05), icon: <FiXCircle size={14} />, color: 'text-red-500' },
          { label: 'Returns', value: Math.round(stats.totalOrders * 0.02), icon: <FiRefreshCw size={14} />, color: 'text-purple-500' },
          { label: 'Low Stock', value: lowStockProducts.length, icon: <FiAlertCircle size={14} />, color: 'text-orange-500' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-xl text-center hover:border-gold/40 transition-colors">
            <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-2 ${s.color} bg-current/10`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 font-sans ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards — Row 3: Membership counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Free Members', value: `${Math.round(stats.totalCustomers * 0.7)}`, note: 'Standard accounts', color: 'border-gray-200 dark:border-gray-700' },
          { label: 'Premium Members', value: `${Math.round(stats.totalCustomers * 0.25)}`, note: '↑ Earning loyalty points', color: 'border-gold/40', textColor: 'text-gold' },
          { label: 'VIP Members', value: `${Math.round(stats.totalCustomers * 0.05)}`, note: 'Exclusive club members', color: 'border-purple-300 dark:border-purple-800', textColor: 'text-purple-500' },
        ].map((m, i) => (
          <div key={i} className={`bg-[var(--card-bg)] border-2 ${m.color} p-5 rounded-xl flex items-center gap-4`}>
            <FiStar size={24} className={m.textColor || 'text-gray-400'} />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{m.label}</p>
              <p className={`text-2xl font-bold font-sans ${m.textColor || ''}`}>{m.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase tracking-wider text-sm">Monthly Sales Trend</h3>
            <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-2 py-1 rounded font-semibold">2026</span>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((grid, idx) => {
                  const y = padding + (idx * (chartHeight / 4));
                  return (
                    <g key={grid} className="opacity-10 dark:opacity-5">
                      <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    </g>
                  );
                })}
                {monthlySalesData.map((d, i) => (
                  <text key={i} x={getX(i)} y={svgHeight - padding + 18} fill="currentColor" fontSize="10" textAnchor="middle" className="opacity-50 font-semibold select-none">{d.month}</text>
                ))}
                <path d={areaPath} fill="url(#chartGradient)" />
                <path d={linePath} fill="none" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_10px_rgba(212,175,55,0.3)]" />
                {monthlySalesData.map((d, i) => (
                  <g key={i} className="cursor-pointer">
                    <circle cx={getX(i)} cy={getY(d.sales)} r="5" fill="#D4AF37" stroke="var(--card-bg)" strokeWidth="2" />
                    <g className="opacity-0 hover:opacity-100 transition-opacity">
                      <rect x={getX(i) - 35} y={getY(d.sales) - 32} width="70" height="22" rx="4" fill="#0F0F0F" />
                      <text x={getX(i)} y={getY(d.sales) - 17} fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">${d.sales}</text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Sales by Category</h3>
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4.5" className="opacity-15" />
                {(() => {
                  let acc = 0;
                  return categoryData.map((cat, idx) => {
                    const strokeDash = `${cat.percentage} ${100 - cat.percentage}`;
                    const strokeOffset = 100 - acc;
                    acc += cat.percentage;
                    return <circle key={idx} cx="21" cy="21" r="15.915" fill="transparent" stroke={cat.color} strokeWidth="4.5" strokeDasharray={strokeDash} strokeDashoffset={strokeOffset} className="transition-all duration-500 hover:stroke-[5.5]" />;
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Total</span>
                <span className="text-xl font-bold font-sans">100%</span>
              </div>
            </div>
            <div className="w-full mt-6 space-y-2">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium opacity-85">{cat.name}</span>
                  </div>
                  <span className="font-semibold">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders + Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase tracking-wider text-sm">Recent Orders</h3>
            <button className="text-xs font-semibold text-gold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer">
              View All <FiArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-gray-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="pb-3">Order ID</th><th className="pb-3">Customer</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 font-bold text-gold font-sans text-xs">#{order.id?.slice(-6)}</td>
                    <td className="py-3 font-medium text-sm">{order.user.name}</td>
                    <td className="py-3 font-bold font-sans text-sm">${order.totalPrice}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border tracking-wider ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span></td>
                    <td className="py-3 text-gray-500 font-sans text-xs">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No recent orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-6 text-red-500 flex items-center gap-2">
            <FiAlertCircle size={14} /> Stock Warnings
          </h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCheck size={24} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm">All inventory levels healthy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 6).map(prod => (
                <div key={prod.id} className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    {prod.images?.[0]?.url ? (
                      <img src={prod.images[0].url} alt={prod.name} className="h-9 w-9 object-cover rounded-lg" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold text-xs">{prod.name.charAt(0)}</div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold truncate max-w-[120px]">{prod.name}</h4>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${prod.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                    {prod.stock === 0 ? 'Out' : `${prod.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
