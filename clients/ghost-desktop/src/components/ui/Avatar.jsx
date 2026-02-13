import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Avatar({ src, alt, fallback, className, size = 'md' }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    return (
        <div
            className={twMerge(
                'relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-identra-border-subtle bg-identra-surface-elevated',
                sizeClasses[size],
                className
            )}
        >
            {src ? (
                <img
                    className="aspect-square h-full w-full object-cover"
                    src={src}
                    alt={alt || 'Avatar'}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-identra-surface-elevated text-identra-text-secondary font-medium">
                    {fallback || '?'}
                </div>
            )}
        </div>
    );
}
