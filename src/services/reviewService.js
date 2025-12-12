import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc } from 'firebase/firestore';

export const reviewService = {
    getAllReviews: async (productId = null) => {
        try {
            let q;
            if (productId) {
                // Filter by Product ID
                // Note: Removing orderBy('date', 'desc') from query to avoid needing a composite index
                q = query(
                    collection(db, 'reviews'),
                    where('productId', '==', productId)
                );
            } else {
                // Return all for home page (or global list)
                q = query(collection(db, 'reviews'), orderBy('date', 'desc'), limit(6));
            }
            const querySnapshot = await getDocs(q);
            const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side sort if productId was used
            if (productId) {
                reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            return reviews;
        } catch (error) {
            console.error("Error getting reviews: ", error);
            // Fallback for demo if DB fails or empty
            return [];
        }
    },

    addReview: async (reviewData) => {
        try {
            // 1. Add review to 'reviews' collection
            const docRef = await addDoc(collection(db, 'reviews'), {
                ...reviewData,
                date: new Date().toISOString(),
                status: 'pending'
            });

            // 2. Update Product Rating & Count
            if (reviewData.productId) {
                const productRef = doc(db, 'products', reviewData.productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const product = productSnap.data();
                    const currentRating = Number(product.rating) || 0;
                    const currentReviews = Number(product.reviews) || 0;
                    const newRatingValue = Number(reviewData.rating) || 5;

                    // Calculate new weighted average
                    const newRating = ((currentRating * currentReviews) + newRatingValue) / (currentReviews + 1);

                    await updateDoc(productRef, {
                        rating: parseFloat(newRating.toFixed(1)),
                        reviews: currentReviews + 1
                    });
                }
            }

            return { id: docRef.id, ...reviewData };
        } catch (error) {
            console.error("Error adding review: ", error);
            throw error;
        }
    }
};
