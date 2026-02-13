import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-identra-bg text-identra-text-primary p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-identra-surface rounded-2xl border border-identra-border p-8 shadow-2xl shadow-black/50"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">Welcome Back</h1>
                    <p className="text-identra-text-secondary">Sign in to access your memory vault</p>
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
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">Email / Username</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="text"
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
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <a href="#" className="text-xs text-identra-text-tertiary hover:text-identra-primary transition-colors">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-identra-primary hover:bg-identra-primary-dark text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-identra-text-tertiary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-identra-primary hover:text-identra-primary-light font-medium transition-colors">
                        Create via Invitation
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
