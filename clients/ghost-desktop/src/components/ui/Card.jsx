import React from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={twMerge(
            'rounded-xl border border-identra-border bg-identra-surface shadow-sm text-identra-text-primary',
            hoverEffect && 'hover:bg-identra-surface-hover hover:border-identra-primary-light/50 transition-colors duration-200 cursor-pointer',
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={twMerge('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={twMerge('font-semibold leading-none tracking-tight text-identra-text-primary', className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={twMerge('text-sm text-identra-text-muted', className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={twMerge('flex items-center p-6 pt-0', className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";
