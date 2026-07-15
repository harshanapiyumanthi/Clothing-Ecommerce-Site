import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiSliders, FiEye, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const PRESET_COLORS = [
  { name: 'Navy', hex: '#0f172a' },
  { name: 'Amber', hex: '#b45309' },
  { name: 'Rose', hex: '#be123c' },
  { name: 'Charcoal', hex: '#1e293b' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Gray', hex: '#cbd5e1' },
  { name: 'Brown', hex: '#78350f' },
  { name: 'Black', hex: '#000000' },
  { name: 'Tan', hex: '#d97706' },
  { name: 'Ruby Red', hex: '#be123c' },
  { name: 'Emerald', hex: '#10b981' }
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    sizes: [],
    colors: [],
    stock: '',
    isFeatured: false,
    isBestSeller: false,
    tags: '',
    imageUrl: '',
    recommendations: [],
    isPersonalizable: false,
    baseProductionTime: '2'
  });

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodData = await adminApi.getProducts();
      const catsData = await adminApi.getCategories();
      setProducts(prodData);
      setCategories(catsData);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discountPrice: product.discountPrice || product.price,
        category: product.category,
        brand: product.brand || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        tags: product.tags ? product.tags.join(', ') : '',
        imageUrl: product.images?.[0]?.url || '',
        recommendations: product.recommendations || [],
        isPersonalizable: product.isPersonalizable || false,
        baseProductionTime: product.baseProductionTime || '2'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: categories[0]?.name || 'Women',
        brand: '',
        sizes: [],
        colors: [],
        stock: '',
        isFeatured: false,
        isBestSeller: false,
        tags: '',
        imageUrl: '',
        recommendations: [],
        isPersonalizable: false,
        baseProductionTime: '2'
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleSize = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleToggleColor = (colorHex) => {
    setFormData(prev => {
      const colors = prev.colors.includes(colorHex)
        ? prev.colors.filter(c => c !== colorHex)
        : [...prev.colors, colorHex];
      return { ...prev, colors };
    });
  };

  const handleToggleRecommendation = (prodId) => {
    setFormData(prev => {
      const recommendations = prev.recommendations.includes(prodId)
        ? prev.recommendations.filter(id => id !== prodId)
        : [...prev.recommendations, prodId];
      return { ...prev, recommendations };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      toast.warning('Please fill in Name, Price, and Stock.');
      return;
    }

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const productPayload = {
        id: editingProduct?.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : parseFloat(formData.price),
        category: formData.category,
        brand: formData.brand,
        sizes: formData.sizes,
        colors: formData.colors,
        stock: parseInt(formData.stock),
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isPersonalizable: formData.isPersonalizable,
        baseProductionTime: parseInt(formData.baseProductionTime),
        tags: tagsArray,
        recommendations: formData.recommendations,
        images: [{ url: formData.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600' }]
      };

      await adminApi.saveProduct(productPayload);
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminApi.deleteProduct(deletingId);
      toast.success('Product deleted successfully');
      setShowDeleteConfirm(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Filters and Search
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = catFilter === 'All' || prod.category === catFilter;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search products by name, brand, or tag..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-[var(--border-color)] rounded-lg focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Category Filters and Add */}
        <div className="flex items-center flex-wrap gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:inline">Category:</span>
            <select
              value={catFilter}
              onChange={(e) => { setCatFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border border-[var(--border-color)] px-3 py-2 rounded-lg text-sm outline-none focus:border-gold cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-gold text-white px-4 py-2.5 rounded-lg text-sm uppercase tracking-wider font-semibold hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-gold/25"
          >
            <FiPlus size={16} /> Add Product
          </button>

        </div>

      </div>

      {/* Products Table Card */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-semibold">
                <th className="p-4 w-20">Preview</th>
                <th className="p-4">Product Info</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Attributes</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No products found. Add a new product to get started.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    
                    {/* Preview Image */}
                    <td className="p-4">
                      {prod.images?.[0]?.url ? (
                        <img src={prod.images[0].url} alt={prod.name} className="h-16 w-12 object-cover rounded shadow-sm border border-[var(--border-color)] bg-gray-100" />
                      ) : (
                        <div className="h-16 w-12 rounded bg-gold/10 text-gold flex items-center justify-center font-bold border border-[var(--border-color)]">
                          {prod.name.charAt(0)}
                        </div>
                      )}
                    </td>

                    {/* Product details */}
                    <td className="p-4">
                      <h4 className="font-bold text-base line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{prod.brand || 'Luxury E-commerce'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-semibold uppercase">{prod.category}</span>
                        {prod.isFeatured && <span className="text-[10px] bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded font-bold uppercase">Featured</span>}
                        {prod.isBestSeller && <span className="text-[10px] bg-blue-500/15 text-blue-500 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold uppercase">Best Seller</span>}
                      </div>
                    </td>

                    {/* Price and discount */}
                    <td className="p-4 font-sans">
                      {prod.discountPrice && prod.discountPrice < prod.price ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gold text-base">${prod.discountPrice}</span>
                          <span className="text-xs text-gray-400 line-through">${prod.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-base">${prod.price}</span>
                      )}
                    </td>

                    {/* Stock level */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`font-bold font-sans ${prod.stock <= 5 ? 'text-red-500' : ''}`}>{prod.stock} Units</span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${prod.stock === 0 ? 'bg-red-500' : prod.stock <= 5 ? 'bg-amber-500' : 'bg-gold'}`}
                            style={{ width: `${Math.min((prod.stock / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Size and Colors list */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        {/* Sizes */}
                        <div className="flex flex-wrap gap-1">
                          {prod.sizes?.map(size => (
                            <span key={size} className="text-[10px] bg-gray-100 dark:bg-gray-800 border border-[var(--border-color)] px-1 py-0.2 rounded font-semibold text-gray-500">{size}</span>
                          ))}
                        </div>
                        {/* Colors */}
                        <div className="flex flex-wrap gap-1">
                          {prod.colors?.map(hex => (
                            <span key={hex} className="h-3 w-3 rounded-full border border-white dark:border-gray-900 shadow-sm" style={{ backgroundColor: hex }} title={hex} />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(prod)}
                          className="p-2 text-gray-500 hover:text-gold hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(prod.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-gray-50 dark:bg-gray-900/10 text-sm">
            <span className="text-gray-500">
              Showing <span className="font-semibold text-[var(--text-color)]">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-[var(--text-color)]">
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </span>{' '}
              of <span className="font-semibold text-[var(--text-color)]">{filteredProducts.length}</span> products
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 border border-[var(--border-color)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 border rounded-lg transition-colors cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-gold text-white border-gold font-semibold shadow-sm'
                      : 'border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 border border-[var(--border-color)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CRUD Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto backdrop-blur-sm">
          <div className="relative bg-[var(--card-bg)] w-full max-w-2xl rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-bold uppercase tracking-wider">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gold p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Silk Evening Gown"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. Elegance Couture"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Stock Count *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Original Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 299"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

                {/* Discount Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Discounted Price ($)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. 249"
                    className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detail the fabric, cut, elegance features, etc."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm resize-none"
                />
              </div>

              {/* Image Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Paste Unsplash or Cloudinary image link..."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                />
                {formData.imageUrl && (
                  <div className="mt-2 h-28 w-20 relative rounded border overflow-hidden bg-gray-100">
                    <img src={formData.imageUrl} alt="preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Preset Sizes Array */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map(size => {
                    const isSelected = formData.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleToggleSize(size)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gold text-white border-gold shadow-sm scale-105'
                            : 'border-[var(--border-color)] hover:bg-gray-150'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preset Colors Array */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => {
                    const isSelected = formData.colors.includes(color.hex);
                    return (
                      <button
                        type="button"
                        key={color.name}
                        onClick={() => handleToggleColor(color.hex)}
                        className={`h-8 px-2.5 rounded-full border text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-gold text-gold bg-gold/5 scale-105'
                            : 'border-[var(--border-color)] hover:bg-gray-150 text-gray-500'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />
                        {color.name}
                        {isSelected && <FiCheck size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign Matching Recommendations (Complete Your Look)</label>
                <div className="border border-[var(--border-color)] rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {products.filter(p => p.id !== editingProduct?.id).map(prod => {
                    const isSelected = formData.recommendations.includes(prod.id);
                    return (
                      <label key={prod.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors border border-transparent hover:border-[var(--border-color)]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRecommendation(prod.id)}
                          className="accent-gold w-4 h-4 rounded"
                        />
                        <div className="w-8 h-10 overflow-hidden rounded bg-gray-100 flex items-center justify-center border border-[var(--border-color)]">
                          {prod.images?.[0]?.url ? (
                            <img src={prod.images[0].url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-xs text-gray-400">{prod.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold leading-tight">{prod.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{prod.category}</span>
                        </div>
                      </label>
                    );
                  })}
                  {products.length <= 1 && <p className="text-xs text-gray-400 p-2">Add more products to create recommendations.</p>}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tags (Comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. silk, gown, new-season, wedding"
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                />
              </div>

              {/* Feature checkboxes & Dream Dress Studio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-color)] mt-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Display Options</h4>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="accent-gold h-4 w-4"
                    />
                    Featured Product
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleInputChange}
                      className="accent-gold h-4 w-4"
                    />
                    Best Seller
                  </label>
                </div>

                <div className="space-y-4 bg-gold/5 p-4 rounded-lg border border-gold/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                    ✨ Dream Dress Studio
                  </h4>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPersonalizable"
                      checked={formData.isPersonalizable}
                      onChange={handleInputChange}
                      className="accent-gold h-4 w-4"
                    />
                    Enable Personalization
                  </label>

                  {formData.isPersonalizable && (
                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Base Production Time (Days)</label>
                      <input
                        type="number"
                        name="baseProductionTime"
                        value={formData.baseProductionTime}
                        onChange={handleInputChange}
                        className="w-full px-2.5 py-1.5 border border-[var(--border-color)] bg-white dark:bg-gray-800 rounded outline-none focus:border-gold text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-transparent border border-[var(--border-color)] rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold text-white rounded-lg text-sm hover:bg-black font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-gold/25"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-red-500">
              <FiInfo /> Delete Product
            </h3>
            <p className="text-sm opacity-80 mb-6">
              Are you sure you want to delete this product? This action is permanent and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[var(--border-color)] bg-transparent rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-650 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManager;
