import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { Star, ShoppingCart, ArrowLeft, Truck, ShieldCheck, PenTool, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '../services/reviewService';
import Input from '../components/Input';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ name: '', comment: '', rating: 5 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await productService.getProductById(id);
                setProduct(productData);

                // Set initial image
                if (productData.images && productData.images.length > 0) {
                    setActiveImage(productData.images[0]);
                } else {
                    setActiveImage(productData.image);
                }

                // Set initial variant
                if (productData.variants && productData.variants.length > 0) {
                    setSelectedVariant(productData.variants[0]);
                }

                // Set initial quantity
                setQuantity(productData.minOrderQuantity || 1);

                // Fetch reviews
                const reviewData = await reviewService.getAllReviews(id);
                setReviews(reviewData);

            } catch (error) {
                console.error('Error fetching data:', error);
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleAddToCart = () => {
        const minQty = product.minOrderQuantity || 1;
        const maxQty = product.maxOrderQuantity || 999;

        if (quantity < minQty) {
            alert(`Minimum order quantity is ${minQty}`);
            return;
        }
        if (quantity > maxQty) {
            alert(`Maximum order quantity is ${maxQty}`);
            return;
        }

        const itemToAdd = {
            ...product,
            id: selectedVariant ? `${product.id}-${selectedVariant.weight}` : product.id,
            price: selectedVariant ? selectedVariant.price : product.price,
            weight: selectedVariant ? selectedVariant.weight : null,
            image: activeImage || product.image,
            minOrderQuantity: minQty,
            maxOrderQuantity: maxQty
        };
        addToCart(itemToAdd, quantity);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewService.addReview({
                ...reviewForm,
                productId: id,
                productName: product.name
            });
            alert('Thank you for your review!');
            setShowReviewModal(false);
            setReviewForm({ name: '', comment: '', rating: 5 });
            const newReviews = await reviewService.getAllReviews(id);
            setReviews(newReviews);
            // Refetch product to update rating/count in UI
            const updatedProduct = await productService.getProductById(id);
            setProduct(updatedProduct);
        } catch (error) {
            console.error(error);
            alert('Failed to submit review');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (!product) return null;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Shop
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-4"
                >
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)]">
                        <div className="aspect-square overflow-hidden rounded-xl bg-gray-50">
                            <img
                                src={activeImage || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                    {/* Image Gallery */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="mb-2 text-[var(--color-primary)] font-medium uppercase tracking-wide">
                        {product.category}
                    </div>
                    <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-4 font-heading">
                        {product.name}
                    </h1>

                    <div className="flex items-center mb-6">
                        <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                    className={i < Math.floor(product.rating) ? "" : "text-gray-300"}
                                />
                            ))}
                        </div>
                        <span className="text-[var(--color-text-muted)]">
                            ({product.reviews} reviews)
                        </span>
                    </div>

                    <div className="text-3xl font-bold text-[var(--color-secondary)] mb-6">
                        ₹{currentPrice}
                    </div>

                    {/* Variants Selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                Select Weight
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((variant, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedVariant === variant
                                            ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)] font-medium'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {variant.weight}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-[var(--color-text-main)] text-lg leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center border border-[var(--color-border)] rounded-md">
                            <button
                                className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() => setQuantity(Math.max((product.minOrderQuantity || 1), quantity - 1))}
                                disabled={quantity <= (product.minOrderQuantity || 1)}
                            >
                                -
                            </button>
                            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                            <button
                                className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() => setQuantity(Math.min((product.maxOrderQuantity || 999), quantity + 1))}
                                disabled={product.maxOrderQuantity && quantity >= product.maxOrderQuantity}
                            >
                                +
                            </button>
                        </div>
                        <Button
                            size="lg"
                            className="flex-grow rounded-full shadow-lg shadow-orange-200"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2" />
                            Add to Cart
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Truck className="text-[var(--color-primary)] mr-3" size={24} />
                            <div>
                                <div className="font-bold text-sm">Fast Delivery</div>
                                <div className="text-xs text-gray-500">Within 2-3 days</div>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <ShieldCheck className="text-[var(--color-primary)] mr-3" size={24} />
                            <div>
                                <div className="font-bold text-sm">Quality Assured</div>
                                <div className="text-xs text-gray-500">Authentic Taste</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-[var(--color-secondary)]">Customer Reviews</h2>
                    <Button variant="outline" onClick={() => setShowReviewModal(true)}>
                        <PenTool size={16} className="mr-2" /> Write a Review
                    </Button>
                </div>

                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review, index) => (
                            <div key={review.id || index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-bold text-[var(--color-secondary)]">{review.name}</div>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < Math.floor(review.rating) ? "currentColor" : "none"}
                                                className={i < Math.floor(review.rating) ? "" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{review.comment}"</p>
                                <div className="text-xs text-gray-400 mt-4">
                                    {review.date ? new Date(review.date).toLocaleDateString() : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                        <Button variant="outline" onClick={() => setShowReviewModal(true)}>
                            Write a Review
                        </Button>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                        >
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">Write a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <Input
                                    label="Your Name"
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Your Review</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                                        rows={4}
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">Submit Review</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
