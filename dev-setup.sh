#!/bin/bash

################################################################################
# CartersCarev3 Development Setup Script
# 
# This script automates common development tasks for the project, including:
# - Verifying prerequisites and environment setup
# - Installing dependencies
# - Setting up environment variables
# - Running development servers
# - Building the project
# - Running type checking
#
# Usage:
#   ./dev-setup.sh [command]
#
# Commands:
#   setup       - Full setup (prerequisites, dependencies, env vars)
#   dev         - Start development servers (all apps)
#   dev:web     - Start only carterscare (Vite) dev server
#   dev:api     - Start only API server
#   build       - Build all packages
#   typecheck   - Run TypeScript type checking
#   clean       - Remove all dependencies and build artifacts
#   help        - Display this help message
#
# Examples:
#   ./dev-setup.sh setup      # First-time setup
#   ./dev-setup.sh dev        # Start development servers
#   ./dev-setup.sh build      # Build for production
#
################################################################################

set -e

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

################################################################################
# PREREQUISITE CHECKS
################################################################################

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js (https://nodejs.org/)")
    else
        local node_version=$(node -v)
        print_success "Node.js $node_version found"
    fi
    
    # Check for pnpm
    if ! command -v pnpm &> /dev/null; then
        missing_tools+=("pnpm (install with: npm install -g pnpm)")
    else
        local pnpm_version=$(pnpm -v)
        print_success "pnpm $pnpm_version found"
    fi
    
    # Check for Git
    if ! command -v git &> /dev/null; then
        missing_tools+=("Git (https://git-scm.com/)")
    else
        local git_version=$(git --version)
        print_success "$git_version found"
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

################################################################################
# ENVIRONMENT SETUP
################################################################################

setup_environment_variables() {
    print_info "Setting up environment variables..."
    
    local env_file="$PROJECT_ROOT/.env.local"
    
    if [ -f "$env_file" ]; then
        print_warning "Environment file already exists at $env_file"
        read -p "Do you want to overwrite it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping environment setup"
            return
        fi
    fi
    
    cat > "$env_file" << 'EOF'
# Development Environment Variables
# Copy sensitive values from your team's secure storage
# DO NOT commit this file to version control

# API Configuration
API_URL=http://localhost:3001
NODE_ENV=development

# Database Configuration (if needed)
# DATABASE_URL=your_database_url_here

# Authentication (if needed)
# AUTH_TOKEN=your_auth_token_here

# Third-party Services (if needed)
# STRIPE_KEY=your_stripe_key_here
# SOME_API_KEY=your_api_key_here
EOF
    
    print_success "Environment file created at $env_file"
    print_warning "Remember to fill in any required environment variables"
}

################################################################################
# DEPENDENCY MANAGEMENT
################################################################################

install_dependencies() {
    print_info "Installing dependencies with pnpm..."
    
    cd "$PROJECT_ROOT"
    
    # Use pnpm install for faster, more reliable installs
    pnpm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

clean_dependencies() {
    print_warning "This will remove all dependencies and build artifacts"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled"
        return
    fi
    
    print_info "Removing dependencies and artifacts..."
    cd "$PROJECT_ROOT"
    
    # Remove node_modules and lock files
    rm -rf node_modules
    rm -rf artifacts/*/node_modules
    rm -rf lib/*/node_modules
    rm -rf scripts/node_modules
    
    # Remove build artifacts
    rm -rf artifacts/*/dist
    rm -rf artifacts/*/.next
    
    print_success "Clean completed"
}

################################################################################
# BUILD OPERATIONS
################################################################################

build_project() {
    print_info "Building project..."
    
    cd "$PROJECT_ROOT"
    
    # Run workspace build script which includes typecheck
    pnpm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

typecheck_project() {
    print_info "Running TypeScript type checking..."
    
    cd "$PROJECT_ROOT"
    
    pnpm run typecheck
    
    if [ $? -eq 0 ]; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        exit 1
    fi
}

################################################################################
# DEVELOPMENT SERVERS
################################################################################

start_dev_servers() {
    print_info "Starting development servers..."
    echo ""
    print_info "Starting all development servers in the background"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Create logs directory
    mkdir -p .dev-logs
    
    # Start API Server (background)
    print_info "Starting API Server on http://localhost:3001"
    pnpm --filter @workspace/api-server run dev > .dev-logs/api-server.log 2>&1 &
    local api_pid=$!
    echo $api_pid > .dev-logs/api-server.pid
    
    # Small delay to allow API to start
    sleep 2
    
    # Start Vite dev server (background)
    print_info "Starting CartersCare (Vite) on http://localhost:5173"
    pnpm --filter @workspace/carterscare run dev > .dev-logs/carterscare.log 2>&1 &
    local web_pid=$!
    echo $web_pid > .dev-logs/carterscare.pid
    
    echo ""
    print_success "Development servers started!"
    echo ""
    echo "Applications available at:"
    echo "  - Web App (CartersCare):  http://localhost:5173"
    echo "  - API Server:              http://localhost:3001"
    echo ""
    echo "Logs available at:"
    echo "  - API Server:  .dev-logs/api-server.log"
    echo "  - Web App:     .dev-logs/carterscare.log"
    echo ""
    print_info "Press Ctrl+C to stop all servers"
    echo ""
    
    # Wait for Ctrl+C
    wait
}

start_web_dev() {
    print_info "Starting CartersCare development server..."
    cd "$PROJECT_ROOT"
    pnpm --filter @workspace/carterscare run dev
}

start_api_dev() {
    print_info "Starting API Server development server..."
    cd "$PROJECT_ROOT"
    pnpm --filter @workspace/api-server run dev
}

################################################################################
# FULL SETUP COMMAND
################################################################################

full_setup() {
    echo ""
    print_info "Running full development setup..."
    echo ""
    
    check_prerequisites
    echo ""
    
    install_dependencies
    echo ""
    
    setup_environment_variables
    echo ""
    
    print_success "Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Review and update .env.local with your configuration"
    echo "  2. Run './dev-setup.sh dev' to start development servers"
    echo "  3. Access the application at http://localhost:5173"
    echo ""
}

################################################################################
# HELP
################################################################################

show_help() {
    cat << EOF
${BLUE}CartersCarev3 Development Setup Script${NC}

${YELLOW}USAGE:${NC}
  ./dev-setup.sh [command]

${YELLOW}COMMANDS:${NC}
  setup       - Full setup (prerequisites, dependencies, env vars) - Run this first!
  dev         - Start all development servers (web app + API)
  dev:web     - Start only CartersCare (Vite) development server
  dev:api     - Start only API Server development server
  build       - Build all packages for production
  typecheck   - Run TypeScript type checking across the workspace
  clean       - Remove dependencies and build artifacts
  help        - Display this help message

${YELLOW}EXAMPLES:${NC}
  # First-time setup
  ./dev-setup.sh setup

  # Start development
  ./dev-setup.sh dev

  # Run type checking
  ./dev-setup.sh typecheck

  # Build for production
  ./dev-setup.sh build

${YELLOW}DIRECTORY STRUCTURE:${NC}
  artifacts/
    ├── carterscare/       - Main React/Vite web application
    ├── api-server/        - Express.js API backend
    └── mockup-sandbox/    - Sandbox environment
  lib/
    ├── api-client-react/  - React API client
    ├── api-zod/           - Zod validation schemas
    └── db/                - Database utilities

${YELLOW}DEVELOPMENT SERVERS:${NC}
  - Web App (Vite):   http://localhost:5173
  - API Server:       http://localhost:3001

${YELLOW}ENVIRONMENT VARIABLES:${NC}
  Configuration is managed via .env.local file created during setup.
  Copy the provided template and fill in values from your team's secure storage.
  Never commit sensitive values to version control.

${YELLOW}TROUBLESHOOTING:${NC}
  - If ports are in use, update them in respective package.json scripts
  - For pnpm issues, try: pnpm install --force
  - For port conflicts, check: lsof -i :5173 or lsof -i :3001
  - View server logs in .dev-logs/ directory

${YELLOW}PACKAGE MANAGER:${NC}
  This project uses pnpm for dependency management.
  Install with: npm install -g pnpm
  Never use npm or yarn with this project.

EOF
}

################################################################################
# MAIN COMMAND HANDLER
################################################################################

main() {
    local command="${1:-help}"
    
    case "$command" in
        setup)
            full_setup
            ;;
        dev)
            start_dev_servers
            ;;
        dev:web|dev-web)
            start_web_dev
            ;;
        dev:api|dev-api)
            start_api_dev
            ;;
        build)
            build_project
            ;;
        typecheck|type-check)
            typecheck_project
            ;;
        clean)
            clean_dependencies
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
