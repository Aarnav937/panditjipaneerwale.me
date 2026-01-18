import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Save, X, Image, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { products as localProducts, categories } from '../../data/products';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // New product form state
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: categories[1] || 'Milk Products',
        price: '',
        description: '',
        image: '',
        stock_quantity: 100,
        is_available: true
    });

    // Load products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('id', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    // Fall back to local products if DB is empty
                    setProducts(localProducts.map(p => ({
                        ...p,
                        stock_quantity: 100,
                        is_available: true
                    })));
                }
            } else {
                // No Supabase, use local products
                setProducts(localProducts.map(p => ({
                    ...p,
                    stock_quantity: 100,
                    is_available: true
                })));
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts(localProducts.map(p => ({
                ...p,
                stock_quantity: 100,
                is_available: true
            })));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Show message
    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Save product (update or create)
    const handleSaveProduct = async (product, isNew = false) => {
        setSaving(true);
        try {
            if (supabase) {
                if (isNew) {
                    const { data, error } = await supabase
                        .from('products')
                        .insert([{
                            name: product.name,
                            category: product.category,
                            price: parseFloat(product.price),
                            description: product.description,
                            image: product.image || `images/products/product-${Date.now()}.webp`,
                            stock_quantity: parseInt(product.stock_quantity) || 100,
                            is_available: product.is_available !== false
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    setProducts(prev => [...prev, data]);
                    showMessage('Product added successfully!');
                } else {
                    const { error } = await supabase
                        .from('products')
                        .update({
                            name: product.name,
                            category: product.category,
                            price: parseFloat(product.price),
                            description: product.description,
                            image: product.image,
                            stock_quantity: parseInt(product.stock_quantity),
                            is_available: product.is_available
                        })
                        .eq('id', product.id);

                    if (error) throw error;
                    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
                    showMessage('Product updated successfully!');
                }
            } else {
                // Local only mode
                if (isNew) {
                    const newId = Math.max(...products.map(p => p.id)) + 1;
                    setProducts(prev => [...prev, { ...product, id: newId }]);
                } else {
                    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
                }
                showMessage('Product saved (local only - no database)');
            }

            setEditingProduct(null);
            setIsAddingNew(false);
            setNewProduct({
                name: '',
                category: categories[1] || 'Milk Products',
                price: '',
                description: '',
                image: '',
                stock_quantity: 100,
                is_available: true
            });
        } catch (error) {
            console.error('Error saving product:', error);
            showMessage('Error saving product: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Delete product
    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            if (supabase) {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (error) throw error;
            }

            setProducts(prev => prev.filter(p => p.id !== productId));
            showMessage('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            showMessage('Error deleting product: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 rounded-lg ${message.type === 'error' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <h3 className="text-xl font-bold">Product Manager ({products.length} products)</h3>
                <button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                >
                    <option value="All">All Categories</option>
                    {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Add New Product Form */}
            <AnimatePresence>
                {isAddingNew && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                        <h4 className="font-bold mb-4">Add New Product</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <select
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Price (AED)"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <input
                                type="number"
                                placeholder="Stock Quantity"
                                value={newProduct.stock_quantity}
                                onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <input
                                type="text"
                                placeholder="Image URL (optional)"
                                value={newProduct.image}
                                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 sm:col-span-2"
                            />
                            <textarea
                                placeholder="Description"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 sm:col-span-2"
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleSaveProduct(newProduct, true)}
                                disabled={saving || !newProduct.name || !newProduct.price}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                            <button
                                onClick={() => setIsAddingNew(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Products Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image.startsWith('http') ? product.image : `/${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Image className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{product.category}</td>
                                    <td className="px-4 py-3 text-sm">AED {product.price}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={product.stock_quantity < 10 ? 'text-red-400' : 'text-green-400'}>
                                            {product.stock_quantity || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.is_available !== false ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                            }`}>
                                            {product.is_available !== false ? 'Available' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingProduct(product)}
                                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Product Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700"
                        >
                            <h4 className="font-bold text-lg mb-4">Edit Product</h4>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Price (AED)"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={editingProduct.stock_quantity || 0}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                                        className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={editingProduct.image}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={editingProduct.description}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={2}
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingProduct.is_available !== false}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, is_available: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span>Available for sale</span>
                                </label>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => handleSaveProduct(editingProduct, false)}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductManager;
