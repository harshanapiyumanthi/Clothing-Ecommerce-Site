import { useState, useEffect } from 'react';
import { FiTrendingUp, FiShoppingCart, FiUsers, FiBox, FiDollarSign, FiArrowUpRight, FiAlertCircle } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';

const DashboardView = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock charts data
  const monthlySalesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 4500 },
    { month: 'Mar', sales: 6200 },
    { month: 'Apr', sales: 5800 },
    { month: 'May', sales: 8000 },
    { month: 'Jun', sales: 9500 },
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
        const statsData = await adminApi.getStats();
        const ordersData = await adminApi.getOrders();
        const productsData = await adminApi.getProducts();
        
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
        setLowStockProducts(productsData.filter(p => p.stock <= 5));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate coordinates for custom SVG Line Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 30;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const salesValues = monthlySalesData.map(d => d.sales);
  const maxSales = Math.max(...salesValues) * 1.1;
  const minSales = Math.min(...salesValues) * 0.9;

  const getX = (index) => padding + (index * (chartWidth / (monthlySalesData.length - 1)));
  const getY = (value) => svgHeight - padding - ((value - minSales) / (maxSales - minSales)) * chartHeight;

  // Generate SVG path coordinates
  const points = monthlySalesData.map((d, i) => `${getX(i)},${getY(d.sales)}`);
  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaPath = points.length > 0 
    ? `${linePath} L ${getX(points.length - 1)},${svgHeight - padding} L ${getX(0)},${svgHeight - padding} Z` 
    : '';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gold/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold mt-2 font-sans">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gold/10 text-gold rounded-lg">
              <FiDollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <FiTrendingUp />
            <span>+12.4%</span>
            <span className="text-gray-400 font-normal ml-1">vs last month</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Orders</p>
              <h3 className="text-2xl font-bold mt-2 font-sans">{stats.totalOrders}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <FiShoppingCart size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <FiTrendingUp />
            <span>+8.2%</span>
            <span className="text-gray-400 font-normal ml-1">vs last month</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customers</p>
              <h3 className="text-2xl font-bold mt-2 font-sans">{stats.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <FiTrendingUp />
            <span>+15.1%</span>
            <span className="text-gray-400 font-normal ml-1">vs last month</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Products</p>
              <h3 className="text-2xl font-bold mt-2 font-sans">{stats.totalProducts}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <FiBox size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-amber-500 text-sm font-medium">
            <FiAlertCircle />
            <span>{lowStockProducts.length} low stock</span>
            <span className="text-gray-400 font-normal ml-1">items detected</span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Line Chart */}
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
                
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map((grid, idx) => {
                  const y = padding + (idx * (chartHeight / 4));
                  const labelValue = Math.round(maxSales - (idx * ((maxSales - minSales) / 4)));
                  return (
                    <g key={grid} className="opacity-10 dark:opacity-5">
                      <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                      <text x={padding - 5} y={y + 4} fill="currentColor" fontSize="10" textAnchor="end" className="font-semibold select-none font-sans">${labelValue}</text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {monthlySalesData.map((d, i) => (
                  <text key={i} x={getX(i)} y={svgHeight - padding + 18} fill="currentColor" fontSize="10" textAnchor="middle" className="opacity-50 font-semibold select-none font-sans">
                    {d.month}
                  </text>
                ))}

                {/* Shaded Area Under Line */}
                {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

                {/* Core Line */}
                {linePath && (
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="drop-shadow-[0_4px_10px_rgba(212,175,55,0.3)]"
                  />
                )}

                {/* Circles for Data Points */}
                {monthlySalesData.map((d, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle cx={getX(i)} cy={getY(d.sales)} r="5" fill="#D4AF37" stroke="var(--card-bg)" strokeWidth="2" />
                    <circle cx={getX(i)} cy={getY(d.sales)} r="9" fill="#D4AF37" className="opacity-0 hover:opacity-20 transition-opacity" />
                    {/* Tooltip on Hover */}
                    <g className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <rect x={getX(i) - 35} y={getY(d.sales) - 32} width="70" height="22" rx="4" fill="#0F0F0F" className="shadow-lg" />
                      <text x={getX(i)} y={getY(d.sales) - 17} fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-sans">
                        ${d.sales}
                      </text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Category Sales Donut / Ring Chart */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Sales by Category</h3>
          <div className="flex flex-col items-center justify-center">
            
            {/* Custom Interactive CSS Donut Ring */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4.5" className="opacity-15" />
                
                {/* Dynamically calculate offsets */}
                {(() => {
                  let accumulatedPercent = 0;
                  return categoryData.map((cat, idx) => {
                    const strokeDash = `${cat.percentage} ${100 - cat.percentage}`;
                    const strokeOffset = 100 - accumulatedPercent;
                    accumulatedPercent += cat.percentage;

                    return (
                      <circle
                        key={idx}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="4.5"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-500 hover:stroke-[5.5]"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total</span>
                <span className="text-xl font-bold font-sans">100%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-6 space-y-2">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium opacity-85">{cat.name}</span>
                  </div>
                  <span className="font-semibold">{cat.percentage}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Grid of Recent Orders and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase tracking-wider text-sm">Recent Orders</h3>
            <button className="text-xs font-semibold text-gold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer">
              View All <FiArrowUpRight />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-gray-400 font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 font-semibold text-gold font-sans">#{order.id}</td>
                    <td className="py-4 font-medium">{order.user.name}</td>
                    <td className="py-4 font-bold font-sans">${order.totalPrice}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 font-sans">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-bold uppercase tracking-wider text-sm mb-6 text-red-500 flex items-center gap-2">
            <FiAlertCircle /> Stock Warnings
          </h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              All inventory levels healthy.
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {prod.images?.[0]?.url ? (
                      <img src={prod.images[0].url} alt={prod.name} className="h-10 w-10 object-cover rounded bg-gray-150" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gold/10 text-gold flex items-center justify-center font-bold">
                        {prod.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold truncate max-w-[150px]">{prod.name}</h4>
                      <p className="text-xs text-gray-500">{prod.brand || 'Luxury Wear'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${prod.stock === 0 ? 'bg-red-150 text-red-800 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                      {prod.stock === 0 ? 'Out of stock' : `${prod.stock} left`}
                    </span>
                  </div>
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
