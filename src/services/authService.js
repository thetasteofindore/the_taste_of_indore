import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';

const CURRENT_USER_KEY = 'toi_current_user';

export const authService = {
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role and details from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split('@')[0],
        role: 'customer' // Default
      };

      if (userDoc.exists()) {
        userData = { ...userData, ...userDoc.data() };
      } else {
        // Create user doc if it doesn't exist (e.g. first admin login)
        await setDoc(doc(db, 'users', user.uid), userData);
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        id: user.uid, // Use uid as id for consistency
        uid: user.uid,
        name,
        email,
        role: 'customer',
        createdAt: new Date().toISOString()
      };

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  getAllUsers: async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addUser: async (userData) => {
    // Note: Client SDK cannot create Auth users for others. 
    // This will only create the Firestore record. The user must register to login.
    // In a real app, this would use a Cloud Function.
    const newUserId = `user-${Date.now()}`; // Temporary ID until they register
    await setDoc(doc(db, 'users', newUserId), {
      ...userData,
      id: newUserId,
      createdAt: new Date().toISOString()
    });
    return { id: newUserId, ...userData };
  },

  updateUser: async (id, updates) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, updates);
    return { id, ...updates };
  },

  deleteUser: async (id) => {
    await deleteDoc(doc(db, 'users', id));
  },

  // Address Management
  saveAddress: async (userId, address) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    let currentAddresses = [];
    if (userDoc.exists()) {
      currentAddresses = userDoc.data().addresses || [];
    }

    // Check if address already exists (simple check)
    const exists = currentAddresses.some(a => a.address === address.address && a.pincode === address.pincode);

    if (!exists) {
      const newAddresses = [...currentAddresses, { ...address, id: Date.now() }];
      // Use setDoc with merge: true to create if missing, update if exists
      await setDoc(userRef, { addresses: newAddresses }, { merge: true });
      return newAddresses;
    }
    return currentAddresses;
  },

  getAddresses: async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().addresses || [];
    }
    return [];
  },

  removeAddress: async (userId, addressId) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const addresses = userData.addresses || [];
      const newAddresses = addresses.filter(a => a.id !== addressId);
      await updateDoc(userRef, { addresses: newAddresses });
      return newAddresses;
    }
    return [];
  }
};
