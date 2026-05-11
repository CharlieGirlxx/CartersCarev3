# Development Setup Guide

Complete guide to setting up and working with the CartersCarev3 project.

## Quick Start

### First-Time Setup
```bash
# Run the comprehensive setup script
./dev-setup.sh setup

# This will:
# ✓ Check prerequisites (Node.js, pnpm, Git)
# ✓ Install all dependencies
# ✓ Create .env.local with template variables
# ✓ Configure the project for development
```

### Start Development
```bash
# Start all development servers
./dev-setup.sh dev

# Or start individual servers
./dev-setup.sh dev:web    # Vite web app on http://localhost:5173
./dev-setup.sh dev:api    # API server on http://localhost:3001
```

## Project Structure

This is a **pnpm monorepo** with multiple interconnected packages:

```
carterscare-v3/
├── artifacts/                    # Main applications
│   ├── carterscare/             # React + Vite web application
│   ├── api-server/              # Express.js backend API
│   └── mockup-sandbox/          # Sandbox/demo environment
├── lib/                          # Shared libraries
│   ├── api-client-react/        # React hooks for API communication
│   ├── api-zod/                 # Zod schemas for validation
│   └── db/                      # Database utilities and types
├── scripts/                      # Build and utility scripts
├── dev-setup.sh                 # 📋 Development automation script
├── .env.local                   # 🔐 Environment variables (created on setup)
├── pnpm-workspace.yaml          # Workspace configuration
└── pnpm-lock.yaml              # Dependency lock file
```

## Available Commands

### Setup & Installation
```bash
./dev-setup.sh setup          # Full initial setup (prerequisites + install + env)
./dev-setup.sh help           # Show all available commands
```

### Development
```bash
./dev-setup.sh dev            # Start all servers (web + API)
./dev-setup.sh dev:web        # Start only Vite dev server (port 5173)
./dev-setup.sh dev:api        # Start only Express API (port 3001)
```

### Building & Type Checking
```bash
./dev-setup.sh build          # Build all packages for production
./dev-setup.sh typecheck      # Run TypeScript type checking
```

### Maintenance
```bash
./dev-setup.sh clean          # Remove dependencies and build artifacts
```

## Prerequisites

The setup script checks for these automatically:

- **Node.js** (v18+) - JavaScript runtime
- **pnpm** (v9+) - Package manager
- **Git** - Version control

### Installing Prerequisites

**macOS (using Homebrew):**
```bash
brew install node
npm install -g pnpm
```

**Ubuntu/Debian:**
```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

**Windows (using Chocolatey):**
```bash
choco install nodejs
npm install -g pnpm
```

**Or install pnpm directly:**
```bash
npm install -g pnpm@latest
```

## Development Servers

### Web Application (CartersCare)
- **Technology**: Vite + React
- **Port**: 5173
- **URL**: http://localhost:5173
- **Script**: `pnpm --filter @workspace/carterscare run dev`
- **Features**: Hot Module Replacement (HMR), instant updates

### API Server
- **Technology**: Express.js
- **Port**: 3001
- **URL**: http://localhost:3001
- **Script**: `pnpm --filter @workspace/api-server run dev`

### Access Points
```
CartersCare Web App:    http://localhost:5173
API Server:             http://localhost:3001
```

## Environment Variables

Environment variables are configured in `.env.local` (created during setup).

### Available Variables
```bash
# Development Configuration
API_URL=http://localhost:3001          # API endpoint for web app
NODE_ENV=development                   # Node environment

# Database (if applicable)
# DATABASE_URL=postgres://...

# Authentication (if applicable)
# AUTH_TOKEN=your_token

# Third-party Services (if applicable)
# STRIPE_KEY=sk_test_...
# OTHER_API_KEY=...
```

### Important Security Notes
- ⚠️ **Never commit `.env.local`** to version control
- 🔐 **Never share sensitive values** publicly
- 🛡️ Use your team's secure storage for production values
- 📋 Template is automatically created from `dev-setup.sh`

## Working with Dependencies

### Install New Packages
```bash
# For the workspace root
pnpm add package-name

# For a specific workspace package
pnpm --filter @workspace/carterscare add package-name

# For dev dependencies
pnpm add -D dev-package-name

# For workspaces (shared across all)
pnpm -w add package-name
```

### Update Packages
```bash
# Update all packages
pnpm update

# Update specific package
pnpm update package-name@latest
```

### Remove Packages
```bash
pnpm remove package-name
```

### View Dependency Tree
```bash
pnpm list
pnpm list --depth=2
```

## Building for Production

### Build All Packages
```bash
./dev-setup.sh build

# Or manually:
pnpm run build
```

This will:
1. Run TypeScript type checking
2. Build all workspace packages
3. Create optimized production bundles

### Build Specific Package
```bash
pnpm --filter @workspace/carterscare run build
pnpm --filter @workspace/api-server run build
```

## Type Checking

### Run Full Type Check
```bash
./dev-setup.sh typecheck

# Or manually:
pnpm run typecheck
```

### Type Check Specific Package
```bash
pnpm --filter @workspace/carterscare run typecheck
```

## Debugging & Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5173      # Vite app
lsof -i :3001      # API server

# Kill the process
kill -9 <PID>
```

### Clear Caches and Rebuild
```bash
./dev-setup.sh clean
./dev-setup.sh setup
./dev-setup.sh dev
```

### Check pnpm Installation
```bash
pnpm --version
pnpm list
```

### View Server Logs
Logs are stored in `.dev-logs/`:
```bash
tail -f .dev-logs/api-server.log
tail -f .dev-logs/carterscare.log
```

### Common Issues

**"pnpm: command not found"**
- Install pnpm: `npm install -g pnpm`

**"Port 5173 already in use"**
- Change port in `artifacts/carterscare/vite.config.ts`
- Or kill the existing process (see Port Already in Use section)

**"Module not found" errors**
- Run `pnpm install` again
- Clear cache: `pnpm install --force`

**TypeScript errors in IDE**
- Reload IDE/editor
- Run `pnpm run typecheck` to verify
- Check TypeScript version: `pnpm ls typescript`

## Useful pnpm Commands

```bash
# View all available commands
pnpm run                    # List all scripts in root

# Run command in specific workspace
pnpm --filter @workspace/carterscare run dev

# Run in all workspaces
pnpm -r run typecheck

# Show workspace dependencies
pnpm list -r

# Install missing dependencies
pnpm install --force

# Update lock file
pnpm install --lockfile-only
```

## Best Practices

### For Development
- ✅ Always run `./dev-setup.sh setup` on first clone
- ✅ Use `pnpm` for all package management
- ✅ Keep `.env.local` up to date with team values
- ✅ Restart servers after environment changes
- ✅ Run `pnpm run typecheck` before committing

### For Team Collaboration
- ✅ Document new environment variables
- ✅ Update this guide when adding dependencies
- ✅ Use workspace packages for shared code
- ✅ Keep pnpm-lock.yaml in version control
- ✅ Never commit `.env.local` or other secrets

### For Production
- ✅ Run full build: `./dev-setup.sh build`
- ✅ Verify type checking passes
- ✅ Test in production environment
- ✅ Use environment-specific configs
- ✅ Review security checklist before deploy

## Additional Resources

### Documentation
- [pnpm Documentation](https://pnpm.io/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

### IDE Setup
- **VS Code**: Ensure TypeScript extension is installed
- **WebStorm**: No additional setup needed
- **Vim/Neovim**: Configure your LSP for TypeScript

### Next Steps
1. Run `./dev-setup.sh setup`
2. Configure `.env.local`
3. Run `./dev-setup.sh dev`
4. Start developing!

## Support & Questions

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review **Common Issues**
3. Ask team members
4. Check team documentation
5. File an issue with full error details

---

**Last Updated**: May 2026
**Maintained by**: Development Team
**Project**: CartersCarev3
