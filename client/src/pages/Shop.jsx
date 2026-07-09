import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock Data
const MOCK_PRODUCTS = [
  { id: 1, name: 'Silk Evening Gown', price: 299, category: 'Women', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2071&auto=format&fit=crop' },
  { id: 2, name: 'Classic Office Blazer', price: 149, category: 'Office', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop' },
  { id: 3, name: 'Designer Handbag', price: 499, category: 'Accessories', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1915&auto=format&fit=crop' },
  { id: 4, name: 'Casual Denim Jacket', price: 89, category: 'Casual', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=2070&auto=format&fit=crop' },
];

const Shop = () => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-border-color pb-2">Filters</h2>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Category</h3>
            <ul className="space-y-2 text-sm opacity-80">
              {['All', 'Women', 'Teen', 'Office', 'Casual', 'Sarees', 'Accessories'].map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition-colors">
                    <input type="radio" name="category" checked={filter === cat} onChange={() => setFilter(cat)} className="accent-gold" />
                    {cat}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Price Filter Placeholder */}
          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <input type="range" min="0" max="1000" className="w-full accent-gold" />
            <div className="flex justify-between text-xs opacity-60 mt-2">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm opacity-60">Showing results</span>
            <select className="bg-transparent border border-border-color px-4 py-2 text-sm outline-none focus:border-gold">
              <option>Sort by Latest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PRODUCTS.filter(p => filter === 'All' || p.category === filter).map((product, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={product.id} 
                className="group cursor-pointer"
              >
                <div className="relative h-80 overflow-hidden bg-gray-100 mb-4">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <button className="bg-white text-black px-6 py-2 text-sm uppercase tracking-wider hover:bg-gold hover:text-white transition-colors shadow-lg">
                      View Details
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                <p className="text-gold font-semibold">${product.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
