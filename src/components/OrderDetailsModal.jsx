import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import Button from './Button';
import ResultModal from './ResultModal';

import { useState } from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
    const [refundLoading, setRefundLoading] = useState(false);
    const [resultModal, setResultModal] = useState({ isOpen: false, type: 'success', title: '', message: '', data: null });

    const handleRefund = async () => {
        if (!window.confirm('Are you sure you want to initiate a full refund for this order?')) return;

        setRefundLoading(true);
        try {
            const response = await fetch('/api/phonepe/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id })
            });
            const data = await response.json();

            if (response.ok) {
                setResultModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Refund Initiated',
                    message: 'Refund ID: ' + data.refundId,
                    data: data
                });
                // Do not close immediately so user can see the modal
            } else {
                setResultModal({
                    isOpen: true,
                    type: 'error',
                    title: 'Refund Failed',
                    message: data.error || 'Server returned an error',
                    data: data
                });
            }
        } catch (error) {
            console.error('Refund Error:', error);
            setResultModal({
                isOpen: true,
                type: 'error',
                title: 'Refund Error',
                message: 'Failed to connect to refund server',
                data: null
            });
        } finally {
            setRefundLoading(false);
        }
    };

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
                    <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Order #{order.id.slice(0, 8)}</h2>
                            <p className="text-[var(--color-text-muted)]">Placed on {order.date}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
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
                                    <p className="capitalize font-medium">
                                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                                            order.paymentMethod === 'phonepe' ? 'PhonePe Online' : 'UPI Payment'}
                                    </p>
                                    {order.paymentReference && (
                                        <p className="text-xs text-gray-500 mt-1">Ref: {order.paymentReference}</p>
                                    )}
                                    {order.paymentId && (
                                        <p className="text-xs text-gray-500 mt-1">Trans ID: {order.paymentId}</p>
                                    )}
                                    <div className="mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            Status: {order.paymentStatus || 'Pending'}
                                        </span>
                                    </div>

                                    {/* Refund Status */}
                                    {order.refundStatus && (
                                        <div className="mt-3 pt-2 border-t border-gray-200">
                                            <p className="text-xs font-bold text-gray-700">Refund: {order.refundStatus}</p>
                                            <p className="text-xs text-gray-500">ID: {order.refundId}</p>
                                            <p className="text-xs text-gray-500">Amt: ₹{order.refundAmount}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            {order.paymentMethod === 'phonepe' && order.paymentStatus === 'Paid' && !order.refundStatus && (
                                <Button
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={handleRefund}
                                    disabled={refundLoading}
                                >
                                    {refundLoading ? 'Processing Refund...' : 'Initiate Full Refund'}
                                </Button>
                            )}
                        </div>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </motion.div>
            </div>

            <ResultModal
                isOpen={resultModal.isOpen}
                onClose={() => setResultModal({ ...resultModal, isOpen: false })}
                type={resultModal.type}
                title={resultModal.title}
                message={resultModal.message}
                data={resultModal.data}
            />
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
