import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { motion } from 'framer-motion';

const Login = () => {
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password, rememberMe);
            navigate('/'); // Redirect to home
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-[var(--color-border)]"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Welcome Back</h1>
                    <p className="text-[var(--color-text-muted)]">Sign in to continue to The Taste Of Indore</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-[var(--color-danger)] text-sm rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@toi.com"
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mr-2 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="text-[var(--color-text-muted)]">Remember me</span>
                        </label>
                        <a href="#" className="text-[var(--color-primary)] hover:underline">Forgot password?</a>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[var(--color-primary)] font-medium hover:underline">
                        Create account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
