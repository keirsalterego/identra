import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const result = await register(username, email, password);
            // Assuming register might return success but user still needs to login
            // Or auto-login if backend supports it. For now, let's redirect to login
            if (result.success) {
                navigate('/login');
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-identra-bg text-identra-text-primary p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-identra-surface rounded-2xl border border-identra-border p-8 shadow-2xl shadow-black/50"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-identra-primary-light to-white bg-clip-text text-transparent mb-2">Join Identra</h1>
                    <p className="text-identra-text-secondary">Create your secure memory vault</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-sm"
                    >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">Confirm Password</label>
                        <div className="relative group">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="Repeat password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-identra-primary hover:bg-identra-primary-dark text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-identra-primary/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-identra-text-tertiary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-identra-primary hover:text-identra-primary-light font-medium transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
