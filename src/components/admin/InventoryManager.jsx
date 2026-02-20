import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, AlertTriangle, Search, Save, Loader2, RefreshCw, MinusCircle, PlusCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { products as localProducts } from '../../data/products';

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState(null);

    // Load products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, category, stock_quantity, is_available, low_stock_threshold, image')
                    .order('name', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setProducts(data);
                } else {
                    setProducts(localProducts.map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        image: p.image,
                        stock_quantity: 100,
                        is_available: true,
                        low_stock_threshold: 10
                    })));
                }
            } else {
                setProducts(localProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    image: p.image,
                    stock_quantity: 100,
                    is_available: true,
                    low_stock_threshold: 10
                })));
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts(localProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                image: p.image,
                stock_quantity: 100,
                is_available: true,
                low_stock_threshold: 10
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

        let matchesFilter = true;
        if (filter === 'low') {
            matchesFilter = product.stock_quantity <= (product.low_stock_threshold || 10) && product.stock_quantity > 0;
        } else if (filter === 'out') {
            matchesFilter = product.stock_quantity === 0 || product.is_available === false;
        }

        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 10) && p.stock_quantity > 0).length,
        outOfStock: products.filter(p => p.stock_quantity === 0 || p.is_available === false).length
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Update stock
    const updateStock = async (productId, newQuantity) => {
        if (newQuantity < 0) return;

        setSaving(productId);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: newQuantity,
                        is_available: newQuantity > 0
                    })
                    .eq('id', productId);

                if (error) throw error;
            }

            setProducts(prev => prev.map(p =>
                p.id === productId
                    ? { ...p, stock_quantity: newQuantity, is_available: newQuantity > 0 }
                    : p
            ));
        } catch (error) {
            console.error('Error updating stock:', error);
            showMessage('Error updating stock: ' + error.message, 'error');
        } finally {
            setSaving(null);
        }
    };

    // Toggle availability
    const toggleAvailability = async (productId, currentStatus) => {
        setSaving(productId);
        try {
            if (supabase) {
                const { error } = await supabase
                    .from('products')
                    .update({ is_available: !currentStatus })
                    .eq('id', productId);

                if (error) throw error;
            }

            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, is_available: !currentStatus } : p
            ));
            showMessage(`Product ${!currentStatus ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error toggling availability:', error);
            showMessage('Error updating: ' + error.message, 'error');
        } finally {
            setSaving(null);
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

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                            <Box className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-gray-400">Total Products</p>
                        </div>
                    </div>
                </div>
                <div
                    className={`bg-gray-800 rounded-xl p-4 border cursor-pointer transition-colors ${filter === 'low' ? 'border-yellow-500 bg-yellow-600/10' : 'border-gray-700 hover:border-yellow-500/50'
                        }`}
                    onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
                            <p className="text-sm text-gray-400">Low Stock</p>
                        </div>
                    </div>
                </div>
                <div
                    className={`bg-gray-800 rounded-xl p-4 border cursor-pointer transition-colors ${filter === 'out' ? 'border-red-500 bg-red-600/10' : 'border-gray-700 hover:border-red-500/50'
                        }`}
                    onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                            <MinusCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
                            <p className="text-sm text-gray-400">Out of Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Refresh */}
            <div className="flex gap-3">
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
                <button
                    onClick={loadProducts}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Stock</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Quick Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredProducts.map((product) => {
                                const isLow = product.stock_quantity <= (product.low_stock_threshold || 10) && product.stock_quantity > 0;
                                const isOut = product.stock_quantity === 0 || product.is_available === false;

                                return (
                                    <tr key={product.id} className={`transition-colors ${isOut ? 'bg-red-900/10' : isLow ? 'bg-yellow-900/10' : 'hover:bg-gray-700/30'
                                        }`}>
                                        <td className="px-4 py-3">
                                            <span className="font-medium truncate max-w-[200px] block">{product.name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">{product.category}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => updateStock(product.id, product.stock_quantity - 1)}
                                                    disabled={saving === product.id || product.stock_quantity <= 0}
                                                    className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
                                                >
                                                    <MinusCircle className="w-5 h-5 text-red-400" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={product.stock_quantity}
                                                    onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                                                    className={`w-16 px-2 py-1 text-center bg-gray-700 rounded border ${isOut ? 'border-red-500' : isLow ? 'border-yellow-500' : 'border-gray-600'
                                                        }`}
                                                />
                                                <button
                                                    onClick={() => updateStock(product.id, product.stock_quantity + 1)}
                                                    disabled={saving === product.id}
                                                    className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
                                                >
                                                    <PlusCircle className="w-5 h-5 text-green-400" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${isOut ? 'bg-red-600/20 text-red-400' :
                                                    isLow ? 'bg-yellow-600/20 text-yellow-400' :
                                                        'bg-green-600/20 text-green-400'
                                                }`}>
                                                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleAvailability(product.id, product.is_available)}
                                                disabled={saving === product.id}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${product.is_available !== false
                                                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                                    }`}
                                            >
                                                {saving === product.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin inline" />
                                                ) : product.is_available !== false ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryManager;
