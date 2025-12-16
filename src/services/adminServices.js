import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// Categories
export const categoryService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'categories'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting categories: ", error);
            return [];
        }
    },
    add: async (category) => {
        try {
            const docRef = await addDoc(collection(db, 'categories'), category);
            return { id: docRef.id, ...category };
        } catch (error) {
            console.error("Error adding category: ", error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, 'categories', id));
        } catch (error) {
            console.error("Error deleting category: ", error);
            throw error;
        }
    }
};

// Banners
export const bannerService = {
    getAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'banners'));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting banners: ", error);
            return [];
        }
    },
    add: async (banner) => {
        try {
            const docRef = await addDoc(collection(db, 'banners'), banner);
            return { id: docRef.id, ...banner };
        } catch (error) {
            console.error("Error adding banner: ", error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, 'banners', id));
        } catch (error) {
            console.error("Error deleting banner: ", error);
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            await setDoc(doc(db, 'banners', id), data, { merge: true });
        } catch (error) {
            console.error("Error updating banner: ", error);
            throw error;
        }
    }
};

// Shipping Rates
export const shippingService = {
    getRates: async () => {
        try {
            const docRef = doc(db, 'config', 'shipping');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return {};
        } catch (error) {
            console.error("Error getting shipping rates: ", error);
            return {};
        }
    },
    saveRates: async (rates) => {
        try {
            await setDoc(doc(db, 'config', 'shipping'), rates);
        } catch (error) {
            console.error("Error saving shipping rates: ", error);
            throw error;
        }
    }
};

// Content (About Us)
// Content (About Us)
export const contentService = {
    getAbout: async () => {
        try {
            const docRef = doc(db, 'content', 'about');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data(); // Return full object { text, images }
            } else {
                return { text: '', images: [] };
            }
        } catch (error) {
            console.error("Error getting about content: ", error);
            return { text: '', images: [] };
        }
    },
    updateAbout: async (data) => {
        try {
            await setDoc(doc(db, 'content', 'about'), data);
            return data;
        } catch (error) {
            console.error("Error updating about content: ", error);
            throw error;
        }
    }
};

// Payment Settings
export const paymentService = {
    getSettings: async () => {
        try {
            const docRef = doc(db, 'config', 'payment');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return { upiId: '', qrCode: '', customLink: '' };
        } catch (error) {
            console.error("Error getting payment settings: ", error);
            return { upiId: '', qrCode: '', customLink: '' };
        }
    },
    saveSettings: async (settings) => {
        try {
            await setDoc(doc(db, 'config', 'payment'), settings);
        } catch (error) {
            console.error("Error saving payment settings: ", error);
            throw error;
        }
    }
};

// Branding Settings
export const brandingService = {
    getSettings: async () => {
        try {
            const docRef = doc(db, 'config', 'branding');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return { favicon: '' };
        } catch (error) {
            console.error("Error getting branding settings: ", error);
            return { favicon: '' };
        }
    },
    saveSettings: async (settings) => {
        try {
            await setDoc(doc(db, 'config', 'branding'), settings);
        } catch (error) {
            console.error("Error saving branding settings: ", error);
            throw error;
        }
    }
};

// Start of Policy Service
export const policyService = {
    getPolicy: async (type) => {
        try {
            const docRef = doc(db, 'content', 'policies');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data[type] || '';
            }
            return '';
        } catch (error) {
            console.error("Error getting policy: ", error);
            return '';
        }
    },
    savePolicy: async (type, content) => {
        try {
            const docRef = doc(db, 'content', 'policies');
            // We use setDoc with merge: true to not overwrite other policies
            await setDoc(docRef, { [type]: content }, { merge: true });
        } catch (error) {
            console.error("Error saving policy: ", error);
            throw error;
        }
    },
    getAllPolicies: async () => {
        try {
            const docRef = doc(db, 'content', 'policies');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return {};
        } catch (error) {
            console.error("Error getting all policies: ", error);
            return {};
        }
    }
};

