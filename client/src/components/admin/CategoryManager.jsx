import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiLayers, FiX, FiCheck, FiInfo } from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import { toast } from 'react-toastify';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
    isActive: true,
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catsData = await adminApi.getCategories();
      setCategories(catsData);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        description: cat.description || '',
        parent: cat.parent || '',
        isActive: cat.isActive !== undefined ? cat.isActive : true,
        imageUrl: cat.image?.url || cat.image || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent: '',
        isActive: true,
        imageUrl: ''
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

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-') 
        ? val.toLowerCase().replace(/\s+/g, '-') 
        : prev.slug
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning('Category name is required.');
      return;
    }

    try {
      const catPayload = {
        id: editingCategory?.id,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        parent: formData.parent || null,
        isActive: formData.isActive,
        image: formData.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600'
      };

      await adminApi.saveCategory(catPayload);
      toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminApi.deleteCategory(deletingId);
      toast.success('Category deleted successfully');
      setShowDeleteConfirm(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      {/* Controls Header */}
      <div className="flex items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)]">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border border-[var(--border-color)] rounded-lg focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-gold text-white px-4 py-2.5 rounded-lg text-sm uppercase tracking-wider font-semibold hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-gold/25"
        >
          <FiPlus size={16} /> Add Category
        </button>

      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-xl text-center text-gray-500 col-span-full">
            No categories match your search.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
              
              <div>
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden bg-gray-100 border-b border-[var(--border-color)]">
                  {cat.image ? (
                    <img 
                      src={cat.image?.url || cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gold bg-gold/5 gap-2">
                      <FiLayers size={36} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wider shadow ${
                      cat.isActive 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/55' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/55'
                    }`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h4 className="text-lg font-bold truncate">{cat.name}</h4>
                  <p className="text-xs text-gold font-semibold font-mono">/{cat.slug}</p>
                  <p className="text-sm opacity-70 line-clamp-2 min-h-[40px]">{cat.description || 'No description provided.'}</p>
                  
                  {cat.parent && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold pt-1 border-t border-[var(--border-color)]">
                      <span className="uppercase tracking-wider">Parent:</span>
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px]">{cat.parent}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-end gap-2 bg-gray-50/50 dark:bg-gray-900/10">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border border-[var(--border-color)] hover:border-gold hover:text-gold rounded transition-all cursor-pointer flex items-center gap-1"
                >
                  <FiEdit size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(cat.id)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer flex items-center gap-1"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Category CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto backdrop-blur-sm">
          <div className="relative bg-[var(--card-bg)] w-full max-w-md rounded-xl border border-[var(--border-color)] shadow-2xl overflow-hidden my-8 flex flex-col">
            
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-bold uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gold p-1 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              
              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Sarees, Office Wear"
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. office-wear"
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm font-mono text-gold"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Summarize products included in this collection..."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm resize-none"
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Parent Category</label>
                <select
                  name="parent"
                  value={formData.parent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm cursor-pointer"
                >
                  <option value="">None (Top Level Category)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
              </div>

              {/* Image Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Paste collection cover link..."
                  className="w-full px-3 py-2 border border-[var(--border-color)] bg-transparent rounded-lg outline-none focus:border-gold text-sm"
                />
                {formData.imageUrl && (
                  <div className="mt-2 h-20 w-full relative rounded border overflow-hidden bg-gray-100">
                    <img src={formData.imageUrl} alt="preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* isActive switch */}
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="accent-gold h-4 w-4"
                />
                Active & Visible on Shop
              </label>

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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
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
              <FiInfo /> Delete Category
            </h3>
            <p className="text-sm opacity-80 mb-6">
              Are you sure you want to delete this category? This action is permanent and cannot be undone.
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

export default CategoryManager;
