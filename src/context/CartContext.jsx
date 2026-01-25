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
                const newQuantity = existingItem.quantity + quantity;
                const maxQty = product.maxOrderQuantity || 999;

                if (newQuantity > maxQty) {
                    alert(`Cannot add more. Maximum allowed quantity is ${maxQty}`);
                    return prevCart;
                }

                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                const minQty = product.minOrderQuantity || 1;
                const maxQty = product.maxOrderQuantity || 999;

                let initialQty = Math.max(quantity, minQty);
                if (initialQty > maxQty) {
                    alert(`Cannot add. Maximum allowed quantity is ${maxQty}`);
                    return prevCart;
                }

                return [...prevCart, { ...product, quantity: initialQty }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        const minQty = item.minOrderQuantity || 1;
        const maxQty = item.maxOrderQuantity || 999;

        if (quantity < minQty) return;
        if (quantity > maxQty) {
            alert(`Maximum quantity allows is ${maxQty}`);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
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
