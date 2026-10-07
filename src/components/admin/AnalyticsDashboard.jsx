import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package, Users, DollarSign, ShoppingCart, Loader2, Calendar, RefreshCw } from 'lucide-react';
import { loadAdminRecords, reportStartDate } from '../../lib/adminRecords';
import { summarizeOrders } from '../../lib/orderReports';

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [dateRange, setDateRange] = useState('7'); // days
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        topProducts: [],
        recentOrders: [],
        ordersByDay: []
    });

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const orders = await loadAdminRecords('orders', { startDate: reportStartDate(dateRange) });
            setStats(summarizeOrders(orders));
        } catch (error) {
            setErrorMessage(error.message || 'Could not load order reports.');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const formatCurrency = (amount) => `AED ${parseFloat(amount).toFixed(2)}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {errorMessage && <p role="alert" className="rounded-xl bg-red-950 p-4 text-red-200">{errorMessage}</p>}
            <p className="text-sm text-gray-400">Order requests are recorded at checkout. Sales totals include confirmed and delivered orders. Dates use Abu Dhabi time.</p>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        aria-label="Report period" className="min-h-11 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                    >
                        <option value="today">Today (Abu Dhabi)</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                        <option value="all">All time</option>
                    </select>
                    <button
                        onClick={loadAnalytics}
                        aria-label="Refresh reports" className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-700/50"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-600/30 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Confirmed sales</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-700/50"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Order requests</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{stats.totalOrders}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-700/50"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Avg confirmed order</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.averageOrderValue)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-700/50"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-600/30 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Customers</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{stats.totalCustomers}</p>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-400" />
                        Top Selling Products
                    </h4>
                    {stats.topProducts.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-sm flex items-center justify-center font-bold">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{product.name}</p>
                                        <p className="text-sm text-gray-400">{product.quantity} sold</p>
                                    </div>
                                    <span className="text-green-400 font-medium">{formatCurrency(product.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders by Day */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Orders by Day
                    </h4>
                    {stats.ordersByDay.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No order data yet</p>
                    ) : (
                        <div className="space-y-2">
                            {stats.ordersByDay.map((day) => {
                                const maxOrders = Math.max(...stats.ordersByDay.map(d => d.orders));
                                const widthPercent = (day.orders / maxOrders) * 100;

                                return (
                                    <div key={day.day} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400 w-20">{day.day}</span>
                                        <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${widthPercent}%` }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                                            >
                                                <span className="text-xs font-bold">{day.orders}</span>
                                            </motion.div>
                                        </div>
                                        <span className="text-xs text-green-400 w-20 text-right">{formatCurrency(day.revenue)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Recent Orders
                </h4>
                {stats.recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                                    <th className="pb-2">Customer</th>
                                    <th className="pb-2">Amount</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-700/50">
                                        <td className="py-3">
                                            <p className="font-medium">{order.customer_name || 'Guest'}</p>
                                            <p className="text-xs text-gray-400">{order.customer_phone}</p>
                                        </td>
                                        <td className="py-3 text-green-400">{formatCurrency(order.total)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                                                    order.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                                                        'bg-blue-600/20 text-blue-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString('en-AE', { timeZone: 'Asia/Dubai' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
