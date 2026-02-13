# 🧠 Identra - Your Personal AI Memory Vault

> A confidential, secure AI-powered memory system that never forgets. Built for 500 beta users.

[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 What is Identra?

Identra is a **desktop-first** personal AI assistant with **persistent memory**. Unlike traditional AI chatbots that forget everything, Identra remembers every conversation, thought, and piece of information you share - forever.

### Key Features

- 🔒 **100% Private** - Your data never leaves your device (MVP uses local encryption + Supabase)
- 🧠 **Perfect Memory** - Never forget anything again. Identra remembers for you
- ⚡ **Instant Launcher** - Press CMD+K anywhere to search and interact
- 🎨 **Beautiful UI** - Modern, dark-first design optimized for desktop
- 🤖 **Multi-Model AI** - Choose between Claude, GPT-4, and Gemini
- 🔍 **Semantic Search** - Find anything using natural language
- 🔐 **End-to-End Encrypted** - Military-grade security for sensitive memories

## 🚀 Quick Start

### Prerequisites

- **Rust** 1.75+ ([Install](https://rustup.rs/))
- **Node.js** 18+ ([Install](https://nodejs.org/))
- **Just** command runner ([Install](https://github.com/casey/just))
- **Supabase** account ([Sign up](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/identra.git
cd identra

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Install dependencies
cd clients/ghost-desktop
yarn install
cd ../..

# Build and run
just dev-all
```

The app will launch automatically. Press **CMD+K** (macOS) or **CTRL+K** (Windows/Linux) to open the quick launcher.

## 📖 Documentation

- [**MVP Completion Guide**](MVP_COMPLETION_GUIDE.md) - Comprehensive roadmap for beta release
- [**Architecture Overview**](IMPLEMENTATION_SUMMARY.md) - System design and components
- [**Environment Setup**](ENV_SETUP_GUIDE.md) - Detailed setup instructions
- [**Chat Setup**](CHAT_SETUP.md) - Configure AI models

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Ghost Desktop (Tauri + React)                  │
│  - Main Window: Chat + Memory Vault             │
│  - Launcher Window: CMD+K Quick Access          │
└───────────────┬─────────────────────────────────┘
                │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐  ┌──────▼──────────┐
│ Vault       │  │ Tunnel Gateway  │
│ Daemon      │  │ (gRPC)          │
│ - OS        │  │ - Auth          │
│   Keychain  │  │ - API Routes    │
│ - Local     │  │ - Supabase      │
│   Encrypt   │  └─────┬───────────┘
└─────────────┘        │
                ┌──────┴──────┐
                │             │
         ┌──────▼─────┐ ┌────▼─────────┐
         │ Brain      │ │ Supabase     │
         │ Service    │ │ Postgres +   │
         │ - RAG      │ │ pgvector     │
         │ - Embeddings│ │ - Memories   │
         │ - AI Chat  │ │ - Auth       │
         └────────────┘ └──────────────┘
```

## 🎨 Design System

Identra uses a **dark-first**, minimalist design inspired by Raycast and Spotlight.

### Color Palette

```css
Background:   #0a0a0b (Deep Black)
Surface:      #121214 (Elevated Black) 
Accent:       #8b7fb8 (Subtle Purple)
Text:         #f5f5f7 (Off White)
Success:      #34c759 (Green)
Error:        #ff453a (Red)
```

## 🔑 Features Roadmap

### ✅ Alpha Complete
- [x] Desktop app foundation
- [x] Multi-window support
- [x] Global shortcuts (CMD+K)
- [x] Chat interface with multiple AI models
- [x] Memory vault UI
- [x] Theme system
- [x] Onboarding flow
- [x] Local encryption

### 🚧 Beta MVP (In Progress)
- [ ] Supabase authentication
- [ ] User account management  
- [ ] Persistent cloud storage
- [ ] RAG implementation
- [ ] Semantic search
- [ ] Memory analytics

### 📅 Post-Beta
- [ ] Mobile app
- [ ] Browser extension
- [ ] Voice input
- [ ] Memory sharing
- [ ] AWS Nitro Enclaves

## 🛠️ Development

### Project Structure

```
identra/
├── apps/
│   ├── brain-service/      # Python - AI/RAG
│   ├── tunnel-gateway/     # Rust - API + Auth
│   └── vault-daemon/       # Rust - Encryption
├── clients/
│   └── ghost-desktop/      # Tauri + React
├── libs/                   # Shared libraries
└── admin/                  # Admin panel (future)
```

### Tech Stack

- **Desktop**: Tauri v2, React 19, Tailwind CSS
- **Backend**: Rust, Tokio, Axum, Tonic
- **AI**: Python, FastAPI, FastEmbed
- **Database**: Supabase (Postgres + pgvector)
- **Auth**: Supabase Auth + JWT
- **Encryption**: AES-256-GCM, ChaCha20

## 🔒 Security

- End-to-end encryption for sensitive data
- Zero-knowledge architecture
- OS keychain integration
- Row-level security (RLS) in Supabase
- Regular security audits

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**Made with ❤️ for people who value their memories**

📖 [Full Guide](MVP_COMPLETION_GUIDE.md) • 🐛 [Issues](https://github.com/yourusername/identra/issues) • 💬 [Discussions](https://github.com/yourusername/identra/discussions)

</div>
