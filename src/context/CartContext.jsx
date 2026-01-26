import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    // Initialize cart from local storage lazily
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('toi_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error parsing cart from local storage:', error);
            return [];
        }
    });
    const [total, setTotal] = useState(0);

    // Remove the useEffect that loads cart, as we do it in initialization now

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem('toi_cart', JSON.stringify(cart));

        // Calculate total
        const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(newTotal);
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        console.log('Adding to cart:', product, quantity);
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                const max = existingItem.maxQuantity || 100;
                const newQty = Math.min(existingItem.quantity + quantity, max);
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: newQty }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.id === productId) {
                    const min = item.minQuantity || 1;
                    const max = item.maxQuantity || 100;
                    // Ensure we don't go below 0, but min limit is strictly enforced for >0 updates
                    // However, to remove input, we usually handle that in UI. Here we expect valid number.
                    // If quantity is 0, we might want to remove? 
                    // Current logic was: if (quantity < 1) return; which implies min 1.
                    // Let's stick to min limit.
                    const newQty = Math.max(min, Math.min(quantity, max));
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const value = {
        cart,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
