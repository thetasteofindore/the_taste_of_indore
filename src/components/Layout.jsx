import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-[var(--color-secondary)] text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-6 mb-6">
                        <a href="/privacy-policy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a>
                        <a href="/shipping-policy" className="hover:text-[var(--color-primary)] transition-colors">Shipping Policy</a>
                        <a href="/terms-conditions" className="hover:text-[var(--color-primary)] transition-colors">Terms & Conditions</a>
                        <a href="/return-policy" className="hover:text-[var(--color-primary)] transition-colors">Return Policy</a>
                        <a href="/refund-policy" className="hover:text-[var(--color-primary)] transition-colors">Refund Policy</a>
                    </div>
                    <div className="text-center">
                        <p>&copy; {new Date().getFullYear()} The Taste Of Indore. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
