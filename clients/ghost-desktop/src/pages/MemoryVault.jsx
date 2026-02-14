import { useState, useEffect } from "react";
import { Lock, Plus, Search } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { MemoryCard } from "../components/MemoryCard";
import { Button } from "../components/ui/Button";

export default function MemoryVault() {
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const history = await invoke("fetch_history", { limit: 100 });
      setMemories(history || []);

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
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this memory? This cannot be undone.")) return;
    try {
      await invoke("delete_memory", { memory_id: id });
      setSelectedMemory(null);
      loadMemories();
    } catch (error) {
      console.error("Failed to delete memory:", error);
      alert("Failed to delete memory: " + error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMemory || !editContent.trim()) return;
    try {
      await invoke("update_memory", {
        memory_id: selectedMemory.id,
        content: editContent,
        tags: selectedMemory.tags || []
      });
      setIsEditing(false);
      setSelectedMemory(null);
      loadMemories();
    } catch (error) {
      console.error("Failed to update memory:", error);
      alert("Failed to update memory: " + error);
    }
  };

  const openMemoryDetails = (memory) => {
    setSelectedMemory(memory);
    setEditContent(memory.content);
    setIsEditing(false);
  };

  const filteredMemories = selectedTag === "all"
    ? memories
    : memories.filter(m => m.tags?.includes(selectedTag));

  return (
    <div className="h-full flex flex-col bg-identra-bg">
      {/* Header */}
      <div className="border-b border-identra-border p-6 shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-identra-text-primary flex items-center gap-3">
              <Lock className="w-6 h-6 text-identra-primary" />
              Memory Vault
            </h1>
            <p className="text-sm text-identra-text-secondary mt-1">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} stored securely
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            size="md"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-identra-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search your memories..."
              className="w-full pl-10 pr-4 py-2.5 bg-identra-surface border border-identra-border rounded-lg text-identra-text-primary placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary transition-colors shadow-soft"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
        </div>

        {/* Tag Filter */}
        {tags.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap animate-fade-in-up">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTag === tag
                    ? 'bg-identra-primary text-white shadow-soft'
                    : 'bg-identra-surface-elevated text-identra-text-secondary hover:bg-identra-surface-hover border border-identra-border-subtle'
                  }`}
              >
                {tag === "all" ? "All" : `#${tag}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Memory Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-identra-bg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-identra-primary"></div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade">
            <div className="w-16 h-16 bg-identra-surface-elevated rounded-full flex items-center justify-center mb-4 border border-identra-border-subtle">
              <Lock className="w-8 h-8 text-identra-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-identra-text-primary mb-2">
              {searchQuery ? "No memories found" : "Your vault is empty"}
            </h3>
            <p className="text-identra-text-secondary mb-6 max-w-sm mx-auto">
              {searchQuery ? "Try a different search term" : "Start adding memories to build your personal knowledge base"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} variant="secondary">
                Add Your First Memory
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {filteredMemories.map((memory, idx) => (
              <MemoryCard
                key={memory.id || idx}
                memory={memory}
                onClick={() => openMemoryDetails(memory)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-identra-surface border border-identra-border rounded-xl max-w-2xl w-full p-6 shadow-strong animate-scale-in">
            <h2 className="text-xl font-bold text-identra-text-primary mb-4">Add New Memory</h2>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="What would you like to remember?..."
              className="w-full h-48 px-4 py-3 bg-identra-bg border border-identra-border rounded-lg text-identra-text-primary placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary transition-colors resize-none mb-6 shadow-inner"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMemory} disabled={!newMemory.trim()}>
                Save Memory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Memory Modal */}
      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade"
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-identra-surface border border-identra-border rounded-xl max-w-2xl w-full p-6 shadow-strong animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-identra-border-subtle">
              <h3 className="tex-lg font-semibold text-identra-text-primary">Memory Details</h3>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-identra-text-tertiary hover:text-identra-text-primary transition-colors"
              >
                ×
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-identra-bg border border-identra-border rounded-lg text-identra-text-primary focus:outline-none focus:border-identra-primary transition-colors resize-none mb-4 shadow-inner"
              />
            ) : (
              <div className="bg-identra-surface-elevated/50 p-4 rounded-lg border border-identra-border-subtle mb-6 max-h-[60vh] overflow-y-auto">
                <p className="text-identra-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedMemory.content}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedMemory.id)}
              >
                Delete
              </Button>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    Edit Memory
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
