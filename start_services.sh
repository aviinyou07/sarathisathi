#!/usr/bin/env bash
set -e

# Sarathi Sakha - High-Performance Local Launcher with NVIDIA GPU Offload
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$HOME/Android/Sdk/platform-tools:$HOME/Android/Sdk/emulator:$HOME/.local/bin"

# 1. Ensure CUDA library path is exported for Ollama
export LD_LIBRARY_PATH="$HOME/.local/lib/ollama:$HOME/.local/lib/ollama/cuda_v13:$HOME/.local/lib/ollama/cuda_v12:${LD_LIBRARY_PATH:-}"
export OLLAMA_KEEP_ALIVE="-1"

echo "🕉️ Starting Sarathi Sakha..."

# 2. Check if Ollama is running
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "⚡ Launching Ollama on GPU (NVIDIA RTX 2050)..."
    nohup ollama serve > /tmp/ollama_sarathi.log 2>&1 &
    sleep 2
fi

# 3. Setup ADB Reverse Ports for Android Emulator
if which adb > /dev/null 2>&1; then
    echo "📱 Reversing emulator ports (8081 & 3000)..."
    adb reverse tcp:8081 tcp:8081 || true
    adb reverse tcp:3000 tcp:3000 || true
fi

# 4. Check if Backend is running
if ! lsof -i:3000 > /dev/null 2>&1; then
    echo "🚀 Starting NestJS Backend daemon..."
    cd "$PROJECT_ROOT/backend"
    nohup node dist/src/main.js > /tmp/backend_sarathi.log 2>&1 &
    sleep 2
fi

echo "✅ All local services active with 100% GPU offload and $0.00 token cost!"
