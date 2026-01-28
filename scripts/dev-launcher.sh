#!/bin/bash
# Bitwig Theme Manager Dev Launcher
# Handles killing old processes and waiting for server to be ready

PROJECT_DIR="/home/user/Programs/Claude Projects/bitwig-theme-manager"
VITE_PORT=1420
WS_PORT=1421

cd "$PROJECT_DIR" || exit 1

# Kill any processes using the dev ports
fuser -k $VITE_PORT/tcp 2>/dev/null
fuser -k $WS_PORT/tcp 2>/dev/null

# Wait for ports to be released
sleep 1

# Required for WebKit on some systems
export WEBKIT_DISABLE_COMPOSITING_MODE=1

# Run in foreground so KDE knows when the app closes
exec npm run tauri dev
