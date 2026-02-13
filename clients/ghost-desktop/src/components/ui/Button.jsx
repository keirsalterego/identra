import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-gradient-to-r from-identra-primary to-identra-primary-light text-white hover:opacity-90 shadow-soft button-glow',
        secondary: 'bg-identra-surface-elevated text-identra-text-primary border border-identra-border hover:bg-identra-surface-hover',
        ghost: 'bg-transparent text-identra-text-secondary hover:text-identra-text-primary hover:bg-identra-surface-hover',
        danger: 'bg-identra-error text-white hover:bg-red-600 shadow-soft',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0 flex items-center justify-center',
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-identra-primary disabled:pointer-events-none disabled:opacity-50 select-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";
