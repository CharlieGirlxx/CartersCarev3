# Troubleshooting & FAQ

Quick solutions to common issues when setting up and developing with CartersCarev3.

## Installation & Setup Issues

### pnpm Not Found

**Error:** `command not found: pnpm`

**Solutions:**

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version

# Update pnpm
npm install -g pnpm@latest

# Or use specific version
npm install -g pnpm@9.0.0
```

**Alternative:** Use npm to run pnpm
```bash
npx pnpm install
npx pnpm run dev
```

### Node.js Version Issues

**Error:** `node: command not found` or version mismatch

**Solutions:**

```bash
# Check current version
node --version
npm --version

# Update Node.js
# macOS (Homebrew)
brew upgrade node

# Ubuntu/Debian
sudo apt-get update
sudo apt-get upgrade nodejs

# Using nvm (Node Version Manager)
nvm install 20
nvm use 20
```

**Recommended:** Node.js v18+ and npm v9+

### Permission Denied on Setup Script

**Error:** `Permission denied: ./dev-setup.sh`

**Solutions:**

```bash
# Make script executable
chmod +x dev-setup.sh

# Then run it
./dev-setup.sh setup

# Or use bash directly
bash dev-setup.sh setup
```

## Dependency & Installation Issues

### Module Not Found Errors

**Error:** `Cannot find module '@workspace/...'`

**Solutions:**

```bash
# Reinstall dependencies
./dev-setup.sh clean
./dev-setup.sh setup

# Or manually
pnpm install --force

# Verify workspace packages
pnpm list -r

# Link workspace packages
pnpm install --workspace-root
```

### Lock File Conflicts

**Error:** Conflicts in `pnpm-lock.yaml`

**Solutions:**

```bash
# Regenerate lock file
pnpm install --lockfile-only

# Or rebuild lock file
rm pnpm-lock.yaml
pnpm install

# Update lock file
pnpm update
```

### Peer Dependency Warnings

**Warning:** `unmet peer dependency`

**Solutions:**

```bash
# These warnings are usually safe in development
# To force install:
pnpm install --force

# Or check .npmrc for settings:
cat .npmrc

# Should contain:
# auto-install-peers=false
# strict-peer-dependencies=false
```

## Development Server Issues

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions:**

```bash
# Find process using the port
lsof -i :5173        # Vite
lsof -i :3001        # API Server

# Kill the process
kill -9 <PID>

# Or change the port
VITE_PORT=5174 pnpm --filter @workspace/carterscare run dev

# Or update vite.config.ts
# server: { port: 5174 }
```

### Server Won't Start

**Error:** Server starts but nothing loads / connection refused

**Solutions:**

```bash
# Check if ports are available
netstat -tuln | grep 5173
netstat -tuln | grep 3001

# Try restarting all servers
./dev-setup.sh dev

# Check environment variables
cat .env.local

# Verify Node.js can run
node --version
```

### Hot Module Replacement (HMR) Not Working

**Error:** Changes don't reflect / page doesn't update

**Solutions:**

```bash
# Restart the dev server
# Press Ctrl+C and run again
./dev-setup.sh dev:web

# Check HMR configuration
cat artifacts/carterscare/vite.config.ts

# Try clearing browser cache
# Chrome: DevTools > Application > Clear Site Data
# Or open in Incognito mode

# Check for middleware issues
# Some proxies/firewalls block WebSocket connections
```

### API Connection Issues

**Error:** `Cannot reach API at http://localhost:3001`

**Solutions:**

```bash
# Verify API is running
curl http://localhost:3001/health

# Check API_URL environment variable
echo $API_URL

# Verify in .env.local
cat .env.local | grep API

# Test API manually
curl -X GET http://localhost:3001/api/health

# Check for CORS issues (browser console)
# May need to update CORS configuration in API
```

## TypeScript & Compilation Issues

### Type Errors

**Error:** Type errors when running `typecheck`

**Solutions:**

```bash
# Run type checking
pnpm run typecheck

# Type check specific package
pnpm --filter @workspace/carterscare run typecheck

# Check for missing types
pnpm list @types/node

# Install missing @types packages
pnpm add -D @types/package-name
```

### Module Resolution Issues

**Error:** `Cannot find module` or `Cannot find declaration`

**Solutions:**

```bash
# Check tsconfig.json
cat tsconfig.json
cat tsconfig.base.json

# Verify paths configuration
# tsconfig.json should have:
# "compilerOptions": {
#   "paths": {
#     "@workspace/*": ["../*/src"]
#   }
# }

# Check if package exports are correct
cat lib/api-client-react/package.json | grep -A 5 '"exports"'
```

## Build Issues

### Build Fails

**Error:** Build process exits with error

**Solutions:**

```bash
# Clean and rebuild
rm -rf artifacts/*/dist
./dev-setup.sh build

# Build specific package
pnpm --filter @workspace/carterscare run build

# Enable verbose output
DEBUG=* pnpm run build

# Check build logs
tail -100 .dev-logs/build.log
```

### Large Bundle Size

**Warning:** Bundle is larger than expected

**Solutions:**

```bash
# Analyze bundle
pnpm add -D vite-plugin-visualizer

# Run analysis (Vite)
pnpm --filter @workspace/carterscare run build

# Check dependencies
pnpm list --depth=0
pnpm why large-package

# Remove unused dependencies
pnpm prune
```

## Environment & Configuration Issues

### .env.local Not Loading

**Error:** Environment variables not available

**Solutions:**

```bash
# Verify file exists
ls -la .env.local

# Check file format (should be KEY=VALUE)
cat .env.local

# Verify no BOM or extra whitespace
file .env.local

# On Windows, might need different line endings
# Convert to Unix line endings if needed
dos2unix .env.local
```

### Missing Required Environment Variables

**Error:** `Error: Missing environment variable: SOME_KEY`

**Solutions:**

```bash
# Check which variables are required
grep "process.env\." src/**/*.ts | grep -v "NODE_ENV" | sort -u

# Copy template and fill in values
cp .env.example .env.local

# Edit the file
nano .env.local

# Verify variables are set
grep "SOME_KEY" .env.local
```

## Database Issues

### Cannot Connect to Database

**Error:** `Error: connect ECONNREFUSED` or `no pg_hba.conf entry`

**Solutions:**

```bash
# Verify PostgreSQL is running
brew services list | grep postgres  # macOS
sudo systemctl status postgresql     # Linux
services.msc                         # Windows

# Test connection string
psql $DATABASE_URL

# Check if database exists
createdb carterscare

# Verify credentials
echo "Host: localhost"
echo "Port: 5432"
echo "Database: carterscare"
echo "User: postgres"

# Reset database if corrupted
dropdb carterscare
createdb carterscare
```

### Database Migrations Failed

**Error:** Migrations didn't apply correctly

**Solutions:**

```bash
# Check migration status
pnpm run db:status

# Reset database and run migrations
pnpm run db:reset
pnpm run db:migrate

# Manually check database
psql carterscare
# \dt (show tables)
# \d table_name (describe table)
```

## Git & Version Control Issues

### Git Conflicts

**Error:** Merge conflicts in files

**Solutions:**

```bash
# Check status
git status

# Resolve conflicts manually
# Edit conflicted files, remove conflict markers
# <<<<<<< HEAD
# ...
# ========
# ...
# >>>>>>> branch-name

# Then continue
git add .
git commit -m "Resolve conflicts"

# For lock files (pnpm-lock.yaml)
pnpm install  # This usually fixes lock file conflicts
```

### Cannot Push Changes

**Error:** `Permission denied` or `fatal: could not read from remote`

**Solutions:**

```bash
# Check remote URL
git remote -v

# Verify SSH key (if using SSH)
ssh -T git@github.com

# Or use HTTPS instead
git remote set-url origin https://github.com/CharlieGirlxx/CartersCarev3.git

# Check credentials are set
git config user.email
git config user.name

# Set credentials if needed
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Performance Issues

### Development Server is Slow

**Error:** Vite takes a long time to start / rebuild is slow

**Solutions:**

```bash
# Check system resources
top      # macOS/Linux
taskmgr  # Windows

# Free up memory
./dev-setup.sh clean
./dev-setup.sh setup

# Disable source maps for faster builds (production only)
GENERATE_SOURCEMAP=false pnpm run build

# Check for large files
find . -type f -size +10M
```

### High CPU Usage

**Error:** Dev server consuming lots of CPU

**Solutions:**

```bash
# Check what's running
ps aux | grep node
ps aux | grep pnpm

# Kill unused processes
killall node

# Restart servers
./dev-setup.sh dev

# Check for file watching issues
# Some IDEs watch too many files
# Configure .watchignore or .gitignore appropriately
```

## Platform-Specific Issues

### macOS Issues

**Issue:** Scripts won't run / Homebrew problems

```bash
# Reinstall Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Fix permissions
sudo chown -R $(whoami) /usr/local/var/homebrew

# Reinstall Node
brew uninstall node
brew install node
```

### Windows Issues

**Issue:** Scripts fail on Windows

```bash
# Use cmd as administrator
# Run in PowerShell (not PowerShell ISE)
# Or use WSL (Windows Subsystem for Linux)

# To use WSL:
wsl --install
# Then use bash scripts normally
```

### Linux Issues

**Issue:** Permission or library problems

```bash
# Build tools might be needed
sudo apt-get install build-essential python3

# PostgreSQL issues
sudo systemctl start postgresql
sudo -u postgres psql

# Port binding issues (if not root)
# Change ports to > 1024 in configuration
```

## Getting Help

### Check Logs

```bash
# Application logs
tail -f .dev-logs/api-server.log
tail -f .dev-logs/carterscare.log

# System logs
dmesg                    # macOS/Linux
eventvwr.msc            # Windows

# Specific error search
grep "ERROR" .dev-logs/*.log
```

### Enable Debug Mode

```bash
# Enable detailed logging
DEBUG=* ./dev-setup.sh dev
DEBUG=carterscare:* pnpm --filter @workspace/carterscare run dev

# More verbose output
pnpm run build --verbose
```

### Collect Diagnostic Information

```bash
# Generate diagnostic report
{
  echo "=== System Info ==="
  uname -a
  echo ""
  echo "=== Node Version ==="
  node --version
  echo ""
  echo "=== pnpm Version ==="
  pnpm --version
  echo ""
  echo "=== Git Status ==="
  git status
  echo ""
  echo "=== Installed Packages ==="
  pnpm list --depth=0
} > diagnostics.txt

# Share this file (without sensitive values from .env.local)
```

## Common Questions

### Can I use npm or yarn instead of pnpm?

**No.** This project is configured specifically for pnpm and uses pnpm-specific features. Using npm or yarn will cause issues.

```bash
# Always use pnpm
pnpm install
pnpm run dev

# NOT npm
npm install
npm run dev
```

### How do I add a new environment variable?

```bash
# 1. Add to .env.example with documentation
# 2. Add to .env.local with your value
# 3. Use in code: process.env.YOUR_VARIABLE
# 4. For TypeScript, add type declaration if needed
```

### Can I change the port numbers?

```bash
# Update in package.json scripts or configuration files:
VITE_PORT=5174 pnpm --filter @workspace/carterscare run dev
API_PORT=3002 pnpm --filter @workspace/api-server run dev
```

### How do I reset everything?

```bash
./dev-setup.sh clean
./dev-setup.sh setup
./dev-setup.sh dev
```

### Where are the log files?

```bash
ls -la .dev-logs/
cat .dev-logs/api-server.log
cat .dev-logs/carterscare.log
```

## Still Having Issues?

1. **Check this guide** - Most common issues are listed here
2. **Check project documentation** - Read DEVELOPMENT.md and CONFIGURATION.md
3. **Review error messages carefully** - They usually contain the solution
4. **Search online** - Include error message and technology name
5. **Ask the team** - Slack or team documentation
6. **Create detailed issue** - Include diagnostic information

---

**Last Updated**: May 2026
**Need help?** Contact the development team or check team documentation
