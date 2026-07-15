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
  }
};
