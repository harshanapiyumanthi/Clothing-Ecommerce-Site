import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/Breadcrumb';

const Wishlist = () => {
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images?.[0]?.url) || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80',
      qty: 1,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || 'Neutral',
      isCustom: false
    }));
    toast.success(`${product.name} added to cart!`);
    dispatch(removeFromWishlist(product.id));
  };

  const handleRemove = (id, name) => {
    dispatch(removeFromWishlist(id));
    toast.info(`${name} removed from wishlist.`);
  };

  const breadcrumbItems = [{ label: 'Wishlist', link: '/wishlist' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)] font-sans">
          My Wishlist
        </h1>
        <div className="h-0.5 w-12 bg-gold mx-auto"></div>
        <p className="text-xs text-gray-500">
          A collection of your favorite couture items, ready for checkout.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-24 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-lg mx-auto space-y-6"
          >
            <div className="flex justify-center text-gray-300">
              <FiHeart size={48} className="stroke-1" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Add premium designs while you browse to keep them saved here.
              </p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-gold hover:bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-md shadow-gold/25">
              Explore Collections
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {wishlistItems.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col bg-white dark:bg-gray-900 border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <Link to={`/product/${product.id}`} className="block relative h-80 overflow-hidden bg-gray-100 border-b border-[var(--border-color)]">
                  <img 
                    src={product.image || (product.images?.[0]?.url) || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-colors shadow">
                      View Details
                    </span>
                  </div>
                </Link>

                {/* Info & Action Buttons */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-xs text-[var(--text-color)] line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gold font-bold font-sans mt-0.5">${product.price}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-grow py-2.5 bg-gold hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FiShoppingBag size={12} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="p-2.5 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
