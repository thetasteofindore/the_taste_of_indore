import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import Button from './Button';

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-6 border-b border-gray-100 pb-4">
                        <div className="flex justify-between items-start pr-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Order #{order.id.slice(0, 8)}</h2>
                                <p className="text-[var(--color-text-muted)]">Placed on {order.date}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold 
                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                {order.status}
                            </span>
                        </div>
                        {order.status === 'Cancelled' && order.cancellationReason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700 text-sm">
                                <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">Cancellation Reason:</span> {order.cancellationReason}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="flex items-center font-bold text-[var(--color-secondary)] mb-3">
                                <Package size={18} className="mr-2 text-[var(--color-primary)]" />
                                Items
                            </h3>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                {order.cartItems && order.cartItems.length > 0 ? (
                                    order.cartItems.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{item.name} {item.weight && `(${item.weight})`} x {item.quantity}</span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Item details not available for this mock order.</p>
                                )}
                                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{order.subtotal || (order.total - (order.shippingCost || 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span>{order.shippingCost ? `₹${order.shippingCost}` : 'Free'}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>₹{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="flex items-center font-bold text-[var(--color-secondary)] mb-3">
                                    <MapPin size={18} className="mr-2 text-[var(--color-primary)]" />
                                    Shipping Details
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                                    {order.shippingAddress ? (
                                        <>
                                            <p className="font-medium">{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                            <p>Phone: {order.shippingAddress.phone}</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">Shipping details not available.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="flex items-center font-bold text-[var(--color-secondary)] mb-3">
                                    <CreditCard size={18} className="mr-2 text-[var(--color-primary)]" />
                                    Payment Method
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                    <p className="capitalize font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}</p>
                                    {order.paymentReference && (
                                        <p className="text-xs text-gray-500 mt-1">Ref: {order.paymentReference}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
