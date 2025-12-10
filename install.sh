#!/usr/bin/env bash
set -euo pipefail

# WhatsApp Claude Agent Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/dsebastien/whatsapp-claude-agent/main/install.sh | bash

REPO="dsebastien/whatsapp-claude-agent"
BINARY_NAME="whatsapp-claude-agent"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running in WSL
is_wsl() {
    if [ -f /proc/version ]; then
        grep -qi microsoft /proc/version 2>/dev/null && return 0
    fi
    if [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
        return 0
    fi
    return 1
}

# Detect OS
detect_os() {
    local os
    case "$(uname -s)" in
        Linux*)
            # Check for WSL - still uses Linux binary
            if is_wsl; then
                info "Detected Windows Subsystem for Linux (WSL)"
            fi
            os="linux"
            ;;
        Darwin*)
            os="darwin"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            os="windows"
            ;;
        *)
            error "Unsupported operating system: $(uname -s)"
            ;;
    esac
    echo "$os"
}

# Detect architecture
detect_arch() {
    local arch
    case "$(uname -m)" in
        x86_64|amd64)
            arch="x64"
            ;;
        arm64|aarch64)
            arch="arm64"
            ;;
        i386|i686)
            error "32-bit systems are not supported. Please use a 64-bit system."
            ;;
        *)
            error "Unsupported architecture: $(uname -m)"
            ;;
    esac
    echo "$arch"
}

# Get latest release tag from GitHub
get_latest_version() {
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/'
}

# Download and install
install() {
    local os=$(detect_os)
    local arch=$(detect_arch)

    info "Detected platform: ${os}-${arch}"

    # Get latest version
    info "Fetching latest release..."
    local version=$(get_latest_version)

    if [ -z "$version" ]; then
        error "Failed to fetch latest version. Check your internet connection."
    fi

    success "Latest version: ${version}"

    # Construct download URL
    local filename="${BINARY_NAME}-${os}-${arch}"
    if [ "$os" = "windows" ]; then
        filename="${filename}.exe"
    fi

    local download_url="https://github.com/${REPO}/releases/download/${version}/${filename}"

    info "Downloading from: ${download_url}"

    # Create install directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"

    local install_path="${INSTALL_DIR}/${BINARY_NAME}"
    if [ "$os" = "windows" ]; then
        install_path="${install_path}.exe"
    fi

    # Download to temp file first
    local temp_path="${install_path}.tmp"

    # Download binary (show progress bar)
    if ! curl -fL --progress-bar "$download_url" -o "$temp_path"; then
        rm -f "$temp_path"
        error "Failed to download binary. The release may not exist for your platform (${os}-${arch})."
    fi

    # Make executable (not needed on Windows)
    if [ "$os" != "windows" ]; then
        chmod +x "$temp_path"
    fi

    # Replace existing binary (if any)
    mv -f "$temp_path" "$install_path"

    success "Installed ${version} to: ${install_path}"

    # Check if install directory is in PATH
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        warn "Installation directory is not in your PATH."
        echo ""
        echo "Add it to your PATH by adding this line to your shell config (~/.bashrc, ~/.zshrc, etc.):"
        echo ""
        echo "  export PATH=\"\$PATH:${INSTALL_DIR}\""
        echo ""
        echo "Then reload your shell or run: source ~/.bashrc (or ~/.zshrc)"
    fi

    echo ""
    success "Installation complete!"
    echo ""
    echo "Quick start:"
    echo "  ${BINARY_NAME} -w \"+1234567890\"    # Replace with your phone number"
    echo ""
    echo "For more options:"
    echo "  ${BINARY_NAME} --help"
    echo ""
    echo "Documentation: https://github.com/${REPO}"
}

# Run installer
install
