import { useState, useEffect } from "react";
import { Lock, Unlock, Search, Plus, Trash2, Eye, EyeOff, Calendar, Tag, Filter } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export default function MemoryVault() {
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const history = await invoke("fetch_history", { limit: 100 });
      setMemories(history || []);
      
      // Extract unique tags
      const allTags = new Set();
      history?.forEach(m => {
        if (m.tags) {
          m.tags.forEach(t => allTags.add(t));
        }
      });
      setTags(["all", ...Array.from(allTags)]);
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }

    setIsLoading(true);
    try {
      const results = await invoke("semantic_search", { query: searchQuery });
      setMemories(results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;

    try {
      await invoke("vault_memory", { 
        content: newMemory,
        tags: []
      });
      
      setNewMemory("");
      setShowAddModal(false);
      loadMemories();
    } catch (error) {
      console.error("Failed to add memory:", error);
      alert("Failed to save memory. Please try again.");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filteredMemories = selectedTag === "all" 
    ? memories 
    : memories.filter(m => m.tags?.includes(selectedTag));

  return (
    <div className="h-full flex flex-col bg-identra-bg">
      {/* Header */}
      <div className="border-b border-identra-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-identra-text flex items-center gap-2">
              <Lock className="w-6 h-6 text-identra-primary" />
              Memory Vault
            </h1>
            <p className="text-sm text-identra-text-secondary mt-1">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} stored securely
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-identra-primary text-white rounded-lg hover:bg-identra-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Memory
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-identra-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search your memories..."
              className="w-full pl-10 pr-4 py-2.5 bg-identra-surface border border-identra-border rounded-lg text-identra-text placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-identra-primary text-white rounded-lg hover:bg-identra-primary/90 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Tag Filter */}
        {tags.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-identra-primary text-white'
                    : 'bg-identra-surface text-identra-text-secondary hover:bg-identra-surface-hover'
                }`}
              >
                {tag === "all" ? "All" : `#${tag}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Memory Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-identra-primary"></div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Lock className="w-16 h-16 text-identra-text-tertiary mb-4" />
            <h3 className="text-lg font-medium text-identra-text mb-2">
              {searchQuery ? "No memories found" : "Your vault is empty"}
            </h3>
            <p className="text-identra-text-secondary mb-4">
              {searchQuery ? "Try a different search term" : "Start adding memories to build your personal knowledge base"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-identra-primary text-white rounded-lg hover:bg-identra-primary/90 transition-colors"
              >
                Add Your First Memory
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map((memory, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedMemory(memory)}
                className="p-4 bg-identra-surface border border-identra-border rounded-lg hover:border-identra-primary transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <Calendar className="w-4 h-4 text-identra-text-tertiary" />
                  <span className="text-xs text-identra-text-tertiary">
                    {formatDate(memory.timestamp || Date.now() / 1000)}
                  </span>
                </div>
                <p className="text-identra-text line-clamp-4 mb-2">
                  {memory.content}
                </p>
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {memory.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-identra-primary/10 text-identra-primary text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-identra-surface border border-identra-border rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-identra-text mb-4">Add New Memory</h2>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="What would you like to remember?..."
              className="w-full h-48 px-4 py-3 bg-identra-bg border border-identra-border rounded-lg text-identra-text placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary transition-colors resize-none"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-identra-surface border border-identra-border text-identra-text rounded-lg hover:bg-identra-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newMemory.trim()}
                className="flex-1 px-4 py-2 bg-identra-primary text-white rounded-lg hover:bg-identra-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Memory Modal */}
      {selectedMemory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMemory(null)}
        >
          <div 
            className="bg-identra-surface border border-identra-border rounded-xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-identra-text-tertiary">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedMemory.timestamp || Date.now() / 1000)}
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-identra-text-tertiary hover:text-identra-text"
              >
                ×
              </button>
            </div>
            <p className="text-identra-text whitespace-pre-wrap mb-4">
              {selectedMemory.content}
            </p>
            {selectedMemory.tags && selectedMemory.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedMemory.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-identra-primary/10 text-identra-primary text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
