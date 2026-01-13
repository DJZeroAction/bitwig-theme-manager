#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
CARGO_TOML="$PROJECT_ROOT/src-tauri/Cargo.toml"

# Get current version
get_version() {
    grep -o '"version": "[^"]*"' "$TAURI_CONF" | head -1 | cut -d'"' -f4
}

# Bump version
bump_version() {
    local version=$1
    local bump_type=$2

    IFS='.' read -r major minor patch <<< "$version"

    case $bump_type in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "$major.$((minor + 1)).0"
            ;;
        patch)
            echo "$major.$minor.$((patch + 1))"
            ;;
        *)
            echo "$bump_type"
            ;;
    esac
}

# Update version in files
update_version() {
    local new_version=$1

    # Update tauri.conf.json
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$TAURI_CONF"

    # Update Cargo.toml (only the package version, not dependencies)
    sed -i "0,/^version = \"[^\"]*\"/s//version = \"$new_version\"/" "$CARGO_TOML"
}

# Main
main() {
    cd "$PROJECT_ROOT"

    current_version=$(get_version)
    echo -e "${YELLOW}Current version: $current_version${NC}"

    # Determine new version
    if [ -z "$1" ]; then
        # Default to patch bump
        new_version=$(bump_version "$current_version" "patch")
    elif [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # Specific version provided
        new_version=$1
    else
        # Bump type provided (major/minor/patch)
        new_version=$(bump_version "$current_version" "$1")
    fi

    echo -e "${GREEN}New version: $new_version${NC}"

    # Confirm
    read -p "Proceed with release v$new_version? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted${NC}"
        exit 1
    fi

    # Update version files
    echo "Updating version files..."
    update_version "$new_version"

    # Git operations
    echo "Committing changes..."
    git add "$TAURI_CONF" "$CARGO_TOML"
    git commit -m "Bump version to $new_version"

    echo "Creating tag v$new_version..."
    git tag "v$new_version"

    echo "Pushing to remote..."
    git push
    git push origin "v$new_version"

    echo -e "${GREEN}Done! Release v$new_version is building.${NC}"
    echo "Watch progress at: https://github.com/DJZeroAction/bitwig-theme-manager/actions"
}

main "$@"
