import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, total } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-[var(--color-secondary)] mb-4">Your Cart is Empty</h2>
                <p className="text-[var(--color-text-muted)] mb-8">Looks like you haven't added any delicacies yet.</p>
                <Link to="/shop">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[var(--color-secondary)] mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)] flex gap-4"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-[var(--color-secondary)]">{item.name}</h3>
                                        <p className="text-sm text-[var(--color-text-muted)]">{item.category}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-400 hover:text-[var(--color-danger)] transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center border border-[var(--color-border)] rounded-md">
                                        <button
                                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= (item.minQuantity || 1)}
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                                        <button
                                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= (item.maxQuantity || 100)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="font-bold text-[var(--color-secondary)]">
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] sticky top-24">
                        <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between text-[var(--color-text-muted)]">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-[var(--color-secondary)]">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full justify-between"
                            size="lg"
                            onClick={() => navigate('/checkout')}
                        >
                            <span>Checkout</span>
                            <ArrowRight size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
