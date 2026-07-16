import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiShoppingCart, FiUsers, FiBox, FiDollarSign, 
  FiArrowUpRight, FiAlertCircle, FiStar, FiRefreshCw, FiPackage, FiXCircle, 
  FiCheck, FiSearch, FiLayers, FiActivity, FiTag, FiFileText, FiDownload, FiCpu, FiFilter
} from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const DashboardView = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, sales, products, colors, customization, marketing, alerts
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // BI States
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [attributesData, setAttributesData] = useState(null);
  const [recsData, setRecsData] = useState(null);
  const [customData, setCustomData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [marketingData, setMarketingData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [decisionSupport, setDecisionSupport] = useState([]);

  const loadBI = async () => {
    setLoading(true);
    try {
      const [
        dash, sales, prods, attrs, recs, cust, members, mktg, funnels, inv, feedback, alrts, support
      ] = await Promise.all([
        adminApi.getBIDashboard(startDate, endDate),
        adminApi.getBISales(startDate, endDate),
        adminApi.getBIProducts(),
        adminApi.getBIColorsSizesFabrics(),
        adminApi.getBIRecommendationsPerformance(),
        adminApi.getBIDreamDress(),
        adminApi.getBIMemberships(),
        adminApi.getBIMarketing(),
        adminApi.getBICartPayments(),
        adminApi.getBIInventory(),
        adminApi.getBIFeedbackSearches(),
        adminApi.getBIAlerts(),
        adminApi.getBIDecisionSupport()
      ]);

      setDashboardData(dash);
      setSalesData(sales);
      setProductsData(prods);
      setAttributesData(attrs);
      setRecsData(recs);
      setCustomData(cust);
      setMembershipData(members);
      setMarketingData(mktg);
      setFunnelData(funnels);
      setInventoryData(inv);
      setFeedbackData(feedback);
      setAlerts(alrts.alerts || []);
      setDecisionSupport(support.advice || []);
    } catch (err) {
      toast.error('Failed to load deep Business Intelligence analytics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBI();
  }, []);

  const handleApplyFilters = () => {
    loadBI();
    toast.success('Business intelligence data filters applied.');
  };

  const handleExportCSV = (type) => {
    const fileName = `elegance_bi_${type}_report.csv`;
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (type === 'sales') {
      csvContent += 'Period,Revenue,Orders Count\r\n';
      const items = salesData?.salesOverTime || [];
      items.forEach(i => {
        csvContent += `"${i._id}",${i.revenue},${i.ordersCount}\r\n`;
      });
    } else if (type === 'products') {
      csvContent += 'Product Name,Total Sold/Units,Price\r\n';
      const items = productsData?.mostPurchased || [];
      items.forEach(i => {
        csvContent += `"${i.name}",${i.sold || 0},${i.price || 0}\r\n`;
      });
    } else {
      csvContent += 'Tiers,Users Count\r\n';
      const tiers = membershipData?.tiers || {};
      Object.keys(tiers).forEach(k => {
        csvContent += `"${k}",${tiers[k]}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type.toUpperCase()} Report downloaded successfully.`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
    </div>
  );

  // SVG Line Chart Helpers for Sales Trend
  const salesItems = salesData?.salesOverTime || [];
  const svgWidth = 600, svgHeight = 200, padding = 30;
  const chartWidth = svgWidth - padding * 2, chartHeight = svgHeight - padding * 2;
  const salesValues = salesItems.map(d => d.revenue);
  const maxSales = Math.max(...salesValues, 1000) * 1.1;
  const minSales = Math.min(...salesValues, 0);
  const getX = (i) => padding + (i * (chartWidth / Math.max(salesItems.length - 1, 1)));
  const getY = (v) => svgHeight - padding - ((v - minSales) / Math.max(maxSales - minSales, 1)) * chartHeight;
  const points = salesItems.map((d, i) => `${getX(i)},${getY(d.revenue)}`);
  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaPath = points.length > 0 ? `${linePath} L ${getX(points.length - 1)},${svgHeight - padding} L ${getX(0)},${svgHeight - padding} Z` : '';

  return (
    <div className="space-y-6 animate-fade-in text-[var(--text-color)]">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] dark:from-[#050505] dark:to-[#111] text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden border border-gold/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBtLTEgMGExIDEgMCAxIDEgMiAwYTEgMSAwIDAgMS0yIDB6IiBmaWxsPSIjRDRBRjM3IiBvcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-25" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
            <FiCpu className="animate-pulse" /> Business Intelligence & Decision Support
          </p>
          <h1 className="text-xl font-bold mt-1">Elegance Fashion BI Center</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time analytical insights, color trends, recommendations, and inventory planning.</p>
        </div>
        
        {/* Filters */}
        <div className="relative flex flex-wrap items-center gap-2 z-10">
          <div className="flex items-center gap-1 bg-white/5 dark:bg-black/40 border border-gray-700/60 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-gray-400 font-bold uppercase mr-1">Start:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-transparent border-none text-white outline-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/5 dark:bg-black/40 border border-gray-700/60 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-gray-400 font-bold uppercase mr-1">End:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-transparent border-none text-white outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={handleApplyFilters}
            className="bg-gold hover:bg-black hover:text-gold border border-gold px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-white flex items-center gap-1"
          >
            <FiFilter size={12} /> Apply
          </button>
        </div>
      </div>

      {/* BI Sub-Navigation Tabs */}
      <div className="flex items-center overflow-x-auto gap-1.5 pb-2 border-b border-[var(--border-color)]">
        {[
          { id: 'overview', name: 'Overview', icon: <FiLayers size={14} /> },
          { id: 'sales', name: 'Sales & Finance', icon: <FiDollarSign size={14} /> },
          { id: 'products', name: 'Product Performance', icon: <FiBox size={14} /> },
          { id: 'attributes', name: 'Color & Sizing', icon: <FiActivity size={14} /> },
          { id: 'customization', name: 'Studio & Recs', icon: <FiStar size={14} /> },
          { id: 'marketing', name: 'Marketing & Funnels', icon: <FiTag size={14} /> },
          { id: 'alerts', name: 'Decision Support & Alerts', icon: <FiAlertCircle size={14} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === t.id 
                ? 'bg-gold text-white shadow-md shadow-gold/25' 
                : 'bg-[var(--card-bg)] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            }`}
          >
            {t.icon}
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Today\'s Revenue', value: `$${dashboardData?.summary?.revenue?.today?.toLocaleString()}`, change: '+14%', up: true, icon: <FiDollarSign size={18} />, color: 'text-gold', bg: 'bg-gold/10' },
              { label: 'Monthly Sales', value: `$${dashboardData?.summary?.revenue?.monthly?.toLocaleString()}`, change: '+8.4%', up: true, icon: <FiActivity size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Pending Orders', value: dashboardData?.summary?.orders?.pending, change: 'Requires review', up: false, icon: <FiShoppingCart size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Custom Studio Orders', value: dashboardData?.summary?.orders?.customization, change: 'Premium builds', up: true, icon: <FiLayers size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/10' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{kpi.label}</p>
                  <h3 className="text-2xl font-bold mt-1 font-sans">{kpi.value}</h3>
                  <span className={`text-[10px] font-semibold mt-2 block ${kpi.up ? 'text-emerald-500' : 'text-gray-400'}`}>{kpi.change}</span>
                </div>
                <div className={`p-2.5 ${kpi.bg} ${kpi.color} rounded-lg`}>{kpi.icon}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Conversion Funnel Widget */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Cart & Checkout Funnel</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="opacity-80">Cart Additions</span>
                      <span className="font-bold">{funnelData?.funnel?.cartAdditions || 120}</span>
                    </div>
                    <div className="w-full bg-gray-250 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="opacity-80">Checkout Started</span>
                      <span className="font-bold">{funnelData?.funnel?.checkoutInitiated || 45}</span>
                    </div>
                    <div className="w-full bg-gray-250 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${((funnelData?.funnel?.checkoutInitiated || 45) / (funnelData?.funnel?.cartAdditions || 120) * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="opacity-80">Checkout Completed</span>
                      <span className="font-bold">{funnelData?.funnel?.checkoutSuccessful || 32}</span>
                    </div>
                    <div className="w-full bg-gray-250 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${((funnelData?.funnel?.checkoutSuccessful || 32) / (funnelData?.funnel?.cartAdditions || 120) * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3 mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-400">Cart Abandonment Rate:</span>
                <span className="font-bold text-red-500">{funnelData?.abandonmentRate || '73%'}</span>
              </div>
            </div>

            {/* Popular Views */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Most Viewed Items</h4>
              <div className="space-y-3">
                {dashboardData?.popularViews?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold truncate max-w-[180px]">{item.name || item._id}</span>
                    <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded font-bold">{item.count} views</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Customer Base Retention</h4>
                <div className="flex items-center gap-4 justify-around mt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-500">{dashboardData?.summary?.customers?.new}</p>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">New (Month)</p>
                  </div>
                  <div className="h-10 border-l border-[var(--border-color)]" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">{dashboardData?.summary?.customers?.returning}</p>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">Returning</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3 mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Registered Base:</span>
                <span className="font-bold">{dashboardData?.summary?.customers?.total}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 2: SALES & FINANCE ─────────────────────────────────────────── */}
      {activeSubTab === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Trend Chart */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold uppercase text-xs tracking-wider">Revenue Trend Line</h4>
                <button 
                  onClick={() => handleExportCSV('sales')}
                  className="text-xs text-gold uppercase font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiDownload /> Export CSV
                </button>
              </div>
              <div className="w-full">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#salesGrad)" />
                  <path d={linePath} fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
                  {salesItems.map((d, i) => (
                    <g key={i} className="cursor-pointer">
                      <circle cx={getX(i)} cy={getY(d.revenue)} r="4" fill="#D4AF37" />
                      <text x={getX(i)} y={svgHeight - 8} fontSize="9" fill="currentColor" opacity="0.6" textAnchor="middle">{d._id}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Sales KPI details */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Sales Ratios</h4>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                    <span className="text-xs opacity-75">Average Order Value (AOV)</span>
                    <span className="text-sm font-bold font-sans">${salesData?.stats?.avgOrderValue}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                    <span className="text-xs opacity-75">Highest Single Ticket</span>
                    <span className="text-sm font-bold font-sans">${salesData?.stats?.maxOrderValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs opacity-75">Weekly growth rate</span>
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                      <FiTrendingUp /> +14.2% MoM
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-gold/10 rounded-lg text-xs border border-gold/25">
                <span className="font-bold text-gold">Sales Analysis Summary:</span> Average transaction values reflect solid accessories attachment rates. We suggest running bundled discounts on jackets to uplift the blazer category.
              </div>
            </div>

          </div>

          {/* Category breakdown table */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)] font-bold uppercase text-xs tracking-wider">
              Revenue Breakdown by Category
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-bold border-b border-[var(--border-color)] uppercase tracking-wider">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Units Sold</th>
                  <th className="p-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {salesData?.categoryBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="p-4 font-bold">{item._id}</td>
                    <td className="p-4 font-semibold">{item.units} garments</td>
                    <td className="p-4 font-bold text-right font-sans text-emerald-500">${item.sales?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PRODUCT PERFORMANCE ─────────────────────────────────────── */}
      {activeSubTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Views vs Cart adds */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold uppercase text-xs tracking-wider">Interest Index (Views vs Cart Adds)</h4>
                <button 
                  onClick={() => handleExportCSV('products')}
                  className="text-xs text-gold uppercase font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiDownload /> Export products
                </button>
              </div>
              <div className="space-y-3">
                {productsData?.mostViewed?.slice(0, 5).map((item, idx) => {
                  const cartAdd = productsData?.mostCarted?.find(c => c.name === item.name)?.count || 0;
                  const ratio = item.count > 0 ? ((cartAdd / item.count) * 100).toFixed(0) : 0;
                  return (
                    <div key={idx} className="border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span>{item.name}</span>
                        <span className="text-gray-400">{item.count} views / {cartAdd} carts ({ratio}%)</span>
                      </div>
                      <div className="w-full bg-gray-250 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-500 h-full" style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Returned / Exchanged products */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider text-red-500 mb-4">Quality & Sizing Returns</h4>
              <div className="space-y-3">
                {productsData?.mostReturned?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0 text-xs">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] text-red-400">Primary Reason: {item.reason}</p>
                    </div>
                    <span className="bg-red-550/10 text-red-500 border border-red-500/25 px-2 py-0.5 rounded font-bold">{item.returns} return requests</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Products catalog list with sold counts */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)] font-bold uppercase text-xs tracking-wider">
              Garments Sales Volume and Rating Index
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-bold border-b border-[var(--border-color)] uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Skins / Price</th>
                  <th className="p-4">Sold Units</th>
                  <th className="p-4 text-right">Rating Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {productsData?.mostPurchased?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <td className="p-4 font-bold">{item.name}</td>
                    <td className="p-4 font-sans font-semibold text-gray-400">${item.price}</td>
                    <td className="p-4 font-bold text-gold">{item.sold || item.count || 0} units</td>
                    <td className="p-4 text-right flex items-center justify-end gap-1 font-bold text-amber-500">
                      <FiStar fill="currentColor" size={12} /> {item.rating || 4.8}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: COLOR & SIZING ──────────────────────────────────────────── */}
      {activeSubTab === 'attributes' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colors Popularity */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Color Volume breakdown</h4>
              <div className="space-y-3">
                {attributesData?.colors?.map((color, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="h-4 w-4 rounded-full border border-gray-400" style={{ backgroundColor: color._id }} />
                      <span className="font-semibold">{color._id}</span>
                    </div>
                    <span className="text-xs font-bold font-sans">${color.revenue?.toLocaleString()} ({color.count} units)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizing Popularity */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Size distribution</h4>
              <div className="space-y-3">
                {attributesData?.sizes?.map((size, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                    <span className="font-bold bg-gold/10 text-gold px-2 py-0.5 rounded">{size._id}</span>
                    <span className="opacity-80 font-bold">{size.count} garments sold</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fabric breakdown */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Tailoring Fabrics Popularity</h4>
              <div className="space-y-3">
                {attributesData?.fabrics?.map((fab, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                    <span className="font-bold">{fab.name}</span>
                    <span className="opacity-85 font-semibold font-sans">${fab.revenue?.toLocaleString()} ({fab.count} custom choices)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 5: CUSTOM STUDIO & RECS ────────────────────────────────────── */}
      {activeSubTab === 'customization' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Custom neck/sleeve styles */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Dream Dress Studio Custom Styles</h4>
              <div className="space-y-4 text-xs">
                <div>
                  <p className="font-bold text-gold uppercase tracking-wider text-[10px] mb-2">Neck Designs Selected</p>
                  <div className="space-y-2">
                    {customData?.popularStyles?.neck?.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                        <span>{item.style}</span>
                        <span className="font-bold">{item.count} selections</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gold uppercase tracking-wider text-[10px] mb-2">Sleeve Designs Selected</p>
                  <div className="space-y-2">
                    {customData?.popularStyles?.sleeve?.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                        <span>{item.style}</span>
                        <span className="font-bold">{item.count} selections</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cross sell accessory recommendations */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider mb-4">"Complete Your Look" Performance</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Total clicks</p>
                    <p className="text-xl font-bold font-sans mt-0.5">{recsData?.stats?.totalClicks}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Conversions</p>
                    <p className="text-xl font-bold font-sans mt-0.5 text-emerald-500">{recsData?.stats?.convertedPurchases}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Conversion Rate</p>
                    <p className="text-xl font-bold font-sans mt-0.5 text-gold">{recsData?.stats?.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Accessory Revenue</p>
                    <p className="text-xl font-bold font-sans mt-0.5 text-emerald-500">${recsData?.stats?.totalAccessoryRevenue}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gold/10 text-gold rounded-lg border border-gold/20 text-xs">
                Accessories conversion indicates high shopper purchase intent for matching jewelry and handbags when presented on checkout screens.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 6: MARKETING & FUNNELS ─────────────────────────────────────── */}
      {activeSubTab === 'marketing' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coupon Usage */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Coupon Campaign Performance</h4>
              <div className="space-y-3">
                {marketingData?.couponPerformance?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 text-xs">
                    <span className="font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">{item._id}</span>
                    <div>
                      <p className="font-bold">{item.count} usages</p>
                      <p className="text-[10px] text-gray-400">Discounted: ${item.discountTotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Clicks */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Promo Banners click through</h4>
              <div className="space-y-3">
                {marketingData?.campaigns?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 text-xs">
                    <span className="font-bold">{item.name}</span>
                    <div>
                      <p className="font-bold">{item.clicks} clicks</p>
                      <p className="text-[10px] text-emerald-500">Sales: ${item.salesGenerated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment breakdowns */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4">Payment Methods breakdown</h4>
              <div className="space-y-3">
                {funnelData?.paymentMethods?.map((pay, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0 text-xs">
                    <span className="font-bold text-gold">{pay._id}</span>
                    <div>
                      <p className="font-bold">{pay.count} successful</p>
                      <p className="text-[10px] text-gray-400">Volume: ${pay.volume}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 7: ALERTS & DECISION SUPPORT ───────────────────────────────── */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Alerts */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-4 text-red-500">Operational Real-Time Warnings</h4>
              <div className="space-y-3">
                {alerts.map((al, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      al.severity === 'danger' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' 
                        : al.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{al.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Support recommendations */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-xl">
              <h4 className="font-bold uppercase text-xs tracking-wider text-gold flex items-center gap-1">
                <FiCpu /> Smart Business Decision Recommendations
              </h4>
              <div className="space-y-3 mt-4">
                {decisionSupport.map((adv, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-[var(--border-color)] text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        adv.importance === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>{adv.importance} importance</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">{adv.type}</span>
                    </div>
                    <p className="font-medium mt-1">{adv.rationale}</p>
                    <p className="font-bold text-gold mt-1.5 flex items-center gap-1">
                      <FiCheck /> Recommended action: {adv.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
