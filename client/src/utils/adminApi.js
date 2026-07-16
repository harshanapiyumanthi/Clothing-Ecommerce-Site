// Admin Mock Database & Real API Gateway
// Persisted via LocalStorage for standalone preview, synchronizes with server endpoints when available.
import axios from 'axios';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  if (userInfo && userInfo.token) {
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  }
  return {};
};

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Women', slug: 'women', description: 'Sophisticated women’s luxury attire.', image: 'https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=600', parent: null, isActive: true },
  { id: 'cat-2', name: 'Office Kit', slug: 'office-kit', description: 'Polished suits and business casual essentials.', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=600', parent: null, isActive: true },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', description: 'Designer handbags, premium shoes, and elegant jewelry.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600', parent: null, isActive: true },
  { id: 'cat-4', name: 'Teen', slug: 'teen', description: 'Trendy and chic streetwear for young adults.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600', parent: null, isActive: true },
  { id: 'cat-5', name: 'Casual', slug: 'casual', description: 'Comfortable day-to-day designer wear.', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600', parent: null, isActive: true }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Silk Evening Gown',
    description: 'A beautiful double-lined luxury silk gown with detailed back strap design, perfect for galas and official night events.',
    price: 299,
    discountPrice: 249,
    category: 'Women',
    brand: 'Elegance Couture',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#0f172a', '#b45309', '#be123c'], // Navy, Amber, Rose
    stock: 12,
    sold: 45,
    isFeatured: true,
    isBestSeller: true,
    tags: ['silk', 'gown', 'evening'],
    images: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600' }]
  },
  {
    id: 'prod-2',
    name: 'Classic Office Blazer',
    description: 'Double-breasted tailor-fit blazer made of fine Italian merino wool. Provides sharp posture and modern elegance.',
    price: 149,
    discountPrice: 129,
    category: 'Office Kit',
    brand: 'Elegance Office',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#1e293b', '#475569', '#cbd5e1'], // Charcoal, Slate, Gray
    stock: 22,
    sold: 84,
    isFeatured: true,
    isBestSeller: true,
    tags: ['blazer', 'wool', 'suit'],
    images: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' }]
  },
  {
    id: 'prod-3',
    name: 'Designer Leather Handbag',
    description: 'Premium calfskin handbag with solid gold-plated hardware closures. Features structured handles and an optional shoulder strap.',
    price: 499,
    discountPrice: 449,
    category: 'Accessories',
    brand: 'Elegance Atelier',
    sizes: ['One Size'],
    colors: ['#78350f', '#000000', '#d97706'], // Brown, Black, Tan
    stock: 4,
    sold: 19,
    isFeatured: true,
    isBestSeller: false,
    tags: ['leather', 'handbag', 'gold'],
    images: [{ url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600' }]
  },
  {
    id: 'prod-4',
    name: 'Casual Denim Overshirt',
    description: 'Heavyweight organic cotton denim overshirt with metal buttons. Hand-washed and styled with slight distress detailing.',
    price: 89,
    discountPrice: 89,
    category: 'Casual',
    brand: 'Elegance Denim',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#2563eb', '#1d4ed8'], // Blue
    stock: 35,
    sold: 112,
    isFeatured: false,
    isBestSeller: true,
    tags: ['denim', 'shirt', 'casual'],
    images: [{ url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' }]
  },
  {
    id: 'prod-5',
    name: 'Velvet Stiletto Heels',
    description: 'Luxury velvet heels with comfortable memory-foam insoles. Designed to stand out while offering long-wear ergonomics.',
    price: 180,
    discountPrice: 150,
    category: 'Accessories',
    brand: 'Elegance Atelier',
    sizes: ['37', '38', '39', '40'],
    colors: ['#be123c', '#000000'], // Ruby Red, Black
    stock: 8,
    sold: 37,
    isFeatured: false,
    isBestSeller: false,
    tags: ['shoes', 'heels', 'velvet'],
    images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600' }]
  }
];

const INITIAL_CUSTOMERS = [
  { id: 'cust-1', name: 'Sarah Connor', email: 'sarah.connor@gmail.com', phone: '+1 234 567 8901', joinDate: '2026-02-12', totalOrders: 5, totalSpent: 1245 },
  { id: 'cust-2', name: 'John Doe', email: 'john.doe@yahoo.com', phone: '+1 987 654 3210', joinDate: '2026-03-24', totalOrders: 2, totalSpent: 238 },
  { id: 'cust-3', name: 'Diana Prince', email: 'diana.prince@amazon.com', phone: '+1 555 019 2834', joinDate: '2026-01-08', totalOrders: 12, totalSpent: 4850 },
  { id: 'cust-4', name: 'Bruce Wayne', email: 'bruce@waynecorp.com', phone: '+1 555 100 2000', joinDate: '2026-04-15', totalOrders: 1, totalSpent: 499 },
  { id: 'cust-5', name: 'Clara Oswald', email: 'clara.oswald@bbc.co.uk', phone: '+44 7911 123456', joinDate: '2026-05-30', totalOrders: 4, totalSpent: 620 }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    user: { name: 'Sarah Connor', email: 'sarah.connor@gmail.com' },
    orderItems: [
      { name: 'Silk Evening Gown', qty: 1, price: 299, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600' },
      { name: 'Designer Leather Handbag', qty: 1, price: 499, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600' }
    ],
    shippingAddress: { address: '123 Cyberdyne Way', city: 'Los Angeles', postalCode: '90001', country: 'USA' },
    paymentMethod: 'Stripe',
    itemsPrice: 798,
    shippingPrice: 0,
    discount: 50,
    totalPrice: 748,
    isPaid: true,
    paidAt: '2026-07-10T14:30:00Z',
    orderStatus: 'Processing',
    createdAt: '2026-07-10T14:28:00Z',
    trackingNumber: 'TRK-98127391'
  },
  {
    id: 'ord-1002',
    user: { name: 'John Doe', email: 'john.doe@yahoo.com' },
    orderItems: [
      { name: 'Classic Office Blazer', qty: 1, price: 149, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' },
      { name: 'Casual Denim Overshirt', qty: 1, price: 89, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' }
    ],
    shippingAddress: { address: '742 Evergreen Terrace', city: 'Springfield', postalCode: '62704', country: 'USA' },
    paymentMethod: 'COD',
    itemsPrice: 238,
    shippingPrice: 15,
    discount: 0,
    totalPrice: 253,
    isPaid: false,
    orderStatus: 'Pending',
    createdAt: '2026-07-12T09:15:00Z'
  },
  {
    id: 'ord-1003',
    user: { name: 'Diana Prince', email: 'diana.prince@amazon.com' },
    orderItems: [
      { name: 'Silk Evening Gown', qty: 2, price: 299, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600' }
    ],
    shippingAddress: { address: '1 Plaza Place', city: 'Themyscira', postalCode: '00042', country: 'Greece' },
    paymentMethod: 'Stripe',
    itemsPrice: 598,
    shippingPrice: 0,
    discount: 100,
    totalPrice: 498,
    isPaid: true,
    paidAt: '2026-07-13T18:00:00Z',
    orderStatus: 'Shipping',
    createdAt: '2026-07-13T17:45:00Z',
    trackingNumber: 'TRK-90081273'
  },
  {
    id: 'ord-1004',
    user: { name: 'Clara Oswald', email: 'clara.oswald@bbc.co.uk' },
    orderItems: [
      { name: 'Casual Denim Overshirt', qty: 2, price: 89, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' }
    ],
    shippingAddress: { address: 'TARDIS Console Room', city: 'Cardiff', postalCode: 'CF10 1FS', country: 'UK' },
    paymentMethod: 'Stripe',
    itemsPrice: 178,
    shippingPrice: 15,
    discount: 10,
    totalPrice: 183,
    isPaid: true,
    paidAt: '2026-07-14T08:10:00Z',
    orderStatus: 'Delivered',
    createdAt: '2026-07-14T08:00:00Z',
    deliveredAt: '2026-07-14T10:15:00Z',
    trackingNumber: 'TRK-00109931'
  }
];

const INITIAL_CUSTOM_ORDERS = [
  {
    id: 'co-101',
    user: { name: 'Sarah Connor', email: 'sarah.connor@gmail.com' },
    description: 'Tailored heavy linen trenchcoat reinforced for outdoor wear. Needs double stitching and deep internal pockets.',
    fabric: 'Heavy Duty Waxed Linen',
    size: 'M',
    color: 'Olive Green',
    budget: 350,
    referenceImages: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' }],
    status: 'Pending',
    adminNote: '',
    quotedPrice: 0,
    createdAt: '2026-07-11T11:20:00Z'
  },
  {
    id: 'co-102',
    user: { name: 'Emma Watson', email: 'emma@watson.co.uk' },
    description: 'Evening silk shawl custom-tailored with gold-thread embroidery depicting cosmic star maps.',
    fabric: 'Georgette Silk',
    size: 'One Size',
    color: 'Midnight Blue',
    budget: 600,
    referenceImages: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600' }],
    status: 'Accepted',
    adminNote: 'Confirmed fabric sourcing. Beautiful design requirement.',
    quotedPrice: 550,
    estimatedDelivery: '2026-08-05',
    createdAt: '2026-07-09T16:45:00Z'
  }
];

const INITIAL_RECOMMENDATIONS = [
  {
    productId: 'prod-1', // Silk Evening Gown
    accessoryCategory: 'Accessories',
    assignedProducts: ['prod-3', 'prod-5'] // Handbag, Stiletto
  },
  {
    productId: 'prod-2', // Blazer
    accessoryCategory: 'Accessories',
    assignedProducts: ['prod-3'] // Handbag
  }
];

// Initialize Storage
const initStorage = () => {
  if (!localStorage.getItem('admin_categories')) {
    localStorage.setItem('admin_categories', JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem('admin_products')) {
    localStorage.setItem('admin_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('admin_customers')) {
    localStorage.setItem('admin_customers', JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem('admin_orders')) {
    localStorage.setItem('admin_orders', JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem('admin_custom_orders')) {
    localStorage.setItem('admin_custom_orders', JSON.stringify(INITIAL_CUSTOM_ORDERS));
  }
  if (!localStorage.getItem('admin_recommendations')) {
    localStorage.setItem('admin_recommendations', JSON.stringify(INITIAL_RECOMMENDATIONS));
  }
};

initStorage();

export const adminApi = {
  // Stats & Analytics
  getStats: async () => {
    try {
      const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
      const customers = JSON.parse(localStorage.getItem('admin_customers') || '[]');
      
      const totalRevenue = orders.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
      const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;

      return {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders
      };
    } catch (e) {
      return { totalRevenue: 1612, totalOrders: 4, totalProducts: 5, totalCustomers: 5, pendingOrders: 1 };
    }
  },

  // Products
  getProducts: async () => {
    return JSON.parse(localStorage.getItem('admin_products') || '[]');
  },
  saveProduct: async (product) => {
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        products[idx] = product;
      }
    } else {
      product.id = 'prod-' + Date.now();
      product.sold = 0;
      products.unshift(product);
    }
    localStorage.setItem('admin_products', JSON.stringify(products));
    return product;
  },
  deleteProduct: async (id) => {
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('admin_products', JSON.stringify(filtered));
    return true;
  },

  // Categories
  getCategories: async () => {
    return JSON.parse(localStorage.getItem('admin_categories') || '[]');
  },
  saveCategory: async (category) => {
    const categories = JSON.parse(localStorage.getItem('admin_categories') || '[]');
    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        categories[idx] = category;
      }
    } else {
      category.id = 'cat-' + Date.now();
      categories.unshift(category);
    }
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    return category;
  },
  deleteCategory: async (id) => {
    const categories = JSON.parse(localStorage.getItem('admin_categories') || '[]');
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem('admin_categories', JSON.stringify(filtered));
    return true;
  },

  // Orders
  getOrders: async () => {
    return JSON.parse(localStorage.getItem('admin_orders') || '[]');
  },
  saveOrderStatus: async (orderId, status, tracking) => {
    const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].orderStatus = status;
      if (tracking !== undefined) orders[idx].trackingNumber = tracking;
      if (status === 'Delivered') {
        orders[idx].isPaid = true;
        orders[idx].deliveredAt = new Date().toISOString();
      }
      localStorage.setItem('admin_orders', JSON.stringify(orders));
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  // Customers
  getCustomers: async () => {
    return JSON.parse(localStorage.getItem('admin_customers') || '[]');
  },

  // Custom Tailor Orders
  getCustomOrders: async () => {
    return JSON.parse(localStorage.getItem('admin_custom_orders') || '[]');
  },
  updateCustomOrder: async (id, data) => {
    const orders = JSON.parse(localStorage.getItem('admin_custom_orders') || '[]');
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...data };
      localStorage.setItem('admin_custom_orders', JSON.stringify(orders));
      return orders[idx];
    }
    throw new Error('Custom order not found');
  },

  // Recommendation management
  getRecommendations: async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recommendations/admin', getAuthHeaders());
      if (response.data && response.data.success) {
        localStorage.setItem('admin_recommendations', JSON.stringify(response.data.recommendations));
        return response.data.recommendations;
      }
    } catch (err) {
      console.warn('Failed to fetch recommendations from server, falling back to local storage', err.message);
    }
    return JSON.parse(localStorage.getItem('admin_recommendations') || '[]');
  },
  saveRecommendation: async (productId, assignedIds) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/recommendations/admin/${productId}`, {
        assignedProducts: assignedIds
      }, getAuthHeaders());
      if (response.data && response.data.success) {
        localStorage.setItem('admin_recommendations', JSON.stringify(response.data.recommendations));
        return response.data.recommendations;
      }
    } catch (err) {
      console.warn('Failed to save recommendations to server, falling back to local storage', err.message);
    }
    
    const recs = JSON.parse(localStorage.getItem('admin_recommendations') || '[]');
    const idx = recs.findIndex(r => r.productId === productId);
    if (idx !== -1) {
      recs[idx].assignedProducts = assignedIds;
    } else {
      recs.push({
        productId,
        accessoryCategory: 'Accessories',
        assignedProducts: assignedIds
      });
    }
    localStorage.setItem('admin_recommendations', JSON.stringify(recs));
    return recs;
  },

  // ─── CRM & Support APIs ─────────────────────────────────────────────
  getCRMDashboard: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/crm/segments', getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getCustomer360: async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/crm/customer-360/${userId}`, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getSupportTickets: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/support', getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  updateSupportTicket: async (ticketId, status, responseMessage) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/support/${ticketId}`, { status, responseMessage }, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  // ─── Business Intelligence APIs ─────────────────────────────────────────────
  getBIDashboard: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get('http://localhost:5000/api/bi/dashboard', { ...getAuthHeaders(), params });
      return res.data;
    } catch (err) {
      console.warn('BI Dashboard API failed, returning offline simulation data.');
      return {
        success: true,
        summary: {
          revenue: { today: 299.00, weekly: 3490.00, monthly: 12800.00, yearly: 154000.00, total: 248900.00 },
          orders: { today: 4, pending: 3, completed: 86, cancelled: 2, returned: 1, customization: 14 },
          inventory: { lowStock: 3, outOfStock: 1 },
          customers: { new: 18, returning: 46, total: 64 }
        },
        popularViews: [
          { name: 'Silk Evening Gown', count: 840 },
          { name: 'Classic Office Blazer', count: 560 },
          { name: 'Designer Leather Handbag', count: 490 },
          { name: 'Velvet Stiletto Heels', count: 360 }
        ],
        recentReviews: [
          { user: { name: 'Sarah Connor' }, rating: 5, comment: 'Perfect tailoring, the gown is stellar!' },
          { user: { name: 'John Doe' }, rating: 4, comment: 'Sharp cut on the blazer.' }
        ]
      };
    }
  },

  getBISales: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get('http://localhost:5000/api/bi/sales', { ...getAuthHeaders(), params });
      return res.data;
    } catch (err) {
      return {
        success: true,
        salesOverTime: [
          { _id: 'Mon', revenue: 1200, ordersCount: 4 },
          { _id: 'Tue', revenue: 1850, ordersCount: 6 },
          { _id: 'Wed', revenue: 1400, ordersCount: 5 },
          { _id: 'Thu', revenue: 2900, ordersCount: 9 },
          { _id: 'Fri', revenue: 3100, ordersCount: 11 },
          { _id: 'Sat', revenue: 4600, ordersCount: 15 },
          { _id: 'Sun', revenue: 3950, ordersCount: 12 }
        ],
        stats: { avgOrderValue: 285.50, maxOrderValue: 2999.00 },
        categoryBreakdown: [
          { _id: 'Women\'s Dresses', sales: 48900, units: 164 },
          { _id: 'Men\'s Blazers', sales: 12400, units: 62 },
          { _id: 'Accessories', sales: 8400, units: 168 },
          { _id: 'Studio Collection', sales: 5200, units: 18 }
        ]
      };
    }
  },

  getBIProducts: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/products', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        mostViewed: [
          { name: 'Silk Evening Gown', count: 1240 },
          { name: 'Classic Office Blazer', count: 910 },
          { name: 'Designer Leather Handbag', count: 680 },
          { name: 'Velvet Stiletto Heels', count: 430 }
        ],
        mostCarted: [
          { name: 'Silk Evening Gown', count: 185 },
          { name: 'Gold Ring Accessory', count: 142 },
          { name: 'Classic Office Blazer', count: 98 }
        ],
        mostPurchased: [
          { name: 'Classic Office Blazer', sold: 84, price: 149 },
          { name: 'Casual Denim Overshirt', sold: 112, price: 89 }
        ],
        mostReturned: [
          { name: 'Gold Ring Accessory', returns: 4, reason: 'Sizing mismatch' },
          { name: 'Velvet Stiletto Heels', returns: 2, reason: 'Too narrow fit' }
        ]
      };
    }
  },

  getBIColorsSizesFabrics: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/colors-sizes-fabrics', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        colors: [
          { _id: '#be123c', count: 98, revenue: 29302 }, // Ruby Red
          { _id: '#0f172a', count: 84, revenue: 25116 }, // Slate Navy
          { _id: '#b45309', count: 54, revenue: 16146 }  // Gold/Amber
        ],
        sizes: [
          { _id: 'M', count: 142 },
          { _id: 'S', count: 98 },
          { _id: 'L', count: 74 },
          { _id: 'XL', count: 32 }
        ],
        fabrics: [
          { name: 'Georgette Silk', count: 34, revenue: 10200 },
          { name: 'Silk Velvet', count: 22, revenue: 7920 },
          { name: 'Premium Linen', count: 18, revenue: 3240 }
        ]
      };
    }
  },

  getBIRecommendationsPerformance: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/recommendations', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        stats: { totalClicks: 146, convertedPurchases: 28, conversionRate: 19.1, totalAccessoryRevenue: 1396.00 },
        topMatches: [
          { primaryProduct: 'Silk Evening Gown', recommendation: 'Gold Ring Accessory', clicks: 68, conversions: 18 },
          { primaryProduct: 'Classic Office Blazer', recommendation: 'Designer Leather Handbag', clicks: 42, conversions: 7 }
        ]
      };
    }
  },

  getBIDreamDress: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/dream-dress', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        totalCustomized: 18,
        customizationRevenue: 5400.00,
        avgCustomizationCost: 300.00,
        popularStyles: {
            neck: [
                { style: 'Sweetheart', count: 32 },
                { style: 'Off-shoulder', count: 24 },
                { style: 'V-Neck', count: 16 }
            ],
            sleeve: [
                { style: 'Long Elegant', count: 28 },
                { style: 'Puff Sleeves', count: 22 },
                { style: 'Sleeveless', count: 18 }
            ],
            decorations: [
                { style: 'Pearl Embroidery', count: 35 },
                { style: 'Lace Trim', count: 21 },
                { style: 'Crystal Sequence', count: 14 }
            ]
        }
      };
    }
  },

  getBIMemberships: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/memberships', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        tiers: { Free: 48, Premium: 12, VIP: 4 },
        upgradeRate: '25.0%',
        renewalRate: '92.5%',
        monthlyGrowth: [
          { month: 'Jan', members: 20 },
          { month: 'Feb', members: 28 },
          { month: 'Mar', members: 39 },
          { month: 'Apr', members: 48 },
          { month: 'May', members: 56 },
          { month: 'Jun', members: 64 }
        ]
      };
    }
  },

  getBIMarketing: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/marketing', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        couponPerformance: [
          { _id: 'ELEGANCE10', count: 28, discountTotal: 840 },
          { _id: 'WELCOME20', count: 16, discountTotal: 480 }
        ],
        bannerClickThroughs: 240,
        campaigns: [
          { name: 'Spring Revival', clicks: 420, salesGenerated: 6300 },
          { name: 'VIP Club Launch', clicks: 210, salesGenerated: 2400 }
        ]
      };
    }
  },

  getBICartPayments: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/cart-payments', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        abandonmentRate: '72.4%',
        funnel: { cartAdditions: 210, checkoutInitiated: 84, checkoutSuccessful: 58 },
        paymentMethods: [
          { _id: 'Stripe', count: 32, volume: 9600 },
          { _id: 'Mintpay', count: 12, volume: 3600 },
          { _id: 'FLEX', count: 6, volume: 2400 },
          { _id: 'COD', count: 8, volume: 1600 }
        ]
      };
    }
  },

  getBIInventory: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/inventory', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        stockValue: 56800.00,
        lowStock: [
          { name: 'Silk Evening Gown', stock: 4, sold: 45 },
          { name: 'Designer Leather Handbag', stock: 2, sold: 19 }
        ],
        outOfStock: [
          { name: 'Vintage Summer Hat', stock: 0, sold: 12 }
        ],
        turnoverRatio: '4.8x',
        fastMoving: [
          { name: 'Casual Denim Overshirt', sold: 112 },
          { name: 'Classic Office Blazer', sold: 84 }
        ],
        slowMoving: [
          { name: 'Velvet Stiletto Heels', sold: 6 }
        ]
      };
    }
  },

  getBIFeedbackSearches: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/feedback-searches', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        reviews: { averageRating: 4.8, totalReviewsCount: 52 },
        popularSearches: [
          { _id: 'evening dress', count: 112 },
          { _id: 'silk gown', count: 86 },
          { _id: 'office blazer', count: 74 }
        ],
        searchesWithNoResults: [
          { _id: 'winter leather jacket', count: 12 },
          { _id: 'neon accessories', count: 8 }
        ]
      };
    }
  },

  getBIAlerts: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/alerts', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        alerts: [
          { id: '1', type: 'low_stock', severity: 'warning', message: 'Product "Designer Leather Handbag" stock is low (2 left).' },
          { id: '2', type: 'high_return_rate', severity: 'danger', message: 'Return rate for Velvet Stiletto Heels is 15% (sizing related).' },
          { id: '3', type: 'system_alert', severity: 'success', message: 'Scheduled daily backup finished successfully.' }
        ]
      };
    }
  },

  getBIDecisionSupport: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bi/decision-support', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        advice: [
          { type: 'restock', importance: 'high', rationale: 'Silk Evening Gown is selling out at a high rate with only 4 items remaining in stock.', action: 'Order 30 units of Silk Evening Gown immediately.' },
          { type: 'discontinue', importance: 'medium', rationale: 'Velvet Stiletto Heels has negative feedback trends (fit too narrow) and high returns.', action: 'Discontinue current size specification and offer promotional clearance.' },
          { type: 'supply_replenish', importance: 'high', rationale: 'Georgette Silk is requested in 60% of customization designs.', action: 'Acquire 3 additional fabric rolls of Georgette Silk.' }
        ]
      };
    }
  },

  // ─── Future Expansion & AI APIs ─────────────────────────────────────────────
  getFutureShippingZones: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/shipping-zones', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        zones: [
          { _id: '1', name: 'South Asia (Local)', countries: ['Sri Lanka', 'India'], baseCost: 350, taxRate: 15, dutyRate: 0, deliveryEstimate: '1-3 Business Days', courierPartner: 'DHL Express' },
          { _id: '2', name: 'North America', countries: ['USA', 'Canada'], baseCost: 4500, taxRate: 8, dutyRate: 5, deliveryEstimate: '5-7 Business Days', courierPartner: 'DHL Express' }
        ]
      };
    }
  },

  saveFutureShippingZone: async (zoneData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/future/shipping-zones', zoneData, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false, message: 'Failed to connect' };
    }
  },

  getFutureWarehouses: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/inventory/warehouses', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        warehouses: [
          { _id: 'w1', name: 'Colombo Main Depot', location: 'Colombo, Sri Lanka', capacity: 20000, stockMap: [] },
          { _id: 'w2', name: 'Kandy Central Hub', location: 'Kandy, Sri Lanka', capacity: 8000, stockMap: [] }
        ]
      };
    }
  },

  updateFutureWarehouseStock: async (warehouseId, productId, quantity) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/future/inventory/warehouses/${warehouseId}/stock`, { productId, quantity }, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getFutureSuppliers: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/inventory/suppliers', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        suppliers: [
          { _id: 's1', name: 'Lanka Silks Co.', contactPerson: 'Arjuna Silva', phone: '+94 77 123 4567', email: 'arjuna@lankasilks.com', suppliedCategories: ['Fabric'], suppliedMaterials: ['Georgette Silk'] }
        ]
      };
    }
  },

  saveFutureSupplier: async (supplierData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/future/inventory/suppliers', supplierData, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getFutureMarketplaceVendors: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/marketplace', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        vendors: [
          { _id: 'v1', name: 'Nirosha Couture', owner: { name: 'Nirosha J', email: 'nirosha@designer.com' }, commissionRate: 12, status: 'Approved' }
        ]
      };
    }
  },

  updateFutureMarketplaceVendor: async (vendorId, updateData) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/future/marketplace/${vendorId}`, updateData, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getFutureTranslations: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/translations', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        translations: [
          { _id: 't1', key: 'navbar_shop', values: { en: 'Shop', si: 'සාප්පුව', ta: 'கடை' }, category: 'Navbar' }
        ]
      };
    }
  },

  updateFutureTranslation: async (translationId, values) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/future/translations/${translationId}`, { values }, getAuthHeaders());
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  getFutureAiStylistAdvice: async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/future/ai-stylist', getAuthHeaders());
      return res.data;
    } catch (err) {
      return {
        success: true,
        userPreferences: { colors: ['Rose Red', 'Navy Blue'], sizes: ['M', 'L'], styles: ['Elegant evening', 'Casual chic'] },
        purchasedHistory: ['Silk Evening Gown'],
        stylistAdvice: {
          Wedding: 'For a wedding occasion, we recommend combining your Silk Evening Gown with gold accents.',
          Office: 'The tailor-fit Merino Wool Blazer provides standard elegance.'
        }
      };
    }
  }
};

