import React, { useState } from "react";
import { Search } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const searchResults = await invoke("semantic_search", { query });
            setResults(searchResults || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-identra-bg p-8 items-center overflow-y-auto">
            <div className="max-w-4xl w-full space-y-8 animate-fade-in-up">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-identra-text-primary flex items-center justify-center gap-3">
                        <Search className="w-8 h-8 text-identra-primary" />
                        Search Your Memories
                    </h1>
                    <p className="text-identra-text-secondary">
                        Find anything you've saved using natural language
                    </p>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="What are you looking for?"
                        className="flex-1 px-6 py-4 bg-identra-surface border border-identra-border rounded-xl text-identra-text-primary placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary focus:ring-1 focus:ring-identra-primary transition-all shadow-soft text-lg"
                        autoFocus
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={!query.trim() || isSearching}
                        size="lg"
                        className="h-auto py-4 px-8 text-lg"
                    >
                        {isSearching ? "Searching..." : "Search"}
                    </Button>
                </div>

                {results.length > 0 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h2 className="text-xl font-semibold text-identra-text-primary mb-4 px-1">
                            Found {results.length} {results.length === 1 ? 'result' : 'results'}
                        </h2>
                        <div className="grid gap-4">
                            {results.map((result, idx) => (
                                <Card
                                    key={idx}
                                    hoverEffect
                                    className="border-identra-border hover:border-identra-primary/50"
                                >
                                    <CardContent className="p-6">
                                        <p className="text-identra-text-secondary leading-relaxed">{result.content}</p>
                                        {result.score && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-identra-surface-elevated rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-identra-primary to-identra-primary-light rounded-full"
                                                        style={{ width: `${result.score * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-identra-text-tertiary tabular-nums">
                                                    {Math.round(result.score * 100)}% match
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {isSearching && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-identra-surface-elevated border-t-identra-primary"></div>
                    </div>
                )}

                {!isSearching && query && results.length === 0 && (
                    <div className="text-center py-16 animate-fade">
                        <div className="w-20 h-20 bg-identra-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-identra-text-tertiary" />
                        </div>
                        <h3 className="text-xl font-semibold text-identra-text-primary mb-2">No results found</h3>
                        <p className="text-identra-text-secondary">Try rephrasing your search or using different keywords</p>
                    </div>
                )}
            </div>
        </div>
    );
}
