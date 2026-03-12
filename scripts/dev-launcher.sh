#!/bin/bash
# Bitwig Theme Manager Dev Launcher
# Handles killing old processes and waiting for server to be ready

# Source shell profile for PATH (nvm, cargo, etc.) when launched from desktop entry
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
fi
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"

PROJECT_DIR="/home/user/Programs/Claude Projects/bitwig-theme-manager"
VITE_PORT=1420
WS_PORT=1421

cd "$PROJECT_DIR" || exit 1

# Kill any processes using the dev ports
fuser -k $VITE_PORT/tcp 2>/dev/null
fuser -k $WS_PORT/tcp 2>/dev/null

# Wait for ports to be released
sleep 1

# Run in foreground so the desktop knows when the app closes
exec npm run tauri dev
