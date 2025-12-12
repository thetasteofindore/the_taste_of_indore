import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { categoryService, bannerService, contentService, shippingService, paymentService, brandingService } from '../../services/adminServices';
import { authService } from '../../services/authService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import { LayoutDashboard, Package, ShoppingBag, Users, Plus, Edit, Trash2, Layers, Image as ImageIcon, FileText, X, MinusCircle, Truck, CreditCard, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [aboutContent, setAboutContent] = useState({ text: '', images: [] });
    const [shippingRates, setShippingRates] = useState({});
    const [paymentSettings, setPaymentSettings] = useState({ upiId: '', qrCode: '', customLink: '' });
    const [brandingSettings, setBrandingSettings] = useState({ favicon: '' });
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Form States
    const [newCategory, setNewCategory] = useState('');
    const [newBanner, setNewBanner] = useState({ title: '', image: '' });
    const [editingBanner, setEditingBanner] = useState(null);
    const [shippingForm, setShippingForm] = useState({ state: '', fee: '' });

    // Product Management States
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Namkeen',
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        variants: [], // Array of { weight, price }
        inStock: true
    });

    // About Content Form State (Local)
    const [aboutForm, setAboutForm] = useState({
        text: '',
        image1: '',
        image2: '',
        image3: '',
        image4: ''
    });

    // User Management States
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'customer' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Sync aboutContent to aboutForm when fetched
        if (aboutContent) {
            const imgs = aboutContent.images || [];
            setAboutForm({
                text: aboutContent.text || '',
                image1: imgs[0] || '',
                image2: imgs[1] || '',
                image3: imgs[2] || '',
                image4: imgs[3] || ''
            });
        }
    }, [aboutContent]);

    const fetchData = async () => {
        try {
            console.log('AdminDashboard: Fetching data...');
            const [p, o, u, c, b, a, s, pay, brand] = await Promise.all([
                productService.getAllProducts(),
                orderService.getAllOrders(),
                authService.getAllUsers(),
                categoryService.getAll(),
                bannerService.getAll(),
                contentService.getAbout(),
                shippingService.getRates(),
                paymentService.getSettings(),
                brandingService.getSettings()
            ]);
            console.log('AdminDashboard: Orders fetched:', o);
            setProducts(p);
            setOrders(o);
            setUsers(u);
            setCategories(c);
            setBanners(b);
            setAboutContent(a || { text: '', images: [] });
            setShippingRates(s || {});
            setPaymentSettings(pay || { upiId: '', qrCode: '', customLink: '' });
            setBrandingSettings(brand || { favicon: '' });
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Product Handlers
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combine separate image fields into array
            const imagesArray = [
                productForm.image1,
                productForm.image2,
                productForm.image3,
                productForm.image4
            ].map(url => url.trim()).filter(url => url);

            const productData = {
                ...productForm,
                price: Number(productForm.price),
                images: imagesArray,
                image: imagesArray[0] || '', // Set main image to first image
                rating: editingProduct ? editingProduct.rating : 0,
                reviews: editingProduct ? editingProduct.reviews : 0
            };

            // Remove temporary fields
            delete productData.image1;
            delete productData.image2;
            delete productData.image3;
            delete productData.image4;

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
                alert('Product updated successfully');
            } else {
                await productService.addProduct(productData);
                alert('Product added successfully');
            }
            setShowProductModal(false);
            setEditingProduct(null);
            resetProductForm();
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            category: 'Namkeen',
            image1: '',
            image2: '',
            image3: '',
            image4: '',
            variants: [],
            inStock: true
        });
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        const images = product.images || (product.image ? [product.image] : []);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image1: images[0] || '',
            image2: images[1] || '',
            image3: images[2] || '',
            image4: images[3] || '',
            variants: product.variants || [],
            inStock: product.inStock
        });
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await productService.deleteProduct(productId);
            fetchData();
        }
    };

    // Variant Handlers
    const addVariant = () => {
        setProductForm({
            ...productForm,
            variants: [...productForm.variants, { weight: '', price: '' }]
        });
    };

    const removeVariant = (index) => {
        const newVariants = [...productForm.variants];
        newVariants.splice(index, 1);
        setProductForm({ ...productForm, variants: newVariants });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...productForm.variants];
        newVariants[index][field] = value;
        setProductForm({ ...productForm, variants: newVariants });
    };

    // Category Handlers
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory) return;
        const added = await categoryService.add({ name: newCategory, description: '' });
        setCategories([...categories, added]);
        setNewCategory('');
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            await categoryService.delete(id);
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    // Banner Handlers
    const handleSaveBanner = async (e) => {
        e.preventDefault();
        if (!newBanner.image) return;

        if (editingBanner) {
            await bannerService.update(editingBanner.id, {
                title: newBanner.title,
                image: newBanner.image
            });
            alert('Banner updated');
        } else {
            await bannerService.add({
                title: newBanner.title || 'New Banner',
                image: newBanner.image,
                active: true
            });
            alert('Banner added');
        }
        setNewBanner({ title: '', image: '' });
        setEditingBanner(null);
        fetchData();
    };

    const handleEditBanner = (banner) => {
        setEditingBanner(banner);
        setNewBanner({ title: banner.title || '', image: banner.image });
    };

    const handleDeleteBanner = async (id) => {
        if (window.confirm('Delete this banner?')) {
            await bannerService.delete(id);
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    // Shipping Handlers
    const handleSaveShippingRate = async (e) => {
        e.preventDefault();
        if (!shippingForm.state || !shippingForm.fee) return;

        const updatedRates = {
            ...shippingRates,
            [shippingForm.state]: Number(shippingForm.fee)
        };

        await shippingService.saveRates(updatedRates);
        setShippingRates(updatedRates);
        setShippingForm({ state: '', fee: '' });
        alert('Shipping rate saved');
    };

    const handleDeleteShippingRate = async (state) => {
        if (window.confirm(`Delete shipping rate for ${state}?`)) {
            const updatedRates = { ...shippingRates };
            delete updatedRates[state];
            await shippingService.saveRates(updatedRates);
            setShippingRates(updatedRates);
        }
    };

    // Content Handlers
    const handleUpdateContent = async () => {
        const imagesArray = [
            aboutForm.image1,
            aboutForm.image2,
            aboutForm.image3,
            aboutForm.image4
        ].map(url => url.trim()).filter(url => url);

        await contentService.updateAbout({
            text: aboutForm.text,
            images: imagesArray
        });
        alert('Content updated successfully!');
        fetchData();
    };

    // User Management Handlers
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await authService.updateUser(editingUser.id, userForm);
                alert('User updated successfully');
            } else {
                await authService.addUser(userForm);
                alert('User created successfully');
            }
            setShowUserModal(false);
            setEditingUser(null);
            setUserForm({ name: '', email: '', password: '', role: 'customer' });
            fetchData(); // Refresh list
        } catch (error) {
            alert(error.message);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserForm({ name: user.name, email: user.email, password: user.password, role: user.role });
        setShowUserModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await authService.deleteUser(userId);
            fetchData();
        }
    };

    const handleCreateTestOrder = async () => {
        const testOrder = {
            customer: 'Test Admin Order',
            email: 'admin@test.com',
            total: 999,
            items: 1,
            cartItems: [{ id: 'test-1', name: 'Test Item', price: 999, quantity: 1 }],
            shippingAddress: { name: 'Admin Tester', address: 'Test Lab', city: 'Debug City', pincode: '000000', phone: '9999999999' },
            paymentMethod: 'cod'
        };
        await orderService.createOrder(testOrder);
        alert('Test Order Created! Refreshing...');
        fetchData();
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        let reason = null;
        if (newStatus === 'Cancelled') {
            reason = window.prompt("Please enter a reason for cancellation:", "Out of stock / Request denied");
            if (!reason) return; // Cancel update if no reason provided
        }
        await orderService.updateOrderStatus(orderId, newStatus, reason);
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus, cancellationReason: reason } : o);
        setOrders(updatedOrders);
    };

    const renderSidebar = () => (
        <div className="w-64 bg-white border-r border-[var(--color-border)] min-h-[calc(100vh-64px)] p-4">
            <div className="space-y-2">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'products', icon: Package, label: 'Products' },
                    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
                    { id: 'users', icon: Users, label: 'Users' },
                    { id: 'categories', icon: Layers, label: 'Categories' },
                    { id: 'banners', icon: ImageIcon, label: 'Banners' },
                    { id: 'shipping', icon: Truck, label: 'Shipping' },
                    { id: 'content', icon: FileText, label: 'Content' },
                    { id: 'payment', icon: CreditCard, label: 'Payment' },
                    { id: 'branding', icon: Palette, label: 'Branding' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-gray-100 text-[var(--color-secondary)]'}`}
                    >
                        <item.icon size={20} className="mr-3" />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-2">Total Sales</div>
                    <div className="text-3xl font-bold text-[var(--color-primary)]">
                        ₹{orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-2">Total Orders</div>
                    <div className="text-3xl font-bold text-[var(--color-secondary)]">{orders.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-2">Total Products</div>
                    <div className="text-3xl font-bold text-[var(--color-secondary)]">{products.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
                    <div className="text-[var(--color-text-muted)] mb-2">Active Users</div>
                    <div className="text-3xl font-bold text-[var(--color-secondary)]">{users.length}</div>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Products</h2>
                <Button size="sm" onClick={() => {
                    setEditingProduct(null);
                    resetProductForm();
                    setShowProductModal(true);
                }}>
                    <Plus size={16} className="mr-2" />
                    Add Product
                </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                        <tr>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Product</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Category</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Price</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Stock</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                                <td className="p-4 flex items-center">
                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                                    <span className="font-medium">{product.name}</span>
                                </td>
                                <td className="p-4 text-[var(--color-text-muted)]">{product.category}</td>
                                <td className="p-4 font-medium">₹{product.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEditProduct(product)} className="p-1 hover:text-[var(--color-primary)]"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-1 hover:text-[var(--color-danger)]"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOrders = () => {
        return (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Orders</h2>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCreateTestOrder}>
                            Create Test Order
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                            setLoading(true);
                            fetchData();
                        }}>Refresh</Button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                            <tr>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Order ID</th>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Customer</th>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Date</th>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Total</th>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Status</th>
                                <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                                        <td className="p-4 font-medium text-[var(--color-primary)]">{order.id.slice(0, 8)}...</td>
                                        <td className="p-4">
                                            <div className="font-medium">{order.customer}</div>
                                            <div className="text-xs text-gray-500">{order.email}</div>
                                            {order.cancellationReason && (
                                                <div className="text-xs text-red-500 mt-1">Note: {order.cancellationReason}</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600">{order.date}</td>
                                        <td className="p-4 font-bold">₹{order.total}</td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer
                                                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>View</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderUsers = () => (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Users</h2>
                <Button size="sm" onClick={() => {
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', password: '', role: 'customer' });
                    setShowUserModal(true);
                }}>
                    <Plus size={16} className="mr-2" />
                    Add User
                </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                        <tr>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Name</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Email</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Role</th>
                            <th className="text-left p-4 font-medium text-[var(--color-text-muted)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="p-1 hover:text-[var(--color-primary)]"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-1 hover:text-[var(--color-danger)]"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Categories</h2>
            <div className="mb-6 flex gap-4">
                <Input
                    placeholder="New Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={handleAddCategory}>Add Category</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-border)] flex justify-between items-center">
                        <span className="font-medium">{cat.name}</span>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBanners = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Banners</h2>
            <div className="mb-6 flex gap-4 items-end bg-white p-4 rounded-lg border border-[var(--color-border)]">
                <div className="flex-grow space-y-2">
                    <Input
                        label="Banner Title"
                        placeholder="e.g. Summer Sale"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    />
                    <Input
                        label="Image URL"
                        placeholder="https://example.com/banner.jpg"
                        value={newBanner.image}
                        onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSaveBanner}>
                        {editingBanner ? 'Update Banner' : 'Add Banner'}
                    </Button>
                    {editingBanner && (
                        <Button variant="ghost" onClick={() => {
                            setEditingBanner(null);
                            setNewBanner({ title: '', image: '' });
                        }}>Cancel</Button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(banner => (
                    <div key={banner.id} className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-border)]">
                        <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover rounded-md mb-4" />
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{banner.title}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditBanner(banner)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderShipping = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Shipping Rates</h2>
            <div className="mb-6 flex gap-4 items-end bg-white p-4 rounded-lg border border-[var(--color-border)]">
                <div className="flex-grow grid grid-cols-2 gap-4">
                    <Input
                        label="State Name"
                        placeholder="e.g. Madhya Pradesh"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    />
                    <Input
                        label="Delivery Fee (₹)"
                        type="number"
                        placeholder="50"
                        value={shippingForm.fee}
                        onChange={(e) => setShippingForm({ ...shippingForm, fee: e.target.value })}
                    />
                </div>
                <Button onClick={handleSaveShippingRate}>Save Rate</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(shippingRates).map(([state, fee]) => (
                    <div key={state} className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-border)] flex justify-between items-center">
                        <div>
                            <div className="font-bold">{state}</div>
                            <div className="text-sm text-gray-500">Delivery: ₹{fee}</div>
                        </div>
                        <button onClick={() => handleDeleteShippingRate(state)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Content Management</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
                <h3 className="text-lg font-bold mb-4">About Us Page Content</h3>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Text Content</label>
                <textarea
                    className="w-full h-40 p-4 border border-[var(--color-border)] rounded-md mb-4 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                    value={aboutForm.text}
                    onChange={(e) => setAboutForm({ ...aboutForm, text: e.target.value })}
                />
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Images (Up to 4)</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                        placeholder="Image URL 1"
                        value={aboutForm.image1}
                        onChange={(e) => setAboutForm({ ...aboutForm, image1: e.target.value })}
                    />
                    <Input
                        placeholder="Image URL 2"
                        value={aboutForm.image2}
                        onChange={(e) => setAboutForm({ ...aboutForm, image2: e.target.value })}
                    />
                    <Input
                        placeholder="Image URL 3"
                        value={aboutForm.image3}
                        onChange={(e) => setAboutForm({ ...aboutForm, image3: e.target.value })}
                    />
                    <Input
                        placeholder="Image URL 4"
                        value={aboutForm.image4}
                        onChange={(e) => setAboutForm({ ...aboutForm, image4: e.target.value })}
                    />
                </div>
                <Button onClick={handleUpdateContent}>Update Content</Button>
            </div>
        </div>
    );

    const handleSavePayment = async () => {
        try {
            await paymentService.saveSettings(paymentSettings);
            alert('Payment settings saved successfully!');
        } catch (error) {
            alert('Failed to save payment settings');
        }
    };

    const renderPayment = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Payment Configuration</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] max-w-2xl">
                <div className="space-y-4">
                    <Input
                        label="UPI ID (VPA)"
                        placeholder="e.g. merchant@upi"
                        value={paymentSettings.upiId}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                    />
                    <Input
                        label="QR Code Image URL"
                        placeholder="https://example.com/qr-code.png"
                        value={paymentSettings.qrCode}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, qrCode: e.target.value })}
                    />
                    <Input
                        label="Custom Payment Link (Optional)"
                        placeholder="e.g. https://razorpay.me/@merchant"
                        value={paymentSettings.customLink}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, customLink: e.target.value })}
                    />
                    <p className="text-sm text-[var(--color-text-muted)]">
                        If a custom link is provided, the "Pay Now" button will redirect to this link instead of using the UPI ID.
                    </p>
                    {paymentSettings.qrCode && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Preview</label>
                            <img
                                src={paymentSettings.qrCode}
                                alt="QR Code Preview"
                                className="w-48 h-48 object-contain border border-gray-200 rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                    <Button onClick={handleSavePayment} className="mt-4">Save Settings</Button>
                </div>
            </div>
        </div>
    );

    const handleSaveBranding = async () => {
        try {
            await brandingService.saveSettings(brandingSettings);
            alert('Branding settings saved successfully!');
        } catch (error) {
            alert('Failed to save branding settings');
        }
    };

    const renderBranding = () => (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">Branding Configuration</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] max-w-2xl">
                <div className="space-y-4">
                    <Input
                        label="Favicon URL"
                        placeholder="https://example.com/favicon.ico"
                        value={brandingSettings.favicon}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, favicon: e.target.value })}
                    />
                    {brandingSettings.favicon && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Preview</label>
                            <img
                                src={brandingSettings.favicon}
                                alt="Favicon Preview"
                                className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                    <Button onClick={handleSaveBranding} className="mt-4">Save Settings</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {renderSidebar()}
            <div className="flex-1 overflow-y-auto h-screen">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'categories' && renderCategories()}
                {activeTab === 'banners' && renderBanners()}
                {activeTab === 'shipping' && renderShipping()}
                {activeTab === 'content' && renderContent()}
                {activeTab === 'payment' && renderPayment()}
                {activeTab === 'branding' && renderBranding()}
            </div>

            {/* Product Modal */}
            < AnimatePresence >
                {showProductModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Product Name"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Category</label>
                                        <select
                                            className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <Input
                                    label="Description"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Base Price (₹)"
                                        type="number"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)]">Product Images (First one is main)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Image URL 1 (Main)"
                                            value={productForm.image1}
                                            onChange={(e) => setProductForm({ ...productForm, image1: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Image URL 2"
                                            value={productForm.image2}
                                            onChange={(e) => setProductForm({ ...productForm, image2: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Image URL 3"
                                            value={productForm.image3}
                                            onChange={(e) => setProductForm({ ...productForm, image3: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Image URL 4"
                                            value={productForm.image4}
                                            onChange={(e) => setProductForm({ ...productForm, image4: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-[var(--color-text-muted)]">Variants (Optional)</label>
                                        <Button type="button" size="sm" variant="outline" onClick={addVariant}>Add Variant</Button>
                                    </div>
                                    {productForm.variants.map((variant, index) => (
                                        <div key={index} className="flex gap-2 mb-2 items-center">
                                            <Input
                                                placeholder="Weight (e.g. 500g)"
                                                value={variant.weight}
                                                onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Price (₹)"
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeVariant(index)} className="text-red-500">
                                                <MinusCircle size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="inStock"
                                        checked={productForm.inStock}
                                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="inStock" className="text-sm font-medium text-[var(--color-text-muted)]">In Stock</label>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* User Modal */}
            < AnimatePresence >
                {showUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                        >
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <form onSubmit={handleUserSubmit} className="space-y-4">
                                <Input
                                    label="Full Name"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    required={!editingUser}
                                    placeholder={editingUser ? "Leave blank to keep current" : ""}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Role</label>
                                    <select
                                        className="w-full p-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                                        value={userForm.role}
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingUser ? 'Update User' : 'Create User'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >
            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div >
    );
};

export default AdminDashboard;
