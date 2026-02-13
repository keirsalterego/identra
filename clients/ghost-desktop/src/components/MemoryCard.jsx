import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Clock, Search, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

export function MemoryCard({ memory, onClick, className }) {
    const { content, tags, created_at, metadata } = memory;

    // Parse timestamp
    const dateStr = created_at?.seconds
        ? new Date(Number(created_at.seconds) * 1000).toLocaleDateString()
        : 'Unknown date';

    return (
        <Card
            hoverEffect
            className={clsx("overflow-hidden group", className)}
            onClick={onClick}
        >
            <CardContent className="p-4">
                {/* Header / Meta */}
                <div className="flex items-center justify-between mb-2 text-identra-text-muted text-xs">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{dateStr}</span>
                    </div>
                    {metadata?.source && (
                        <span className="uppercase tracking-wider opacity-70 border border-identra-border rounded px-1.5 py-0.5">
                            {metadata.source}
                        </span>
                    )}
                </div>

                {/* Content Preview */}
                <p className="text-sm text-identra-text-secondary line-clamp-3 mb-3 font-medium">
                    {content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {tags && tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-identra-surface-elevated text-identra-text-tertiary border border-identra-border-subtle group-hover:border-identra-primary/30 transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
