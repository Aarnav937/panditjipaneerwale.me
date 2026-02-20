import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Plus, Edit2, Trash2, Check, Home, Briefcase, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADDRESS_ICONS = {
    'Home': Home,
    'Work': Briefcase,
    'Other': Building
};

const AddressManager = ({ isOpen, onClose, onSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        address: '',
        is_default: false
    });

    // Load addresses
    const loadAddresses = useCallback(async () => {
        setLoading(true);
        const phone = localStorage.getItem('customerPhone');

        // Load from localStorage first
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            setAddresses(JSON.parse(saved));
        }

        // Try to sync with Supabase
        if (phone && supabase) {
            try {
                const { data, error } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('customer_phone', phone)
                    .order('is_default', { ascending: false });

                if (!error && data && data.length > 0) {
                    setAddresses(data);
                    localStorage.setItem('savedAddresses', JSON.stringify(data));
                }
            } catch (error) {
                console.warn('Address sync failed:', error);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadAddresses();
        }
    }, [isOpen, loadAddresses]);

    // Save address
    const saveAddress = async (addressData, isNew = false) => {
        const phone = localStorage.getItem('customerPhone');

        if (isNew) {
            const newAddr = {
                ...addressData,
                id: Date.now().toString(),
                customer_phone: phone
            };

            // If setting as default, clear other defaults
            let updatedAddresses = addresses.map(a =>
                addressData.is_default ? { ...a, is_default: false } : a
            );
            updatedAddresses.push(newAddr);

            setAddresses(updatedAddresses);
            localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));

            // Sync with Supabase
            if (phone && supabase) {
                try {
                    if (addressData.is_default) {
                        await supabase
                            .from('addresses')
                            .update({ is_default: false })
                            .eq('customer_phone', phone);
                    }
                    await supabase
                        .from('addresses')
                        .insert([{ ...addressData, customer_phone: phone }]);
                } catch (error) {
                    console.warn('Address save failed:', error);
                }
            }
        } else {
            // Update existing
            let updatedAddresses = addresses.map(a => {
                if (a.id === addressData.id) return addressData;
                if (addressData.is_default) return { ...a, is_default: false };
                return a;
            });

            setAddresses(updatedAddresses);
            localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));

            if (phone && supabase) {
                try {
                    if (addressData.is_default) {
                        await supabase
                            .from('addresses')
                            .update({ is_default: false })
                            .eq('customer_phone', phone);
                    }
                    await supabase
                        .from('addresses')
                        .update(addressData)
                        .eq('id', addressData.id);
                } catch (error) {
                    console.warn('Address update failed:', error);
                }
            }
        }

        setIsAddingNew(false);
        setEditingAddress(null);
        setNewAddress({ label: 'Home', address: '', is_default: false });
    };

    // Delete address
    const deleteAddress = async (addressId) => {
        const phone = localStorage.getItem('customerPhone');
        const updatedAddresses = addresses.filter(a => a.id !== addressId);

        setAddresses(updatedAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));

        if (phone && supabase) {
            try {
                await supabase
                    .from('addresses')
                    .delete()
                    .eq('id', addressId);
            } catch (error) {
                console.warn('Address delete failed:', error);
            }
        }
    };

    // Select address
    const handleSelect = (address) => {
        onSelect(address.address);
        onClose();
    };

    const getIcon = (label) => {
        const Icon = ADDRESS_ICONS[label] || MapPin;
        return <Icon className="w-5 h-5" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-gray-900 z-50 rounded-t-3xl shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <MapPin className="text-blue-500 w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Add New Button */}
                            {!isAddingNew && (
                                <button
                                    onClick={() => setIsAddingNew(true)}
                                    className="w-full mb-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add New Address
                                </button>
                            )}

                            {/* Add New Form */}
                            <AnimatePresence>
                                {isAddingNew && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4"
                                    >
                                        <h4 className="font-bold mb-3">New Address</h4>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                {['Home', 'Work', 'Other'].map(label => (
                                                    <button
                                                        key={label}
                                                        onClick={() => setNewAddress({ ...newAddress, label })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newAddress.label === label
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                placeholder="Enter full address..."
                                                value={newAddress.address}
                                                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                            />
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newAddress.is_default}
                                                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Set as default address</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => saveAddress(newAddress, true)}
                                                    disabled={!newAddress.address.trim()}
                                                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingNew(false);
                                                        setNewAddress({ label: 'Home', address: '', is_default: false });
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Address List */}
                            {addresses.length === 0 && !isAddingNew ? (
                                <div className="text-center py-12 text-gray-500">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No saved addresses</p>
                                    <p className="text-sm">Add an address for faster checkout</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${address.is_default
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                }`}
                                            onClick={() => handleSelect(address)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${address.is_default
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {getIcon(address.label)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 dark:text-white">{address.label}</span>
                                                        {address.is_default && (
                                                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.address}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAddress(address);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteAddress(address.id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddressManager;
