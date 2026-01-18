import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Download, Eye, X, Loader2, ShoppingBag, Phone, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CustomerDatabase = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Load customers
    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            if (supabase) {
                // Get customers with order stats
                const { data: customersData, error: customersError } = await supabase
                    .from('customers')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (customersError) throw customersError;

                // Get order stats per customer
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('customer_phone, total');

                if (ordersError) throw ordersError;

                // Calculate stats
                const orderStats = {};
                ordersData?.forEach(order => {
                    if (!orderStats[order.customer_phone]) {
                        orderStats[order.customer_phone] = { count: 0, total: 0 };
                    }
                    orderStats[order.customer_phone].count++;
                    orderStats[order.customer_phone].total += parseFloat(order.total) || 0;
                });

                // Merge stats with customers
                const enrichedCustomers = customersData?.map(customer => ({
                    ...customer,
                    order_count: orderStats[customer.phone]?.count || 0,
                    total_spent: orderStats[customer.phone]?.total || 0
                })) || [];

                setCustomers(enrichedCustomers);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // Load customer orders
    const loadCustomerOrders = async (phone) => {
        setLoadingOrders(true);
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('customer_phone', phone)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCustomerOrders(data || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setCustomerOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    // View customer details
    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        loadCustomerOrders(customer.phone);
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Phone', 'Name', 'Address', 'Orders', 'Total Spent (AED)', 'Joined'];
        const rows = customers.map(c => [
            c.phone,
            c.name || '',
            c.address || '',
            c.order_count,
            c.total_spent.toFixed(2),
            new Date(c.created_at).toLocaleDateString()
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        const query = searchQuery.toLowerCase();
        return (
            customer.phone?.toLowerCase().includes(query) ||
            customer.name?.toLowerCase().includes(query) ||
            customer.address?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Customer Database ({customers.length})
                </h3>
                <button
                    onClick={exportToCSV}
                    disabled={customers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by phone, name, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                />
            </div>

            {/* Empty State */}
            {customers.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                    <Users className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No customers yet</p>
                    <p className="text-sm text-gray-500 mt-2">Customers will appear here when they place orders</p>
                </div>
            ) : (
                /* Customers Table */
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Phone</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Orders</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Total Spent</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{customer.name || 'Anonymous'}</p>
                                                <p className="text-sm text-gray-400 truncate max-w-[200px]">
                                                    {customer.address || 'No address'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{customer.phone}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                                                {customer.order_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-green-400">
                                            AED {customer.total_spent.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-400">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleViewCustomer(customer)}
                                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4 text-blue-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[80vh] overflow-y-auto"
                        >
                            {/* Customer Info */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-xl">{selectedCustomer.name || 'Anonymous Customer'}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {selectedCustomer.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Joined {new Date(selectedCustomer.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {selectedCustomer.address && (
                                        <p className="flex items-center gap-1 mt-2 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            {selectedCustomer.address}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 rounded-lg hover:bg-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-sm text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-blue-400">{selectedCustomer.order_count}</p>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-sm text-gray-400">Total Spent</p>
                                    <p className="text-2xl font-bold text-green-400">AED {selectedCustomer.total_spent.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Order History */}
                            <h5 className="font-bold mb-3 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Order History
                            </h5>

                            {loadingOrders ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No orders yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {customerOrders.map((order) => (
                                        <div key={order.id} className="bg-gray-700/30 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {new Date(order.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-400">AED {order.total}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                                                            order.status === 'confirmed' ? 'bg-blue-600/20 text-blue-400' :
                                                                'bg-yellow-600/20 text-yellow-400'
                                                        }`}>
                                                        {order.status || 'pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {Array.isArray(order.items) ? (
                                                    order.items.map((item, idx) => (
                                                        <span key={idx}>
                                                            {item.name} x{item.quantity}
                                                            {idx < order.items.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span>Order items</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDatabase;
