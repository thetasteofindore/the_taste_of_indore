import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';
import { Search, Filter } from 'lucide-react';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');

    const categories = ['All', 'Sev'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getAllProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let result = [...products];

        // Filter by Category
        if (selectedCategory !== 'All') {
            if (selectedCategory === 'Sev') {
                // Show both Sev and Namkeen under "Sev" category
                result = result.filter(p => p.category === 'Sev' || p.category === 'Namkeen');
            } else {
                result = result.filter(p => p.category === selectedCategory);
            }
        }

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, searchQuery, sortBy]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-secondary)] mb-2">Shop Our Delicacies</h1>
                    <p className="text-[var(--color-text-muted)]">Authentic flavors delivered to you</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="default">Sort By: Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>

            {/* Categories Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
              px-6 py-2 rounded-full whitespace-nowrap transition-colors font-medium
              ${selectedCategory === cat
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-white text-[var(--color-secondary)] border border-gray-200 hover:bg-gray-50'}
            `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            ) : (
                <>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-500">No products found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="mt-4 text-[var(--color-primary)] font-medium hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Shop;
