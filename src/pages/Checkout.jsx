import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { shippingService, paymentService } from '../services/adminServices';
import Button from '../components/Button';
import Input from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { CONFIG } from '../utils/config';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [shippingRates, setShippingRates] = useState({});
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [paymentConfig, setPaymentConfig] = useState({ upiId: CONFIG.UPI_ID, qrCode: '' });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: '',
        city: 'Indore',
        state: '',
        pincode: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
        fetchShippingRates();
        fetchPaymentSettings();
    }, [user]);

    // Recalculate delivery fee when state changes
    useEffect(() => {
        if (formData.state && shippingRates[formData.state]) {
            setDeliveryFee(shippingRates[formData.state]);
        } else {
            setDeliveryFee(CONFIG.SHIPPING_COST); // Default fallback
        }
    }, [formData.state, shippingRates]);

    const fetchAddresses = async () => {
        if (user?.id || user?.uid) {
            const addresses = await authService.getAddresses(user.uid || user.id);
            setSavedAddresses(addresses);
        }
    };

    const fetchShippingRates = async () => {
        const rates = await shippingService.getRates();
        setShippingRates(rates);
    };

    const fetchPaymentSettings = async () => {
        const settings = await paymentService.getSettings();
        if (settings && settings.upiId) {
            setPaymentConfig(settings);
        }
    };

    // Logic: If total > threshold, free shipping? 
    // Or does state-based fee override free shipping?
    // Let's assume state-based fee applies always if configured, otherwise default logic.
    // If state fee is found, use it. If not, check free shipping threshold.

    const calculateShipping = () => {
        if (formData.state && shippingRates[formData.state] !== undefined) {
            return shippingRates[formData.state];
        }
        return total >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
    };

    const finalShippingCost = calculateShipping();
    const finalTotal = total + finalShippingCost;

    if (cart.length === 0) {
        // navigate('/shop'); // Causing render loop if called directly in body
        // return null;
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAddressSelect = (addr) => {
        setFormData({
            ...formData,
            address: addr.address,
            city: addr.city,
            state: addr.state || '', // Ensure state is captured if saved
            pincode: addr.pincode,
            phone: addr.phone || formData.phone,
            name: addr.name || formData.name
        });
        setShowAddressModal(false);
    };

    const handleSaveAddress = async () => {
        if (user?.id || user?.uid) {
            await authService.saveAddress(user.uid || user.id, formData);
            fetchAddresses();
            alert('Address saved to your profile!');
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (paymentMethod === 'upi') {
            setShowUpiModal(true);
        } else {
            processOrder();
        }
    };

    const processOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                customer: user?.name || formData.name,
                email: user?.email || formData.email,
                total: finalTotal,
                subtotal: total,
                shippingCost: finalShippingCost,
                items: cart.length,
                cartItems: cart,
                shippingAddress: formData,
                paymentMethod: paymentMethod,
                paymentReference: paymentReference || null,
                status: 'Pending',
                date: new Date().toLocaleDateString()
            };

            const orderRef = await orderService.createOrder(orderData);

            clearCart();
            navigate('/order-success', { state: { orderId: orderRef.id, total: finalTotal } });
        } catch (error) {
            console.error('Order placement failed:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpiPayment = () => {
        if (paymentConfig.customLink) {
            window.open(paymentConfig.customLink, '_blank');
        } else {
            window.open(`upi://pay?pa=${paymentConfig.upiId}&pn=TheTasteOfIndore&am=${finalTotal}&cu=INR`, '_blank');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[var(--color-secondary)] mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Step 1: Shipping Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] mb-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[var(--color-secondary)]">Shipping Information</h2>
                            {user && savedAddresses.length > 0 && (
                                <Button size="sm" variant="outline" onClick={() => setShowAddressModal(true)}>
                                    Select Saved Address
                                </Button>
                            )}
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                id="phone"
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                id="address"
                                label="Address"
                                className="md:col-span-2"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                id="city"
                                label="City"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">State</label>
                                <select
                                    id="state"
                                    className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none bg-white"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(shippingRates).length > 0 ? (
                                        Object.keys(shippingRates).map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <Input
                                id="pincode"
                                label="Pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                required
                            />
                        </form>
                        {user && (
                            <div className="mt-4">
                                <button
                                    onClick={handleSaveAddress}
                                    className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                                >
                                    Save this address for future
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Step 2: Payment Method */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]"
                    >
                        <h2 className="text-xl font-bold text-[var(--color-secondary)] mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[var(--color-primary)] bg-orange-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                    className="mr-3 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="font-medium">Cash on Delivery (COD)</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-[var(--color-primary)] bg-orange-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                    className="mr-3 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="font-medium">UPI (Google Pay / PhonePe)</span>
                            </label>
                        </div>
                    </motion.div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] sticky top-24">
                        <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-6">Order Summary</h3>

                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} {item.weight && `(${item.weight})`} x {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                <span>Shipping {formData.state && `(${formData.state})`}</span>
                                <span>{finalShippingCost === 0 ? 'Free' : `₹${finalShippingCost}`}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-[var(--color-secondary)] pt-2">
                                <span>Total</span>
                                <span>₹{finalTotal}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handlePlaceOrder}
                            isLoading={loading}
                        >
                            Place Order
                        </Button>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                        >
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-4">Select Address</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {savedAddresses.map((addr, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleAddressSelect(addr)}
                                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[var(--color-primary)] hover:bg-orange-50 transition-colors"
                                    >
                                        <div className="flex items-start">
                                            <MapPin size={18} className="text-[var(--color-primary)] mr-2 mt-1" />
                                            <div>
                                                <div className="font-bold">{addr.name}</div>
                                                <div className="text-sm text-gray-600">{addr.address}</div>
                                                <div className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</div>
                                                <div className="text-sm text-gray-500 mt-1">{addr.phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {savedAddresses.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No saved addresses found.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UPI Payment Modal */}
            <AnimatePresence>
                {showUpiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                        >
                            <button
                                onClick={() => setShowUpiModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-4">UPI Payment</h3>
                            <p className="text-gray-600 mb-6">
                                Please complete the payment using your preferred UPI app.
                            </p>

                            {paymentConfig.qrCode && (
                                <div className="mb-6 flex justify-center">
                                    <img
                                        src={paymentConfig.qrCode}
                                        alt="Payment QR Code"
                                        className="w-48 h-48 object-contain border border-gray-200 rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">₹{finalTotal}</div>
                                <div className="text-sm text-gray-500">Amount to Pay</div>
                            </div>

                            <Button onClick={handleUpiPayment} className="w-full mb-4">
                                Pay Now
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">After Payment</span>
                                </div>
                            </div>

                            <Input
                                label="Payment Reference / Transaction ID"
                                placeholder="Enter 12-digit UTR/Ref No."
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                className="mb-4"
                            />

                            <Button
                                onClick={processOrder}
                                className="w-full"
                                disabled={!paymentReference}
                            >
                                Confirm Payment & Place Order
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
