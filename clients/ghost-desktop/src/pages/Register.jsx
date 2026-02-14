import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Loader2, ArrowRight, Check, X } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Password strength validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
    const passwordMatch = password === confirmPassword && confirmPassword.length > 0;

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        if (passwordStrength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength === 3) return 'Fair';
        if (passwordStrength === 4) return 'Good';
        return 'Strong';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (passwordStrength < 3) {
            setError('Please choose a stronger password');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setLoading(true);

        try {
            const result = await register(username, email, password);
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-identra-primary-light to-white bg-clip-text text-transparent mb-2">
                        Join Identra
                    </h1>
                    <p className="text-identra-text-secondary">Create your secure memory vault</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">
                            Username
                        </label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="choose_username"
                                minLength={3}
                                maxLength={20}
                                required
                            />
                        </div>
                        <p className="text-xs text-identra-text-muted ml-1">
                            Lowercase letters, numbers, and underscores only
                        </p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">
                            Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-identra-surface-elevated border border-identra-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50 transition-all placeholder:text-identra-text-disabled"
                                placeholder="Create a strong password"
                                minLength={8}
                                required
                            />
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-identra-surface-elevated rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getStrengthColor()}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${
                                        passwordStrength <= 2 ? 'text-red-400' :
                                        passwordStrength === 3 ? 'text-yellow-400' :
                                        passwordStrength === 4 ? 'text-blue-400' :
                                        'text-green-400'
                                    }`}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-400' : 'text-identra-text-muted'}`}>
                                        {passwordChecks.length ? <Check size={12} /> : <X size={12} />}
                                        <span>8+ characters</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-400' : 'text-identra-text-muted'}`}>
                                        {passwordChecks.uppercase ? <Check size={12} /> : <X size={12} />}
                                        <span>Uppercase</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? 'text-green-400' : 'text-identra-text-muted'}`}>
                                        {passwordChecks.lowercase ? <Check size={12} /> : <X size={12} />}
                                        <span>Lowercase</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-400' : 'text-identra-text-muted'}`}>
                                        {passwordChecks.number ? <Check size={12} /> : <X size={12} />}
                                        <span>Number</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-green-400' : 'text-identra-text-muted'}`}>
                                        {passwordChecks.special ? <Check size={12} /> : <X size={12} />}
                                        <span>Special char</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-identra-text-tertiary uppercase tracking-wider ml-1">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-identra-text-muted group-focus-within:text-identra-primary transition-colors" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-identra-surface-elevated border rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none transition-all placeholder:text-identra-text-disabled ${
                                    confirmPassword.length > 0
                                        ? passwordMatch
                                            ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500/50'
                                            : 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                                        : 'border-identra-border focus:border-identra-primary/50 focus:ring-1 focus:ring-identra-primary/50'
                                }`}
                                placeholder="Re-enter your password"
                                required
                            />
                            {confirmPassword.length > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {passwordMatch ? (
                                        <Check size={18} className="text-green-400" />
                                    ) : (
                                        <X size={18} className="text-red-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terms Acceptance */}
                    <div className="flex items-start gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 rounded border-identra-border bg-identra-surface-elevated cursor-pointer"
                            required
                        />
                        <label htmlFor="terms" className="text-xs text-identra-text-tertiary cursor-pointer">
                            I agree to the{' '}
                            <a href="#" className="text-identra-primary hover:text-identra-primary-light">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-identra-primary hover:text-identra-primary-light">Privacy Policy</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || passwordStrength < 3 || !passwordMatch || !agreedToTerms}
                        className="w-full bg-identra-primary hover:bg-identra-primary-dark text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-identra-primary/20"
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
